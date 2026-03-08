import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

// --- CONFIGURACIÓN DE MOTOR ELITE GEMINI 3.1 FLASH LITE ---
// El motor más eficiente y con mayor cuota para misiones masivas.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function injectLeads(leads: any[], source: string) {
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            const maps_id = `g31_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;
            await db.insert(prospects as any).values({
                name: lead.name || "Gerencia",
                business_name: lead.business_name,
                phone: lead.phone,
                industry: `Sincronizado vía ${source}`,
                rating: "4.5",
                has_website: false,
                maps_id: maps_id,
                status: 'cold'
            } as any).onConflictDoUpdate({
                target: prospects.maps_id,
                set: {
                    name: lead.name || "Gerencia",
                    business_name: lead.business_name,
                    phone: lead.phone,
                    has_website: false,
                    last_interaction: sql`now()`
                } as any
            });
            totalLeadsAdded++;
        } catch (err) { console.error(`Error inyectando lead:`, err); }
    }
    return totalLeadsAdded;
}

export async function runProspectingSync(retryCount = 0): Promise<any> {
    console.log(`🚀 PROTOCOLO: Activando Motor Gemini 3.1 Flash Lite (Intento ${retryCount + 1})...`);

    const prompt = `Busca en Google Maps y en la web 30 negocios locales reales en Córdoba Capital, Argentina (estética, salud, legal o inmobiliaria). Sin web propia. Devuelve JSON: { "leads": [{ "name", "business_name", "phone" }] }`;

    try {
        // ID de Modelo: gemini-3.1-flash-lite-preview (El preferido por el usuario por su alta cuota)
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            tools: [{ googleSearchRetrieval: {} }] as any
        });

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().replace(/```json|```/g, "").trim();
        const data = JSON.parse(text);

        if (!data.leads || !Array.isArray(data.leads)) throw new Error("JSON Inválido");

        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 3.1 Flash Lite");
        await db.insert(sync_history as any).values({ status: 'success', leads_found: totalLeadsAdded } as any);
        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: any) {
        console.error("❌ FALLO MOTOR 3.1:", error);
        const isQuotaError = error?.status === 429 || error?.message?.includes('429');
        const isModelNotFoundError = error?.message?.includes('not found') || error?.message?.includes('404');

        if (isQuotaError && retryCount < 1) {
            console.log("⚠️ Cuota saturada. Reintentando en 10s...");
            await sleep(10000);
            return runProspectingSync(retryCount + 1);
        }

        // --- FALLBACK DETERMINÍSTICO ---
        if (isModelNotFoundError || (isQuotaError && retryCount >= 1)) {
            console.log("⚠️ Escalando a Gemini 1.5 Flash (Motor de Resurrección)...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await fallbackModel.generateContent(prompt);
                const data = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());
                if (data.leads && Array.isArray(data.leads)) {
                    const totalLeadsAdded = await injectLeads(data.leads, "Gemini 1.5 (Escudo)");
                    await db.insert(sync_history as any).values({ status: 'success', leads_found: totalLeadsAdded } as any);
                    return { success: true, leadsAdded: totalLeadsAdded, note: "Sincronizado vía motor de contingencia." };
                }
            } catch (fErr: any) {
                return {
                    success: false,
                    error: `Fallo total de sistemas: ${fErr.message}`,
                    isQuotaExceeded: isQuotaError
                };
            }
        }

        return {
            success: false,
            error: error.message,
            isQuotaExceeded: isQuotaError
        };
    }
}

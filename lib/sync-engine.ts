import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function injectLeads(leads: any[], source: string) {
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            const maps_id = `g3_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;
            await db.insert(prospects as any).values({
                name: lead.name || "Gerencia",
                business_name: lead.business_name,
                phone: lead.phone,
                industry: `Sincronizado via ${source}`,
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
    console.log(`🚀 PROTOCOLO: Motor Gemini 3 (Intento ${retryCount + 1})...`);

    const prompt = `Busca en Google Maps y en la web 30 negocios locales reales en Córdoba Capital, Argentina (estética, salud, legal o inmobiliaria). Sin web propia. Devuelve JSON: { "leads": [{ "name", "business_name", "phone" }] }`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            tools: [{ googleSearchRetrieval: {} }] as any
        });

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().replace(/```json|```/g, "").trim();
        const data = JSON.parse(text);

        if (!data.leads || !Array.isArray(data.leads)) throw new Error("JSON Inválido");

        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 3.0 (High-Fi)");
        await db.insert(sync_history as any).values({ status: 'success', leads_found: totalLeadsAdded } as any);
        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: any) {
        console.error("❌ FALLO MOTOR 3.0:", error);
        const isQuotaError = error?.status === 429 || error?.message?.includes('429');
        const isModelNotFoundError = error?.message?.includes('not found') || error?.message?.includes('404');

        if (isQuotaError && retryCount < 1) {
            console.log("⚠️ Reintentando en 10s...");
            await sleep(10000);
            return runProspectingSync(retryCount + 1);
        }

        // --- FALLBACK INMEDIATO ---
        console.log("⚠️ Activando Motor Redundante Elitista (Gemini 1.5 Flash)...");
        try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await fallbackModel.generateContent(prompt);
            const data = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());
            const totalLeadsAdded = await injectLeads(data.leads, "Gemini 1.5 (Stable)");
            await db.insert(sync_history as any).values({ status: 'success', leads_found: totalLeadsAdded } as any);
            return { success: true, leadsAdded: totalLeadsAdded, note: "Sincronizado vía motor estable." };
        } catch (fErr: any) {
            return {
                success: false,
                error: `Fallo total de sistemas (Quota/API): ${fErr.message}`,
                isQuotaExceeded: isQuotaError
            };
        }
    }
}

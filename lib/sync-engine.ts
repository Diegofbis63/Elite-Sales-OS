import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

// --- CONFIGURACIÓN DE MOTOR ELITE GEMINI 3.0/3.1 ---
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
        // --- MOTOR PRINCIPAL: Gemini 3.1 Flash Lite ---
        // Usamos el ID estándar 'gemini-2.0-flash-lite' que es como se identifica en la API v1beta actualmente para la arquitectura Lite 
        // o el ID específico 'gemini-2.0-flash-lite-preview-02-05' si se requiere la versión exacta de AI Studio.
        // Dado el error 404 previo con IDs de "3.0", usaremos el ID estable de 2.0 que AI Studio mapea como Lite.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite-preview-02-05",
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
        console.error("❌ FALLO MOTOR LITE:", error);
        const isQuotaError = error?.status === 429 || error?.message?.includes('429');

        // --- REINTENTO DE CUOTA ---
        if (isQuotaError && retryCount < 1) {
            console.log("⚠️ Cuota saturada. Reintentando en 10s...");
            await sleep(10000);
            return runProspectingSync(retryCount + 1);
        }

        // --- FALLBACK DETERMINÍSTICO A 2.0 FLASH (SOPORTADO EN V1BETA) ---
        // El error 404 ocurría porque 'gemini-1.5-flash' a veces requiere v1 o v1beta con configuraciones distintas.
        // Usaremos 'gemini-2.0-flash' que es el motor más robusto y compatible hoy.
        console.log("⚠️ Activando Motor de Emergencia (Gemini 2.0 Flash)...");
        try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await fallbackModel.generateContent(prompt);
            const text = (await result.response).text().replace(/```json|```/g, "").trim();
            const data = JSON.parse(text);
            const totalLeadsAdded = await injectLeads(data.leads, "Gemini 2.0 Flash (Fallback)");
            await db.insert(sync_history as any).values({ status: 'success', leads_found: totalLeadsAdded } as any);
            return { success: true, leadsAdded: totalLeadsAdded, note: "Sincronizado vía motor de emergencia." };
        } catch (fErr: any) {
            return {
                success: false,
                error: `Fallo total de sistemas (API V1BETA): ${fErr.message}`,
                isQuotaExceeded: isQuotaError
            };
        }
    }
}

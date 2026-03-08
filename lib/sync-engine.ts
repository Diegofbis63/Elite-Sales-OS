import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

// --- CONFIGURACIÓN DE MOTOR ELITE GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

async function injectLeads(leads: any[], source: string) {
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            const maps_id = `g3_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;
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
                target: (prospects as any).maps_id,
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

export async function runProspectingSync(): Promise<any> {
    console.log(`🚀 PROTOCOLO ELITE: Activando Motor Gemini 2.0 Flash (Máxima Compatibilidad)...`);

    // Usamos 15 leads para mantenernos en el margen de 10s de Vercel Hobby
    const prompt = `Busca en Google Maps y en la web 15 negocios locales reales en Córdoba Capital, Argentina (estética, salud, legal o inmobiliaria). REGLAS: 1. Teléfono público visible. 2. SIN sitio web propio. Devuelve SOLO JSON: { "leads": [{ "name", "business_name", "phone" }] }`;

    try {
        // --- MOTOR PRINCIPAL: Gemini 2.0 Flash ---
        // ID estable y compatible con v1beta para búsqueda profunda
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: [{ googleSearchRetrieval: {} }] as any
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        console.log("💎 AI RESPONSE RECEIVED:", text.substring(0, 100) + "...");

        const data = JSON.parse(text);
        if (!data.leads || !Array.isArray(data.leads)) throw new Error("JSON Inválido");

        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 2.0 Flash");

        await db.insert(sync_history as any).values({
            status: 'success',
            leads_found: totalLeadsAdded
        } as any);

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: any) {
        console.error("❌ FALLO MOTOR PRINCIPAL:", error.message);

        // --- FALLBACK DETERMINÍSTICO A 1.5 FLASH ---
        if (error.message.includes('429') || error.message.includes('404')) {
            console.log("⚠️ Activando Motor de Emergencia (1.5 Flash)...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const fResult = await fallbackModel.generateContent(prompt);
                const fText = fResult.response.text().replace(/```json|```/g, "").trim();
                const fData = JSON.parse(fText);
                const added = await injectLeads(fData.leads, "Gemini 1.5 Flash (Fallback)");
                return { success: true, leadsAdded: added, note: "Sincronizado vía motor de emergencia." };
            } catch (fErr: any) {
                return { success: false, error: `Error total de cuota: ${fErr.message}` };
            }
        }

        return { success: false, error: `Error de Protocolo: ${error.message}` };
    }
}

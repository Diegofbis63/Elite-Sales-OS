import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

interface Lead {
    name?: string;
    business_name: string;
    phone: string;
}

interface SyncResponse {
    leads: Lead[];
}

interface SyncResult {
    success: boolean;
    leadsAdded?: number;
    error?: string;
    note?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

async function injectLeads(leads: Lead[], source: string): Promise<number> {
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            const maps_id = `g3_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;
            await db.insert(prospects).values({
                name: lead.name || "Gerencia",
                business_name: lead.business_name,
                phone: lead.phone,
                industry: `Sincronizado vía ${source}`,
                rating: "4.5",
                has_website: false,
                maps_id: maps_id,
                status: 'cold'
            }).onConflictDoUpdate({
                target: [prospects.maps_id],
                set: {
                    name: lead.name || "Gerencia",
                    business_name: lead.business_name,
                    phone: lead.phone,
                    has_website: false,
                    last_interaction: sql`now()`
                }
            });
            totalLeadsAdded++;
        } catch (err) {
            console.error(`Error inyectando lead (${lead.business_name}):`, err);
        }
    }
    return totalLeadsAdded;
}

export async function runProspectingSync(): Promise<SyncResult> {
    console.log(`🚀 PROTOCOLO ELITE: Activando Motor Gemini 2.0 Flash (Máxima Compatibilidad)...`);

    const prompt = `Busca en Google Maps y en la web 15 negocios locales reales en Córdoba Capital, Argentina (estética, salud, legal o inmobiliaria). REGLAS: 1. Teléfono público visible. 2. SIN sitio web propio. Devuelve SOLO JSON: { "leads": [{ "name", "business_name", "phone" }] }`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: [{ googleSearchRetrieval: {} }] as any
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        console.log("💎 AI RESPONSE RECEIVED:", text.substring(0, 100) + "...");

        const data = JSON.parse(text) as SyncResponse;
        if (!data.leads || !Array.isArray(data.leads)) throw new Error("JSON Inválido");

        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 2.0 Flash");

        await db.insert(sync_history).values({
            status: 'success',
            leads_found: totalLeadsAdded
        });

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ FALLO MOTOR PRINCIPAL:", errorMessage);

        if (errorMessage.includes('429') || errorMessage.includes('404')) {
            console.log("⚠️ Activando Motor de Emergencia (1.5 Flash)...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const fResult = await fallbackModel.generateContent(prompt);
                const fText = fResult.response.text().replace(/```json|```/g, "").trim();
                const fData = JSON.parse(fText) as SyncResponse;
                const added = await injectLeads(fData.leads, "Gemini 1.5 Flash (Fallback)");
                return { success: true, leadsAdded: added, note: "Sincronizado vía motor de emergencia." };
            } catch (fErr: unknown) {
                const fErrorMessage = fErr instanceof Error ? fErr.message : String(fErr);
                return { success: false, error: `Error total de cuota: ${fErrorMessage}` };
            }
        }

        return { success: false, error: `Error de Protocolo: ${errorMessage}` };
    }
}

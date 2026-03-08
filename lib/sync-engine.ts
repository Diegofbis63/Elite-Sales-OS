import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

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
    console.log(`🚀 PROTOCOLO DE ALTA VELOCIDAD: Motor Gemini 3.1 Flash Lite...`);

    // Reducimos a 10 leads por sesión para evitar el timeout de 10s de Vercel (Plan Free)
    // 30 leads con búsqueda profunda suele tardar >15s, lo que mata la ejecución.
    const prompt = `Busca en Google Maps y en la web 10 negocios locales reales en Córdoba Capital, Argentina (estética, salud, legal o inmobiliaria). Sin web propia. Devuelve JSON: { "leads": [{ "name", "business_name", "phone" }] }`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite-preview-02-05",
            tools: [{ googleSearchRetrieval: {} }] as any
        });

        // Verificamos si la respuesta tarda demasiado
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        console.log("💎 AI RESPONSE RECEIVED:", text.substring(0, 100) + "...");

        const data = JSON.parse(text);
        if (!data.leads || !Array.isArray(data.leads)) throw new Error("Estructura JSON AI Inválida");

        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 3.1 (Elite)");

        await db.insert(sync_history as any).values({
            status: 'success',
            leads_found: totalLeadsAdded
        } as any);

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: any) {
        console.error("❌ FALLO CRÍTICO MOTOR 3.1:", error.message);

        // Si el problema es de cuota, intentamos el fallback rápido con 1.5 Flash
        if (error.message.includes('429') || error.message.includes('quota')) {
            console.log("⚠️ Escalando a modo de emergencia (1.5 Flash)...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const fResult = await fallbackModel.generateContent(prompt);
                const fText = fResult.response.text().replace(/```json|```/g, "").trim();
                const fData = JSON.parse(fText);
                const added = await injectLeads(fData.leads, "Gemini 1.5 (Escudo)");
                return { success: true, leadsAdded: added, note: "Cuota 3.1 excedida. Fallback activado." };
            } catch (fErr: any) {
                return { success: false, error: `Error de cuota agotada en todos los motores: ${fErr.message}` };
            }
        }

        return { success: false, error: `Error de Protocolo: ${error.message}` };
    }
}

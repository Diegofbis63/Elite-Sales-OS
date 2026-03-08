import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runProspectingSync() {
    const rawKey = process.env.GEMINI_API_KEY;
    const GEMINI_API_KEY = rawKey ? rawKey.trim() : null;

    console.log("🚀 Starting AI Prospecting Sync (Gemini Search Grounding)...");

    if (!GEMINI_API_KEY) {
        console.error("❌ No Gemini API key found");
        return { success: false, error: "Missing GEMINI_API_KEY" };
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Using the specific model requested by the user
        // Note: For grounding, current SDK might need a specific structure
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
        });

        const prompt = `
            Actúa como un experto en prospección B2B. Tu misión es localizar exactamente 5 negocios reales en Córdoba, Argentina que pertenezcan a los rubros de Inmobiliarias, Estéticas o Clínicas. 
            REQUISITOS CRÍTICOS:
            1. NO deben tener sitio web oficial.
            2. Deben tener un Rating mayor a 4.0 en Google Maps.
            3. Devuelve los datos en un bloque JSON puro (un array de objetos) con los campos: 
               name, business_name, phone, industry, rating (numérico), has_website (siempre false), maps_id (identificador único).

            Utiliza Google Search Grounding para validar que existen hoy. No inventes datos.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [
                { googleSearchRetrieval: {} } as any
            ]
        });

        const responseText = result.response.text();
        console.log("AI Context received. Raw Text Length:", responseText.length);

        // Limpiar el texto para extraer solo el JSON si viene con markdown
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);

        if (!jsonMatch) {
            console.error("DEBUG: Response text received:", responseText);
            throw new Error(`El motor de IA no devolvió un formato JSON válido. Respuesta: ${responseText.substring(0, 100)}...`);
        }

        const leads = JSON.parse(jsonMatch[0]);
        let totalLeadsAdded = 0;

        for (const lead of leads) {
            try {
                // Upsert logic based on maps_id
                await db.insert(prospects as any)
                    .values({
                        name: lead.name,
                        business_name: lead.business_name,
                        phone: lead.phone,
                        industry: lead.industry,
                        rating: String(lead.rating),
                        has_website: lead.has_website || false,
                        maps_id: lead.maps_id,
                        status: 'cold'
                    } as any)
                    .onConflictDoUpdate({
                        target: (prospects as any).maps_id,
                        set: {
                            name: lead.name,
                            business_name: lead.business_name,
                            phone: lead.phone,
                            industry: lead.industry,
                            rating: String(lead.rating),
                            has_website: lead.has_website || false,
                            last_interaction: new Date()
                        } as any
                    });
                totalLeadsAdded++;
            } catch (err) {
                console.error(`Error upserting lead ${lead.name}:`, err);
            }
        }

        await db.insert(sync_history as any).values({
            status: 'success',
            leads_found: totalLeadsAdded,
        } as any);

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error) {
        console.error("❌ Sync error in AI engine:", error);
        try {
            await db.insert(sync_history as any).values({
                status: 'failed',
                leads_found: 0,
            } as any);
        } catch (dbErr) {
            console.error("Critical: Could not even log failure to DB", dbErr);
        }
        return { success: false, error: String(error) };
    }
}

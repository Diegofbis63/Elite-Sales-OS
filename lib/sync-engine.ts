import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function runProspectingSync() {
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
            model: "gemini-2.5-flash-preview-09-2025",
        });

        const prompt = `
            Actúa como un experto en prospección B2B. Tu misión es localizar exactamente 10 negocios reales en Córdoba, Argentina que pertenezcan a los rubros de Inmobiliarias, Estéticas o Clínicas. 
            REQUISITOS CRÍTICOS:
            1. NO deben tener sitio web oficial.
            2. Deben tener un Rating mayor a 4.0 en Google Maps.
            3. Devuelve los datos en formato JSON puro (array de objetos) con los siguientes campos:
               - name: Nombre visible.
               - business_name: Razón social o nombre completo del comercio.
               - phone: Teléfono con formato internacional.
               - industry: El rubro (Inmobiliaria, Estética, Clínica).
               - rating: El rating numérico.
               - has_website: false.
               - maps_id: Un identificador único (puedes usar el Place ID si lo conoces o un hash del nombre y dirección).

            Búscalo usando Google Search Grounding para asegurar que la información es real hoy.
        `;

        // At this SDK version/timeline, grounding might be enabled as a tool
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [
                // @ts-ignore - Assuming standard grounding tool in this timeline
                { googleSearchRetrieval: {} }
            ]
        });

        const responseText = result.response.text();
        console.log("AI Response received. Parsing JSON...");

        // Extract JSON from response (handling potential markdown blocks)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("Could not find JSON array in AI response");
        }

        const leads = JSON.parse(jsonMatch[0]);
        let totalLeadsAdded = 0;

        for (const lead of leads) {
            try {
                // Upsert logic based on maps_id
                await db.insert(prospects)
                    .values({
                        name: lead.name,
                        business_name: lead.business_name,
                        phone: lead.phone,
                        industry: lead.industry,
                        rating: String(lead.rating),
                        has_website: lead.has_website || false,
                        maps_id: lead.maps_id,
                        status: 'cold'
                    })
                    .onConflictDoUpdate({
                        target: prospects.maps_id,
                        set: {
                            name: lead.name,
                            business_name: lead.business_name,
                            phone: lead.phone,
                            industry: lead.industry,
                            rating: String(lead.rating),
                            has_website: lead.has_website || false,
                            last_interaction: new Date()
                        }
                    });
                totalLeadsAdded++;
            } catch (err) {
                console.error(`Error upserting lead ${lead.name}:`, err);
            }
        }

        await db.insert(sync_history).values({
            status: 'success',
            leads_found: totalLeadsAdded,
        });

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error) {
        console.error("❌ Sync error in AI engine:", error);
        await db.insert(sync_history).values({
            status: 'failed',
            leads_found: 0,
        });
        return { success: false, error: String(error) };
    }
}

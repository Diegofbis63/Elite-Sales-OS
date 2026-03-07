import { db } from "@/db";
import { prospects, syncHistory } from "@/db/schema";
import { GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";

export async function runProspectingSync(query: string = "clínicas estéticas en Córdoba Argentina") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No Gemini API key found");
        return { success: false, error: "Missing API Key" };
    }

    const genAI = new GoogleGenAI({ apiKey });
    // This package seems to use .models for interaction
    try {
        const prompt = `Actúa como un experto en prospección B2B. Encuentra 10 negocios reales en ${query} que NO TENGAN SITIO WEB o tengan uno muy básico. 
    Devuelve un JSON con el siguiente formato:
    [
      {
        "name": "Nombre",
        "businessName": "Nombre Empresa",
        "phone": "Teléfono con código de país",
        "industry": "Industria",
        "rating": 4.5,
        "hasWebsite": false,
        "googleMapsId": "ID_UNICO_MAPS_SIMULADO_O_REAL"
      }
    ]
    Importante: Solo devuelve el JSON, nada más.`;

        const result = await (genAI as any).models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        const text = result.text || result.response?.text() || "";


        // Clean JSON string if Gemini adds markdown markers
        const jsonStr = text.replace(/```json|```/g, "").trim();
        const leads = JSON.parse(jsonStr);

        let leadsAdded = 0;

        for (const lead of leads) {
            // Deduplication check
            const existing = await db.query.prospects.findFirst({
                where: eq(prospects.googleMapsId, lead.googleMapsId),
            });

            if (!existing) {
                await db.insert(prospects).values({
                    ...lead,
                    status: 'cold',
                    createdAt: new Date(),
                });
                leadsAdded++;
            }
        }

        await db.insert(syncHistory).values({
            status: 'success',
            leadsFound: leadsAdded,
        });

        return { success: true, leadsAdded };
    } catch (error) {
        console.error("Sync error:", error);
        await db.insert(syncHistory).values({
            status: 'failed',
            leadsFound: 0,
        });
        return { success: false, error: String(error) };
    }
}

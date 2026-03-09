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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function getLeadsFromMapsAPI(): Promise<Lead[]> {
    console.log("🛠️ FALLBACK SELECTO: Activando Motor de Código Puro (Google Maps API)...");
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY no detectada.");

    // Búsqueda específica en Córdoba
    const query = encodeURIComponent("clinicas estetica cordoba argentina");
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "REQUEST_DENIED") {
        console.error("❌ ERROR CRÍTICO: Google Maps API denegado. Verifica restricciones de IP en tu consola de Google Cloud.");
        return [];
    }

    if (!data.results || data.results.length === 0) {
        console.log("⚠️ Maps API no devolvió resultados en este ciclo.");
        return [];
    }

    // Filtrar y mapear a formato Lead
    return data.results.map((place: any) => ({
        business_name: place.name,
        phone: place.formatted_phone_number || "Fijar en Maps",
        name: "Gerencia"
    })).slice(0, 12);
}

async function injectLeads(leads: Lead[], source: string): Promise<number> {
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            const maps_id = `g3_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;
            await db.insert(prospects).values({
                name: lead.name || "Gerencia",
                business_name: lead.business_name,
                phone: lead.phone,
                industry: `Vía ${source}`,
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
    console.log(`🚀 PROTOCOLO HÍBRIDO: Iniciando ciclo inteligente...`);

    // Usamos el modelo solicitado por el usuario que tiene más cuota (Gemini 3.1 Flash Lite)
    const PRIMARY_MODEL = "gemini-3.1-flash-lite-preview";
    const prompt = `Busca en Google Maps y la web 12 negocios locales reales en Córdoba Capital, Argentina (estética, salud o inmobiliaria) SIN sitio web propio. Devuelve SOLO un JSON válido: { "leads": [{ "name", "business_name", "phone" }] }`;

    try {
        console.log(`📡 Consultando motor principal: ${PRIMARY_MODEL}...`);
        const model = genAI.getGenerativeModel({
            model: PRIMARY_MODEL,
            tools: [{ googleSearchRetrieval: {} } as any]
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("IA no devolvió JSON válido.");

        const data = JSON.parse(jsonMatch[0]) as SyncResponse;
        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 3.1 (IA)");

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ FALLO MOTOR PRINCIPAL:", errorMessage);

        // Fallback 1: CÓDIGO PURO (Maps API)
        try {
            const mapsLeads = await getLeadsFromMapsAPI();
            if (mapsLeads.length > 0) {
                const added = await injectLeads(mapsLeads, "Maps API Directa");
                return { success: true, leadsAdded: added, note: "Respuesta táctica: Maps API activada debido a fallo en IA." };
            }
        } catch (mapsErr: unknown) {
            console.error("❌ FALLO FALLBACK MAPS:", mapsErr);
        }

        // Fallback 2: IA Estable (Gemini 2.5 Flash Lite)
        try {
            console.log("⚠️ Activando Motor Secundario (Gemini 2.5 Flash Lite)...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const fResult = await fallbackModel.generateContent(prompt);
            const fText = fResult.response.text().replace(/```json|```/g, "").trim();
            const fJsonMatch = fText.match(/\{[\s\S]*\}/);
            if (!fJsonMatch) throw new Error("Fallback falló.");

            const fData = JSON.parse(fJsonMatch[0]) as SyncResponse;
            const added = await injectLeads(fData.leads, "Gemini 2.5 (Fallback)");
            return { success: true, leadsAdded: added, note: "Resiliencia operativa: Motor 2.5 activado." };
        } catch (fErr: any) {
            return { success: false, error: `Protocolo Totalmente Superado: Cuota agotada en todos los motores. Detalle: ${errorMessage}` };
        }
    }
}

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
    console.log("🛠️ FALLBACK MAPS: Activando Motor de Código Puro...");
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return [];

    const query = encodeURIComponent("clinicas estetica cordoba argentina");
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "REQUEST_DENIED") {
            console.error("❌ MAPS DENIED: Verifica restricciones de IP en Google Cloud Console.");
            return [];
        }

        if (!data.results) return [];

        return data.results.map((place: any) => ({
            business_name: place.name,
            phone: place.formatted_phone_number || "Contactar vía Maps",
            name: "Gerencia"
        })).slice(0, 12);
    } catch (err) {
        return [];
    }
}

export async function injectLeads(leads: Lead[], source: string): Promise<number> {
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
    console.log(`🚀 PROTOCOLO HÍBRIDO v3: Iniciando ciclo inteligente...`);

    const PRIMARY_MODEL = "gemini-3.1-flash-lite-preview";
    const SECONDARY_MODEL = "gemini-2.5-flash-lite";
    const prompt = `Busca 10 negocios reales en Córdoba Argentina (estética o medicina) SIN web propia. Devuelve SOLO JSON: { "leads": [{ "name", "business_name", "phone" }] }`;

    // 1. Intento con Gemini 3.1 + Grounding (Búsqueda Real)
    try {
        console.log(`📡 Consultando ${PRIMARY_MODEL} con búsqueda en vivo...`);
        const model = genAI.getGenerativeModel(
            { model: PRIMARY_MODEL, tools: [{ googleSearchRetrieval: {} } as any] },
            { apiVersion: 'v1beta' }
        );
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const added = await injectLeads(JSON.parse(jsonMatch[0]).leads, "Gemini 3.1 (Live Search)");
            return { success: true, leadsAdded: added };
        }
    } catch (e: any) {
        console.warn("⚠️ Fallo o Límite en Búsqueda Real. Pasando a Conocimiento Interno...");
    }

    // 2. Intento con Gemini 3.1 (Conocimiento Interno - Sin Tools para evitar 429)
    try {
        console.log(`🧠 Consultando ${PRIMARY_MODEL} (Conocimiento de Base)...`);
        const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const added = await injectLeads(JSON.parse(jsonMatch[0]).leads, "Gemini 3.1 (Memory)");
            return { success: true, leadsAdded: added, note: "Velocidad Máxima: Basado en conocimiento de red." };
        }
    } catch (e: any) {
        console.warn("⚠️ Fallo en Motor 3.1. Probando Resiliencia 2.5...");
    }

    // 3. Intento con Gemini 2.5 (Sin Tools)
    try {
        console.log(`🏗️ Activando Resiliencia: ${SECONDARY_MODEL}...`);
        const model = genAI.getGenerativeModel({ model: SECONDARY_MODEL });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const added = await injectLeads(JSON.parse(jsonMatch[0]).leads, "Gemini 2.5 (Fallback)");
            return { success: true, leadsAdded: added, note: "Pánico de Cuota: Motor de auxilio activado." };
        }
    } catch (e) {
        console.error("❌ Todos los motores de IA fallaron.");
    }

    // 4. Último Recurso: API de Maps Directa (Puede estar bloqueada por IP)
    const mapsLeads = await getLeadsFromMapsAPI();
    if (mapsLeads.length > 0) {
        const added = await injectLeads(mapsLeads, "Google Maps Direct");
        return { success: true, leadsAdded: added, note: "Respuesta de Emergencia: API de Maps activada." };
    }

    return {
        success: false,
        error: "ECLIPSE TOTAL DE SISTEMAS: Cuota de IA agotada y API de Maps bloqueada por IP. Recomendación: Configurar facturación o limpiar restricciones de IP en Google Cloud Console."
    };
}

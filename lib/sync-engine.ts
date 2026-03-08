import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

// --- CONFIGURACIÓN DE MOTOR ELITE CLAUDE/GEMINI 3.0 ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

/**
 * Función auxiliar para esperar (sleep) entre reintentos
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función centralizada para inyectar leads en la base de datos Neon
 */
async function injectLeads(leads: any[], source: string) {
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            const maps_id = `g3_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;

            await db.insert(prospects as any)
                .values({
                    name: lead.name || "Gerencia",
                    business_name: lead.business_name,
                    phone: lead.phone,
                    industry: `Sincronizado via ${source}`,
                    rating: "4.5",
                    has_website: false,
                    maps_id: maps_id,
                    status: 'cold'
                } as any)
                .onConflictDoUpdate({
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
        } catch (err) {
            console.error(`Error inyectando lead:`, err);
        }
    }
    return totalLeadsAdded;
}

export async function runProspectingSync(retryCount = 0) {
    console.log(`🚀 PROTOCOLO DE SINCRONIZACIÓN: Activando Motor Gemini 3.0 Flash (Intento ${retryCount + 1})...`);

    const prompt = `Busca en Google Maps y en la web 30 negocios locales reales en Córdoba Capital, Argentina (específicamente clínicas de estética, consultorios médicos, estudios jurídicos o inmobiliarias). 

REGLAS ESTRICTAS:
1. Todos los negocios DEBEN tener un número de teléfono público visible.
2. NINGÚN negocio debe tener un sitio web oficial propio (busco negocios sin dominio web propio).
3. Devuelve EXCLUSIVAMENTE un objeto JSON válido que contenga un array llamado "leads".
4. Cada objeto dentro del array debe tener exactamente tres propiedades: "name" (nombre del contacto si está disponible, o "Gerencia"), "business_name" (nombre del local), y "phone" (número de teléfono). No agregues texto adicional (markdown) fuera del JSON.`;

    try {
        // Intentamos usar el modelo 3.0 solicitado
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            tools: [{ googleSearchRetrieval: {} }] as any
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);

        if (!data.leads || !Array.isArray(data.leads)) {
            throw new Error("Estructura JSON inválida.");
        }

        const totalLeadsAdded = await injectLeads(data.leads, "Gemini 3.0 (High-Fi)");

        await db.insert(sync_history as any).values({
            status: 'success',
            leads_found: totalLeadsAdded,
        } as any);

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: any) {
        console.error("❌ FALLO EN EL PROTOCOLO:", error);

        const isQuotaError = error?.status === 429 || error?.message?.includes('429');
        const isModelNotFoundError = error?.message?.includes('not found');

        // --- Lógica de Auto-Reintento Inteligente ---
        if (isQuotaError && retryCount < 2) {
            console.log("⚠️ Cuota agotada. Aplicando protocolo de espera (10s) y reintento...");
            await sleep(10000);
            return runProspectingSync(retryCount + 1);
        }

        // --- Fallback Crítico si el ID 3.0 no existe o falla ---
        if (isModelNotFoundError || (isQuotaError && retryCount >= 2)) {
            console.log("⚠️ Escalando a Gemini 1.5 Flash (Ultra-Estable) como fallback...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await fallbackModel.generateContent(prompt);
                const data = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());
                if (data.leads && Array.isArray(data.leads)) {
                    const totalLeadsAdded = await injectLeads(data.leads, "Gemini 1.5 (Estable)");
                    await db.insert(sync_history as any).values({ status: 'success', leads_found: totalLeadsAdded } as any);
                    return { success: true, leadsAdded: totalLeadsAdded, note: "Sincronizado vía motor estable (Fallback)" };
                }
            } catch (fallbackErr) {
                console.error("❌ Fallo incluso el fallback:", fallbackErr);
            }
        }

        return {
            success: false,
            error: isQuotaError
                ? "Cuota de Gemini 3.0 agotada. Es necesario un despliegue forzado para refrescar el handshake con Google."
                : `Error de sistema: ${error?.message || "Protocolo interrumpido"}.`,
            isQuotaExceeded: isQuotaError
        };
    }
}

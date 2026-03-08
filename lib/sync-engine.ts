import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from 'drizzle-orm';

// --- CONFIGURACIÓN DE MOTOR ELITE GEMINI 3.0 FLASH ---
// Inicialización desde 0 de la librería oficial de Google
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function runProspectingSync() {
    console.log("🚀 PROTOCOLO DE RECONSTRUCCIÓN: Activando Motor Gemini 3.0 Flash...");

    try {
        // Inicializamos el modelo de próxima generación solicitado con capacidades de búsqueda
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            tools: [
                {
                    // @ts-ignore - Soporte para búsqueda web en tiempo real
                    googleSearchRetrieval: {},
                },
            ] as any
        });

        const prompt = `Busca en Google Maps y en la web 30 negocios locales reales en Córdoba Capital, Argentina (específicamente clínicas de estética, consultorios médicos, estudios jurídicos o inmobiliarias). 

REGLAS ESTRICTAS:
1. Todos los negocios DEBEN tener un número de teléfono público visible.
2. NINGÚN negocio debe tener un sitio web oficial propio ( busco negocios sin dominio web propio).
3. Devuelve EXCLUSIVAMENTE un objeto JSON válido que contenga un array llamado "leads".
4. Cada objeto dentro del array debe tener exactamente tres propiedades: "name" (nombre del contacto si está disponible, o "Gerencia"), "business_name" (nombre del local), y "phone" (número de teléfono ). No agregues texto adicional (markdown) fuera del JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Limpiamos la respuesta de posibles bloques markdown que la IA a veces agrega por error (aunque el prompt pide no ponerlos)
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);

        if (!data.leads || !Array.isArray(data.leads)) {
            throw new Error("Estructura JSON inválida detectada.");
        }

        const leads = data.leads;
        let totalLeadsAdded = 0;

        for (const lead of leads) {
            try {
                // Generamos un identificador único basado en el nombre y teléfono
                const maps_id = `gemini3_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;

                await db.insert(prospects as any)
                    .values({
                        name: lead.name || "Gerencia",
                        business_name: lead.business_name,
                        phone: lead.phone,
                        industry: "Sincronizado via Gemini 3.0",
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
                console.error(`Error de inyección individual:`, err);
            }
        }

        await db.insert(sync_history as any).values({
            status: 'success',
            leads_found: totalLeadsAdded,
        } as any);

        return { success: true, leadsAdded: totalLeadsAdded };

    } catch (error: any) {
        console.error("❌ FALLO EN EL PROTOCOLO GEMINI 3.0:", error);

        const isQuotaError = error?.status === 429 || error?.message?.includes('429');

        return {
            success: false,
            error: isQuotaError
                ? "Cuota de Gemini 3.0 agotada. Es necesario un despliegue forzado para refrescar el handshake con Google."
                : `Error crítico de sistema: ${error?.message || "Protocolo interrumpido"}.`,
            isQuotaExceeded: isQuotaError
        };
    }
}

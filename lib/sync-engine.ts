import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { sql } from 'drizzle-orm';

interface Lead {
    name?: string;
    business_name: string;
    phone: string;
    industry?: string;
    rating?: string;
    has_website?: boolean;
    maps_id?: string;
}

interface SyncResult {
    success: boolean;
    leadsAdded?: number;
    error?: string;
}

/**
 * Inyecta prospectos en la base de datos controlando duplicados.
 */
export async function injectLeads(leads: Lead[], source: string): Promise<number> {
    if (!db) {
        console.error("❌ DB_NOT_FOUND: No se puede inyectar leads sin conexión a DB.");
        return 0;
    }
    let totalLeadsAdded = 0;
    for (const lead of leads) {
        try {
            // Generar un ID único basado en el negocio si no viene de Maps
            const maps_id = lead.maps_id || `out_${lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lead.phone.replace(/[^0-9]/g, '')}`;

            await db.insert(prospects).values({
                name: lead.name || "Gerencia",
                business_name: lead.business_name,
                phone: lead.phone,
                industry: lead.industry || `Vía ${source}`,
                rating: lead.rating || "0",
                has_website: lead.has_website || false,
                maps_id: maps_id,
                status: 'cold'
            } as any).onConflictDoNothing({
                target: [prospects.maps_id]
            });

            totalLeadsAdded++;
        } catch (err) {
            console.error(`Error inyectando lead (${lead.business_name}):`, err);
        }
    }
    return totalLeadsAdded;
}

export async function runProspectingSync(nicheQuery: string = "Salud y Estética (Clínicas)"): Promise<SyncResult> {
    // Mapeo limpio de nichos para Google Maps (Búsqueda Singular Natural)
    const nicheMap: Record<string, string> = {
        'Salud y Estética (Clínicas)': 'centro de estetica',
        'Fitness y Deportes (Gimnasios)': 'gimnasio',
        'Belleza y Cuidado (Salones)': 'peluqueria',
        'Servicios Profesionales': 'estudio juridico',
        'Real Estate / Inmobiliarias': 'inmobiliaria',
        'Mascotas y Veterinaria': 'veterinaria',
        'Automotriz Premium': 'taller mecanico'
    };

    const searchKeyword = nicheMap[nicheQuery] || 'centro de estetica';
    const locationAnchor = "Santa Rosa 1016 Cordoba Argentina";
    const finalQuery = encodeURIComponent(`${searchKeyword} cerca de ${locationAnchor}`);
    const limit = 30;
    // CRÍTICO: async=false para modo síncrono
    const url = `https://api.app.outscraper.com/maps/search-v2?query=${finalQuery}&limit=${limit}&language=es&async=false`;

    console.log(`📡 MOTOR DETERMINISTA v7 (Outscraper): Iniciando extracción de nicho: [${nicheQuery}]...`);
    console.log("[DEBUG 1] Iniciando Sincro. URL generada:", url);
    console.log("[DEBUG 2] API Key presente:", !!process.env.OUTSCRAPER_API_KEY);

    if (!db) {
        console.error("❌ SYSTEM_FATAL: DATABASE_URL missing or connection refused.");
        return { success: false, error: "EMERGENCIA: La base de datos no está disponible. Revisa tus variables de entorno en Vercel." };
    }

    try {
        const apiKey = process.env.OUTSCRAPER_API_KEY;
        if (!apiKey) {
            throw new Error("CONFIG_ERROR: Falta OUTSCRAPER_API_KEY en el entorno.");
        }

        const response = await fetch(url, {
            headers: { 'X-API-KEY': apiKey }
        });

        console.log("[DEBUG 3] HTTP Status Outscraper:", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`API_ERROR: Outscraper respondió con status ${response.status}`);
        }

        const data = await response.json();
        console.log("[DEBUG 4] Respuesta Cruda JSON (Muestra):", JSON.stringify(data).substring(0, 200));

        if (!data.data || !data.data[0]) {
            console.log("[DEBUG 5] FALLO: data.data[0] es undefined o nulo.");
            return {
                success: false,
                error: `CERO_RESULTADOS (v7): Outscraper no localizó lugares para "${searchKeyword}" en esta zona.`
            };
        }

        const places = data.data[0];
        console.log(`[DEBUG 6] ÉXITO DE API: Se recibieron ${places.length} locales crudos. Iniciando filtrado...`);

        if (places.length > 0) {
            console.log("[DEBUG 7] Muestra de Propiedades del Local 1:", Object.keys(places[0]).join(", "));
        }

        // FILTRO ESTRICTO (v7): Con teléfono y SIN website (propiedad exacta confirmada)
        const filteredLeads = places
            .filter((place: any) => {
                const hasPhone = place.phone && String(place.phone).trim() !== '';
                // Propiedad 'website' confirmada por telemetría anterior
                const noWebsite = !place.website || String(place.website).trim() === '';
                return hasPhone && noWebsite;
            })
            .map((place: any) => ({
                name: 'Gerencia',
                business_name: place.name || 'Negocio Sin Nombre',
                phone: place.phone,
                industry: place.type || searchKeyword,
                rating: place.rating ? String(place.rating) : '0',
                has_website: false,
                maps_id: place.place_id,
                status: 'cold',
            }));

        console.log(`[DEBUG 8] Tras filtrado estricto (v7), quedaron ${filteredLeads.length} prospectos.`);

        if (filteredLeads.length === 0) {
            return {
                success: false,
                error: `BARRIDO COMPLETADO: Se analizaron ${places.length} locales. Todos ya poseen website o carecen de teléfono público.`
            };
        }

        // Inyectar en NeonDB con protección amigable
        try {
            const added = await injectLeads(filteredLeads, `Outscraper ${searchKeyword}`);

            // Registrar éxito en historial
            await db.insert(sync_history).values({
                leads_found: added,
                status: 'success'
            });

            return { success: true, leadsAdded: added };
        } catch (dbErr: any) {
            console.error("❌ FALLO DE INSERCIÓN EN DB:", dbErr);
            return { success: false, error: `DB_INSERT_ERROR: Los datos se extrajeron pero falló la carga a NeonDB: ${dbErr.message}` };
        }

    } catch (error: any) {
        console.error("🚨 FALLO CRÍTICO EN SYNC ENGINE:", error);

        try {
            if (db) {
                await db.insert(sync_history).values({
                    leads_found: 0,
                    status: 'failed'
                });
            }
        } catch (e) { }

        return {
            success: false,
            error: error.message || "Error desconocido en el motor de sincronización."
        };
    }
}

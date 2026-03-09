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

export async function runProspectingSync(nicheQuery: string = "clinica OR estetica"): Promise<SyncResult> {
    const locationAnchor = "cerca de Santa Rosa 1016 Cordoba Argentina";
    const finalQuery = encodeURIComponent(`${nicheQuery} ${locationAnchor}`);
    const limit = 30;
    // CRÍTICO: Agregar &async=false para recibir datos inmediatos
    const url = `https://api.app.outscraper.com/maps/search-v2?query=${finalQuery}&limit=${limit}&language=es&async=false`;

    console.log(`📡 MOTOR DETERMINISTA v6 (Outscraper): Iniciando extracción de nicho: [${nicheQuery}]...`);
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
        // Mostrar las primeras 200 letras de la respuesta cruda para ver si es un Error o un Task ID
        console.log("[DEBUG 4] Respuesta Cruda JSON:", JSON.stringify(data).substring(0, 200));

        if (!data.data || !data.data[0]) {
            console.log("[DEBUG 5] FALLO: data.data[0] es undefined. La API no devolvió el array de lugares.");
            return {
                success: false,
                error: `CERO_RESULTADOS (DEBUG): La API de extracción no devolvió el formato esperado o falló la búsqueda.`
            };
        }

        const places = data.data[0];
        console.log(`[DEBUG 6] ÉXITO DE API: Se recibieron ${places.length} locales crudos. Iniciando filtrado...`);

        // Inspeccionar un local crudo para ver si las propiedades 'phone' o 'site' cambiaron de nombre
        if (places.length > 0) {
            console.log("[DEBUG 7] Muestra de Propiedades del Local 1:", Object.keys(places[0]).join(", "));
        }

        // FILTRO ESTRICTO (RELAJADO PARA DEBUG): Con teléfono y SIN página web oficial
        const filteredLeads = places
            .filter((place: any) => {
                // Tiene que tener teléfono Y (no tener sitio web OR el sitio web es un string vacío)
                const hasPhone = place.phone && String(place.phone).trim() !== '';
                // Acepta undefined, null, string vacío, o si el campo se llama 'website' en lugar de 'site'
                const siteUrl = place.site || place.website;
                const noWebsite = !siteUrl || String(siteUrl).trim() === '';
                return hasPhone && noWebsite;
            })
            .map((place: any) => ({
                name: 'Gerencia',
                business_name: place.name || 'Negocio Sin Nombre',
                phone: place.phone,
                industry: place.type || 'B2B Prospect',
                rating: place.rating ? String(place.rating) : '0',
                has_website: false,
                maps_id: place.place_id,
                status: 'cold',
            }));

        console.log(`[DEBUG 8] Tras filtrado estricto, quedaron ${filteredLeads.length} prospectos listos para NeonDB.`);

        if (filteredLeads.length === 0) {
            return {
                success: false,
                error: `BARRIDO COMPLETADO: Se analizaron ${places.length} locales. Todos poseen sitio web oficial según el motor de filtrado v6.`
            };
        }

        // Inyectar en NeonDB
        const added = await injectLeads(filteredLeads, `Outscraper ${nicheQuery}`);

        // Registrar en historial
        await db.insert(sync_history).values({
            leads_found: added,
            status: 'success'
        });

        return {
            success: true,
            leadsAdded: added
        };

    } catch (error: any) {
        console.error("🚨 FALLO CRÍTICO EN SYNC ENGINE:", error);

        if (db) {
            await db.insert(sync_history).values({
                leads_found: 0,
                status: 'failed'
            });
        }

        return {
            success: false,
            error: error.message || "Error desconocido en el motor de sincronización."
        };
    }
}

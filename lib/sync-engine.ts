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
    console.log(`📡 MOTOR DETERMINISTA v5 (Outscraper): Iniciando extracción de nicho: [${nicheQuery}]...`);

    if (!db) {
        console.error("❌ SYSTEM_FATAL: DATABASE_URL missing or connection refused.");
        return { success: false, error: "EMERGENCIA: La base de datos no está disponible. Revisa tus variables de entorno en Vercel." };
    }

    try {
        const apiKey = process.env.OUTSCRAPER_API_KEY;
        if (!apiKey) {
            throw new Error("CONFIG_ERROR: Falta OUTSCRAPER_API_KEY en el entorno.");
        }

        // Búsqueda Dinámica con Ancla de Ubicación optimizada
        const locationAnchor = "cerca de Santa Rosa 1016 Cordoba Argentina";
        const finalQuery = encodeURIComponent(`${nicheQuery} ${locationAnchor}`);
        const limit = 30; // Límite estricto para proteger cuota
        const url = `https://api.app.outscraper.com/maps/search-v2?query=${finalQuery}&limit=${limit}&language=es`;

        const response = await fetch(url, {
            headers: { 'X-API-KEY': apiKey }
        });

        if (!response.ok) {
            throw new Error(`API_ERROR: Outscraper respondió con status ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data[0]) {
            return {
                success: false,
                error: `CERO_RESULTADOS: No se localizaron nuevos locales del nicho especifico en esta zona de barrido.`
            };
        }

        const places = data.data[0];

        // FILTRO ESTRICTO (CRÍTICO): Con teléfono y SIN página web oficial
        const filteredLeads = places
            .filter((place: any) => {
                // Tiene que tener teléfono Y (no tener sitio web OR el sitio web es un string vacío)
                const hasPhone = place.phone && place.phone.trim() !== '';
                const noWebsite = !place.site || place.site.trim() === '';
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

        if (filteredLeads.length === 0) {
            return {
                success: false,
                error: `BARRIDO COMPLETADO: Se analizaron ${places.length} locales del nicho seleccionado. Todos ya poseen sitio web oficial o carecen de teléfono. Sugerencia: Cambiar el nicho en el selector.`
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

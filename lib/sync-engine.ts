import { db } from "@/db";
import { prospects, sync_history } from "@/db/schema";
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function runProspectingSync() {
    console.log("🚀 Starting AI Prospecting Sync (Vercel AI SDK + Google Search Tool)...");

    try {
        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: z.object({
                leads: z.array(z.object({
                    name: z.string(),
                    business_name: z.string(),
                    phone: z.string(),
                    industry: z.string(),
                    rating: z.number(),
                    has_website: z.boolean(),
                    maps_id: z.string(),
                }))
            }),
            prompt: `
                Actúa como un experto en prospección B2B de élite. 
                Busca en Google negocios reales y operativos en Córdoba, Argentina.
                Categorías: Inmobiliarias, Estéticas de Lujo o Clínicas Privadas.
                
                REQUISITOS OBLIGATORIOS:
                1. NO deben tener sitio web oficial (valídalo buscando su nombre).
                2. Deben tener un Rating > 4.2 en Google Maps.
                3. Los teléfonos deben estar en formato internacional (+54...).
                4. Extrae 5 negocios únicos.
            `,
        });

        const leads = object.leads;
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

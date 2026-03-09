"use server";

import { db } from '../db';
import { prospects, outbox, message_templates, sync_history, user_profile } from '../db/schema';
import { desc, eq, sql, isNull, gte, lte, and } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import { runProspectingSync, injectLeads } from './sync-engine';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Verification & Sync ---
export async function verifyConnection() {
    try {
        if (!db) return { success: false, message: "Base de datos no disponible por falta de variable de entorno." };
        const testName = `Test_${Date.now()}`;
        await db.insert(prospects as any).values({
            name: testName,
            business_name: "Antigravity Lab",
            status: 'cold',
            maps_id: `test_${Date.now()}`
        } as any);

        const result = await db.query.prospects.findFirst({
            where: eq(prospects.name, testName)
        });

        if (result) {
            return { success: true, message: "Database connection stable. Read/Write verified." };
        }
        return { success: false, message: "Write succeeded but Read failed." };
    } catch (error: any) {
        console.error("DB Verification Error:", error);
        return { success: false, message: error.message || "Connection failed." };
    }
}

export async function syncProspects(nicheQuery?: string) {
    return await runProspectingSync(nicheQuery);
}

// --- Prospects ---
export async function getProspects() {
    try {
        if (!db) return [];
        const results = await db.query.prospects.findMany({
            orderBy: [desc(prospects.createdAt)],
        });

        if (results.length === 0) {
            return [];
        }
        return results;
    } catch (error) {
        console.error("Error fetching prospects:", error);
        return [];
    }
}

export async function createProspect(data: any) {
    try {
        if (!db) throw new Error("Base de datos no disponible.");
        await db.insert(prospects as any).values({
            ...data,
            maps_id: data.maps_id || `manual_${Date.now()}`
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating prospect:", error);
        return { success: false, error: String(error) };
    }
}

export async function updateProspectStatus(id: string, status: 'cold' | 'contacted' | 'interested' | 'closed') {
    try {
        if (!db) return { success: false };
        await db.update(prospects).set({ status, last_interaction: new Date() }).where(eq(prospects.id, id));
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function updateProspectFinancials(id: string, data: any) {
    try {
        if (!db) return { success: false };
        await db.update(prospects).set({
            total_price: data.total_price,
            installments: data.installments,
            monthly_maintenance: data.monthly_maintenance,
            last_payment_date: data.last_payment_date ? new Date(data.last_payment_date) : new Date(),
            next_payment_due: data.next_payment_due ? new Date(data.next_payment_due) : null,
            status: 'closed'
        }).where(eq(prospects.id, id));
        return { success: true };
    } catch (error) {
        console.error("Error updating financials:", error);
        return { success: false };
    }
}

export async function updateProjectVault(id: string, details: any) {
    try {
        if (!db) return { success: false };
        await db.update(prospects).set({
            project_details: details
        }).where(eq(prospects.id, id));
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function updateProspect(id: string, data: any) {
    try {
        if (!db) return { success: false };
        await db.update(prospects).set({
            name: data.name,
            business_name: data.business_name,
            phone: data.phone,
            industry: data.industry,
            last_interaction: new Date()
        }).where(eq(prospects.id, id));
        return { success: true };
    } catch (error) {
        console.error("Error updating prospect:", error);
        return { success: false };
    }
}

export async function importLeads(leads: any[]) {
    try {
        const added = await injectLeads(leads, "Importación Manual");
        return { success: true, leadsAdded: added };
    } catch (error) {
        console.error("Error importando leads:", error);
        return { success: false, error: String(error) };
    }
}

// --- Outbox (WhatsApp Bridge) ---
export async function queueMessage(phone: string, message: string, mediaUrl?: string) {
    try {
        if (!db) return { success: false };
        await db.insert(outbox as any).values({
            phone,
            message,
            media_url: mediaUrl,
            status: 'pending'
        });
        return { success: true };
    } catch (error) {
        console.error("Queue error:", error);
        return { success: false };
    }
}

// --- Templates ---
export async function getTemplates() {
    try {
        if (!db) return [];
        const t = await db.query.message_templates.findMany();
        return t;
    } catch (error) {
        return [];
    }
}

export async function createTemplate(title: string, content: string) {
    try {
        if (!db) return { success: false, error: "Base de datos no disponible." };
        await db.insert(message_templates as any).values({
            title,
            content,
            media_urls: []
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating template:", error);
        return { success: false, error: String(error) };
    }
}

// --- Profile ---
export async function getProfile() {
    try {
        if (!db) return null;
        let profile = await db.query.user_profile.findFirst({ where: eq(user_profile.id, 1) });
        if (!profile) {
            // Inicializar si no existe
            await db.insert(user_profile).values({ id: 1, full_name: 'Director Elite', role: 'CEO & Founder' });
            profile = await db.query.user_profile.findFirst({ where: eq(user_profile.id, 1) });
        }
        return profile;
    } catch (error) {
        return null;
    }
}

export async function updateProfile(data: any) {
    try {
        if (!db) return { success: false };
        await db.update(user_profile).set({
            ...data,
            updated_at: new Date()
        }).where(eq(user_profile.id, 1));
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// --- Multimedia (Cloudinary) ---
export async function uploadToCloudinary(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    upload_preset: 'elite_sales_preset', // Per directiva de ingeniería
                    unsigned: true
                } as any,
                (error, result) => {
                    if (error) reject(error);
                    else resolve({ success: true, url: result?.secure_url });
                }
            );
            stream.end(buffer);
        });
    } catch (error: any) {
        console.error("Cloudinary error:", error);
        return { success: false, error: error.message };
    }
}

// --- Stats ---
export async function getDashboardStats() {
    try {
        if (!db) {
            return {
                projectedRevenue: "$0",
                hotProspects: 0,
                conversionRate: "0%",
                messagesSent: "0",
                withoutWeb: 0,
                totalProspects: 0
            };
        }
        const all = await getProspects();
        const totalProspects = all.length;
        const closed = all.filter(p => p.status === 'closed');
        const hot = all.filter(p => p.status === 'interested').length;

        // Ingresos Reales: Suma de total_price + monthly_maintenance de los cerrados
        const totalRevenue = closed.reduce((acc, p) => acc + Number(p.total_price || 0) + Number(p.monthly_maintenance || 0), 0);

        const conversionRate = totalProspects > 0 ? (closed.length / totalProspects) * 100 : 0;
        const messagesSentRes = await db.query.outbox.findMany({ where: eq(outbox.status, 'sent') });
        const withoutWeb = all.filter(p => !p.has_website).length;

        return {
            projectedRevenue: `$${totalRevenue.toLocaleString()}`,
            hotProspects: hot,
            conversionRate: `${conversionRate.toFixed(1)}%`,
            messagesSent: messagesSentRes.length.toLocaleString(),
            withoutWeb,
            totalProspects
        };
    } catch (error) {
        return {
            projectedRevenue: "$0",
            hotProspects: 0,
            conversionRate: "0%",
            messagesSent: "0",
            withoutWeb: 0,
            totalProspects: 0
        };
    }
}

export async function processOutbox() {
    try {
        if (!db) return { success: false, error: "Base de datos no disponible." };
        const pending = await db.query.outbox.findMany({
            where: eq(outbox.status, 'pending')
        });

        if (pending.length === 0) return { success: true, processed: 0 };

        for (const msg of pending) {
            // AQUÍ: Integración real con Twilio o WAAPI en el futuro
            await db.update(outbox as any)
                .set({ status: 'sent', sent_at: sql`now()` } as any)
                .where(eq(outbox.id, msg.id));
        }

        return { success: true, processed: pending.length };
    } catch (error) {
        console.error("Outbox process error:", error);
        return { success: false, error: String(error) };
    }
}
export async function getNotifications() {
    try {
        if (!db) return [];
        const allClosed = await db.query.prospects.findMany({
            where: eq(prospects.status, 'closed')
        });

        const notifications: any[] = [];
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        allClosed.forEach(p => {
            // Alerta de Cobro
            if (p.next_payment_due && p.next_payment_due <= nextWeek) {
                notifications.push({
                    id: `pay_${p.id}`,
                    type: 'billing',
                    title: 'Cobro Pendiente',
                    msg: `Cuota de ${p.business_name} vence el ${p.next_payment_due.toLocaleDateString()}`,
                    item: p
                });
            }

            // Alerta de Domino
            const details = (p.project_details as any) || {};
            if (details.domain_renewal_date) {
                const renewalDate = new Date(details.domain_renewal_date);
                if (renewalDate <= nextWeek) {
                    notifications.push({
                        id: `dom_${p.id}`,
                        type: 'security',
                        title: 'Vencimiento Dominio',
                        msg: `El dominio de ${p.business_name} vence en pocos días.`,
                        item: p
                    });
                }
            }
        });

        return notifications;
    } catch (error) {
        return [];
    }
}

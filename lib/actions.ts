import { db } from '../db';
import { prospects, outbox, message_templates, sync_history } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import { runProspectingSync } from './sync-engine';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Verification & Sync ---
export async function verifyConnection() {
    try {
        const testId = crypto.randomUUID();
        // @ts-ignore
        await db.insert(prospects).values({
            id: testId,
            name: "Test Connection",
            business_name: "Antigravity Lab",
            status: 'cold',
            maps_id: `test_${Date.now()}`
        });

        const result = await db.query.prospects.findFirst({
            where: eq(prospects.id, testId)
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

export async function syncProspects() {
    "use server";
    return await runProspectingSync();
}

// --- Prospects ---
export async function getProspects() {
    try {
        const results = await db.query.prospects.findMany({
            orderBy: [desc(prospects.createdAt)],
        });

        if (results.length === 0) {
            return [
                {
                    id: crypto.randomUUID(),
                    name: "Dr. Alberto Fernández",
                    business_name: "Clínica Estética Córdoba",
                    phone: "+54 351 123 4567",
                    industry: "Health",
                    rating: "4.8",
                    has_website: false,
                    maps_id: "sample_id",
                    status: 'cold' as const,
                    last_interaction: null,
                    createdAt: new Date()
                }
            ];
        }
        return results;
    } catch (error) {
        console.error("Error fetching prospects:", error);
        return [];
    }
}

export async function updateProspectStatus(id: string, status: 'cold' | 'contacted' | 'interested' | 'closed') {
    "use server";
    try {
        // @ts-ignore
        await db.update(prospects).set({ status, last_interaction: new Date() }).where(eq(prospects.id, id));
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// --- Outbox (WhatsApp Bridge) ---
export async function queueMessage(phone: string, message: string, mediaUrl?: string) {
    "use server";
    try {
        // @ts-ignore
        await db.insert(outbox).values({
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
        const t = await db.query.message_templates.findMany();
        if (t.length === 0) {
            return [{
                id: crypto.randomUUID(),
                title: "Liquid Luxury - Contacto",
                content: "Hola {nombre}, vimos tu negocio {negocio} y tenemos una propuesta..."
            }];
        }
        return t;
    } catch (error) {
        return [];
    }
}

// --- Multimedia (Cloudinary) ---
export async function uploadToCloudinary(formData: FormData) {
    "use server";
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
                },
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
        const all = await getProspects();
        const totalProspects = all.length;
        const hot = all.filter(p => p.status === 'interested').length;
        const closed = all.filter(p => p.status === 'closed').length;
        const conversionRate = totalProspects > 0 ? (closed / totalProspects) * 100 : 0;
        const messagesSentRes = await db.query.outbox.findMany({ where: eq(outbox.status, 'sent') });
        const withoutWeb = all.filter(p => !p.has_website).length;

        return {
            projectedRevenue: `$${(hot * 1200).toLocaleString()}`,
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

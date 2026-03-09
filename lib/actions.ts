"use server";

import { db } from '../db';
import { prospects, outbox, message_templates, sync_history } from '../db/schema';
import { desc, eq, sql, isNull } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import { runProspectingSync, injectLeads } from './sync-engine';
import { GoogleGenerativeAI } from "@google/generative-ai";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Verification & Sync ---
export async function verifyConnection() {
    try {
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

export async function syncProspects() {
    return await runProspectingSync();
}

// --- Prospects ---
export async function getProspects() {
    try {
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
        await db.update(prospects as any).set({ status, last_interaction: new Date() }).where(eq(prospects.id, id));
        return { success: true };
    } catch (error) {
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function chatWithAI(message: string, history: any[] = []) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            tools: [{ googleSearchRetrieval: {} } as any]
        }, { apiVersion: 'v1beta' });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });

        const result = await chat.sendMessage(message);
        return { success: true, text: result.response.text() };
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return { success: false, error: error.message };
    }
}

// --- Outbox (WhatsApp Bridge) ---
export async function queueMessage(phone: string, message: string, mediaUrl?: string) {
    try {
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
        const t = await db.query.message_templates.findMany();
        return t;
    } catch (error) {
        return [];
    }
}

export async function createTemplate(title: string, content: string) {
    try {
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

export async function processOutbox() {
    try {
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

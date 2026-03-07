"use server";

import { db } from "@/db";
import { prospects, templates, syncHistory } from "@/db/schema";
import { desc, eq, sql, and, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProspects() {
    try {
        return await db.query.prospects.findMany({
            orderBy: [desc(prospects.createdAt)],
        });
    } catch (error) {
        console.error("Error fetching prospects:", error);
        return [];
    }
}

export async function getTemplates() {
    try {
        return await db.query.templates.findMany({
            orderBy: [desc(templates.createdAt)],
        });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return [];
    }
}

export async function getDashboardStats() {
    try {
        const allProspects = await db.select().from(prospects);

        // In search of "Hot" prospects (interested)
        const hotProspects = allProspects.filter(p => p.status === 'Interested' || p.status === 'Interested').length;

        // Conversion rate (Closed / Total)
        const closedCount = allProspects.filter(p => p.status === 'Closed').length;
        const conversionRate = allProspects.length > 0 ? (closedCount / allProspects.length) * 100 : 0;

        // Messages sent (Total contacted)
        const messagesSent = allProspects.filter(p => p.status !== 'Cold').length;

        // Projected Revenue (Demo logic: $5000 per closed deal)
        const projectedRevenue = closedCount * 5000;

        // Businesses without web
        const withoutWeb = allProspects.filter(p => !p.hasWebsite).length;

        return {
            projectedRevenue: `$${projectedRevenue.toLocaleString()}`,
            hotProspects,
            conversionRate: `${conversionRate.toFixed(1)}%`,
            messagesSent: messagesSent.toLocaleString(),
            withoutWeb
        };
    } catch (error) {
        console.error("Error calculating stats:", error);
        return {
            projectedRevenue: "$0",
            hotProspects: 0,
            conversionRate: "0%",
            messagesSent: "0",
            withoutWeb: 0
        };
    }
}

import { runProspectingSync } from "./sync-engine";

export async function syncProspects(query: string = "clínicas estéticas en Córdoba") {
    try {
        const result = await runProspectingSync(query);
        revalidatePath("/");
        return result;
    } catch (error) {
        console.error("Error syncing prospects:", error);
        return { success: false };
    }
}

export async function updateProspectStatus(id: number, status: string) {
    try {
        await db.update(prospects)
            .set({ status: status as any, lastInteraction: new Date() })
            .where(eq(prospects.id, id));
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating prospect status:", error);
        return { success: false };
    }
}

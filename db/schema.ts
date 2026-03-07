import { pgTable, text, serial, timestamp, jsonb, boolean, integer, real } from 'drizzle-orm/pg-core';

export const prospects = pgTable('prospects', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    businessName: text('business_name'),
    phone: text('phone'),
    industry: text('industry'),
    rating: real('rating'),
    hasWebsite: boolean('has_website').default(false),
    googleMapsId: text('google_maps_id').unique(),
    status: text('status').default('cold'), // cold, contacted, interested, closed
    lastInteraction: timestamp('last_interaction'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const templates = pgTable('message_templates', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(), // con placeholders {nombre} y {negocio}
    mediaUrls: jsonb('media_urls').$type<string[]>().default([]),
    createdAt: timestamp('created_at').defaultNow(),
});

export const syncHistory = pgTable('sync_history', {
    id: serial('id').primaryKey(),
    timestamp: timestamp('timestamp').defaultNow(),
    status: text('status').notNull(), // success, failed
    leadsFound: integer('leads_found').default(0),
});

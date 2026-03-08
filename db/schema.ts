import { pgTable, text, timestamp, jsonb, boolean, integer, numeric, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const prospects = pgTable('prospects', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    name: text('name').notNull(),
    business_name: text('business_name'),
    phone: text('phone'),
    industry: text('industry'),
    rating: numeric('rating'),
    has_website: boolean('has_website').default(false),
    maps_id: text('maps_id').unique(),
    status: text('status', { enum: ['cold', 'contacted', 'interested', 'closed'] }).default('cold'),
    last_interaction: timestamp('last_interaction'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const outbox = pgTable('outbox', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    phone: text('phone').notNull(),
    message: text('message').notNull(),
    media_url: text('media_url'),
    status: text('status').default('pending').notNull(),
    sent_at: timestamp('sent_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

export const message_templates = pgTable('message_templates', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(), // con soporte para variables {nombre} y {negocio}
    media_urls: jsonb('media_urls').default([]),
});

export const sync_history = pgTable('sync_history', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    timestamp: timestamp('timestamp').defaultNow(),
    leads_found: integer('leads_found').default(0),
    status: text('status').notNull(), // success, failed
});

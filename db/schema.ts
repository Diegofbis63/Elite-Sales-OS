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
    status: text('status').default('cold').$type<'cold' | 'contacted' | 'interested' | 'closed' | 'cancelled'>(),

    // Finanzas ERP
    total_price: numeric('total_price').default('0'),
    installments: integer('installments').default(1),
    monthly_maintenance: numeric('monthly_maintenance').default('0'),

    // Control de Cobros
    last_payment_date: timestamp('last_payment_date'),
    next_payment_due: timestamp('next_payment_due'),

    // Bóveda del Proyecto (JSONB)
    // Estructura: { website_url, admin_user, admin_password, database_hosting, domain_name, domain_renewal_date }
    project_details: jsonb('project_details').default({}),

    last_interaction: timestamp('last_interaction'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const user_profile = pgTable('user_profile', {
    id: integer('id').primaryKey().default(1), // Único perfil por ahora
    full_name: text('full_name').default('Director Elite'),
    role: text('role').default('CEO & Founder'),
    photo_base64: text('photo_base64'),
    updated_at: timestamp('updated_at').defaultNow(),
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

export const projects = pgTable('projects', {
    id: text('id').primaryKey(),
    es: jsonb('es').notNull(), // { name, description, value_props: [], niche, roi_metric }
    en: jsonb('en').notNull(),
    vercel_url: text('vercel_url'),
    doc_url: text('doc_url'),
    estimated_price: text('estimated_price').default('0'),
    created_at: timestamp('created_at').defaultNow(),
});

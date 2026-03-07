import { pgTable, text, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const prospects = pgTable('prospects', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    contact: text('contact'),
    status: text('status').default('Frío'),
    lastContact: text('last_contact'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const templates = pgTable('templates', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    state: text('state').notNull(),
    content: text('content').notNull(),
    variables: jsonb('variables').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow(),
});

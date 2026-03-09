import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Inicialización de base de datos resiliente.
 * Prioriza variables limpias de la integración nativa de Vercel (POSTGRES_URL).
 */
const url = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '').trim();

if (!url && process.env.NODE_ENV === 'production') {
    console.warn("⚠️ ALERTA: No se detectó URL de base de datos. Verifica la integración de Vercel Storage.");
}

// @ts-ignore
export const client = url ? neon(url) : null;
// @ts-ignore
export const db = url ? drizzle(client, { schema }) : null;

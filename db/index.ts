import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Inicialización segura de la base de datos.
 * Evita el crash en tiempo de compilación o durante el renderizado del servidor de componentes cliente
 * si la variable DATABASE_URL falta momentáneamente en el entorno.
 */
const url = process.env.DATABASE_URL?.trim();

if (!url && process.env.NODE_ENV === 'production') {
    console.warn("⚠️ DATABASE_URL no detectada en producción. Las operaciones de DB fallarán.");
}

// Exportamos el cliente y la instancia de db de forma que el error se maneje en ejecución
// y no detenga la carga del módulo (aislamiento de Server Actions).
// @ts-ignore
export const client = url ? neon(url) : null;
// @ts-ignore
export const db = url ? drizzle(client, { schema }) : null;

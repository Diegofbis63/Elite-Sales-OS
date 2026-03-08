import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const url = process.env.DATABASE_URL?.trim();
if (!url) throw new Error("DATABASE_URL is not defined or is empty");
const sql = neon(url);
export const db = drizzle(sql, { schema });

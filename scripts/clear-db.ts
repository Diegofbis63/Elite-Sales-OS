import { db } from "../db/index";
import { sql } from "drizzle-orm";

async function clear() {
    console.log("Limpiando tablas para recrear con UUIDs...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS sync_history CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS message_templates CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS prospects CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS templates CASCADE;`);
        console.log("Tablas eliminadas con éxito.");
        process.exit(0);
    } catch (e) {
        console.error("Error al limpiar:", e);
        process.exit(1);
    }
}

clear();

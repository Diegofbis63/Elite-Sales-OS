import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { sql } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function main() {
    console.log('Seeding users...');

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'elite2024';

    const adminPasswordHash = await bcrypt.hash(adminPass, 10);
    const demoPassword = await bcrypt.hash('demo2024', 10);

    // Limpiar usuarios previos para asegurar que solo existan los actuales
    await db.delete(schema.users);

    await db.insert(schema.users).values([
        {
            username: adminUser,
            password: adminPasswordHash,
            role: 'admin'
        },
        {
            username: 'demo',
            password: demoPassword,
            role: 'demo'
        }
    ]).onConflictDoUpdate({
        target: schema.users.username,
        set: {
            password: sql`excluded.password`,
            role: sql`excluded.role`
        }
    });

    console.log('Users seeded successfully');
    console.log(`Admin: ${adminUser} / ${adminPass}`);
    console.log('Demo: demo / demo2024');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

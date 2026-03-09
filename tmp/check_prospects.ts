import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const res = await (sql as any)`SELECT DISTINCT status FROM prospects`;
        console.log('Statuses:', res);

        const all = await (sql as any)`SELECT id, name, status FROM prospects LIMIT 5`;
        console.log('Samples:', all);
    } catch (err) {
        console.error('Error:', err);
    }
}
check();

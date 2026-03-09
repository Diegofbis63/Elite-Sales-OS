import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We must require/import db AFTER dotenv.config
async function check() {
    const { db } = await import('../db');
    const { prospects } = await import('../db/schema');
    try {
        const results = await db!.select().from(prospects);
        console.log('Results Found:', results.length);
        console.log('Sample Row (columns):', Object.keys(results[0] || {}));
    } catch (err) {
        console.error('Error with Drizzle:', err);
    }
}
check();

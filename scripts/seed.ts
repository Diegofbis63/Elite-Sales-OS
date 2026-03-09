import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
    console.log('Seeding initial data...');

    await db.insert(schema.prospects).values([
        { name: 'Dr. Roberto Gómez', business_name: 'Clínica del Sol', status: 'interested', industry: 'Salud' },
        { name: 'Lic. María Paz', business_name: 'Estética Nueva Córdoba', status: 'contacted', industry: 'Estética' },
        { name: 'Ing. Carlos Ruiz', business_name: 'Sanatorio Allende', status: 'cold', industry: 'Salud' },
        { name: 'Dra. Ana López', business_name: 'Consultorios Cerro', status: 'closed', industry: 'Salud' },
    ]);

    await db.insert(schema.message_templates).values([
        {
            title: 'Abridor Clínicas',
            content: 'Hola {nombre}, ¿cómo estás? Vi que están haciendo un excelente trabajo en {negocio}. Quería consultarte si actualmente están tomando nuevos pacientes o si tienen la agenda llena.',
        },
        {
            title: 'Seguimiento Valor (Día 3)',
            content: 'Hola {nombre}, te escribo cortito para no robarte tiempo. ¿Pudiste ver el mensaje anterior sobre cómo podemos escalar las consultas en {negocio}?',
        },
    ]);

    console.log('Seed completed successfully');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

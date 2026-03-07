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
        { name: 'Clínica del Sol', contact: 'Dr. Roberto Gómez', status: 'Interesado', lastContact: 'Hoy, 10:30 AM' },
        { name: 'Estética Nueva Córdoba', contact: 'Lic. María Paz', status: 'Contactado', lastContact: 'Ayer, 16:45 PM' },
        { name: 'Sanatorio Allende', contact: 'Ing. Carlos Ruiz', status: 'Frío', lastContact: 'Hace 3 días' },
        { name: 'Consultorios Cerro', contact: 'Dra. Ana López', status: 'Cerrado', lastContact: 'Hace 1 semana' },
    ]);

    await db.insert(schema.templates).values([
        {
            title: 'Abridor Clínicas',
            state: 'Frío',
            content: 'Hola {nombre}, ¿cómo estás? Vi que están haciendo un excelente trabajo en {negocio}. Quería consultarte si actualmente están tomando nuevos pacientes o si tienen la agenda llena.',
            variables: ['{nombre}', '{negocio}']
        },
        {
            title: 'Seguimiento Valor (Día 3)',
            state: 'Contactado',
            content: 'Hola {nombre}, te escribo cortito para no robarte tiempo. ¿Pudiste ver el mensaje anterior sobre cómo podemos escalar las consultas en {negocio}?',
            variables: ['{nombre}', '{negocio}']
        },
    ]);

    console.log('Seed completed successfully');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

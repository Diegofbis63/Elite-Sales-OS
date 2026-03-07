import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { templates } from '../db/schema';
import { desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        try {
            const data = await db.select().from(templates).orderBy(desc(templates.createdAt));
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { title, state, content, variables } = req.body;
            const result = await db.insert(templates).values({
                title,
                state,
                content,
                variables,
            }).returning();
            return res.status(201).json(result[0]);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

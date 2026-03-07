import { NextResponse } from 'next/server';
import { runProspectingSync } from '@/lib/sync-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Check for Vercel Cron Secret (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const result = await runProspectingSync();
    return NextResponse.json(result);
}

import { NextResponse } from 'next/server';
import { runProspectingSync } from '@/lib/sync-engine';

export async function GET(request: Request) {
    // Basic verification for Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log("Cron sync triggered.");
    const result = await runProspectingSync();
    return NextResponse.json(result);
}

export async function POST(request: Request) {
    // For manual triggers (if requested)
    const result = await runProspectingSync();
    return NextResponse.json(result);
}

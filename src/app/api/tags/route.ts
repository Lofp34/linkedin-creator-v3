import { NextResponse } from 'next/server';
import { getTags } from '@/lib/db';

// GET /api/tags - List all tags
export async function GET() {
    try {
        // Debug: Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('PG')));
            return NextResponse.json(
                { error: 'Database not configured', debug: 'DATABASE_URL missing' },
                { status: 500 }
            );
        }

        const tags = await getTags();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags', details: String(error) },
            { status: 500 }
        );
    }
}

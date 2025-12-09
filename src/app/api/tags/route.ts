import { NextResponse } from 'next/server';
import { getTags, createTag } from '@/lib/db';

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

// POST /api/tags - Create a new tag
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, is_priority } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newTag = await createTag({ name, category, is_priority });
        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        console.error('Failed to create tag:', error);
        return NextResponse.json(
            { error: 'Failed to create tag', details: String(error) },
            { status: 500 }
        );
    }
}

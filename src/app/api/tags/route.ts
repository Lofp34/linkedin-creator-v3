import { NextResponse } from 'next/server';
import { getTags } from '@/lib/db';

// GET /api/tags - List all tags
export async function GET() {
    try {
        const tags = await getTags();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

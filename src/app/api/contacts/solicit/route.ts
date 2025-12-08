import { NextResponse } from 'next/server';
import { incrementSolicitationCount } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'IDs array is required and cannot be empty' },
                { status: 400 }
            );
        }

        await incrementSolicitationCount(ids);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to increment solicitations:', error);
        return NextResponse.json(
            { error: 'Failed to update solicitations', details: String(error) },
            { status: 500 }
        );
    }
}

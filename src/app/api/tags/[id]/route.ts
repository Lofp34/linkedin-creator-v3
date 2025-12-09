import { NextResponse } from 'next/server';
import { updateTag, deleteTag } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const tagId = parseInt(id);

        if (isNaN(tagId)) {
            return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
        }

        const updatedTag = await updateTag(tagId, body);

        if (!updatedTag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTag);
    } catch (error) {
        console.error('Failed to update tag:', error);
        return NextResponse.json(
            { error: 'Failed to update tag', details: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tagId = parseInt(id);

        if (isNaN(tagId)) {
            return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
        }

        const success = await deleteTag(tagId);

        if (!success) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete tag:', error);
        return NextResponse.json(
            { error: 'Failed to delete tag', details: String(error) },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { updateContactTags, deleteContact } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH /api/contacts/[id] - Update contact tags
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { tags } = body;

        if (!Array.isArray(tags)) {
            return NextResponse.json(
                { error: 'Tags must be an array' },
                { status: 400 }
            );
        }

        const contact = await updateContactTags(id, tags);

        if (!contact) {
            return NextResponse.json(
                { error: 'Contact not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Failed to update contact:', error);
        return NextResponse.json(
            { error: 'Failed to update contact', details: String(error) },
            { status: 500 }
        );
    }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const deleted = await deleteContact(id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Contact not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete contact:', error);
        return NextResponse.json(
            { error: 'Failed to delete contact', details: String(error) },
            { status: 500 }
        );
    }
}

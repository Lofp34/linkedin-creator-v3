import { NextResponse } from 'next/server';
import { getContacts, addContact } from '@/lib/db';

// GET /api/contacts - List all contacts
export async function GET() {
    try {
        const contacts = await getContacts();
        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contacts' },
            { status: 500 }
        );
    }
}

// POST /api/contacts - Create a new contact
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstname, lastname, tags } = body;

        if (!firstname || !lastname) {
            return NextResponse.json(
                { error: 'Firstname and lastname are required' },
                { status: 400 }
            );
        }

        const contact = await addContact(firstname, lastname, tags || []);
        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Failed to create contact:', error);
        return NextResponse.json(
            { error: 'Failed to create contact' },
            { status: 500 }
        );
    }
}

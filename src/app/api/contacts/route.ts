import { NextResponse } from 'next/server';
import { getContacts, addContact } from '@/lib/db';

// GET /api/contacts - List all contacts
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

        const contacts = await getContacts();
        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contacts', details: String(error) },
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
            { error: 'Failed to create contact', details: String(error) },
            { status: 500 }
        );
    }
}

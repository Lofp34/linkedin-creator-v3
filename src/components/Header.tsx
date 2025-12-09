'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header({
    contactCount,
    onAddContact,
    onManageTags
}: {
    contactCount?: number;
    onAddContact?: () => void;
    onManageTags?: () => void;
}) {
    const pathname = usePathname();

    return (
        <header className="app-header">
            <div className="app-logo">
                <span className="app-logo-prefix">LinkedIn</span>
                <span className="app-logo-main">@Creator</span>
            </div>

            <nav style={{ display: 'flex', gap: '2rem', margin: '0 2rem' }}>
                <Link
                    href="/"
                    className="nav-link"
                    style={{
                        fontWeight: pathname === '/' ? 'bold' : 'normal',
                        color: pathname === '/' ? 'var(--color-primary)' : 'var(--color-text)',
                        textDecoration: 'none'
                    }}
                >
                    Campagne
                </Link>
                <Link
                    href="/contacts"
                    className="nav-link"
                    style={{
                        fontWeight: pathname === '/contacts' ? 'bold' : 'normal',
                        color: pathname === '/contacts' ? 'var(--color-primary)' : 'var(--color-text)',
                        textDecoration: 'none'
                    }}
                >
                    Mes Contacts
                </Link>
            </nav>

            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginLeft: 'auto' }}>
                {onAddContact && (
                    <button className="btn btn-primary" onClick={onAddContact}>
                        + Nouveau Contact
                    </button>
                )}
                {onManageTags && (
                    <button className="btn btn-secondary" onClick={onManageTags}>
                        # Tags
                    </button>
                )}
                {contactCount !== undefined && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {contactCount} contacts
                    </span>
                )}
            </div>
        </header>
    );
}

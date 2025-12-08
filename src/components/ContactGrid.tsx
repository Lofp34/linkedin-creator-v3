'use client';

import type { Person } from '@/lib/db';

interface ContactGridProps {
    contacts: Person[];
    selectedContacts: Set<string>;
    onToggleContact: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}

export function ContactGrid({
    contacts,
    selectedContacts,
    onToggleContact,
    onSelectAll,
    onDeselectAll
}: ContactGridProps) {
    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname[0] || ''}${lastname[0] || ''}`.toUpperCase();
    };

    const allSelected = contacts.length > 0 && contacts.every(c => selectedContacts.has(c.id));

    return (
        <div>
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-value">{contacts.length}</span>
                    <span className="stat-label">Contacts filtrés</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{selectedContacts.size}</span>
                    <span className="stat-label">Sélectionnés</span>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        disabled={contacts.length === 0}
                    >
                        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                </div>
            </div>

            {contacts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl)',
                    color: 'var(--color-text-muted)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', opacity: 0.5 }}>🏷️</div>
                    <p>Sélectionnez des tags pour filtrer vos contacts</p>
                </div>
            ) : (
                <div className="contact-grid">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            className={`contact-card ${selectedContacts.has(contact.id) ? 'selected' : ''}`}
                            onClick={() => onToggleContact(contact.id)}
                        >
                            <div className="contact-avatar">
                                {getInitials(contact.firstname, contact.lastname)}
                            </div>
                            <div className="contact-info">
                                <div className="contact-name">
                                    {contact.firstname} {contact.lastname}
                                </div>
                                <div className="contact-solicitations">
                                    {contact.solicitation_count} sollicitation{contact.solicitation_count !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

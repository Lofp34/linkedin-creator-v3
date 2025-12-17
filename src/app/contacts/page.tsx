'use client';

import { useState, useEffect } from 'react';
import type { Person, Tag } from '@/lib/db';
import { AddContactModal } from '@/components/AddContactModal';
import { Header } from '@/components/Header';
import { TagSelector } from '@/components/TagSelector';
import { TagManager } from '@/components/TagManager';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Person[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingContact, setEditingContact] = useState<Person | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                setTags(data);
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    useEffect(() => {
        Promise.all([fetchContacts(), fetchTags()]).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setContacts(prev => prev.filter(c => c.id !== id));
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Failed to delete contact:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleUpdateTags = async (contact: Person, newTags: string[]) => {
        try {
            const response = await fetch(`/api/contacts/${contact.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: newTags })
            });

            if (response.ok) {
                const updatedContact = await response.json();
                setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
                setEditingContact(null);
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Failed to update contact:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleAddContact = async (contactData: Omit<Person, 'id' | 'solicitation_count' | 'last_solicitation_date'>) => {
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                const newContact = await response.json();
                setContacts(prev => [newContact, ...prev]);
                setIsAddModalOpen(false);
            } else {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 409) {
                    throw new Error(errorData.details || 'Ce contact existe déjà');
                }
                throw new Error('Erreur lors de la création');
            }
        } catch (error) {
            console.error('Failed to add contact:', error);
            throw error;
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <Header
                contactCount={contacts.length}
                onAddContact={() => setIsAddModalOpen(true)}
                onManageTags={() => setIsTagManagerOpen(true)}
            />

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mes Contacts</h1>
                    <input
                        type="text"
                        placeholder="Rechercher un contact..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', maxWidth: '400px' }}
                    />
                </div>

                {loading ? (
                    <div>Chargement...</div>
                ) : (
                    <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--color-surface-hover)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Nom</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Tags</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map(contact => (
                                    <tr key={contact.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{contact.firstname} {contact.lastname}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {contact.tags.map(tag => (
                                                    <span key={tag} className="tag tag-neutral">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn"
                                                    onClick={() => setEditingContact(contact)}
                                                    style={{ fontSize: '0.875rem' }}
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    className="btn"
                                                    onClick={() => handleDelete(contact.id)}
                                                    style={{ fontSize: '0.875rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal d'édition des tags */}
                {editingContact && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Modifier {editingContact.firstname} {editingContact.lastname}</h2>
                                <button
                                    className="btn-icon"
                                    onClick={() => setEditingContact(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <label className="form-label">Tags</label>
                                <div className="tags-sections">
                                    <TagSelector
                                        availableTags={tags}
                                        selectedTags={editingContact.tags}
                                        onToggleTag={(tagName) => {
                                            const newTags = editingContact.tags.includes(tagName)
                                                ? editingContact.tags.filter(t => t !== tagName)
                                                : [...editingContact.tags, tagName];
                                            setEditingContact({ ...editingContact, tags: newTags });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn" onClick={() => setEditingContact(null)}>Annuler</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleUpdateTags(editingContact, editingContact.tags)}
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AddContactModal
                isOpen={isAddModalOpen}
                tags={tags}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddContact}
                onManageTags={() => setIsTagManagerOpen(true)}
            />

            <TagManager
                isOpen={isTagManagerOpen}
                onClose={() => setIsTagManagerOpen(false)}
                tags={tags}
                onTagsChange={fetchTags}
            />
        </div>
    );
}

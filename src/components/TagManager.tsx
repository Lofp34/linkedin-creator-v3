'use client';

import { useState } from 'react';
import type { Tag } from '@/lib/db';

interface TagManagerProps {
    isOpen: boolean;
    onClose: () => void;
    tags: Tag[];
    onTagsChange: () => void; // Trigger to refresh tags in parent
}

export function TagManager({ isOpen, onClose, tags, onTagsChange }: TagManagerProps) {
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ name: '', category: '', is_priority: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );

    const priorityTags = tags.filter(t => t.is_priority);

    if (!isOpen) return null;

    const resetForm = () => {
        setFormData({ name: '', category: '', is_priority: false });
        setError(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = view === 'add' ? '/api/tags' : `/api/tags/${editingTag?.id}`;
            const method = view === 'add' ? 'POST' : 'PATCH';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Une erreur est survenue');
            }

            onTagsChange();
            setView('list');
            resetForm();
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/tags/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            onTagsChange();
        } catch (err) {
            alert(String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePriority = async (tag: Tag) => {
        try {
            const response = await fetch(`/api/tags/${tag.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_priority: !tag.is_priority })
            });

            if (!response.ok) throw new Error('Failed to update priority');
            onTagsChange();
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    const startEdit = (tag: Tag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            category: tag.category,
            is_priority: tag.is_priority
        });
        setView('edit');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>
                        {view === 'list' && 'Gérer les tags'}
                        {view === 'add' && 'Nouveau tag'}
                        {view === 'edit' && 'Modifier le tag'}
                    </h2>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {view === 'list' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { setView('add'); resetForm(); }}
                                >
                                    + Nouveau Tag
                                </button>
                            </div>

                            <input
                                type="text"
                                className="form-input"
                                placeholder="Rechercher un tag..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {/* Priority Tags Section */}
                            {priorityTags.length > 0 && (
                                <div style={{ padding: '1rem', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-warning)' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-warning)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        ★ Tags Prioritaires (Mis en avant)
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {priorityTags.map(tag => (
                                            <div key={tag.id} className="tag tag-include" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '0.25rem' }}>
                                                {tag.name}
                                                <button
                                                    onClick={() => handleTogglePriority(tag)}
                                                    title="Retirer des prioritaires"
                                                    style={{ border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--color-surface-hover)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nom</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Catégorie</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Prioritaire</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTags.map(tag => (
                                            <tr key={tag.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span className={`tag ${tag.is_priority ? 'tag-include' : 'tag-neutral'}`}>
                                                        {tag.name}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                    {tag.category}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tag.is_priority}
                                                        onChange={() => handleTogglePriority(tag)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={() => startEdit(tag)}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            style={{ color: 'var(--color-danger)' }}
                                                            onClick={() => handleDelete(tag.id)}
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave}>
                            {error && (
                                <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Nom</label>
                                <input
                                    required
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Recruteur"
                                />
                            </div>

                            <div className="form-group">
                                <label>Catégorie</label>
                                <input
                                    className="form-input"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Ex: Poste"
                                    list="categories"
                                />
                                <datalist id="categories">
                                    {Array.from(new Set(tags.map(t => t.category))).map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="is_priority"
                                    checked={formData.is_priority}
                                    onChange={e => setFormData({ ...formData, is_priority: e.target.checked })}
                                    style={{ width: '1.25rem', height: '1.25rem' }}
                                />
                                <label htmlFor="is_priority" style={{ marginBottom: 0 }}>Tag prioritaire (mis en avant)</label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn" onClick={() => { setView('list'); setError(null); }}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {view === 'list' && (
                    <div className="modal-footer">
                        <button className="btn" onClick={onClose}>Fermer</button>
                    </div>
                )}
            </div>
        </div>
    );
}

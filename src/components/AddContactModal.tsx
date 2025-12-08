'use client';

import { useState } from 'react';
import type { Person, Tag } from '@/lib/db';

interface AddContactModalProps {
    isOpen: boolean;
    tags: Tag[];
    onClose: () => void;
    onAdd: (contact: Omit<Person, 'id' | 'solicitation_count' | 'last_solicitation_date'>) => void;
}

export function AddContactModal({ isOpen, tags, onClose, onAdd }: AddContactModalProps) {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');

    if (!isOpen) return null;

    const filteredTags = tags
        .filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
        .slice(0, 15);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstname.trim() || !lastname.trim()) return;

        onAdd({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            tags: selectedTags
        });

        setFirstname('');
        setLastname('');
        setSelectedTags([]);
        setTagSearch('');
        onClose();
    };

    const toggleTag = (tagName: string) => {
        setSelectedTags(prev =>
            prev.includes(tagName)
                ? prev.filter(t => t !== tagName)
                : [...prev, tagName]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nouveau Contact</h2>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="firstname">Prénom *</label>
                        <input
                            id="firstname"
                            type="text"
                            className="form-input"
                            value={firstname}
                            onChange={e => setFirstname(e.target.value)}
                            placeholder="Ex: Jean"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastname">Nom *</label>
                        <input
                            id="lastname"
                            type="text"
                            className="form-input"
                            value={lastname}
                            onChange={e => setLastname(e.target.value)}
                            placeholder="Ex: Dupont"
                        />
                    </div>

                    <div className="form-group">
                        <label>Tags ({selectedTags.length} sélectionnés)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={tagSearch}
                            onChange={e => setTagSearch(e.target.value)}
                            placeholder="Rechercher un tag..."
                        />

                        {selectedTags.length > 0 && (
                            <div className="selected-tags">
                                {selectedTags.map(tag => (
                                    <span key={tag} className="tag tag-include" onClick={() => toggleTag(tag)}>
                                        {tag} ✕
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="tag-suggestions">
                            {filteredTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={`tag ${selectedTags.includes(tag.name) ? 'tag-include' : 'tag-neutral'}`}
                                    onClick={() => toggleTag(tag.name)}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!firstname.trim() || !lastname.trim()}
                        >
                            Ajouter le contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

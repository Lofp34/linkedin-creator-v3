'use client';

import { useState } from 'react';
import type { Person, Tag } from '@/lib/db';
import { TagSelector } from '@/components/TagSelector';

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

    if (!isOpen) return null;

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
                        <label>Tags</label>
                        <TagSelector
                            availableTags={tags}
                            selectedTags={selectedTags}
                            onToggleTag={toggleTag}
                        />
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

'use client';

import { useState, useMemo } from 'react';
import type { Tag } from '@/lib/db';

interface TagSelectorProps {
    availableTags: Tag[];
    selectedTags: string[];
    onToggleTag: (tagName: string) => void;
}

export function TagSelector({ availableTags, selectedTags, onToggleTag }: TagSelectorProps) {
    const [search, setSearch] = useState('');
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    // Group tags by category
    const tagsByCategory = useMemo(() => {
        const grouped: Record<string, Tag[]> = {};
        availableTags.forEach(tag => {
            const category = tag.category || 'Non classée';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(tag);
        });
        return grouped;
    }, [availableTags]);

    const categories = Object.keys(tagsByCategory).sort();

    // Filter for search
    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        return availableTags.filter(t =>
            t.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [availableTags, search]);

    const handleToggleCategory = (category: string) => {
        setOpenCategory(prev => prev === category ? null : category);
    };

    return (
        <div className="tag-selector">
            <input
                type="text"
                className="form-input"
                placeholder="Rechercher un tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: '1rem' }}
            />

            {/* Show selected tags summary */}
            {selectedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {selectedTags.map(tag => (
                        <span
                            key={tag}
                            className="tag tag-include"
                            onClick={() => onToggleTag(tag)}
                            style={{ cursor: 'pointer' }}
                        >
                            {tag} ✕
                        </span>
                    ))}
                </div>
            )}

            <div className="tag-list-container" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {searchResults ? (
                    // Search Results View
                    <div style={{ padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {searchResults.length === 0 ? (
                            <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Aucun tag trouvé</div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {searchResults.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        className={`tag ${selectedTags.includes(tag.name) ? 'tag-include' : 'tag-neutral'}`}
                                        onClick={() => onToggleTag(tag.name)}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Accordion View
                    <div>
                        {categories.map(category => {
                            const isOpen = openCategory === category;
                            const categoryTags = tagsByCategory[category];
                            const selectedCount = categoryTags.filter(t => selectedTags.includes(t.name)).length;

                            return (
                                <div key={category} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleCategory(category)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: isOpen ? 'var(--color-surface-hover)' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <span>{category}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {selectedCount > 0 && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px'
                                                }}>
                                                    {selectedCount}
                                                </span>
                                            )}
                                            <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                ▼
                                            </span>
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div style={{ padding: '1rem', background: 'var(--color-surface)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {categoryTags.map(tag => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    className={`tag ${selectedTags.includes(tag.name) ? 'tag-include' : 'tag-neutral'}`}
                                                    onClick={() => onToggleTag(tag.name)}
                                                >
                                                    {tag.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

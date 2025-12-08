'use client';

import { useMemo } from 'react';
import type { Tag } from '@/lib/db';
import { TAG_CATEGORIES } from '@/lib/constants';

export type TagState = 'neutral' | 'include' | 'exclude';

interface TagCloudProps {
    tags: Tag[];
    tagStates: Record<string, TagState>;
    onToggleTag: (tagName: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onResetFilters: () => void;
}

export function TagCloud({
    tags,
    tagStates,
    onToggleTag,
    searchQuery,
    onSearchChange,
    onResetFilters
}: TagCloudProps) {
    const tagsByCategory = useMemo(() => {
        const grouped: Record<string, string[]> = {};

        TAG_CATEGORIES.forEach(category => {
            grouped[category] = tags
                .filter(tag => tag.category === category || (!tag.category && category === 'Non classée'))
                .map(tag => tag.name)
                .filter(name => !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort();
        });

        return grouped;
    }, [tags, searchQuery]);

    const activeFiltersCount = Object.values(tagStates).filter(s => s !== 'neutral').length;

    return (
        <div className="tag-cloud">
            <input
                type="text"
                className="search-input"
                placeholder="🔍 Rechercher un tag..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <div style={{ marginTop: 'var(--space-lg)' }}>
                {TAG_CATEGORIES.map(category => {
                    const categoryTags = tagsByCategory[category] || [];
                    if (categoryTags.length === 0) return null;

                    return (
                        <div key={category} className="category-section">
                            <div className="category-header">
                                <span className="category-title">{category}</span>
                                <span className="category-count">{categoryTags.length}</span>
                            </div>
                            <div className="category-tags">
                                {categoryTags.map(tagName => {
                                    const state = tagStates[tagName] || 'neutral';
                                    return (
                                        <button
                                            key={tagName}
                                            className={`tag tag-${state}`}
                                            onClick={() => onToggleTag(tagName)}
                                            title={`Cliquer pour ${state === 'neutral' ? 'inclure' : state === 'include' ? 'exclure' : 'retirer'}`}
                                        >
                                            {tagName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeFiltersCount > 0 && (
                <div className="reset-filters">
                    <button className="btn btn-secondary" onClick={onResetFilters} style={{ width: '100%' }}>
                        Réinitialiser les filtres ({activeFiltersCount})
                    </button>
                </div>
            )}
        </div>
    );
}

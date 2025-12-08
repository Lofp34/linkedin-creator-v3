'use client';

import { useState } from 'react';
import type { Person } from '@/lib/db';

interface PreviewPanelProps {
    selectedContacts: Person[];
}

export function PreviewPanel({ selectedContacts }: PreviewPanelProps) {
    const [copied, setCopied] = useState(false);

    const textToCopy = selectedContacts
        .map(p => `@${p.firstname} ${p.lastname}`)
        .join(', ');

    const charCount = textToCopy.length;

    const handleCopy = async () => {
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                console.error('Failed to copy', e);
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="preview-panel">
            <div className="preview-header">
                <h3 className="preview-title">Aperçu</h3>
                <span className="preview-count">{selectedContacts.length} mention{selectedContacts.length !== 1 ? 's' : ''}</span>
            </div>

            {selectedContacts.length === 0 ? (
                <div className="preview-empty">
                    <div className="preview-empty-icon">📋</div>
                    <p>Sélectionnez des contacts pour voir l&apos;aperçu</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-sm)' }}>
                        Cliquez sur les tags pour filtrer, puis sur les contacts pour les sélectionner
                    </p>
                </div>
            ) : (
                <div className="preview-content">
                    {selectedContacts.map((contact, index) => (
                        <span key={contact.id}>
                            <span className="preview-mention">@{contact.firstname} {contact.lastname}</span>
                            {index < selectedContacts.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            )}

            <div className="preview-footer">
                {copied ? (
                    <div className="copy-success">
                        ✓ Copié dans le presse-papiers !
                    </div>
                ) : (
                    <>
                        <div className="preview-stats">
                            <span>{charCount} caractères</span>
                            <span>{selectedContacts.length} personne{selectedContacts.length !== 1 ? 's' : ''}</span>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleCopy}
                            disabled={selectedContacts.length === 0}
                            style={{ width: '100%' }}
                        >
                            📋 Copier pour LinkedIn
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

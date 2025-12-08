'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Person, Tag } from '@/lib/db';
import { TagCloud, TagState } from '@/components/TagCloud';
import { ContactGrid, SortOrder } from '@/components/ContactGrid';
import { PreviewPanel } from '@/components/PreviewPanel';
import { AddContactModal } from '@/components/AddContactModal';
import { Header } from '@/components/Header';

export default function Home() {
  const [contacts, setContacts] = useState<Person[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagStates, setTagStates] = useState<Record<string, TagState>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('name');

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [contactsRes, tagsRes] = await Promise.all([
          fetch('/api/contacts'),
          fetch('/api/tags')
        ]);

        if (contactsRes.ok && tagsRes.ok) {
          const contactsData = await contactsRes.json();
          const tagsData = await tagsRes.json();
          setContacts(contactsData);
          setTags(tagsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter contacts based on tag states
  const filteredContacts = useMemo(() => {
    const includedTags = Object.entries(tagStates)
      .filter(([, state]) => state === 'include')
      .map(([tag]) => tag);

    const excludedTags = Object.entries(tagStates)
      .filter(([, state]) => state === 'exclude')
      .map(([tag]) => tag);

    if (includedTags.length === 0) {
      return [];
    }

    const filtered = contacts.filter(person => {
      const hasIncluded = includedTags.some(tag => person.tags.includes(tag));
      const hasExcluded = excludedTags.some(tag => person.tags.includes(tag));
      return hasIncluded && !hasExcluded;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'solicitation-asc') {
        return a.solicitation_count - b.solicitation_count;
      }
      if (sortOrder === 'solicitation-desc') {
        return b.solicitation_count - a.solicitation_count;
      }
      // 'name' sort is default from DB/API usually, but let's enforce it
      return a.lastname.localeCompare(b.lastname);
    });
  }, [tagStates, contacts, sortOrder]);

  // Get selected contact objects
  const selectedContactObjects = useMemo(() => {
    return filteredContacts.filter(c => selectedContacts.has(c.id));
  }, [filteredContacts, selectedContacts]);

  const handleToggleTag = (tagName: string) => {
    setTagStates(prev => {
      const currentState = prev[tagName] || 'neutral';
      const newStates = { ...prev };

      if (currentState === 'neutral') {
        newStates[tagName] = 'include';
      } else if (currentState === 'include') {
        newStates[tagName] = 'exclude';
      } else {
        delete newStates[tagName];
      }

      return newStates;
    });
  };

  const handleResetFilters = () => {
    setTagStates({});
    setSelectedContacts(new Set());
  };

  const handleToggleContact = (id: string) => {
    setSelectedContacts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
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
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="app-layout" style={{ placeItems: 'center', display: 'grid' }}>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header
        contactCount={contacts.length}
        onAddContact={() => setIsAddModalOpen(true)}
      />

      <aside className="sidebar-left">
        <TagCloud
          tags={tags}
          tagStates={tagStates}
          onToggleTag={handleToggleTag}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onResetFilters={handleResetFilters}
        />
      </aside>

      <main className="main-content">
        <ContactGrid
          contacts={filteredContacts}
          selectedContacts={selectedContacts}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onToggleContact={handleToggleContact}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      </main>

      <aside className="sidebar-right">
        <PreviewPanel selectedContacts={selectedContactObjects} />
      </aside>

      <AddContactModal
        isOpen={isAddModalOpen}
        tags={tags}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
      />
    </div>
  );
}

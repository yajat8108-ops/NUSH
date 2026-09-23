'use client';

import { create } from 'zustand';

export interface JournalEntry {
  id: string;
  author: 'Yajat' | 'Nush';
  title: string;
  content: string;
  date: string;
  mood: '🥰' | '🥹' | '😊' | '😴' | '🫢' | '🍜';
  moodLabel: string;
  tags: string[];
}

interface JournalStore {
  entries: JournalEntry[];
  isLoading: boolean;
  isSyncing: boolean;
  addEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useJournalStore = create<JournalStore>()((set, get) => ({
  entries: [],       // always empty on load — server is the truth
  isLoading: true,   // show spinner until first server fetch completes
  isSyncing: false,

  syncWithServer: async () => {
    try {
      set({ isSyncing: true });
      const res = await fetch('/api/sync?key=journal', { cache: 'no-store' });
      if (res.ok) {
        const serverEntries = await res.json();
        if (Array.isArray(serverEntries)) {
          set({ entries: serverEntries });
        }
      }
    } catch (e) {
      console.error('Failed to sync journal entries from server:', e);
    } finally {
      set({ isSyncing: false, isLoading: false });
    }
  },

  addEntry: async (entry) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: 'journal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    };

    // Optimistic update
    set((state) => ({ entries: [newEntry, ...state.entries] }));

    // Sync with global server
    try {
      set({ isSyncing: true });
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journal',
          action: 'add',
          item: newEntry,
        }),
      });
    } catch (e) {
      console.error('Failed to save journal entry to server:', e);
    } finally {
      set({ isSyncing: false });
    }
  },

  deleteEntry: async (id) => {
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journal',
          action: 'delete',
          id,
        }),
      });
    } catch (e) {
      console.error('Failed to delete journal entry from server:', e);
    }
  },
}));

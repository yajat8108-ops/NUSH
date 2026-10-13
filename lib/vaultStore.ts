'use client';

import { create } from 'zustand';
import { SoundEngine } from './audio';
import confetti from 'canvas-confetti';

export interface VaultEntry {
  id: string;
  author: 'nush' | 'yajat';
  type: 'love_note' | 'mood' | 'date_wish' | 'secret_request';
  content: string;
  moodEmoji: string;
  createdAt: string;
  sticker?: string;
}

interface VaultStore {
  entries: VaultEntry[];
  currentMood: string;
  isLoading: boolean;
  isSyncing: boolean;
  setCurrentMood: (mood: string) => void;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useVaultStore = create<VaultStore>()((set, get) => ({
  entries: [],       // always empty on load — server is the truth
  currentMood: '🥰 Loved',
  isLoading: true,   // show spinner until first server fetch completes
  isSyncing: false,

  setCurrentMood: (mood: string) => {
    SoundEngine.pop();
    set({ currentMood: mood });
  },

  syncWithServer: async () => {
    try {
      set({ isSyncing: true });
      const res = await fetch('/api/sync?key=vault', { cache: 'no-store' });
      if (res.ok) {
        const serverEntries = await res.json();
        if (Array.isArray(serverEntries)) {
          set({ entries: serverEntries });
        }
      }
    } catch (e) {
      console.error('Failed to sync vault entries from server:', e);
    } finally {
      set({ isSyncing: false, isLoading: false });
    }
  },

  addEntry: async (data) => {
    const newEntry: VaultEntry = {
      ...data,
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
    };

    SoundEngine.confettiPop();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x: 0.5, y: 0.7 },
      colors: ['#FF5C8E', '#FF9EC9', '#FFDD8C', '#B9AEF5'],
    });

    // Optimistic update
    set((state) => ({
      entries: [newEntry, ...state.entries],
    }));

    // Global server sync
    try {
      set({ isSyncing: true });
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vault',
          action: 'add',
          item: newEntry,
        }),
      });
    } catch (e) {
      console.error('Failed to save vault entry to server:', e);
    } finally {
      set({ isSyncing: false });
    }
  },

  deleteEntry: async (id: string) => {
    SoundEngine.click();
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vault',
          action: 'delete',
          id,
        }),
      });
    } catch (e) {
      console.error('Failed to delete vault entry from server:', e);
    }
  },
}));

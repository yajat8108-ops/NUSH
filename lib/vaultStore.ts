'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  setCurrentMood: (mood: string) => void;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => void;
  deleteEntry: (id: string) => void;
}

const INITIAL_ENTRIES: VaultEntry[] = [
  {
    id: 'seed_1',
    author: 'yajat',
    type: 'love_note',
    content: 'Welcome to your private authorship corner, Nushi! Anything you write here is saved forever on your device. Tell me your thoughts, request 2 AM Maggi, or log your mood anytime ❤️',
    moodEmoji: '💖',
    createdAt: '2026-08-22T00:00:00.000Z',
    sticker: '💌',
  },
  {
    id: 'seed_2',
    author: 'yajat',
    type: 'date_wish',
    content: 'Standing date coupon: Unlimited tight hugs and zero complaints whenever you demand it.',
    moodEmoji: '🫢',
    createdAt: '2026-08-23T12:00:00.000Z',
    sticker: '🎟️',
  },
];

export const useVaultStore = create<VaultStore>()(
  persist(
    (set, get) => ({
      entries: INITIAL_ENTRIES,
      currentMood: '🥰 Loved',

      setCurrentMood: (mood: string) => {
        SoundEngine.pop();
        set({ currentMood: mood });
      },

      addEntry: (data) => {
        const newEntry: VaultEntry = {
          ...data,
          id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        };

        SoundEngine.confettiPop();
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { x: 0.5, y: 0.7 },
          colors: ['#FF5C8E', '#FF9EC9', '#FFDD8C', '#B9AEF5'],
        });

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },

      deleteEntry: (id: string) => {
        SoundEngine.click();
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },
    }),
    {
      name: 'yajat_nush_two_way_vault_v1',
    }
  )
);

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
}

const PRESEEDED_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-1',
    author: 'Yajat',
    title: 'The Birthday Teddy & That Unforgettable Smile',
    content: `I will never forget giving you that brown teddy bear on your birthday. You held it so gently, looked right at me, and announced you were naming it 'Yajat'. I laughed so hard my stomach hurt, but in my heart, I knew you were making sure a piece of me stayed with you in your room every night. Best gift decision of my life.`,
    date: '2026-07-22T21:30:00.000Z',
    mood: '🥰',
    moodLabel: 'Completely In Love',
    tags: ['#birthday', '#teddy', '#wifey'],
  },
  {
    id: 'journal-2',
    author: 'Yajat',
    title: '8:00 PM Open Audi Guard Escape & Slow Walk to GB-2',
    content: `The guard whistled right at 8:00 PM. We both packed up slowly, laughing as we walked towards AB-1. Then AB-1 closed too, so we took the detour past Dr. Morphin's just to buy 10 more minutes together. Standing outside Girls Block 2 saying goodbye is the hardest thing every day, but also the proof of how precious every single minute is.`,
    date: '2026-08-14T20:15:00.000Z',
    mood: '🥹',
    moodLabel: 'Emotional & Sacred',
    tags: ['#openaudi', '#campuswalk', '#guards'],
  },
  {
    id: 'journal-3',
    author: 'Yajat',
    title: 'All-Night FaceTime with Screen Brightness at 1%',
    content: `It was 4:15 AM. You had fallen asleep while talking about your classes, phone propped against your pillow. I kept the call running at 1% brightness, listening to your soft breathing until the sun started rising. I never want you to go to sleep feeling lonely ever again.`,
    date: '2026-08-28T04:23:00.000Z',
    mood: '😴',
    moodLabel: 'Peaceful & Warm',
    tags: ['#latenight', '#facetime', '#forever'],
  },
];

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      entries: PRESEEDED_ENTRIES,
      addEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: `journal-${Date.now()}`,
        };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
      },
      deleteEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
      },
    }),
    {
      name: 'yajat_nush_relationship_journal_v1',
    }
  )
);

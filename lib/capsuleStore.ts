'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CapsuleLetter {
  id: string;
  sender: 'Yajat' | 'Nush';
  title: string;
  content: string;
  writtenDate: string;
  unlockDate: string;
  sealEmoji: string;
  isOpened: boolean;
  tag: string;
}

interface CapsuleStore {
  letters: CapsuleLetter[];
  devBypass: boolean;
  addCapsule: (letter: Omit<CapsuleLetter, 'id' | 'isOpened'>) => void;
  openCapsule: (id: string) => void;
  toggleDevBypass: () => void;
}

const PRESEEDED_LETTERS: CapsuleLetter[] = [
  {
    id: 'capsule-4-month',
    sender: 'Yajat',
    title: '4 Months of Us: The Autumn Promise 🍁',
    content: `My dearest Nushi,

If you're reading this, we've crossed 4 full months together. Four months of campus walks, 8 PM Open Audi escapes, and looking at you and still getting that exact same flutter in my chest that I got on day one. 

I wrote this during our 3-month anniversary on September 22nd while coding our website late at night. I wanted future-you to know that with every month that passes, my love for you doesn't just grow—it deepens into something permanent. 

Promise me we're still having 2 AM Maggi dates and laughing about how I sang for you on guitar during the fake dating pact. You are my forever, Nush. 

Always yours,
Yajat 🐻❤️`,
    writtenDate: '2026-09-22T00:00:00+05:30',
    unlockDate: '2026-10-22T00:00:00+05:30',
    sealEmoji: '🍁',
    isOpened: false,
    tag: '4-Month Milestone (October 22, 2026)',
  },
  {
    id: 'capsule-6-month',
    sender: 'Yajat',
    title: 'Half a Year: A Milestone for the Soul ❄️',
    content: `Happy 6 months, my baby wifeyyy 😭❤️

Six whole months. Half a year of calling you my girl. Half a year of learning every face you make when you're annoyed, every smile that makes me want to jump up and down, and every secret you've entrusted with me.

Remember when we were just two kids making a fake dating pact for an IIT Madras hackathon? Look where that fake pact brought us. Look at this world we built. 

Thank you for choosing me every single day. I will keep choosing you in every lifetime, every universe. 

All my love,
Yajat Kataria 👑💖`,
    writtenDate: '2026-09-22T00:00:00+05:30',
    unlockDate: '2026-12-22T00:00:00+05:30',
    sealEmoji: '❄️',
    isOpened: false,
    tag: '6-Month Milestone (December 22, 2026)',
  },
  {
    id: 'capsule-1-year',
    sender: 'Yajat',
    title: 'One Complete Orbit Around the Sun Together 🌟',
    content: `Happy 1 Year Anniversary, Nush 😭💍✨

365 days. 8,760 hours. 525,600 minutes of pure happiness. 

I wrote this sealed message an entire 9 months ago on our 3-month anniversary. If you are reading this on our 1-year anniversary, I want you to look across at me right now and give me the tightest hug ever. 

We made it through semesters, exams, long calls, campus walks, and every single goodbye at Girls Block 2. And this is still only chapter one of our infinite book. 

I love you endlessly, my Anushka. Happy 1 Year, my world. ❤️

Forever your Yajat 🐻✨`,
    writtenDate: '2026-09-22T00:00:00+05:30',
    unlockDate: '2027-06-22T00:00:00+05:30',
    sealEmoji: '💍',
    isOpened: false,
    tag: '1-Year Milestone (June 22, 2027)',
  },
];

export const useCapsuleStore = create<CapsuleStore>()(
  persist(
    (set, get) => ({
      letters: PRESEEDED_LETTERS,
      devBypass: false,

      addCapsule: (letter) => {
        const newLetter: CapsuleLetter = {
          ...letter,
          id: `capsule-${Date.now()}`,
          isOpened: false,
        };
        set((state) => ({ letters: [newLetter, ...state.letters] }));
      },

      openCapsule: (id) => {
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id ? { ...l, isOpened: true } : l
          ),
        }));
      },

      toggleDevBypass: () => {
        set((state) => ({ devBypass: !state.devBypass }));
      },
    }),
    {
      name: 'yajat_nush_time_capsules_v2', // Updated key ensures new dates load cleanly
    }
  )
);


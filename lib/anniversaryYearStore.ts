'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyLoveReason {
  day: number;
  category: 'quirk' | 'memory' | 'compliment' | 'promise' | 'inside_joke';
  text: string;
  tag: string;
}

export interface YearStats {
  totalDays: number;
  facetimeHours: number;
  maggiBowls: number;
  openAudiEvictions: number;
  libraryStaringHours: number;
  virtualHugs: number;
  kissesCount: number;
  topSong: string;
}

// Generates 365 tailored reasons based on Yajat & Anushka canonical lore
function generate365Reasons(): DailyLoveReason[] {
  const categories: DailyLoveReason['category'][] = ['quirk', 'memory', 'compliment', 'promise', 'inside_joke'];
  const baseReasons: { cat: DailyLoveReason['category']; text: string; tag: string }[] = [
    { cat: 'memory', text: 'The way you looked at me on the first day when I brought my guitar and sang for you.', tag: 'First Meet' },
    { cat: 'inside_joke', text: '“In boys, I don’t trust anyone but me.” The fake dating pact that became our real forever.', tag: 'The Pact' },
    { cat: 'memory', text: 'August 22, 2026: Our first actual kiss on the quiet walkway just past AB-2.', tag: 'AB-2 Kiss' },
    { cat: 'memory', text: 'July 23: The 23rd smooch milestone that made my heart forget how to beat.', tag: 'Smooch 23' },
    { cat: 'inside_joke', text: 'Getting chased out of Open Audi by campus guards right at 8:00 PM every single evening.', tag: 'Open Audi' },
    { cat: 'inside_joke', text: 'That you literally named your birthday teddy bear “Yajat” so you can hug him anytime.', tag: 'Teddy Yajat' },
    { cat: 'compliment', text: 'Your velvety radio voice that made me delete Spotify because no music compares.', tag: 'Radio Nushi' },
    { cat: 'memory', text: 'Late-night FaceTime calls that lasted until 4:23 AM with screen brightness at 1%.', tag: 'All-Night Call' },
    { cat: 'quirk', text: 'The adorable nose scrunch you do whenever you are teasing me or acting annoyed.', tag: 'Nose Scrunch' },
    { cat: 'memory', text: 'Central Library study dates: 0% academic study and 100% staring across the desk.', tag: 'Library Pass' },
    { cat: 'quirk', text: 'Your 2 AM cheese Maggi protocol: extra cheese, extra spicy, no questions asked.', tag: 'Midnight Maggi' },
    { cat: 'memory', text: 'IIT Madras Hackathon at 2 AM where we traded heartbreaks and healed together.', tag: 'Hackathon' },
    { cat: 'promise', text: 'I promise to always walk on the road-side of the pavement to protect you.', tag: 'Gentleman' },
    { cat: 'promise', text: 'I promise to always make you 2 AM Maggi whenever your cravings kick in.', tag: 'Chef Yajat' },
    { cat: 'compliment', text: 'How effortlessly breathtaking you look even with messy hair and no makeup.', tag: 'Natural Beauty' },
    { cat: 'promise', text: 'Our undisputed #1 dream date: Late-night stargazing under the open sky holding you close.', tag: 'Stargazing' },
    { cat: 'memory', text: 'Walking that long loop past Dr. Morphin just to steal 5 more minutes before Girls Block 2.', tag: 'Campus Loop' },
    { cat: 'quirk', text: 'How you say “I will be ready in 5 minutes” and take 45 minutes looking gorgeous.', tag: 'Getting Ready' },
    { cat: 'compliment', text: 'The warmth in your eyes when you look at me after we’ve been laughing for hours.', tag: 'Your Eyes' },
    { cat: 'promise', text: 'I will never let a day pass without giving you a soft, sacred forehead kiss.', tag: 'Forehead Kiss' },
  ];

  const reasons: DailyLoveReason[] = [];
  const genericTemplates = [
    'How your hand fits so perfectly inside my jacket pocket during cold evening walks.',
    'The sweet sleepy voice you have when you answer my morning call.',
    'How you remember the smallest things I told you months ago.',
    'How proud I feel whenever I talk about you to my friends.',
    'Your laugh that instantly cures whatever bad day or college stress I am having.',
    'How fiercely you care for the people you love with your whole heart.',
    'The way you lean your head on my shoulder when we sit side by side.',
    'How our fake dating pact turned into the realest, deepest love of my life.',
    'Your patience when I explain nerdy coding ideas you pretend to understand.',
    'How safe I feel when I am wrapped in your arms after a long week.',
    'The secret folded notes we used to pass under the library desks.',
    'Your cute dramatic gasps whenever you tell me college gossip.',
    'How you make ordinary campus pathways feel like a movie set.',
    'That you are my favorite notification on my phone screen, always.',
    'Because 365 days with you felt like 365 seconds, and I want 100 more years.',
  ];

  for (let i = 1; i <= 365; i++) {
    if (i <= baseReasons.length) {
      const b = baseReasons[i - 1];
      reasons.push({ day: i, category: b.cat, text: b.text, tag: b.tag });
    } else {
      const template = genericTemplates[(i - baseReasons.length - 1) % genericTemplates.length];
      const cat = categories[i % categories.length];
      reasons.push({
        day: i,
        category: cat,
        text: `Day ${i}: ${template}`,
        tag: `Day ${i} Milestone`,
      });
    }
  }

  return reasons;
}

export const ALL_365_REASONS = generate365Reasons();

export const YEAR_STATS: YearStats = {
  totalDays: 365,
  facetimeHours: 1240,
  maggiBowls: 142,
  openAudiEvictions: 178,
  libraryStaringHours: 112,
  virtualHugs: 9840,
  kissesCount: 15420,
  topSong: 'Agar Tum Saath Ho (Tamasha) & Radio Nushi FM',
};

interface AnniversaryYearStore {
  reasons: DailyLoveReason[];
  activeReasonDay: number;
  bookmarkedDays: number[];
  setActiveReasonDay: (day: number) => void;
  toggleBookmark: (day: number) => void;

  // Dual-Key Vault State
  yajatKeyInserted: boolean;
  nushKeyInserted: boolean;
  isVaultUnsealed: boolean;
  setYajatKey: (val: boolean) => void;
  setNushKey: (val: boolean) => void;

  // Dream Sanctuary Room items
  guitarStrumCount: number;
  teddyHugCount: number;
  maggiSteamActive: boolean;
  stickyNotes: { id: string; text: string; author: 'yajat' | 'nush'; color: string }[];
  strumGuitar: () => void;
  hugTeddy: () => void;
  addStickyNote: (text: string, author: 'yajat' | 'nush') => void;
}

export const useAnniversaryYearStore = create<AnniversaryYearStore>()(
  persist(
    (set, get) => ({
      reasons: ALL_365_REASONS,
      activeReasonDay: 1,
      bookmarkedDays: [1, 2, 3, 4, 5, 23, 82, 100, 365],
      setActiveReasonDay: (day) => set({ activeReasonDay: Math.max(1, Math.min(365, day)) }),
      toggleBookmark: (day) => {
        set((s) => ({
          bookmarkedDays: s.bookmarkedDays.includes(day)
            ? s.bookmarkedDays.filter((d) => d !== day)
            : [...s.bookmarkedDays, day],
        }));
      },

      yajatKeyInserted: false,
      nushKeyInserted: false,
      isVaultUnsealed: false,
      setYajatKey: (val) => {
        set({ yajatKeyInserted: val });
        if (val && get().nushKeyInserted) {
          set({ isVaultUnsealed: true });
        }
      },
      setNushKey: (val) => {
        set({ nushKeyInserted: val });
        if (val && get().yajatKeyInserted) {
          set({ isVaultUnsealed: true });
        }
      },

      guitarStrumCount: 0,
      teddyHugCount: 0,
      maggiSteamActive: true,
      stickyNotes: [
        { id: '1', text: 'Don’t forget your umbrella today bbg! ☔', author: 'yajat', color: '#FEF08A' },
        { id: '2', text: 'You owe me extra cheese Maggi tonight 🍜😋', author: 'nush', color: '#FBCFE8' },
        { id: '3', text: 'Forehead kisses booked for 8 PM past AB-2 💋', author: 'yajat', color: '#BAE6FD' },
      ],
      strumGuitar: () => set((s) => ({ guitarStrumCount: s.guitarStrumCount + 1 })),
      hugTeddy: () => set((s) => ({ teddyHugCount: s.teddyHugCount + 1 })),
      addStickyNote: (text, author) => {
        const colors = ['#FEF08A', '#FBCFE8', '#BAE6FD', '#BBF7D0', '#DDD6FE'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        set((s) => ({
          stickyNotes: [
            ...s.stickyNotes,
            { id: Date.now().toString(), text, author, color: randomColor },
          ],
        }));
      },
    }),
    {
      name: 'yajat_nush_year_one_v1',
    }
  )
);

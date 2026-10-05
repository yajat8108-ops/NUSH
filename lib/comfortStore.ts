'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OpenWhenEnvelope {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  waxColor: string;
  letter: string[];
  toolType: 'sleep_timer' | 'cramp_care' | 'breathing_pacer' | 'apology_pact' | 'hug_simulator';
  unlockedAt: string | null;
}

export const OPEN_WHEN_ENVELOPES: OpenWhenEnvelope[] = [
  {
    id: 'cant_sleep',
    title: 'Open when you can’t sleep',
    subtitle: 'Phone brightness at 1%, night sky, and my voice',
    icon: '🌙',
    waxColor: '#4A5568',
    toolType: 'sleep_timer',
    unlockedAt: null,
    letter: [
      'Hey my sleepy princess...',
      'If you’re reading this at 2 AM or 4 AM and tossing and turning, close your eyes for just three seconds and take a deep breath.',
      'Remember our all-night FaceTime calls where I would keep the screen on just to watch you sleep peacefully under your blanket? Even right now, I am right here beside you in spirit, holding your hand.',
      'Let your shoulders drop. Turn on the gentle heartbeat sound below. You are safe, you are protected, and you are unconditionally loved.',
      'Sleep tight, meri jaan. I’ll be the first person thinking of you the second you wake up. 💤❤️',
    ],
  },
  {
    id: 'cramps_sick',
    title: 'Open when you have cramps or feel sick',
    subtitle: 'Zero guilt, warm blanket, and royal pampering',
    icon: '🌸',
    waxColor: '#E53E3E',
    toolType: 'cramp_care',
    unlockedAt: null,
    letter: [
      'My poor baby... 🥺❤️',
      'I hate seeing you in pain, and if I could absorb every single cramp into my own body right now, you know I would do it in a heartbeat.',
      'Official Queen Protocol for today: Zero productivity required. Do not stress about college, exams, or anything. You are allowed to curl into a burrito blanket all day.',
      'I have dispatched unlimited virtual hot water bottles, infinite forehead kisses, and hot cheese Maggi on standby.',
      'You are the strongest girl I know, but today you don’t have to be strong. Just let me pamper you. 🫂🍵',
    ],
  },
  {
    id: 'anxious_overthinking',
    title: 'Open when you’re overthinking or anxious',
    subtitle: 'A grounding anchor when the world gets loud',
    icon: '🌿',
    waxColor: '#319795',
    toolType: 'breathing_pacer',
    unlockedAt: null,
    letter: [
      'Breathe with me, Nush. In... and out...',
      'Your mind is running at 100 miles an hour right now, thinking of things that haven’t happened or worrying about the future. But look right here.',
      'Nothing in this world can shake what we have. No college stress, no temporary phase, no distance. You are doing so much better than you give yourself credit for.',
      'Sync your breath with the glowing circle below. Let the acoustic guitar wash over you.',
      'I am in your corner forever. We take this one day, one breath at a time. I’ve got you. 🕊️✨',
    ],
  },
  {
    id: 'fight_disagreement',
    title: 'Open when we had a disagreement',
    subtitle: 'Us vs. the problem, never you vs. me',
    icon: '🤝',
    waxColor: '#805AD5',
    toolType: 'apology_pact',
    unlockedAt: null,
    letter: [
      'Stop for a second, look at this screen, and remember who we are.',
      'Whatever silly thing happened or however stubborn I was being: You mean more to me than my ego, my pride, or being “right”. You are my best friend and the love of my life.',
      'Remember our pact: It is always You & Me vs. The Problem, never You vs. Me.',
      'Come claim your forehead kiss voucher below. Let’s talk softly, hug tightly, and fix it like we always do. I love you so much. 🫂❤️',
    ],
  },
  {
    id: 'miss_my_hugs',
    title: 'Open when you miss my hugs',
    subtitle: 'A full-body tactile embrace across the distance',
    icon: '🧸',
    waxColor: '#DD6B20',
    toolType: 'hug_simulator',
    unlockedAt: null,
    letter: [
      'Arms open wide right now... come here! 🤗',
      'Whenever that heavy feeling hits your chest where you just want to bury your face in my hoodie and not speak for an hour—that is the exact hug I am wrapping around you right now.',
      'Hold the hug button below to trigger the haptic heartbeat wave.',
      'Close your eyes and feel my chin resting on your head. You are never alone. Not for one single second. 🧸❤️',
    ],
  },
];

interface ComfortStore {
  envelopes: OpenWhenEnvelope[];
  activeEnvelopeId: string | null;
  setActiveEnvelopeId: (id: string | null) => void;
  openEnvelope: (id: string) => void;
}

export const useComfortStore = create<ComfortStore>()(
  persist(
    (set, get) => ({
      envelopes: OPEN_WHEN_ENVELOPES,
      activeEnvelopeId: null,
      setActiveEnvelopeId: (id) => set({ activeEnvelopeId: id }),
      openEnvelope: (id) => {
        const now = new Date().toISOString();
        set((s) => ({
          activeEnvelopeId: id,
          envelopes: s.envelopes.map((env) =>
            env.id === id ? { ...env, unlockedAt: env.unlockedAt || now } : env
          ),
        }));
      },
    }),
    {
      name: 'yajat_nush_comfort_v1',
    }
  )
);

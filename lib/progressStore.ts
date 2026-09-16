'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SoundEngine } from './audio';
import confetti from 'canvas-confetti';

interface ProgressStore {
  progress: number;
  completedMilestones: Record<string, boolean>;
  unlockedAll: boolean;
  lastUnlockedToast: string | null;
  
  // Actions
  addProgress: (milestone: string, points: number, label: string) => void;
  setHundredPercent: () => void;
  toggleUnlockAll: () => void;
  resetProgress: () => void;
  clearToast: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: 10,
      completedMilestones: { 'visit_hero': true },
      unlockedAll: false,
      lastUnlockedToast: null,

      addProgress: (milestone, points, label) => {
        const { completedMilestones, progress } = get();
        if (completedMilestones[milestone]) return;

        const newMilestones = { ...completedMilestones, [milestone]: true };
        const newProgress = Math.min(100, progress + points);

        SoundEngine.chime();
        
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { x: 0.9, y: 0.1 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
        });

        if (newProgress >= 100 && progress < 100) {
          SoundEngine.confettiPop();
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { x: 0.5, y: 0.4 },
            colors: ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C'],
            scalar: 1.5,
          });
        }

        set({
          progress: newProgress,
          completedMilestones: newMilestones,
          lastUnlockedToast: `+${points}% Love Meter: ${label} ✨`,
        });

        setTimeout(() => {
          set({ lastUnlockedToast: null });
        }, 4000);
      },

      setHundredPercent: () => {
        SoundEngine.confettiPop();
        set({
          progress: 100,
          unlockedAll: true,
          lastUnlockedToast: '🏆 100% Master Love Unlocked via Dev God Mode! 💖',
        });
      },

      toggleUnlockAll: () => {
        const current = get().unlockedAll;
        SoundEngine.pop();
        set({ unlockedAll: !current });
      },

      resetProgress: () => {
        set({
          progress: 10,
          completedMilestones: { 'visit_hero': true },
          unlockedAll: false,
          lastUnlockedToast: 'Love Meter Reset to 10%',
        });
      },

      clearToast: () => set({ lastUnlockedToast: null }),
    }),
    {
      name: 'yajat_nush_love_progress',
    }
  )
);

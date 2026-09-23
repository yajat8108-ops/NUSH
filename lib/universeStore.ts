'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SoundEngine } from './audio';
import confetti from 'canvas-confetti';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlockedAt: string | null;
  secret?: boolean;
}

export interface SavedScene {
  id: string;
  name: string;
  bg: string;
  outfit: string;
  items: string[];
  createdAt: string;
}

export interface SavedCollage {
  id: string;
  title: string;
  layout: string;
  stickers: { id: string; emoji: string; x: number; y: number; rotate: number }[];
  note: string;
  createdAt: string;
}

export interface FortuneEntry {
  id: string;
  text: string;
  type: 'prediction' | 'date' | 'roast' | 'moment';
  date: string;
}

interface UniverseStore {
  // Exploration Progress
  enteredUniverse: boolean;
  setEnteredUniverse: (val: boolean) => void;
  explorationPoints: Record<string, boolean>;
  addExplorationPoint: (key: string, label?: string) => void;
  getExplorationPercent: () => number;

  // Sound & Soundtrack
  soundtrackPlaying: boolean;
  soundtrackMuted: boolean;
  toggleSoundtrack: () => void;
  setSoundtrackPlaying: (val: boolean) => void;
  toggleMute: () => void;

  // Secrets & Secret Room
  discoveredSecrets: Record<string, boolean>;
  unlockSecret: (secretKey: string, secretName: string) => void;
  isSecretRoomUnlocked: () => boolean;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  lastUnlockedAchievement: Achievement | null;
  clearAchievementToast: () => void;

  // Game 11: Love Slice (Fruit Ninja) High Scores & Stats
  loveSliceBestScore: number;
  loveSliceBestCombo: number;
  loveSliceTotalSliced: number;
  saveLoveSliceScore: (score: number, combo: number, sliced: number) => void;

  // Game 1: Love Maze
  loveMazeCompleted: boolean;
  setLoveMazeCompleted: () => void;

  // Game 8: Heart Catcher
  heartCatcherHighScore: number;
  saveHeartCatcherScore: (score: number) => void;

  // Game 9: Word Scramble
  scrambleLevelsCompleted: number;
  completeScrambleLevel: (lvl: number) => void;

  // Game 4: Rhythm Tap
  rhythmHighScore: number;
  saveRhythmScore: (score: number) => void;

  // Game 6: Love Clicker
  lovePoints: number;
  clickerMultiplier: number;
  clickerUpgrades: Record<string, number>;
  addLovePoints: (pts: number) => void;
  buyClickerUpgrade: (id: string, cost: number, multiplierBoost: number) => boolean;

  // Game 10: Virtual Hug & Kiss Counters
  virtualHugs: number;
  virtualKisses: number;
  secretAffectionMode: boolean;
  addHug: () => void;
  addKiss: () => void;
  setSecretAffectionMode: (val: boolean) => void;

  // Game 2: Outfit / Scene Builder
  savedScenes: SavedScene[];
  saveScene: (scene: SavedScene) => void;

  // Game 7: Photo Collage Maker
  savedCollages: SavedCollage[];
  saveCollage: (collage: SavedCollage) => void;

  // Game 3: Fortune Spinner
  fortuneHistory: FortuneEntry[];
  addFortune: (entry: FortuneEntry) => void;

  // Game 5: Truth or Soft-Dare
  favoritePrompts: string[];
  toggleFavoritePrompt: (prompt: string) => void;

  // UI Modals & Floating Dock State
  isAchievementsOpen: boolean;
  setAchievementsOpen: (open: boolean) => void;
  isTimeMachineOpen: boolean;
  setTimeMachineOpen: (open: boolean) => void;
  isSecretsPickerOpen: boolean;
  setSecretsPickerOpen: (open: boolean) => void;
  isCamcorderOn: boolean;
  setCamcorderOn: (on: boolean) => void;
  isLibraryBookOpen: boolean;
  setLibraryBookOpen: (open: boolean) => void;
  isVideoCallOpen: boolean;
  setVideoCallOpen: (open: boolean) => void;

  // Daily Streak & Countdown
  streakCount: number;
  lastVisitDate: string | null;
  checkAndUpdateStreak: () => void;

  // Reset & Cheat helpers
  unlockAllCheat: () => void;
  resetUniverse: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'universe_entered', title: 'Cosmic Step', desc: 'Entered the 3-Month Relationship Universe', icon: '🌌', unlockedAt: null },
  { id: 'first_secret', title: 'First Secret Found', desc: 'Discovered your first hidden easter egg', icon: '🔍', unlockedAt: null },
  { id: 'kiss_unlocked', title: 'The 22 August Kiss', desc: 'Collided the hearts and unlocked our actual kiss memory', icon: '💋', unlockedAt: null },
  { id: 'smooch_23', title: '23 — First Smooch', desc: 'Revealed the first smooch milestone', icon: '🫦', unlockedAt: null },
  { id: 'ab2_kiss', title: 'AB-2 Callback', desc: 'Found the kiss spot just past AB-2', icon: '📍', unlockedAt: null, secret: true },
  { id: 'library_detective', title: 'Library Starrer', desc: 'Found the secret library study pass (0% study, 100% stare)', icon: '📚', unlockedAt: null, secret: true },
  { id: 'video_caller', title: 'All-Night Caller', desc: 'Triggered the simulated late-night FaceTime call', icon: '📱', unlockedAt: null, secret: true },
  { id: 'slice_master', title: 'Heart Slicer 💗', desc: 'Sliced over 50 romantic items in Love Slice', icon: '🥷', unlockedAt: null },
  { id: 'diamond_heart', title: 'Diamond Heart 💎', desc: 'Sliced the super rare diamond heart in Love Slice', icon: '💎', unlockedAt: null, secret: true },
  { id: 'maze_runner', title: 'Found My Way to You', desc: 'Completed the Love Maze without getting lost forever', icon: '🧭', unlockedAt: null },
  { id: 'word_nerd', title: 'Word Master', desc: 'Unscrambled all relationship secret phrases', icon: '🔤', unlockedAt: null },
  { id: 'rhythm_star', title: 'In Sync With My Heart', desc: 'Achieved Perfect Sync on Mini Rhythm Tap', icon: '🎵', unlockedAt: null },
  { id: 'hug_100', title: 'Professional Hugger 🤗', desc: 'Sent over 100 virtual hugs', icon: '🤗', unlockedAt: null },
  { id: 'kiss_100', title: 'Kiss Addict 💋', desc: 'Sent over 100 virtual kisses', icon: '💋', unlockedAt: null },
  { id: 'affection_secret', title: 'Secret Affection Flood', desc: 'Discovered the hidden Hug-Hug-Kiss sequence', icon: '🌊', unlockedAt: null, secret: true },
  { id: 'simp_supreme', title: 'Certified Simp', desc: 'Generated 1,000+ Love Points in Love Clicker', icon: '👑', unlockedAt: null },
  { id: 'countdown_streak', title: 'Daily Devotee 🔥', desc: 'Checked into the universe on consecutive days during the countdown', icon: '🔥', unlockedAt: null, secret: true },
  { id: 'countdown_complete', title: 'Century Milestone Master 👑', desc: 'Unlocked all 10 daily countdown drops', icon: '👑', unlockedAt: null, secret: true },
  { id: 'secret_room', title: 'Secret Room Explorer', desc: 'Unlocked the hidden developer memory vault (5+ secrets)', icon: '🚪', unlockedAt: null, secret: true },
  { id: 'universe_100', title: '100% Relationship Master', desc: 'Explored every corner of our 3-month universe', icon: '💖', unlockedAt: null, secret: true },
  { id: 'perfect_match', title: 'Perfect Match 💫', desc: 'Scored 90%+ on the Compatibility Test — cosmically aligned', icon: '💫', unlockedAt: null },
];

export const useUniverseStore = create<UniverseStore>()(
  persist(
    (set, get) => ({
      enteredUniverse: false,
      setEnteredUniverse: (val) => set({ enteredUniverse: val }),
      explorationPoints: {},
      
      addExplorationPoint: (key, label) => {
        const { explorationPoints, unlockAchievement } = get();
        if (explorationPoints[key]) return;
        const next = { ...explorationPoints, [key]: true };
        set({ explorationPoints: next });
        
        SoundEngine.chime();
        confetti({
          particleCount: 15,
          spread: 40,
          origin: { x: 0.9, y: 0.1 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
        });

        // Check if 100%
        const totalKeys = 20;
        const currentCount = Object.keys(next).length;
        if (currentCount >= totalKeys) {
          unlockAchievement('universe_100');
        }
      },

      getExplorationPercent: () => {
        const count = Object.keys(get().explorationPoints).length;
        return Math.min(100, Math.round((count / 20) * 100));
      },

      soundtrackPlaying: false,
      soundtrackMuted: false,
      toggleSoundtrack: () => set((s) => ({ soundtrackPlaying: !s.soundtrackPlaying })),
      setSoundtrackPlaying: (val) => set({ soundtrackPlaying: val }),
      toggleMute: () => set((s) => ({ soundtrackMuted: !s.soundtrackMuted })),

      discoveredSecrets: {},
      unlockSecret: (secretKey, secretName) => {
        const { discoveredSecrets, unlockAchievement } = get();
        if (discoveredSecrets[secretKey]) return;
        const next = { ...discoveredSecrets, [secretKey]: true };
        set({ discoveredSecrets: next });

        SoundEngine.confettiPop();
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
        });

        unlockAchievement('first_secret');
        if (Object.keys(next).length >= 5) {
          unlockAchievement('secret_room');
        }
      },

      isSecretRoomUnlocked: () => {
        return Object.keys(get().discoveredSecrets).length >= 5;
      },

      achievements: INITIAL_ACHIEVEMENTS,
      lastUnlockedAchievement: null,
      unlockAchievement: (id) => {
        const { achievements } = get();
        const existing = achievements.find((a) => a.id === id);
        if (!existing || existing.unlockedAt) return;

        const now = new Date().toISOString();
        const updated = achievements.map((a) => (a.id === id ? { ...a, unlockedAt: now } : a));
        const unlockedObj = updated.find((a) => a.id === id) || null;

        SoundEngine.chime();
        set({
          achievements: updated,
          lastUnlockedAchievement: unlockedObj,
        });

        setTimeout(() => {
          set({ lastUnlockedAchievement: null });
        }, 5000);
      },

      clearAchievementToast: () => set({ lastUnlockedAchievement: null }),

      // Love Slice
      loveSliceBestScore: 0,
      loveSliceBestCombo: 0,
      loveSliceTotalSliced: 0,
      saveLoveSliceScore: (score, combo, sliced) => {
        const { loveSliceBestScore, loveSliceBestCombo, loveSliceTotalSliced, unlockAchievement } = get();
        const newTotal = loveSliceTotalSliced + sliced;
        set({
          loveSliceBestScore: Math.max(loveSliceBestScore, score),
          loveSliceBestCombo: Math.max(loveSliceBestCombo, combo),
          loveSliceTotalSliced: newTotal,
        });
        if (newTotal >= 50) unlockAchievement('slice_master');
        if (combo >= 23) get().addExplorationPoint('slice_combo_23');
      },

      // Love Maze
      loveMazeCompleted: false,
      setLoveMazeCompleted: () => {
        set({ loveMazeCompleted: true });
        get().unlockAchievement('maze_runner');
        get().addExplorationPoint('love_maze');
      },

      // Heart Catcher
      heartCatcherHighScore: 0,
      saveHeartCatcherScore: (score) => {
        set((s) => ({ heartCatcherHighScore: Math.max(s.heartCatcherHighScore, score) }));
        get().addExplorationPoint('heart_catcher');
      },

      // Word Scramble
      scrambleLevelsCompleted: 0,
      completeScrambleLevel: (lvl) => {
        set((s) => ({ scrambleLevelsCompleted: Math.max(s.scrambleLevelsCompleted, lvl) }));
        if (lvl >= 4) get().unlockAchievement('word_nerd');
        get().addExplorationPoint('word_scramble');
      },

      // Rhythm Tap
      rhythmHighScore: 0,
      saveRhythmScore: (score) => {
        set((s) => ({ rhythmHighScore: Math.max(s.rhythmHighScore, score) }));
        if (score >= 250) get().unlockAchievement('rhythm_star');
        get().addExplorationPoint('rhythm_tap');
      },

      // Love Clicker
      lovePoints: 0,
      clickerMultiplier: 1,
      clickerUpgrades: {},
      addLovePoints: (pts) => {
        const { lovePoints, unlockAchievement } = get();
        const next = lovePoints + pts;
        set({ lovePoints: next });
        if (next >= 1000) unlockAchievement('simp_supreme');
        get().addExplorationPoint('love_clicker');
      },
      buyClickerUpgrade: (id, cost, multiplierBoost) => {
        const { lovePoints, clickerMultiplier, clickerUpgrades } = get();
        if (lovePoints < cost) return false;
        set({
          lovePoints: lovePoints - cost,
          clickerMultiplier: clickerMultiplier + multiplierBoost,
          clickerUpgrades: { ...clickerUpgrades, [id]: (clickerUpgrades[id] || 0) + 1 },
        });
        SoundEngine.pop();
        return true;
      },

      // Virtual Hug / Kiss
      virtualHugs: 0,
      virtualKisses: 0,
      secretAffectionMode: false,
      addHug: () => {
        const { virtualHugs, unlockAchievement } = get();
        const next = virtualHugs + 1;
        set({ virtualHugs: next });
        if (next >= 100) unlockAchievement('hug_100');
        get().addExplorationPoint('hug_counter');
      },
      addKiss: () => {
        const { virtualKisses, unlockAchievement } = get();
        const next = virtualKisses + 1;
        set({ virtualKisses: next });
        if (next >= 100) unlockAchievement('kiss_100');
        get().addExplorationPoint('kiss_counter');
      },
      setSecretAffectionMode: (val) => {
        set({ secretAffectionMode: val });
        if (val) {
          get().unlockAchievement('affection_secret');
          get().unlockSecret('affection_flood', 'Secret Affection Flood Mode');
        }
      },

      // Saved Scenes
      savedScenes: [],
      saveScene: (scene) => {
        set((s) => ({ savedScenes: [scene, ...s.savedScenes] }));
        get().addExplorationPoint('scene_builder');
      },

      // Saved Collages
      savedCollages: [],
      saveCollage: (collage) => {
        set((s) => ({ savedCollages: [collage, ...s.savedCollages] }));
        get().addExplorationPoint('collage_maker');
      },

      // Fortune History
      fortuneHistory: [],
      addFortune: (entry) => {
        set((s) => ({ fortuneHistory: [entry, ...s.fortuneHistory] }));
        get().addExplorationPoint('fortune_spinner');
      },

      // Favorite Prompts
      favoritePrompts: [],
      toggleFavoritePrompt: (prompt) => {
        set((s) => {
          const exists = s.favoritePrompts.includes(prompt);
          return {
            favoritePrompts: exists ? s.favoritePrompts.filter((p) => p !== prompt) : [...s.favoritePrompts, prompt],
          };
        });
        get().addExplorationPoint('truth_dare');
      },

      // Cheat Helper
      unlockAllCheat: () => {
        const now = new Date().toISOString();
        const allAchievements = INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlockedAt: a.unlockedAt || now }));
        const allExploration: Record<string, boolean> = {};
        for (let i = 1; i <= 25; i++) {
          allExploration[`exploration_point_${i}`] = true;
        }
        const allSecrets: Record<string, boolean> = {
          secret_nush: true,
          secret_yajat: true,
          secret_teddy: true,
          secret_pills: true,
          secret_maggi: true,
          secret_openaudi: true,
          secret_library: true,
          secret_kiss: true,
          secret_voice: true,
          secret_stomach: true,
          secret_escape: true,
          secret_cuddle: true,
          secret_smile: true,
          secret_facetime: true,
          secret_wifey: true,
          secret_90: true,
          secret_cheat: true,
          secret_room: true,
        };

        set({
          achievements: allAchievements,
          explorationPoints: allExploration,
          discoveredSecrets: allSecrets,
          lovePoints: (get().lovePoints || 0) + 100000,
          virtualHugs: Math.max(100, get().virtualHugs),
          virtualKisses: Math.max(100, get().virtualKisses),
          loveMazeCompleted: true,
          secretAffectionMode: true,
          scrambleLevelsCompleted: 5,
          heartCatcherHighScore: Math.max(100, get().heartCatcherHighScore),
          rhythmHighScore: Math.max(500, get().rhythmHighScore),
          loveSliceBestScore: Math.max(100, get().loveSliceBestScore),
          loveSliceTotalSliced: Math.max(100, get().loveSliceTotalSliced),
        });

        SoundEngine.confettiPop();
        confetti({
          particleCount: 180,
          spread: 140,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#00FF66', '#FFD700', '#FF5C8E', '#B9AEF5'],
        });
      },

      // UI Modals & Floating Dock State
      isAchievementsOpen: false,
      setAchievementsOpen: (open) => set({ isAchievementsOpen: open }),
      isTimeMachineOpen: false,
      setTimeMachineOpen: (open) => set({ isTimeMachineOpen: open }),
      isSecretsPickerOpen: false,
      setSecretsPickerOpen: (open) => set({ isSecretsPickerOpen: open }),
      isCamcorderOn: false,
      setCamcorderOn: (on) => set({ isCamcorderOn: on }),
      isLibraryBookOpen: false,
      setLibraryBookOpen: (open) => set({ isLibraryBookOpen: open }),
      isVideoCallOpen: false,
      setVideoCallOpen: (open) => set({ isVideoCallOpen: open }),

      // Daily Streak & Countdown
      streakCount: 7,
      lastVisitDate: null,
      checkAndUpdateStreak: () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const { lastVisitDate, streakCount, unlockAchievement } = get();

        // Local optimistic streak calculation
        let localStreak = Math.max(streakCount || 1, 1);
        if (!lastVisitDate) {
          set({ lastVisitDate: todayStr, streakCount: localStreak });
        } else if (lastVisitDate !== todayStr) {
          const [y1, m1, d1] = lastVisitDate.split('-').map(Number);
          const [y2, m2, d2] = todayStr.split('-').map(Number);
          const diffDays = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);

          if (diffDays === 1) {
            localStreak += 1;
            set({ lastVisitDate: todayStr, streakCount: localStreak });
            if (localStreak >= 3) {
              unlockAchievement('countdown_streak');
            }
          } else if (diffDays <= 2) {
            // Forgive a 1-day gap: keep streak active
            set({ lastVisitDate: todayStr });
          } else {
            localStreak = 1;
            set({ lastVisitDate: todayStr, streakCount: 1 });
          }
        }

        // Global sync with server so Nush and Yajat share the exact same streak!
        if (typeof window !== 'undefined') {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'streak',
              action: 'check_in',
              date: todayStr,
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res && res.data && typeof res.data.streakCount === 'number') {
                set({
                  streakCount: Math.max(res.data.streakCount, 1),
                  lastVisitDate: res.data.lastVisitDate || todayStr,
                });
                if (res.data.streakCount >= 3) {
                  unlockAchievement('countdown_streak');
                }
              }
            })
            .catch(() => {});
        }
      },

      // Reset Helper
      resetUniverse: () => {
        set({
          enteredUniverse: false,
          explorationPoints: {},
          discoveredSecrets: {},
          achievements: INITIAL_ACHIEVEMENTS,
          loveSliceBestScore: 0,
          loveSliceBestCombo: 0,
          loveSliceTotalSliced: 0,
          loveMazeCompleted: false,
          heartCatcherHighScore: 0,
          scrambleLevelsCompleted: 0,
          rhythmHighScore: 0,
          lovePoints: 0,
          clickerMultiplier: 1,
          clickerUpgrades: {},
          virtualHugs: 0,
          virtualKisses: 0,
          secretAffectionMode: false,
          savedScenes: [],
          savedCollages: [],
          fortuneHistory: [],
          favoritePrompts: [],
        });
      },
    }),
    {
      name: 'yajat_nush_universe_v3',
    }
  )
);

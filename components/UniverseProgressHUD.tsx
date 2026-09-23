'use client';

import React, { useEffect } from 'react';
import { useUniverseStore } from '@/lib/universeStore';
import { useStore } from '@/lib/store';
import { SoundEngine } from '@/lib/audio';

export default function UniverseProgressHUD() {
  const {
    getExplorationPercent,
    soundtrackPlaying,
    toggleSoundtrack,
    enteredUniverse,
    streakCount,
    checkAndUpdateStreak,
  } = useUniverseStore();
  const { theme, toggleTheme } = useStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const percent = getExplorationPercent();

  if (!enteredUniverse) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden select-none font-nunito">
      {/* Streak Pill */}
      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5 text-xs font-mono text-white">
        <span className="text-base animate-bounce">🔥</span>
        <span className="text-[var(--butter)] font-bold">{streakCount}d</span>
      </div>

      {/* Exploration Pill */}
      <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-2 text-xs font-mono text-white">
        <span className="text-[var(--pink)] animate-pulse">🌌</span>
        <span>
          Universe: <b className="text-[var(--butter)]">{percent}%</b>
        </span>
        <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--pink)] to-[var(--butter)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Soundtrack Toggle */}
      <button
        onClick={() => {
          SoundEngine.click();
          toggleSoundtrack();
        }}
        className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-lg backdrop-blur text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          soundtrackPlaying
            ? 'bg-[var(--pink-deep)] border-white text-white'
            : 'bg-black/60 border-white/20 text-gray-400'
        }`}
        title={soundtrackPlaying ? 'Pause Soundtrack' : 'Play Soundtrack'}
      >
        {soundtrackPlaying ? '🔊' : '🔈'}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => {
          SoundEngine.pop();
          toggleTheme();
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 bg-black/60 shadow-lg backdrop-blur text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer text-white"
        title={theme === 'dark' ? 'Switch to Light Mode 🌸' : 'Switch to Dark Mode ✨'}
      >
        {theme === 'dark' ? '✨' : '🌸'}
      </button>
    </div>
  );
}

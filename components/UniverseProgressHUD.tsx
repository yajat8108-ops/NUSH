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
    isCamcorderOn,
    setCamcorderOn,
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
    <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-2 print:hidden select-none font-nunito max-w-[95vw]">
      {/* Streak Pill */}
      <div className="bg-black/70 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono text-white">
        <span className="text-xs sm:text-base">🔥</span>
        <span className="text-[var(--butter)] font-bold">{streakCount}d</span>
      </div>

      {/* Exploration Pill */}
      <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-white">
        <span className="text-[var(--pink)]">🌌</span>
        <span>
          <span className="hidden sm:inline">Universe: </span>
          <b className="text-[var(--butter)]">{percent}%</b>
        </span>
        <div className="w-8 sm:w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--pink)] to-[var(--butter)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* VHS Mode Quick Toggle */}
      <button
        onClick={() => {
          SoundEngine.click();
          setCamcorderOn(!isCamcorderOn);
        }}
        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border shadow-lg backdrop-blur text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          isCamcorderOn
            ? 'bg-red-600 border-white text-white animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]'
            : 'bg-black/70 border-white/20 text-gray-300 hover:text-white'
        }`}
        title={isCamcorderOn ? 'Exit VHS Mode 🎥' : 'Enable Vintage VHS Camcorder Mode 🎥'}
      >
        🎥
      </button>

      {/* Soundtrack Toggle */}
      <button
        onClick={() => {
          SoundEngine.click();
          toggleSoundtrack();
        }}
        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border shadow-lg backdrop-blur text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          soundtrackPlaying
            ? 'bg-[var(--pink-deep)] border-white text-white'
            : 'bg-black/70 border-white/20 text-gray-300'
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
        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-white/20 bg-black/70 shadow-lg backdrop-blur text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer text-white"
        title={theme === 'dark' ? 'Switch to Light Mode 🌸' : 'Switch to Dark Mode ✨'}
      >
        {theme === 'dark' ? '✨' : '🌸'}
      </button>
    </div>
  );
}

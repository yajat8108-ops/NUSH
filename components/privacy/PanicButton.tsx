'use client';

import React, { useEffect, useRef } from 'react';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

export default function PanicButton() {
  const { isStealthMode, setStealthMode, soundtrackPlaying, toggleSoundtrack } = useUniverseStore();
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key or Ctrl+Shift+L instantly activates Stealth Camouflage
      if (e.key === 'Escape' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l')) {
        if (!isStealthMode) {
          triggerPanic();
        }
      }
    };

    // Mobile double-tap on top area of screen
    const handleTouchStart = (e: TouchEvent) => {
      // Check if touch is in the top 60px of screen
      if (e.touches[0].clientY < 60) {
        const now = Date.now();
        if (now - lastTapRef.current < 350) {
          // Double-tap detected on top bar!
          triggerPanic();
        }
        lastTapRef.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isStealthMode, soundtrackPlaying]);

  const triggerPanic = () => {
    SoundEngine.click();
    if (soundtrackPlaying) {
      toggleSoundtrack();
    }
    setStealthMode(true);
  };

  return (
    <button
      onClick={triggerPanic}
      className="fixed top-2.5 left-2.5 sm:top-4 sm:left-4 z-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer print:hidden select-none"
      title="Quick calc (Esc or double-tap top bar)"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
      <span className="font-bold text-zinc-300">fx</span>
      <span className="text-zinc-500 hidden sm:inline">calc</span>
    </button>
  );
}


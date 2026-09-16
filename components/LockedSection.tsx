'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/lib/progressStore';
import { useUniverseStore } from '@/lib/universeStore';

interface LockedSectionProps {
  minProgress: number;
  sectionName: string;
  tip: string;
  unlockDay?: number;
  children: ReactNode;
}

// Day 1 starts tonight at 12:00 AM (midnight, Sep 9, 2026)
const DAY_1_START = new Date('2026-09-09T00:00:00+05:30');

export default function LockedSection({
  minProgress,
  sectionName,
  tip,
  unlockDay,
  children,
}: LockedSectionProps) {
  const loveMeterProgress = useProgressStore((state) => state.progress);
  const getExplorationPercent = useUniverseStore((state) => state.getExplorationPercent);
  const [now, setNow] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const explorationPercent = mounted ? getExplorationPercent() : 0;
  const effectiveProgress = Math.max(loveMeterProgress || 10, explorationPercent || 0);

  // Check if calendar day requirement has arrived after midnight
  let dayUnlocked = false;
  let unlockDateLabel = '';
  if (unlockDay) {
    const dayUnlockTime = DAY_1_START.getTime() + (unlockDay - 1) * 24 * 60 * 60 * 1000;
    const targetDate = new Date(dayUnlockTime);
    dayUnlocked = now.getTime() >= dayUnlockTime;
    unlockDateLabel = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const isUnlocked = effectiveProgress >= minProgress || dayUnlocked;

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'opacity, transform' }}
      >
        {children}
      </motion.div>
    );
  }

  // Calculate percentage towards unlock for the mini progress bar
  const progressPercent = Math.min(100, Math.max(0, (effectiveProgress / minProgress) * 100));

  return (
    <div className="w-full relative flex flex-col items-center justify-center p-4 sm:p-8 my-6 select-none">
      {/* Frosted Glass Sealed Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/40 dark:bg-[#151022]/60 backdrop-blur-xl border-2 border-[var(--pink)]/40 rounded-3xl shadow-[0_8px_32px_rgba(255,92,142,0.18)] p-6 sm:p-8 text-center relative overflow-hidden"
      >
        {/* Ambient floating radial sheen */}
        <div
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,182,193,0.15)_0%,transparent_60%)] pointer-events-none"
        />

        {/* Pulsing Lock Icon with Sparkles */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl sm:text-6xl mb-3 relative inline-block"
        >
          🔒
          <motion.span
            animate={{ opacity: [0, 1, 0], scale: [0.7, 1.2, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
            className="absolute -top-1 -right-2 text-2xl"
          >
            ✨
          </motion.span>
        </motion.div>

        {/* Text Content */}
        <h3 className="font-serif font-bold text-2xl text-[var(--plum)] dark:text-white mb-1">
          Chapter Sealed: {sectionName}
        </h3>
        <p className="font-mono text-xs text-[var(--plum-soft)] dark:text-gray-400 mb-5 font-semibold">
          Requires <strong className="text-[var(--pink-deep)] font-bold">{minProgress}%</strong> Universe Exploration (Current: {effectiveProgress}%)
        </p>

        {/* Progress Bar towards Unlock */}
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 mb-5 overflow-hidden relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[var(--pink)] via-[var(--lavender)] to-[var(--butter)] rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </motion.div>
        </div>

        {/* Romantic Hint Box */}
        <div className="bg-[var(--butter)]/40 dark:bg-white/5 border border-[var(--pink)]/30 rounded-2xl p-3.5 text-left shadow-sm">
          <p className="font-nunito text-[var(--plum)] dark:text-gray-200 text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">💡 How to unlock:</span> {tip}
          </p>
          {unlockDay && (
            <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              ⏳ Or unlocks automatically on <strong>{unlockDateLabel}</strong> on our Road to September 22nd Anniversary.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

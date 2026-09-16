'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

export default function FloatingBottomDock() {
  const {
    achievements,
    setAchievementsOpen,
    setTimeMachineOpen,
    isSecretsPickerOpen,
    setSecretsPickerOpen,
    isCamcorderOn,
    setCamcorderOn,
    setLibraryBookOpen,
    setVideoCallOpen,
    unlockSecret,
    unlockAchievement,
    addExplorationPoint,
  } = useUniverseStore();

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  const handleOpenLibrary = () => {
    SoundEngine.pop();
    unlockSecret('library_pass', 'Secret Central Library Study Pass');
    unlockAchievement('library_detective');
    addExplorationPoint('library_secret');
    setLibraryBookOpen(true);
  };

  const handleOpenVideoCall = () => {
    SoundEngine.pop();
    unlockSecret('facetime_call', 'Simulated 2nd-Month FaceTime Call');
    unlockAchievement('video_caller');
    addExplorationPoint('video_call');
    setVideoCallOpen(true);
  };

  return (
    <>
      {/* 1. BOTTOM LEFT FLOATING DOCK (VHS + LIBRARY + FACETIME) */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 print:hidden select-none">
        {/* Camcorder VHS Mode Toggle */}
        <button
          onClick={() => {
            SoundEngine.click();
            setCamcorderOn(!isCamcorderOn);
          }}
          className={`h-10 px-3.5 rounded-full flex items-center gap-1.5 font-mono text-xs font-bold border shadow-xl backdrop-blur transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isCamcorderOn
              ? 'bg-red-600 border-white text-white animate-pulse'
              : 'bg-black/60 hover:bg-black/80 border-white/20 text-white'
          }`}
          title="Toggle Vintage VHS Camcorder Viewfinder Overlay 🎥"
        >
          <span className="text-sm">🎥</span>
          <span className="hidden sm:inline">VHS</span>
        </button>

        {/* Library Pass Easter Egg */}
        <button
          onClick={handleOpenLibrary}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-base shadow-xl backdrop-blur hover:scale-110 active:scale-95 transition-transform text-white cursor-pointer"
          title="Central Library Study Pass (0% study, 100% stare) 📚"
        >
          📚
        </button>

        {/* Video Call Simulation */}
        <button
          onClick={handleOpenVideoCall}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-base shadow-xl backdrop-blur hover:scale-110 active:scale-95 transition-transform text-white cursor-pointer"
          title="Simulate our 2nd-month all-night FaceTime call 📱"
        >
          📱
        </button>
      </div>

      {/* 2. BOTTOM RIGHT FLOATING DOCK (TIME MACHINE + SECRETS + ACHIEVEMENTS) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 print:hidden select-none max-w-[90vw]">
        {/* Row 1: Time Machine (Multiverse Vault) Button */}
        <motion.button
          onClick={() => {
            SoundEngine.click();
            setTimeMachineOpen(true);
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/40 font-mono text-xs md:text-sm font-bold backdrop-blur-md cursor-pointer hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-shadow"
          aria-label="Open Time Machine Archive"
        >
          <span className="text-base animate-spin" style={{ animationDuration: '8s' }}>
            ⏳
          </span>
          <span>Time Machine (5 Sites)</span>
        </motion.button>

        {/* Row 2: Secrets Pill + Achievements Pill in Non-Overlapping Flex Row */}
        <div className="flex items-center gap-2">
          {/* Secrets Drawer Toggle */}
          <button
            onClick={() => {
              SoundEngine.pop();
              setSecretsPickerOpen(!isSecretsPickerOpen);
            }}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-3.5 py-2 rounded-full font-mono text-xs font-bold shadow-xl border border-white/30 backdrop-blur flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Open Secret Easter Eggs Menu"
          >
            <span>✨</span>
            <span>Secrets</span>
          </button>

          {/* Achievements Trigger */}
          <button
            onClick={() => {
              SoundEngine.click();
              setAchievementsOpen(true);
            }}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-4 py-2 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/30 cursor-pointer"
            title="View Relationship Badges & Achievements"
          >
            <span>🏆</span>
            <span>
              Achievements ({unlockedCount}/{achievements.length})
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

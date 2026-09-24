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
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center print:hidden select-none max-w-[98vw]">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-[#12101a]/92 backdrop-blur-2xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.65)] hover:border-white/30 transition-all"
      >
        {/* 1. VHS Camcorder Mode Toggle */}
        <button
          onClick={() => {
            SoundEngine.click();
            setCamcorderOn(!isCamcorderOn);
          }}
          className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
            isCamcorderOn
              ? 'bg-red-600 text-white animate-pulse border border-white shadow-[0_0_15px_rgba(220,38,38,0.8)]'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
          }`}
          title="Toggle Vintage VHS Camcorder Viewfinder 🎥"
        >
          <span className="text-xs sm:text-sm">🎥</span>
          <span>{isCamcorderOn ? 'REC' : 'VHS'}</span>
        </button>

        {/* 2. Library Pass */}
        <button
          onClick={handleOpenLibrary}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-xs sm:text-sm text-white transition-all active:scale-95 cursor-pointer shrink-0"
          title="VIT Central Library Study Pass 📚"
        >
          📚
        </button>

        {/* 3. FaceTime Call Simulation */}
        <button
          onClick={handleOpenVideoCall}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-xs sm:text-sm text-white transition-all active:scale-95 cursor-pointer shrink-0"
          title="All-Night FaceTime Call Simulation 📱"
        >
          📱
        </button>

        <div className="w-[1px] h-4 sm:h-5 bg-white/20 mx-0.5 shrink-0" />

        {/* 4. Time Machine Vault */}
        <button
          onClick={() => {
            SoundEngine.click();
            setTimeMachineOpen(true);
          }}
          className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-mono text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0 transition-all border border-white/20"
          title="Time Machine (5 Past Anniversary Sites) ⏳"
        >
          <span className="text-xs sm:text-sm animate-spin" style={{ animationDuration: '8s' }}>
            ⏳
          </span>
          <span>Vault</span>
        </button>

        {/* 5. Secrets Drawer */}
        <button
          onClick={() => {
            SoundEngine.pop();
            setSecretsPickerOpen(!isSecretsPickerOpen);
          }}
          className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0 border border-white/10 ${
            isSecretsPickerOpen
              ? 'bg-[var(--pink-deep)] text-white shadow-md'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          title="Secret Easter Eggs & Minigames ✨"
        >
          <span>✨</span>
          <span>Secrets</span>
        </button>

        {/* 6. Achievements */}
        <button
          onClick={() => {
            SoundEngine.click();
            setAchievementsOpen(true);
          }}
          className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-mono text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0 transition-all border border-white/20"
          title="Achievements & Badges 🏆"
        >
          <span>🏆</span>
          <span>{unlockedCount}/{achievements.length}</span>
        </button>
      </motion.div>
    </div>
  );
}

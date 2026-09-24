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
      {/* ─── MOBILE PILL (< md) ───────────────────────────────────── */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 print:hidden select-none">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.2 }}
          className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          {/* VHS Toggle */}
          <button
            onClick={() => { SoundEngine.click(); setCamcorderOn(!isCamcorderOn); }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 transition-all active:scale-90 cursor-pointer text-xs font-mono font-bold ${
              isCamcorderOn
                ? 'bg-red-600 text-white animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.7)]'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle VHS Camcorder Mode"
          >
            <span className="text-lg leading-none">🎥</span>
            <span className="text-[9px] tracking-wide">{isCamcorderOn ? 'REC' : 'VHS'}</span>
          </button>

          {/* Library */}
          <button
            onClick={handleOpenLibrary}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="VIT Library Pass"
          >
            <span className="text-lg leading-none">📚</span>
            <span className="text-[9px] font-mono tracking-wide">Lib</span>
          </button>

          {/* FaceTime */}
          <button
            onClick={handleOpenVideoCall}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="FaceTime Call"
          >
            <span className="text-lg leading-none">📱</span>
            <span className="text-[9px] font-mono tracking-wide">Call</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/15 mx-0.5" />

          {/* Time Machine */}
          <button
            onClick={() => { SoundEngine.click(); setTimeMachineOpen(true); }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 text-amber-300 hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
            title="Time Machine Vault"
          >
            <span className="text-lg leading-none animate-spin" style={{ animationDuration: '8s' }}>⏳</span>
            <span className="text-[9px] font-mono tracking-wide">Vault</span>
          </button>

          {/* Secrets */}
          <button
            onClick={() => { SoundEngine.pop(); setSecretsPickerOpen(!isSecretsPickerOpen); }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 transition-all active:scale-90 cursor-pointer ${
              isSecretsPickerOpen ? 'bg-[var(--pink-deep)]/60 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Secret Easter Eggs"
          >
            <span className="text-lg leading-none">✨</span>
            <span className="text-[9px] font-mono tracking-wide">Secrets</span>
          </button>

          {/* Achievements */}
          <button
            onClick={() => { SoundEngine.click(); setAchievementsOpen(true); }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-90 cursor-pointer relative"
            title="Achievements"
          >
            <span className="text-lg leading-none">🏆</span>
            <span className="text-[9px] font-mono tracking-wide">{unlockedCount}/{achievements.length}</span>
          </button>
        </motion.div>
      </div>

      {/* ─── DESKTOP LEFT CORNER (md+) ───────────────────────────── */}
      <div className="hidden md:flex fixed bottom-6 left-6 z-40 items-center gap-2.5 print:hidden select-none">
        {/* VHS Camcorder Toggle */}
        <button
          onClick={() => { SoundEngine.click(); setCamcorderOn(!isCamcorderOn); }}
          className={`h-10 px-3.5 rounded-full flex items-center gap-1.5 font-mono text-xs font-bold border shadow-xl backdrop-blur transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isCamcorderOn
              ? 'bg-red-600 border-white text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]'
              : 'bg-black/70 hover:bg-black/90 border-white/20 text-white'
          }`}
          title="Toggle Vintage VHS Camcorder Viewfinder 🎥"
        >
          <span className="text-sm">🎥</span>
          <span>{isCamcorderOn ? '● REC' : 'VHS'}</span>
        </button>

        {/* Library Pass */}
        <button
          onClick={handleOpenLibrary}
          className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 flex items-center justify-center text-base shadow-xl backdrop-blur hover:scale-110 active:scale-95 transition-transform text-white cursor-pointer"
          title="Central Library Study Pass 📚"
        >
          📚
        </button>

        {/* Video Call */}
        <button
          onClick={handleOpenVideoCall}
          className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 flex items-center justify-center text-base shadow-xl backdrop-blur hover:scale-110 active:scale-95 transition-transform text-white cursor-pointer"
          title="Simulate our 2nd-month all-night FaceTime 📱"
        >
          📱
        </button>
      </div>

      {/* ─── DESKTOP RIGHT CORNER (md+) ─────────────────────────── */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-2.5 print:hidden select-none">
        {/* Time Machine */}
        <motion.button
          onClick={() => { SoundEngine.click(); setTimeMachineOpen(true); }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/40 font-mono text-xs md:text-sm font-bold backdrop-blur-md cursor-pointer hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-shadow"
        >
          <span className="text-base animate-spin" style={{ animationDuration: '8s' }}>⏳</span>
          <span>Time Machine (5 Sites)</span>
        </motion.button>

        {/* Secrets + Achievements row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { SoundEngine.pop(); setSecretsPickerOpen(!isSecretsPickerOpen); }}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-3.5 py-2 rounded-full font-mono text-xs font-bold shadow-xl border border-white/30 backdrop-blur flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Secret Easter Eggs Menu"
          >
            <span>✨</span>
            <span>Secrets</span>
          </button>

          <button
            onClick={() => { SoundEngine.click(); setAchievementsOpen(true); }}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-4 py-2 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-white/30 cursor-pointer"
            title="View Achievements & Badges"
          >
            <span>🏆</span>
            <span>Achievements ({unlockedCount}/{achievements.length})</span>
          </button>
        </div>
      </div>
    </>
  );
}

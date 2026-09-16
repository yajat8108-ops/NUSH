'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

export default function AchievementsModal() {
  const {
    achievements,
    isAchievementsOpen,
    setAchievementsOpen,
    isSecretRoomUnlocked,
    lastUnlockedAchievement,
    clearAchievementToast,
  } = useUniverseStore();

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <>

      {/* Achievement Toast */}
      <AnimatePresence>
        {lastUnlockedAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[99999] bg-[#1a1226] text-white p-4 rounded-2xl border-2 border-[var(--butter)] shadow-2xl flex items-center gap-3 font-nunito max-w-xs"
          >
            <span className="text-3xl">{lastUnlockedAchievement.icon}</span>
            <div>
              <span className="text-[10px] font-mono uppercase text-[var(--butter)] font-bold block">
                🏆 Achievement Unlocked!
              </span>
              <h4 className="font-bold text-sm text-white">{lastUnlockedAchievement.title}</h4>
              <p className="text-[11px] text-gray-300">{lastUnlockedAchievement.desc}</p>
            </div>
            <button
              onClick={clearAchievementToast}
              className="text-gray-400 hover:text-white text-xs ml-auto"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Modal Drawer */}
      <AnimatePresence>
        {isAchievementsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setAchievementsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#191524] text-white p-6 rounded-3xl max-w-xl w-full shadow-2xl border-2 border-[var(--pink)]/40 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏆✨</span>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--butter)] font-mono">
                      RELATIONSHIP ACHIEVEMENTS
                    </h3>
                    <p className="text-xs text-[var(--pink)]">
                      {unlockedCount} of {achievements.length} badges unlocked
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAchievementsOpen(false)}
                  className="text-gray-400 hover:text-white text-base font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Badges Grid */}
              <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
                {achievements.map((ach) => {
                  const isUnlocked = Boolean(ach.unlockedAt);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                        isUnlocked
                          ? 'bg-white/10 border-[var(--butter)]/50 shadow-md'
                          : 'bg-white/5 border-white/5 opacity-50'
                      }`}
                    >
                      <span className="text-2xl filter drop-shadow">
                        {isUnlocked ? ach.icon : '🔒'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs md:text-sm text-[var(--butter)]">
                            {isUnlocked ? ach.title : '??? Secret Badge'}
                          </h4>
                          {isUnlocked && (
                            <span className="text-[9px] font-mono text-[var(--pink)]">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-300">
                          {isUnlocked ? ach.desc : 'Explore the relationship universe to unlock'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Secret Room Trigger */}
              {isSecretRoomUnlocked() && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <a
                    href="#secret-room"
                    onClick={() => setAchievementsOpen(false)}
                    className="w-full py-2.5 bg-gradient-to-r from-[var(--butter)] via-yellow-400 to-[var(--pink)] text-[#1a1528] rounded-2xl font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    <span>🚪</span>
                    <span>SECRET ROOM UNLOCKED &rarr; Jump to Room</span>
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

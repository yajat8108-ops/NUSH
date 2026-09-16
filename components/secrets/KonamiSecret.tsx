'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';
import TwoPlayerLoveGame from '../arcade/TwoPlayerLoveGame';

interface KonamiSecretProps {
  onClose: () => void;
}

export default function KonamiSecret({ onClose }: KonamiSecretProps) {
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const { unlockAchievement } = useUniverseStore();

  useEffect(() => {
    SoundEngine.confettiPop();
    unlockAchievement('konami_player');
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#ec4899'],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 md:p-6 select-none overflow-y-auto"
      onClick={onClose}
    >
      <AnimatePresence mode="wait">
        {!isPlayingGame ? (
          <motion.div
            key="card"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#0d130a] border-4 border-[#22c55e] rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(34,197,94,0.4)] text-center text-[#22c55e] font-mono my-auto"
            style={{
              boxShadow: 'inset 0 0 40px rgba(34,197,94,0.2), 0 0 60px rgba(34,197,94,0.4)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>

            <div className="text-4xl mb-3">👾🎮✨</div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-yellow-400 mb-2">
              PLAYER 2 HAS JOINED!
            </h2>
            <p className="text-xs text-[#86efac] mb-6 tracking-widest uppercase">
              KONAMI CODE ACCEPTED &middot; GOD MODE ACTIVE
            </p>

            {/* RETRO 8-BIT STATS CARD */}
            <div className="bg-black/80 border-2 border-[#22c55e] rounded-2xl p-5 text-left text-xs space-y-3 shadow-inner">
              <div className="flex justify-between border-b border-[#22c55e]/30 pb-2">
                <span>PLAYER 1:</span>
                <span className="text-white font-bold">YAJAT (LVL 99 SIMP)</span>
              </div>
              <div className="flex justify-between border-b border-[#22c55e]/30 pb-2">
                <span>PLAYER 2:</span>
                <span className="text-pink-400 font-bold">ANUSHKA (LVL 99 PRINCESS)</span>
              </div>
              <div className="flex justify-between border-b border-[#22c55e]/30 pb-2">
                <span>CO-OP STATUS:</span>
                <span className="text-yellow-400 font-bold">PERMANENTLY LINKED ❤️</span>
              </div>
              <div className="flex justify-between">
                <span>HP / LOVE METER:</span>
                <span className="text-red-400 font-bold">999999 / 999999 (MAX)</span>
              </div>
            </div>

            <p className="font-caveat text-2xl text-white mt-6 leading-relaxed">
              &ldquo;You just unlocked the greatest co-op campaign in the universe. Forever teammate, forever player two. ❤️&rdquo;
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  SoundEngine.chime();
                  setIsPlayingGame(true);
                }}
                className="px-6 py-3 rounded-full bg-[#22c55e] text-black font-bold text-xs uppercase hover:bg-[#16a34a] cursor-pointer shadow-lg active:scale-95 transition-transform font-mono"
              >
                START CO-OP CAMPAIGN ▶
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl my-auto"
          >
            <TwoPlayerLoveGame onExit={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

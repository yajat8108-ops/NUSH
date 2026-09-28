'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calculator from '@/components/Calculator';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function StealthGate() {
  const { isStealthMode, setStealthMode, unlockAchievement } = useUniverseStore();
  const [passcode, setPasscode] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!isStealthMode || isWarping) return;
      if (e.key === 'Enter') {
        checkSecretCode(passcode);
      }
    };
    const handleCustomPortal = () => {
      triggerUnlockSuccess();
    };

    window.addEventListener('keydown', handleGlobalKey);
    window.addEventListener('unlock-universe-portal', handleCustomPortal);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      window.removeEventListener('unlock-universe-portal', handleCustomPortal);
    };
  }, [isStealthMode, passcode, isWarping]);

  const triggerUnlockSuccess = () => {
    setIsWarping(true);
    SoundEngine.confettiPop();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9', '#ffffff'],
    });

    unlockAchievement('stealth_agent');

    setTimeout(() => {
      setStealthMode(false);
      setIsWarping(false);
      setPasscode('');
    }, 1100);
  };

  const checkSecretCode = (code: string) => {
    const cleaned = code.trim().toLowerCase();
    if (['2208', '2307', '365', '90', '143', '2206', 'nush', 'yajat', 'love'].includes(cleaned)) {
      triggerUnlockSuccess();
    } else {
      setUnlockError(true);
      SoundEngine.error();
      setTimeout(() => setUnlockError(false), 1200);
    }
  };

  if (!isStealthMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="stealth-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[999999] bg-[#0c0c0e] text-white flex flex-col items-center justify-between p-4 overflow-y-auto font-mono select-none"
      >
        {/* Cosmic Warp Overlay when unlocking */}
        <AnimatePresence>
          {isWarping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000000] bg-gradient-to-tr from-pink-600/40 via-purple-600/30 to-amber-500/20 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-none text-center p-6"
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="text-6xl mb-4"
              >
                🌌
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-widest uppercase">
                Welcome Home, Nushi 👑💖
              </h2>
              <p className="text-xs font-mono text-pink-200 mt-2">
                Unsealing Our Private Universe...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Innocent Academic Header Bar */}
        <div className="w-full max-w-md flex items-center justify-between border-b border-white/10 pb-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
              Casio ClassWiz fx-991EX &middot; Engineering Mode
            </span>
          </div>

          {/* Looks like a system restore / session button — actually the secret portal */}
          <button
            onClick={() => triggerUnlockSuccess()}
            className="text-[10px] text-zinc-600 hover:text-zinc-500 transition-colors px-2 py-1 rounded bg-white/[0.03] cursor-pointer font-mono border border-white/5"
            title=""
          >
            SYS v2.4.1
          </button>
        </div>

        {/* Real Authentic Working Calculator */}
        <div className="w-full max-w-md my-auto flex flex-col items-center">
          <Calculator />
        </div>

        {/* Discreet Unlock Dock at the bottom — looks like a session/token field */}
        <div className="w-full max-w-md border-t border-white/10 pt-3 mt-4 flex items-center gap-2">
          <input
            type="password"
            placeholder="Session token..."
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') checkSecretCode(passcode); }}
            className={`flex-1 bg-white/5 border ${
              unlockError ? 'border-red-500 text-red-300' : 'border-white/10 text-zinc-500'
            } rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/20 transition-colors font-mono placeholder-zinc-700`}
          />
          <button
            onClick={() => checkSecretCode(passcode)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-500 hover:text-zinc-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer active:scale-95"
          >
            Auth
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

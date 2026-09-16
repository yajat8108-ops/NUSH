'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { useUniverseStore } from '@/lib/universeStore';
import confetti from 'canvas-confetti';

export default function TheKissMilestone() {
  const { unlockAchievement, unlockSecret, addExplorationPoint } = useUniverseStore();
  const [smoochRevealed, setSmoochRevealed] = useState(false);
  const [kissUnlocked, setKissUnlocked] = useState(false);
  const [heartProgress, setHeartProgress] = useState(0); // 0 to 100
  const [ab2Revealed, setAb2Revealed] = useState(false);

  const handleSmoochClick = () => {
    SoundEngine.pop();
    setSmoochRevealed(true);
    unlockAchievement('smooch_23');
    addExplorationPoint('smooch_23');
  };

  const handleCollideHearts = () => {
    SoundEngine.heartbeat();
    setHeartProgress(100);
    setTimeout(() => {
      setKissUnlocked(true);
      unlockAchievement('kiss_unlocked');
      addExplorationPoint('kiss_22_aug');
      SoundEngine.confettiPop();
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
      });
    }, 400);
  };

  const handleAB2Click = () => {
    SoundEngine.chime();
    setAb2Revealed(true);
    unlockSecret('ab2_kiss', 'Kiss Spot Just After AB-2');
    unlockAchievement('ab2_kiss');
    addExplorationPoint('ab2_kiss');
  };

  return (
    <section id="the-kiss" className="anniversary-section relative py-12">
      <SectionHead
        eyebrow="exhibit c · the kiss timeline"
        title="When Our Hearts Collided"
        subtitle="Two sacred milestones that changed everything forever"
      />

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* MILESTONE 1: 23 — First Smooch */}
        <div className="bg-gradient-to-r from-[#1c182b] to-[#251b38] rounded-3xl border border-[var(--pink)]/30 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🫦✨</span>
              <div>
                <span className="text-xs font-mono text-[var(--pink)] uppercase font-bold">Milestone One</span>
                <h3 className="text-xl font-bold text-[var(--butter)] font-mono">23 — THE FIRST SMOOCH</h3>
              </div>
            </div>
            {!smoochRevealed && (
              <button
                onClick={handleSmoochClick}
                className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold text-[var(--pink)] border border-[var(--pink)]/40 transition-transform hover:scale-105"
              >
                Tap to Reveal 💋
              </button>
            )}
          </div>

          <AnimatePresence>
            {smoochRevealed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <p className="font-caveat text-2xl text-[var(--pink)] leading-relaxed mb-2">
                  &ldquo;The very first playful smooch... our little world started accelerating right from that moment.
                  I still remember the butterflies.&rdquo;
                </p>
                <span className="text-xs text-gray-400 font-mono">Status: Unlocked in our memory vault ❤️</span>
              </motion.div>
            ) : (
              <p className="text-xs text-gray-400 italic">This memory is locked. Tap reveal to unlock the details.</p>
            )}
          </AnimatePresence>
        </div>

        {/* MILESTONE 2: 22 August — First Actual Kiss */}
        <div className="bg-gradient-to-b from-[#251733] via-[#331c42] to-[#1a1226] rounded-3xl border-2 border-[var(--pink-deep)] p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6">
            <span className="text-xs font-mono text-[var(--butter)] uppercase font-bold tracking-widest block mb-1">
              Major Relationship Milestone
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-white font-mono flex items-center justify-center gap-2">
              <span>💋</span> 22 AUGUST — THE FIRST ACTUAL KISS
            </h3>
            <p className="text-xs text-[var(--pink)] mt-1">
              Bring our hearts together to unlock this memory
            </p>
          </div>

          {!kissUnlocked ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-full max-w-sm h-24 bg-black/40 rounded-full border border-white/20 p-2 flex items-center justify-between px-6 mb-6">
                <motion.span
                  animate={{ x: heartProgress === 100 ? 110 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl filter drop-shadow cursor-pointer"
                >
                  🐻
                </motion.span>
                <span className="text-sm font-mono text-gray-500">····· ✨ ·····</span>
                <motion.span
                  animate={{ x: heartProgress === 100 ? -110 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl filter drop-shadow cursor-pointer"
                >
                  🌸
                </motion.span>
              </div>

              <button
                onClick={handleCollideHearts}
                className="px-8 py-3 bg-gradient-to-r from-[var(--pink-deep)] via-[var(--lav)] to-[var(--butter)] text-[#1a1528] rounded-full font-bold font-mono text-sm shadow-[0_0_25px_rgba(255,92,142,0.6)] hover:scale-105 active:scale-95 transition-all"
              >
                Bring Our Hearts Together 💖
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 text-[#1a1528] p-6 rounded-2xl border-4 border-[var(--pink-deep)] shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <span className="font-mono text-xs uppercase font-bold text-[var(--pink-deep)]">
                  📅 22 August 2026 &middot; 2nd Month Anniversary Eve
                </span>
                <span className="text-lg">💋✨</span>
              </div>
              <p className="font-caveat text-2xl md:text-3xl text-[var(--plum)] leading-relaxed mb-4">
                &ldquo;That moment when everything else on this entire campus disappeared. No guards, no noise, no distance...
                just looking into your eyes, holding you tight, and kissing you for real for the very first time.
                I swear my heart forgot how to beat for three seconds. You are my forever, Nush.&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Memory Verified &middot; Stamped into Eternity</span>
                <span className="text-[var(--pink-deep)] font-bold">Yajat &amp; Nush ❤️</span>
              </div>
            </motion.div>
          )}

          {/* AB-2 Special Callback */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <span className="text-xs font-mono text-[var(--butter)] font-bold block">
                📍 Secret Callback: The Spot Just After AB-2
              </span>
              <p className="text-xs text-gray-400">
                You remember that quiet walkway we always sneak into right after AB-1 and AB-2?
              </p>
            </div>
            <button
              onClick={handleAB2Click}
              className={`px-4 py-2 rounded-full text-xs font-bold font-mono transition-transform hover:scale-105 ${
                ab2Revealed
                  ? 'bg-green-500/20 text-green-300 border border-green-400'
                  : 'bg-white/10 hover:bg-white/20 text-[var(--pink)] border border-white/20'
              }`}
            >
              {ab2Revealed ? '✓ AB-2 Kiss Unlocked 💋' : 'Trigger AB-2 Kiss Memory 🔍'}
            </button>
          </div>

          <AnimatePresence>
            {ab2Revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-300 font-nunito"
              >
                &ldquo;Getting kicked out by the guards at 8 PM, finding our way past AB-2, and stealing one more kiss
                before walking towards Dr. Morphin&apos;s... that is our pavitra tradition 😭❤️.&rdquo;
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

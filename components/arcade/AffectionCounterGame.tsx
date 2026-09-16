'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const SECRET_SEQUENCE = ['hug', 'hug', 'kiss', 'hug', 'kiss'];

export default function AffectionCounterGame() {
  const {
    virtualHugs,
    virtualKisses,
    secretAffectionMode,
    addHug,
    addKiss,
    setSecretAffectionMode,
  } = useUniverseStore();

  const [sequenceBuffer, setSequenceBuffer] = useState<string[]>([]);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!milestoneMsg) return;
    const t = setTimeout(() => setMilestoneMsg(null), 4000);
    return () => clearTimeout(t);
  }, [milestoneMsg]);

  const checkMilestones = (type: 'hug' | 'kiss', count: number) => {
    if (count === 22 && type === 'kiss') {
      setMilestoneMsg('✨ 22 Kisses: Referencing 22 August — our first actual kiss! 💋');
    } else if (count === 23 && type === 'hug') {
      setMilestoneMsg('✨ 23 Hugs: Referencing 23 — our first smooch! 🫦');
    } else if (count === 100) {
      setMilestoneMsg(`🏆 100 ${type === 'hug' ? 'Hugs' : 'Kisses'}! That is a serious dose of affection.`);
    } else if (count === 500) {
      setMilestoneMsg('🔥 500! YOU REALLY LOVE AFFECTION.');
    }
  };

  const handleInteract = (type: 'hug' | 'kiss', e: React.MouseEvent) => {
    SoundEngine.pop();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newId = Date.now() + Math.random();
    setFloatingParticles((prev) => [
      ...prev.slice(-12),
      { id: newId, text: type === 'hug' ? '🤗 Hug Delivered!' : '💋 Kiss Sent!', x, y },
    ]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 800);

    if (type === 'hug') {
      addHug();
      checkMilestones('hug', virtualHugs + 1);
    } else {
      addKiss();
      checkMilestones('kiss', virtualKisses + 1);
    }

    // Check Secret Sequence
    const nextSeq = [...sequenceBuffer.slice(-4), type];
    setSequenceBuffer(nextSeq);

    if (nextSeq.join(',') === SECRET_SEQUENCE.join(',')) {
      setSecretAffectionMode(true);
      SoundEngine.confettiPop();
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
      });
      setMilestoneMsg('🌊 SECRET AFFECTION FLOOD MODE UNLOCKED! 💖');
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl border p-5 shadow-2xl text-white font-nunito select-none transition-all duration-700 ${
      secretAffectionMode
        ? 'bg-gradient-to-b from-[#381a42] via-[#592652] to-[#24102b] border-[var(--butter)] shadow-[0_0_40px_rgba(255,92,142,0.4)]'
        : 'bg-gradient-to-b from-[#1c182b] to-[#120f18] border-[var(--pink)]/30'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>🤗💋</span> VIRTUAL HUG &amp; KISS COUNTER
          </h3>
          <p className="text-xs text-[var(--pink)]">Send unlimited hugs and kisses across space &amp; time</p>
        </div>
        <div className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          Total: <span className="text-[var(--butter)] font-bold">{virtualHugs + virtualKisses}</span>
        </div>
      </div>

      {/* Interactive Big Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Hug Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => handleInteract('hug', e)}
          className="relative h-44 rounded-3xl bg-gradient-to-tr from-[var(--pink-deep)] to-[var(--lav)] p-4 flex flex-col items-center justify-center border-2 border-white/30 shadow-xl overflow-hidden group cursor-pointer"
        >
          <span className="text-5xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">🤗</span>
          <span className="font-bold text-base text-white tracking-wide">GIVE A HUG</span>
          <span className="text-xs font-mono text-white/80 mt-1">{virtualHugs} Delivered</span>
        </motion.button>

        {/* Kiss Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => handleInteract('kiss', e)}
          className="relative h-44 rounded-3xl bg-gradient-to-tr from-[var(--butter)] to-[var(--pink)] p-4 flex flex-col items-center justify-center border-2 border-white/30 shadow-xl overflow-hidden group cursor-pointer text-[#1a1528]"
        >
          <span className="text-5xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">💋</span>
          <span className="font-bold text-base tracking-wide">SEND A KISS</span>
          <span className="text-xs font-mono text-[#1a1528]/80 mt-1">{virtualKisses} Sent</span>
        </motion.button>
      </div>

      {/* Milestone Toast */}
      <AnimatePresence>
        {milestoneMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-[var(--butter)] text-[#1a1528] rounded-2xl text-xs font-bold text-center border-2 border-yellow-300 shadow-xl mb-3"
          >
            {milestoneMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Particle Text */}
      {floatingParticles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -50, scale: 1.2 }}
          transition={{ duration: 0.8 }}
          className="fixed pointer-events-none text-sm font-bold font-mono text-[var(--butter)] z-[99999] drop-shadow-lg"
          style={{ left: p.x, top: p.y }}
        >
          {p.text}
        </motion.div>
      ))}
    </div>
  );
}

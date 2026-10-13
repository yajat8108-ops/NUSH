'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SectionHead from '@/components/SectionHead';
import { SORRY } from '@/lib/sorryContent';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'nush_sorry_state';

interface StoredSorryState {
  acceptedPromises: string[];
  redeemedTokens: string[];
  reply: 'needTime' | 'talk' | null;
}

const DEFAULT_STATE: StoredSorryState = {
  acceptedPromises: [],
  redeemedTokens: [],
  reply: null,
};

function safeReadStorage(): StoredSorryState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      acceptedPromises: Array.isArray(parsed?.acceptedPromises) ? parsed.acceptedPromises : [],
      redeemedTokens: Array.isArray(parsed?.redeemedTokens) ? parsed.redeemedTokens : [],
      reply: parsed?.reply === 'needTime' || parsed?.reply === 'talk' ? parsed.reply : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function safeWriteStorage(state: StoredSorryState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Gracefully handle storage quota or blocked access
  }
}

// Background Floating Particle
function FloatingParticle({ delay, x, size, emoji }: { delay: number; x: string; size: number; emoji: string }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <motion.div
      initial={{ y: '110%', opacity: 0, x }}
      animate={{
        y: '-20%',
        opacity: [0, 0.45, 0.6, 0],
        rotate: [0, 15, -15, 0],
      }}
      transition={{
        duration: 14 + delay * 2,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
      style={{ left: x, fontSize: `${size}px` }}
      className="absolute pointer-events-none select-none z-0 opacity-40 filter blur-[0.3px]"
      aria-hidden="true"
    >
      {emoji}
    </motion.div>
  );
}

export default function SorrySection() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<StoredSorryState>(DEFAULT_STATE);

  // Virtual Hug modal & animation state
  const [hugActive, setHugActive] = useState(false);

  // Calculator State
  const [calcExpression, setCalcExpression] = useState<string>('Ready');
  const [calcResult, setCalcResult] = useState<string>('Select an equation below');

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const initial = safeReadStorage();
    setState(initial);
  }, []);

  // Sync updates to localStorage
  const updateState = useCallback((updater: (prev: StoredSorryState) => StoredSorryState) => {
    setState((prev) => {
      const next = updater(prev);
      safeWriteStorage(next);
      return next;
    });
  }, []);

  // Promise toggle handler with micro-confetti
  const handleTogglePromise = (id: string, e?: React.MouseEvent) => {
    try {
      SoundEngine.click();
    } catch {}

    const isCurrentlyAccepted = state.acceptedPromises.includes(id);

    if (!isCurrentlyAccepted) {
      // Trigger subtle celebratory confetti from click position or center
      try {
        const x = e ? e.clientX / window.innerWidth : 0.5;
        const y = e ? e.clientY / window.innerHeight : 0.5;
        confetti({
          particleCount: 22,
          spread: 45,
          origin: { x, y },
          colors: ['#FF9EC9', '#FF5C8E', '#B9AEF5', '#FFDD8C'],
          disableForReducedMotion: true,
        });
      } catch {}
    }

    updateState((prev) => {
      const exists = prev.acceptedPromises.includes(id);
      const nextAccepted = exists
        ? prev.acceptedPromises.filter((p) => p !== id)
        : [...prev.acceptedPromises, id];

      // If all promises accepted, trigger special celebration
      if (!exists && nextAccepted.length === SORRY.promises.length) {
        setTimeout(() => {
          try {
            SoundEngine.chime();
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FF9EC9', '#FF5C8E', '#B9AEF5'],
              disableForReducedMotion: true,
            });
          } catch {}
        }, 200);
      }

      return {
        ...prev,
        acceptedPromises: nextAccepted,
      };
    });
  };

  // Token toggle handler (redeem with confetti or undo)
  const handleToggleToken = (id: string, e?: React.MouseEvent) => {
    const isCurrentlyRedeemed = state.redeemedTokens.includes(id);

    if (!isCurrentlyRedeemed) {
      try {
        SoundEngine.pop();
        setTimeout(() => {
          try {
            SoundEngine.chime();
          } catch {}
        }, 120);

        // Confetti explosion on redeem
        const x = e ? e.clientX / window.innerWidth : 0.5;
        const y = e ? e.clientY / window.innerHeight : 0.5;
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { x, y },
          colors: ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C'],
          disableForReducedMotion: true,
        });
      } catch {}
    } else {
      try {
        SoundEngine.click();
      } catch {}
    }

    updateState((prev) => {
      const exists = prev.redeemedTokens.includes(id);
      return {
        ...prev,
        redeemedTokens: exists
          ? prev.redeemedTokens.filter((t) => t !== id)
          : [...prev.redeemedTokens, id],
      };
    });
  };

  // Reply selection
  const handleSelectReply = (choice: 'needTime' | 'talk') => {
    try {
      SoundEngine.chime();
    } catch {}

    updateState((prev) => ({
      ...prev,
      reply: choice,
    }));
  };

  const handleResetReply = () => {
    try {
      SoundEngine.click();
    } catch {}

    updateState((prev) => ({
      ...prev,
      reply: null,
    }));
  };

  // Virtual Hug trigger
  const handleTriggerHug = () => {
    try {
      SoundEngine.heartbeat();
    } catch {}
    setHugActive(true);
    setTimeout(() => {
      try {
        SoundEngine.heartbeat();
      } catch {}
    }, 400);
  };

  // Calculator actions
  const handleCalcButton = (type: string) => {
    try {
      SoundEngine.click();
    } catch {}

    switch (type) {
      case 'ego':
        setCalcExpression('Ego ÷ 0');
        setCalcResult('Error: Ego undefined. Cleared to make room for us.');
        break;
      case 'sorry':
        setCalcExpression('Sorry × ∞');
        setCalcResult('∞ sincere apologies, without end.');
        break;
      case 'pride':
        setCalcExpression('Pride − 1');
        setCalcResult('0 (None left when it comes to you.)');
        break;
      case 'us':
        setCalcExpression('You + Me');
        setCalcResult('Everything. 🤍');
        break;
      case 'ujjain':
        setCalcExpression('Ujjain − Nush');
        setCalcResult('Math Error: Trips without Nush are illegal 🚫');
        break;
      case 'love':
        setCalcExpression('Love ^ 100');
        setCalcResult('Exponentially infinite & growing every day ❤️');
        break;
      case 'clear':
        setCalcExpression('0');
        setCalcResult('Matrix Reset. Ready for love.');
        break;
    }
  };

  const acceptedCount = state.acceptedPromises.length;
  const totalPromises = SORRY.promises.length;
  const progressRatio = totalPromises > 0 ? (acceptedCount / totalPromises) * 100 : 0;

  return (
    <section
      id="im-sorry"
      aria-label="I'm Sorry section"
      className="py-16 md:py-24 px-4 max-w-3xl mx-auto relative overflow-hidden"
    >
      {/* Background Floating Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <FloatingParticle delay={0} x="8%" size={18} emoji="🌸" />
        <FloatingParticle delay={4} x="24%" size={16} emoji="🤍" />
        <FloatingParticle delay={8} x="68%" size={18} emoji="✨" />
        <FloatingParticle delay={3} x="85%" size={16} emoji="🌸" />
        <FloatingParticle delay={6} x="48%" size={14} emoji="🕊️" />
      </div>

      {/* 1. Header with SectionHead */}
      <div className="relative z-10">
        <SectionHead
          eyebrow={SORRY.eyebrow}
          title={SORRY.title}
          subtitle={SORRY.subtitle}
        />
      </div>

      <div className="mt-10 flex flex-col gap-10 relative z-10">
        {/* 2. Letter Card with animated paragraphs & wax seal motif */}
        <motion.article
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-6 sm:p-9 md:p-12 shadow-xl border relative overflow-hidden"
          style={{
            backgroundColor: 'var(--white)',
            boxShadow: 'var(--card-shadow)',
            borderColor: 'color-mix(in srgb, var(--pink) 45%, transparent)',
          }}
        >
          {/* Decorative Corner Ribbon / Stamp */}
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none opacity-20 filter blur-xl"
            style={{ backgroundColor: 'var(--pink-deep)' }}
          />

          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <motion.span
                animate={shouldReduceMotion ? {} : { rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-3xl"
                aria-hidden="true"
              >
                💌
              </motion.span>
              <div>
                <h3
                  className="text-xs sm:text-sm font-quicksand font-bold uppercase tracking-wider"
                  style={{ color: 'var(--pink-deep)' }}
                >
                  From Yajat To Nush
                </h3>
                <p className="text-[11px] font-mono" style={{ color: 'var(--plum-soft)' }}>
                  A sincere, unedited letter
                </p>
              </div>
            </div>

            {/* Little Wax Seal Badge */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md border text-sm font-caveat font-bold select-none"
              style={{
                backgroundColor: 'var(--pink-deep)',
                color: 'white',
                borderColor: 'color-mix(in srgb, white 40%, transparent)',
              }}
              title="Sealed with love & regret"
            >
              Y♡N
            </div>
          </div>

          <div className="space-y-5 text-base sm:text-lg font-nunito leading-relaxed" style={{ color: 'var(--plum)' }}>
            {SORRY.letter.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : idx * 0.14 }}
                className="relative pl-3 border-l-2"
                style={{ borderColor: 'color-mix(in srgb, var(--pink) 35%, transparent)' }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.45 }}
            className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-right"
            style={{
              borderColor: 'color-mix(in srgb, var(--pink) 25%, transparent)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-nunito" style={{ color: 'var(--plum-soft)' }}>
              <span>🕊️ Written with zero defense</span>
            </div>
            <div
              className="font-caveat text-3xl sm:text-4xl font-semibold tracking-wide"
              style={{ color: 'var(--pink-deep)' }}
            >
              {SORRY.signoff}
            </div>
          </motion.div>
        </motion.article>

        {/* 3. Optional "What I Did" Card */}
        {SORRY.whatIDid && SORRY.whatIDid.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--pink) 10%, var(--white))',
              borderColor: 'color-mix(in srgb, var(--pink-deep) 45%, transparent)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" aria-hidden="true">🕊️</span>
                <h3
                  className="font-quicksand font-bold text-lg sm:text-xl"
                  style={{ color: 'var(--pink-deep)' }}
                >
                  What I Did (Taking Full Accountability)
                </h3>
              </div>
              <span
                className="text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-full border font-semibold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--pink-deep) 15%, transparent)',
                  borderColor: 'var(--pink-deep)',
                  color: 'var(--pink-deep)',
                }}
              >
                Zero Excuses
              </span>
            </div>

            <p
              className="font-nunito text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--plum)' }}
            >
              {SORRY.whatIDid}
            </p>
          </motion.div>
        )}

        {/* 4. "What I Understand Now" list with interactive card hover */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl p-6 sm:p-8 border shadow-lg"
          style={{
            backgroundColor: 'var(--white)',
            boxShadow: 'var(--card-shadow)',
            borderColor: 'color-mix(in srgb, var(--lav) 45%, transparent)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-2xl" aria-hidden="true">💡</span>
            <div>
              <h3
                className="font-quicksand font-bold text-xl sm:text-2xl"
                style={{ color: 'var(--plum)' }}
              >
                What I Understand Now
              </h3>
              <p className="text-xs font-nunito" style={{ color: 'var(--plum-soft)' }}>
                Realizations from looking honestly at how my actions affected you
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {SORRY.understand.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={shouldReduceMotion ? {} : { x: 4, scale: 1.01 }}
                className="flex items-start gap-3.5 p-4 rounded-2xl border text-sm sm:text-base font-nunito leading-relaxed transition-all"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--lav) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--lav) 30%, transparent)',
                  color: 'var(--plum)',
                }}
              >
                <span
                  className="font-quicksand font-bold text-xs mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'var(--lav)',
                    color: 'var(--white)',
                  }}
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
                <span className="flex-grow">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 5. "What I Promise" Checklist with live counter & animated progress bar */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl p-6 sm:p-8 border shadow-lg"
          style={{
            backgroundColor: 'var(--white)',
            boxShadow: 'var(--card-shadow)',
            borderColor: 'color-mix(in srgb, var(--pink) 45%, transparent)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" aria-hidden="true">🤞</span>
                <h3
                  className="font-quicksand font-bold text-xl sm:text-2xl"
                  style={{ color: 'var(--plum)' }}
                >
                  What I Promise
                </h3>
              </div>
              <p
                className="text-xs sm:text-sm font-nunito mt-1"
                style={{ color: 'var(--plum-soft)' }}
              >
                Hold me to every single commitment. Tap each one to accept.
              </p>
            </div>

            {/* Live counter */}
            <div
              aria-live="polite"
              className="self-start sm:self-auto font-quicksand font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full border shadow-sm transition-all"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--pink) 18%, transparent)',
                borderColor: 'var(--pink-deep)',
                color: 'var(--pink-deep)',
              }}
            >
              <span>{acceptedCount} of {totalPromises} accepted</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="mb-6">
            <div
              className="w-full h-2.5 rounded-full overflow-hidden border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--pink) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--pink) 30%, transparent)',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressRatio}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--pink) 0%, var(--pink-deep) 100%)',
                }}
              />
            </div>
            {acceptedCount === totalPromises && totalPromises > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-caveat text-center mt-2 text-base font-semibold"
                style={{ color: 'var(--pink-deep)' }}
              >
                Every promise is sealed in my heart forever 🤍
              </motion.p>
            )}
          </div>

          <div className="space-y-3">
            {SORRY.promises.map((promise) => {
              const isAccepted = mounted && state.acceptedPromises.includes(promise.id);
              return (
                <motion.div
                  key={promise.id}
                  role="checkbox"
                  aria-checked={isAccepted}
                  tabIndex={0}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                  onClick={(e) => handleTogglePromise(promise.id, e)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleTogglePromise(promise.id);
                    }
                  }}
                  className="group flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm"
                  style={{
                    backgroundColor: isAccepted
                      ? 'color-mix(in srgb, var(--pink) 14%, transparent)'
                      : 'color-mix(in srgb, var(--white) 90%, transparent)',
                    borderColor: isAccepted
                      ? 'var(--pink-deep)'
                      : 'color-mix(in srgb, var(--pink) 30%, transparent)',
                  }}
                >
                  <motion.div
                    animate={isAccepted ? { scale: [0.8, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0"
                    style={{
                      backgroundColor: isAccepted ? 'var(--pink-deep)' : 'transparent',
                      borderColor: isAccepted ? 'var(--pink-deep)' : 'var(--plum-soft)',
                    }}
                    aria-hidden="true"
                  >
                    {isAccepted && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.div>
                  <span
                    className={`font-nunito text-sm sm:text-base leading-snug transition-colors ${
                      isAccepted ? 'font-semibold' : ''
                    }`}
                    style={{ color: 'var(--plum)' }}
                  >
                    {promise.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 6. SciCalc-Style "Apology Calculator" with interactive buttons */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl p-5 sm:p-7 shadow-2xl border relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-sci)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">🧮</span>
              <h3 className="font-quicksand font-bold text-base sm:text-lg text-white">
                Apology Equation Matrix
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--mid)',
                }}
              >
                SciCalc Core
              </span>
              <button
                type="button"
                onClick={() => handleCalcButton('clear')}
                className="text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
              >
                AC
              </button>
            </div>
          </div>

          {/* Calculator Screen */}
          <div
            className="rounded-2xl p-4 sm:p-5 mb-5 border transition-all shadow-inner"
            style={{
              backgroundColor: '#0d0d10',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              className="text-right font-mono text-xs sm:text-sm tracking-wider mb-1"
              style={{ color: 'var(--mid)' }}
            >
              {calcExpression}
            </div>
            <motion.div
              key={calcResult}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-right font-quicksand font-bold text-base sm:text-xl md:text-2xl min-h-[1.75rem] transition-all"
              style={{ color: 'var(--op)' }}
              aria-live="polite"
            >
              {calcResult}
            </motion.div>
          </div>

          {/* 6 Tactile Operation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              onClick={() => handleCalcButton('ego')}
              className="py-3 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--bg-op)',
                color: 'var(--op)',
                borderColor: 'color-mix(in srgb, var(--op) 30%, transparent)',
              }}
            >
              Ego ÷ 0
            </motion.button>
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              onClick={() => handleCalcButton('sorry')}
              className="py-3 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--bg-op)',
                color: 'var(--op)',
                borderColor: 'color-mix(in srgb, var(--op) 30%, transparent)',
              }}
            >
              Sorry × ∞
            </motion.button>
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              onClick={() => handleCalcButton('pride')}
              className="py-3 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--bg-op)',
                color: 'var(--op)',
                borderColor: 'color-mix(in srgb, var(--op) 30%, transparent)',
              }}
            >
              Pride − 1
            </motion.button>
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              onClick={() => handleCalcButton('us')}
              className="py-3 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all shadow-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--pink-deep) 35%, var(--bg-op))',
                color: '#fff',
                borderColor: 'var(--pink)',
              }}
            >
              You + Me
            </motion.button>
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              onClick={() => handleCalcButton('ujjain')}
              className="py-3 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--bg-op)',
                color: 'var(--op)',
                borderColor: 'color-mix(in srgb, var(--op) 30%, transparent)',
              }}
            >
              Ujjain − Nush
            </motion.button>
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              onClick={() => handleCalcButton('love')}
              className="py-3 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all shadow-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--pink-deep) 25%, var(--bg-sci))',
                color: '#ff7aa5',
                borderColor: 'color-mix(in srgb, #ff7aa5 40%, transparent)',
              }}
            >
              Love ^ 100
            </motion.button>
          </div>
        </motion.div>

        {/* 7. Redeemable Make-Up Tokens (Enhanced Coupon Style) */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="w-full"
        >
          <div className="text-center mb-6">
            <h3
              className="font-quicksand font-bold text-2xl sm:text-3xl mb-1"
              style={{ color: 'var(--plum)' }}
            >
              Redeemable Make-Up Tokens
            </h3>
            <p
              className="font-caveat text-xl sm:text-2xl"
              style={{ color: 'var(--pink-deep)' }}
            >
              Tear one off whenever you need it — valid indefinitely ✨
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {SORRY.tokens.map((token, idx) => {
              const isRedeemed = mounted && state.redeemedTokens.includes(token.id);
              const rotation = idx % 2 === 0 ? 0.7 : -0.7;

              return (
                <motion.div
                  key={token.id}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.015, rotate: 0 }}
                  style={{ rotate: rotation }}
                  className="relative w-full flex flex-col transition-all"
                >
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-lg border-2 transition-all"
                    style={{
                      backgroundColor: 'var(--white)',
                      borderColor: isRedeemed ? 'var(--pink-deep)' : 'var(--pink)',
                      boxShadow: 'var(--card-shadow)',
                    }}
                  >
                    {/* Perforation line with cutouts */}
                    <div
                      className="h-4 border-b-2 border-dashed relative flex items-center justify-evenly"
                      style={{
                        borderColor: 'var(--pink-deep)',
                        backgroundColor: 'color-mix(in srgb, var(--pink) 20%, transparent)',
                      }}
                      aria-hidden="true"
                    >
                      {[...Array(14)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full -mt-4 shadow-inner"
                          style={{ backgroundColor: 'var(--white)' }}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row p-4 sm:p-6 items-start sm:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4 flex-grow">
                        <div className="text-4xl sm:text-5xl flex-shrink-0 drop-shadow-md select-none" aria-hidden="true">
                          {token.icon}
                        </div>
                        <div>
                          <h4
                            className="font-quicksand font-bold text-base sm:text-lg tracking-wide uppercase mb-1"
                            style={{ color: 'var(--plum)' }}
                          >
                            {token.title}
                          </h4>
                          <p
                            className="font-nunito text-xs sm:text-sm leading-relaxed"
                            style={{ color: 'var(--plum-soft)' }}
                          >
                            {token.desc}
                          </p>
                        </div>
                      </div>

                      <div
                        className="self-end sm:self-center flex-shrink-0 sm:border-l-2 sm:border-dashed sm:pl-5"
                        style={{ borderColor: 'var(--pink)' }}
                      >
                        <motion.button
                          type="button"
                          aria-pressed={isRedeemed}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.93 }}
                          onClick={(e) => handleToggleToken(token.id, e)}
                          className="font-quicksand font-bold text-xs sm:text-sm py-2 px-4 rounded-full transition-all border shadow-md"
                          style={{
                            backgroundColor: isRedeemed
                              ? 'color-mix(in srgb, var(--plum) 15%, transparent)'
                              : 'var(--pink)',
                            color: isRedeemed ? 'var(--plum)' : 'var(--white)',
                            borderColor: isRedeemed
                              ? 'color-mix(in srgb, var(--plum) 30%, transparent)'
                              : 'var(--pink-deep)',
                          }}
                        >
                          {isRedeemed ? 'Claimed (Undo)' : 'Redeem Token'}
                        </motion.button>
                      </div>
                    </div>

                    {/* Slam Stamp overlay on redemption */}
                    <AnimatePresence>
                      {isRedeemed && (
                        <motion.div
                          initial={{ scale: 2.8, opacity: 0, rotate: -25 }}
                          animate={{ scale: 1, opacity: 1, rotate: -12 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ type: 'spring', bounce: 0.6, duration: 0.6 }}
                          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <div
                            className="border-4 font-black font-quicksand text-xl sm:text-3xl px-5 py-2 rounded-xl shadow-2xl uppercase tracking-widest backdrop-blur-sm"
                            style={{
                              borderColor: 'var(--pink-deep)',
                              color: 'var(--pink-deep)',
                              backgroundColor: 'color-mix(in srgb, var(--white) 88%, transparent)',
                              boxShadow: '0 10px 30px rgba(255, 92, 142, 0.4)',
                            }}
                          >
                            REDEEMED ❤️
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 8. Optional Voice Note */}
        {SORRY.voiceNoteSrc && SORRY.voiceNoteSrc.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl p-6 sm:p-8 border shadow-lg"
            style={{
              backgroundColor: 'var(--white)',
              boxShadow: 'var(--card-shadow)',
              borderColor: 'color-mix(in srgb, var(--pink) 40%, transparent)',
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-2xl" aria-hidden="true">🎙️</span>
              <h3
                className="font-quicksand font-bold text-lg sm:text-xl"
                style={{ color: 'var(--plum)' }}
              >
                A Spoken Voice Note
              </h3>
            </div>
            <p
              className="font-nunito text-sm sm:text-base mb-4"
              style={{ color: 'var(--plum-soft)' }}
            >
              If reading feels heavy right now, you can listen to my voice instead.
            </p>
            <audio
              controls
              className="w-full rounded-xl"
              src={SORRY.voiceNoteSrc}
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
          </motion.div>
        )}

        {/* 9. Extra Comfort Touch: Virtual Hug Button */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl p-6 border shadow-md text-center"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--pink) 10%, var(--white))',
            borderColor: 'color-mix(in srgb, var(--pink) 35%, transparent)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="font-quicksand font-bold text-base sm:text-lg" style={{ color: 'var(--plum)' }}>
                Need a gentle, silent hug right now? 🫂
              </h4>
              <p className="font-nunito text-xs sm:text-sm" style={{ color: 'var(--plum-soft)' }}>
                No talking, no explanations — just quiet warmth sent straight to your heart.
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              onClick={handleTriggerHug}
              className="px-5 py-2.5 rounded-full font-quicksand font-bold text-xs sm:text-sm border shadow-md flex-shrink-0 transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--pink-deep)',
                borderColor: 'var(--pink)',
                color: 'var(--white)',
              }}
            >
              Send Virtual Hug 🤍
            </motion.button>
          </div>
        </motion.div>

        {/* 10. Two No-Pressure Reply Buttons */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl p-6 sm:p-9 border shadow-xl text-center relative overflow-hidden"
          style={{
            backgroundColor: 'var(--white)',
            boxShadow: 'var(--card-shadow)',
            borderColor: 'color-mix(in srgb, var(--lav) 45%, transparent)',
          }}
        >
          <h3
            className="font-quicksand font-bold text-xl sm:text-2xl mb-2"
            style={{ color: 'var(--plum)' }}
          >
            How are you feeling right now?
          </h3>
          <p
            className="font-nunito text-xs sm:text-sm max-w-md mx-auto mb-7"
            style={{ color: 'var(--plum-soft)' }}
          >
            Both choices are 100% okay. There is no right or wrong answer, and no rush on your healing.
          </p>

          <AnimatePresence mode="wait">
            {!mounted || state.reply === null ? (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.button
                  type="button"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={() => handleSelectReply('needTime')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-quicksand font-bold text-sm sm:text-base border-2 transition-all shadow-sm"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--lav) 18%, transparent)',
                    borderColor: 'var(--lav)',
                    color: 'var(--plum)',
                  }}
                >
                  ⏳ {SORRY.replies.needTime.label}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={() => handleSelectReply('talk')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-quicksand font-bold text-sm sm:text-base border-2 transition-all shadow-md"
                  style={{
                    backgroundColor: 'var(--pink)',
                    borderColor: 'var(--pink-deep)',
                    color: 'var(--white)',
                  }}
                >
                  💬 {SORRY.replies.talk.label}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center gap-5 max-w-lg mx-auto"
              >
                <div
                  className="p-6 rounded-2xl border text-sm sm:text-base font-nunito leading-relaxed shadow-sm w-full text-left"
                  style={{
                    backgroundColor:
                      state.reply === 'needTime'
                        ? 'color-mix(in srgb, var(--lav) 12%, transparent)'
                        : 'color-mix(in srgb, var(--pink) 12%, transparent)',
                    borderColor:
                      state.reply === 'needTime' ? 'var(--lav)' : 'var(--pink-deep)',
                    color: 'var(--plum)',
                  }}
                >
                  <p className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--pink-deep)' }}>
                    <span>{state.reply === 'needTime' ? '⏳' : '💬'}</span>
                    <span>You selected: &ldquo;{state.reply === 'needTime' ? SORRY.replies.needTime.label : SORRY.replies.talk.label}&rdquo;</span>
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed">
                    {state.reply === 'needTime'
                      ? SORRY.replies.needTime.response
                      : SORRY.replies.talk.response}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {state.reply === 'talk' && (
                    <a
                      href="https://wa.me/?text=Hey%20Yajat,%20I%20read%20your%20letter%20and%20I'm%20ready%20to%20talk%20%F0%9F%A4%8D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full font-quicksand font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <span>💬 Message on WhatsApp</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleResetReply}
                    className="text-xs sm:text-sm font-quicksand font-semibold underline underline-offset-4 transition-colors"
                    style={{ color: 'var(--plum-soft)' }}
                  >
                    Change my answer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Hug Heartbeat Modal */}
      <AnimatePresence>
        {hugActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setHugActive(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="rounded-3xl p-8 max-w-sm w-full text-center border shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--pink)',
                boxShadow: '0 25px 80px rgba(255, 92, 142, 0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.25, 1, 1.25, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl mb-4 select-none"
              >
                🫂🤍
              </motion.div>

              <h3 className="font-quicksand font-bold text-xl mb-2" style={{ color: 'var(--plum)' }}>
                Holding you softly right now
              </h3>
              <p className="font-nunito text-sm leading-relaxed mb-6" style={{ color: 'var(--plum-soft)' }}>
                Take a deep breath, Nush. You don&apos;t have to carry anything alone. You are safe, cherished, and deeply loved.
              </p>

              <button
                type="button"
                onClick={() => setHugActive(false)}
                className="px-6 py-2.5 rounded-full font-quicksand font-bold text-sm shadow-md transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--pink)',
                  color: 'white',
                }}
              >
                Close with love 🤍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

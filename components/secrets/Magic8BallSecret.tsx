'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface Magic8BallSecretProps {
  onClose: () => void;
}

const ROMANTIC_ANSWERS = [
  'Signs point to forever ❤️',
  "Outlook: you're stuck with Yajat forever 🥰",
  '100% chance of forehead kisses today 💋',
  'The stars confirm: he is completely obsessed with you ✨',
  'Answer: 2 AM Maggi with extra cheese 🍜',
  'Reply hazy... kiss him instead 😘',
  'Without a single doubt: you are his favorite human 👑',
  'Fate has spoken: tight cuddles tonight 🫢',
  'Signs say: you are the prettiest girl in the universe 🌸',
  'Cannot predict now, too busy smiling thinking about you 🥹',
  'My sources say: infinite forehead kiss refills unlocked 🎟️',
  'Very doubtful... that anyone could love you more than Yajat 💻❤️',
  'Yes, absolutely. You are his home 🏰',
  'It is certain: 8 PM Open Audi memories never fade 🥹❤️',
  'Outlook very good: forever to go ♾️',
];

export default function Magic8BallSecret({ onClose }: Magic8BallSecretProps) {
  const [answer, setAnswer] = useState<string>('Ask a question & tap the 8-ball ✨');
  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const { unlockAchievement } = useUniverseStore();

  const handleShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    SoundEngine.whoosh();

    setTimeout(() => {
      const nextAnswer = ROMANTIC_ANSWERS[Math.floor(Math.random() * ROMANTIC_ANSWERS.length)];
      setAnswer(nextAnswer);
      setIsShaking(false);
      SoundEngine.chime();

      setShakeCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          unlockAchievement('fortune_seeker');
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#B9AEF5', '#FF5C8E', '#FFDD8C'],
          });
        }
        return next;
      });
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center text-center max-w-md w-full"
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm text-white cursor-pointer font-mono"
        >
          ✕
        </button>

        <div className="mb-6">
          <span className="text-3xl block mb-1">🔮</span>
          <h2 className="font-serif text-3xl text-[var(--butter)] font-bold">
            Oracle 8-Ball of Love
          </h2>
          <p className="font-mono text-xs text-purple-200 mt-1">
            Think of a romantic question and tap the sphere
          </p>
        </div>

        {/* 3D 8-BALL SPHERE */}
        <motion.div
          animate={
            isShaking
              ? {
                  x: [-12, 12, -10, 10, -6, 6, 0],
                  y: [-8, 8, -6, 6, -4, 4, 0],
                  rotate: [-5, 5, -4, 4, -2, 2, 0],
                }
              : { y: [0, -8, 0] }
          }
          transition={
            isShaking
              ? { duration: 0.8, ease: 'easeInOut' }
              : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
          }
          onClick={handleShake}
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-full cursor-pointer flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_80px_rgba(185,174,245,0.25)] border-4 border-purple-950/40"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #3b3552 0%, #151221 50%, #08060f 100%)',
          }}
        >
          {/* Inner Liquid Window */}
          <div
            className="w-36 h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center p-4 border-2 border-indigo-500/30 shadow-inner"
            style={{
              background: 'radial-gradient(circle, #100b29 0%, #05030d 100%)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), 0 0 15px rgba(185,174,245,0.3)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={answer}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.5 }}
                className="text-center font-caveat text-xl md:text-2xl text-[var(--butter)] font-bold leading-tight"
                style={{
                  textShadow: '0 0 15px rgba(255,221,140,0.8)',
                }}
              >
                {answer}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Shake Button CTA */}
        <button
          onClick={handleShake}
          disabled={isShaking}
          className="mt-8 px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-mono font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {isShaking ? 'Gazing into our destiny... ✨' : '🔮 TAP TO SHAKE THE ORACLE'}
        </button>

        {shakeCount >= 3 && (
          <p className="font-mono text-[10px] text-emerald-400 mt-2">
            🏆 Achievement Unlocked: Fortune Seeker
          </p>
        )}
      </div>
    </motion.div>
  );
}

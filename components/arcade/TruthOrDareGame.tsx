'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

const TRUTHS = [
  'What was your exact first thought when Yajat kissed you hello on the forehead?',
  'What is one tiny habit of Yajat that secretly makes you smile when nobody is looking?',
  'What is your favorite memory from our all-night video call on the 2nd month anniversary?',
  'If you could replay one single minute from Open Audi, which minute would it be?',
  'Which song instantly makes you think of Yajat without fail?',
  'What is the funniest face Yajat has made while trying to be romantic?',
];

const SOFT_DARES = [
  'Send Yajat a 5-second voice note saying something sweet in your radio voice 🎙️',
  'Send your current reaction photo / selfie right now without retaking it 📸',
  'Pick the location and meal for our next 2 AM Maggi study session 🍜',
  'Record a 3-second audio saying "I love you Yajat Kataria" and send it ❤️',
  'Promise Yajat 5 consecutive forehead kisses the next time you meet 😘',
  'Give your phone a hug right now pretending it is Teddy Yajat 🧸',
];

export default function TruthOrDareGame() {
  const { favoritePrompts, toggleFavoritePrompt } = useUniverseStore();
  const [tab, setTab] = useState<'truth' | 'dare'>('truth');
  const [currentPrompt, setCurrentPrompt] = useState(TRUTHS[0]);
  const [history, setHistory] = useState<string[]>([TRUTHS[0]]);

  const nextPrompt = (mode: 'truth' | 'dare') => {
    SoundEngine.whoosh();
    const pool = mode === 'truth' ? TRUTHS : SOFT_DARES;
    const filtered = pool.filter((p) => p !== currentPrompt);
    const selected = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentPrompt(selected);
    setHistory((prev) => [selected, ...prev.slice(0, 9)]);
  };

  const isFavorited = favoritePrompts.includes(currentPrompt);

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>💞✨</span> TRUTH OR SOFT-DARE
          </h3>
          <p className="text-xs text-[var(--pink)]">Light romantic truths and cute, safe dares</p>
        </div>
        <div className="flex gap-1 bg-white/10 p-1 rounded-full text-xs font-mono">
          <button
            onClick={() => { setTab('truth'); nextPrompt('truth'); }}
            className={`px-3 py-1 rounded-full transition-colors ${
              tab === 'truth' ? 'bg-[var(--pink-deep)] text-white' : 'text-gray-300'
            }`}
          >
            Truth 💡
          </button>
          <button
            onClick={() => { setTab('dare'); nextPrompt('dare'); }}
            className={`px-3 py-1 rounded-full transition-colors ${
              tab === 'dare' ? 'bg-[var(--lav)] text-white' : 'text-gray-300'
            }`}
          >
            Soft Dare 🎀
          </button>
        </div>
      </div>

      {/* Card Display */}
      <div className="min-h-[160px] bg-black/40 rounded-2xl border border-white/10 p-5 flex flex-col justify-between mb-4 relative overflow-hidden">
        <div className="flex justify-between items-center text-xs font-mono text-[var(--pink)] mb-2">
          <span>{tab === 'truth' ? '🔮 ROMANTIC TRUTH' : '💌 SWEET SOFT-DARE'}</span>
          <button
            onClick={() => {
              SoundEngine.pop();
              toggleFavoritePrompt(currentPrompt);
            }}
            className="text-base hover:scale-125 transition-transform"
            title="Favorite Prompt"
          >
            {isFavorited ? '💖' : '🤍'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentPrompt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-base md:text-lg text-gray-100 font-semibold leading-relaxed my-2"
          >
            &ldquo;{currentPrompt}&rdquo;
          </motion.p>
        </AnimatePresence>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => nextPrompt(tab)}
            className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-4 py-2 rounded-full font-bold shadow hover:scale-105 transition-transform"
          >
            Next Prompt &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

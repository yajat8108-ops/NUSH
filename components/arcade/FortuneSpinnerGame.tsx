'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore, FortuneEntry } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const FORTUNES: Omit<FortuneEntry, 'id' | 'date'>[] = [
  { type: 'prediction', text: 'A suspiciously cute date with extra tight hugs is approaching in Month 3.' },
  { type: 'date', text: 'Late-night campus walk + 2 AM Maggi with extra cheese, no questions asked.' },
  { type: 'roast', text: 'Prediction: You will lose an argument against Yajat and still somehow win completely.' },
  { type: 'moment', text: 'A sacred memory at Open Audi will be retold with happy tears tonight.' },
  { type: 'prediction', text: 'Yajat will delete another app just to listen to you sing on FaceTime.' },
  { type: 'date', text: 'Central Library study date where 0% studying and 100% staring occurs.' },
  { type: 'roast', text: 'You will take 3 business days to get ready, and he will wait with a big smile.' },
  { type: 'moment', text: 'Your forehead will receive approximately 100 kisses before the clock hits midnight.' },
  { type: 'prediction', text: 'Teddy bear Yajat will be cuddled tightly tonight while falling asleep.' },
  { type: 'date', text: 'Rooftop stargazing session with Agar Tum Saath Ho on loop.' },
];

export default function FortuneSpinnerGame() {
  const { fortuneHistory, addFortune } = useUniverseStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<FortuneEntry | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const crackCookie = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    SoundEngine.scratch();

    setTimeout(() => {
      const selected = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      const newEntry: FortuneEntry = {
        id: Date.now().toString(),
        text: selected.text,
        type: selected.type,
        date: new Date().toLocaleDateString(),
      };

      setCurrentFortune(newEntry);
      addFortune(newEntry);
      setIsSpinning(false);
      SoundEngine.confettiPop();
      confetti({ particleCount: 40, spread: 60, origin: { x: 0.5, y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>🥠✨</span> FORTUNE COOKIE SPINNER
          </h3>
          <p className="text-xs text-[var(--pink)]">Crack open a fortune or spin our relationship future</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-mono transition-colors"
        >
          {showHistory ? 'Close ✕' : `History (${fortuneHistory.length}) 📜`}
        </button>
      </div>

      {showHistory ? (
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {fortuneHistory.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">No fortunes cracked yet. Crack your first cookie below!</p>
          ) : (
            fortuneHistory.map((f) => (
              <div key={f.id} className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs">
                <span className="text-[10px] font-mono uppercase text-[var(--pink)] block mb-1">
                  {f.type} &middot; {f.date}
                </span>
                <p className="text-gray-200">{f.text}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          {/* Interactive Cookie */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isSpinning ? { rotate: [0, -15, 15, -15, 0], scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
            transition={{ duration: 1.2 }}
            onClick={crackCookie}
            disabled={isSpinning}
            className="w-36 h-36 bg-gradient-to-tr from-[var(--butter)] via-[#ffd275] to-[#f4be47] rounded-full border-4 border-yellow-300 shadow-[0_0_30px_rgba(255,221,140,0.3)] flex items-center justify-center cursor-pointer text-5xl mb-6 relative group"
          >
            <span className="filter drop-shadow-md">{isSpinning ? '💥' : '🥠'}</span>
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-500/40 animate-spin-slow pointer-events-none" />
          </motion.button>

          <p className="text-xs text-gray-300 mb-4">
            {isSpinning ? 'Cracking cookie...' : 'Tap the golden cookie to reveal today’s relationship fortune!'}
          </p>

          {/* Fortune Card */}
          <AnimatePresence>
            {currentFortune && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full bg-white/95 text-[#1a1528] p-4 rounded-2xl border-2 border-[var(--pink)] shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[var(--pink-deep)]">
                    {currentFortune.type === 'prediction' && '🔮 Love Prediction'}
                    {currentFortune.type === 'date' && '🎟️ Date Idea'}
                    {currentFortune.type === 'roast' && '😏 Playful Roast'}
                    {currentFortune.type === 'moment' && '🥹 Sacred Memory'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{currentFortune.date}</span>
                </div>
                <p className="font-caveat text-xl md:text-2xl text-[var(--plum)] leading-snug">
                  &ldquo;{currentFortune.text}&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

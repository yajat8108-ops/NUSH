'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SoundEngine } from '@/lib/audio';
import { useLiveMoment } from '@/lib/useLiveMoment';

export default function AnniversaryHero() {
  const liveMoment = useLiveMoment();
  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState<{ yajat: number; nush: number; both: number }>({ yajat: 0, nush: 0, both: 0 });

  // Click handler for Yajat
  const handleYajatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEngine.click();
    setClickCount((prev) => ({ ...prev, yajat: prev.yajat + 1 }));
    setActiveBubble('yajat');
    setTimeout(() => setActiveBubble(null), 3000);

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#ffffff'],
      shapes: ['circle'],
    });
  };

  // Click handler for Nush
  const handleNushClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEngine.chime();
    setClickCount((prev) => ({ ...prev, nush: prev.nush + 1 }));
    setActiveBubble('nush');
    setTimeout(() => setActiveBubble(null), 3000);

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C', '#ffffff'],
      shapes: ['circle'],
    });
  };

  // Click handler for & (Both)
  const handleBothClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEngine.confettiPop();
    setClickCount((prev) => ({ ...prev, both: prev.both + 1 }));
    setActiveBubble('both');
    setTimeout(() => setActiveBubble(null), 3500);

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x, y },
      colors: ['#FF5C8E', '#3B82F6', '#B9AEF5', '#FFDD8C', '#FF9EC9'],
      shapes: ['circle'],
      scalar: 1.3,
    });
  };

  useEffect(() => {
    const startDate = new Date('2026-06-22T00:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - startDate;
      if (diff > 0) {
        setTimePassed({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero select-none relative">

      
      <p className="eyebrow fade-in slide-in-from-bottom-4 zoom-in-95 animate-in" style={{ animationDuration: '1s' }}>
        a very official 3-month anniversary website &middot; a whole quarter of a year together 👑💖
      </p>

      {/* Live Midnight Countdown / Road to Sep 22nd Anniversary Status */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur border border-[var(--pink)]/30 font-mono text-[11px] text-[var(--butter)] shadow-lg">
          <span className="animate-pulse">💍</span>
          <span>
            {new Date().getTime() >= new Date('2026-09-22T00:00:00+05:30').getTime()
              ? 'HAPPY ANNIVERSARY, MERI NUSHI! 💍👑💖'
              : new Date().getTime() >= new Date('2026-09-09T00:00:00+05:30').getTime()
              ? 'Road to Sep 22nd Anniversary &middot; Daily Chapter Unlocked! 💖'
              : 'Day 1 Starts Tomorrow at Midnight &middot; Road to Sep 22nd Anniversary ⏳'}
          </span>
        </div>
      </div>

      {/* Floating Interactive Speech Bubbles */}
      <div className="relative">
        <AnimatePresence>
          {activeBubble === 'yajat' && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 left-0 md:left-10 z-50 bg-blue-500 text-white font-nunito font-bold text-xs md:text-sm px-4 py-2 rounded-2xl shadow-xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>💻</span>
              <span>Yajat: Coding websites &amp; loving Nush ({clickCount.yajat} clicks! 💙)</span>
            </motion.div>
          )}

          {activeBubble === 'nush' && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 right-0 md:right-10 z-50 bg-pink-500 text-white font-nunito font-bold text-xs md:text-sm px-4 py-2 rounded-2xl shadow-xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>🌸</span>
              <span>Nush: Prettiest girl in the universe ({clickCount.nush} clicks! 💖)</span>
            </motion.div>
          )}

          {activeBubble === 'both' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1.1, y: -25 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[var(--pink-deep)] to-blue-500 text-white font-caveat font-bold text-lg md:text-xl px-5 py-2 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 whitespace-nowrap"
            >
              <span>♾️ Yajat + Nush = Sacred &amp; Forever ❤️</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big Interactive Title */}
        <h1 className="script big flex items-center justify-center gap-3 md:gap-8 flex-wrap mt-2">
          <motion.span
            onClick={handleYajatClick}
            whileHover={{ scale: 1.08, color: '#3B82F6' }}
            whileTap={{ scale: 0.92 }}
            className="cursor-pointer transition-colors duration-200 inline-block drop-shadow-md"
            title="Click Yajat! 👦🏻"
          >
            Yajat
          </motion.span>

          <motion.span 
            onClick={handleBothClick}
            whileHover={{ scale: 1.3, rotate: 15 }}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: [1, 1.15, 1] }} 
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="text-[var(--pink-deep)] inline-block drop-shadow-xl cursor-pointer"
            title="Click & for a spark! 💖"
          >
            &amp;
          </motion.span>

          <motion.span
            onClick={handleNushClick}
            whileHover={{ scale: 1.08, color: '#FF5C8E' }}
            whileTap={{ scale: 0.92 }}
            className="cursor-pointer transition-colors duration-200 inline-block drop-shadow-md"
            title="Click Nush! 👧🏻"
          >
            Nush
          </motion.span>
        </h1>
      </div>

      <p className="hero-sub mt-3 max-w-xl mx-auto">
        three months of pure magic, our all-night calls, library study dates, your velvety voice, and a whole universe of memories 🥹❤️
      </p>

      {/* Redesigned & Beautifully Polished Day Counter Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-8 bg-[var(--white)]/90 backdrop-blur-md border-2 border-[var(--pink-deep)]/40 rounded-3xl p-6 md:p-8 shadow-[var(--card-shadow)] flex flex-col items-center max-w-sm md:max-w-md mx-auto relative overflow-hidden group"
      >
        {/* Subtle decorative glow behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pink)]/10 via-transparent to-[var(--lav)]/10 pointer-events-none" />

        {/* Days count */}
        <div className="flex items-baseline gap-2">
          <span className="font-caveat text-6xl md:text-7xl font-bold text-[var(--pink-deep)] leading-none drop-shadow-sm">
            {timePassed.days}
          </span>
          <span className="font-nunito font-extrabold text-sm md:text-base text-[var(--plum-soft)] tracking-wider uppercase">
            Days
          </span>
        </div>

        {/* Subtitle */}
        <span className="font-nunito font-extrabold text-xs md:text-sm tracking-widest uppercase text-[var(--plum)] mt-1 mb-4 text-center">
          of us &amp; our little world ❤️🎶
        </span>

        {/* Time Pills Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full font-mono text-[var(--plum)]">
          <div className="bg-[var(--cream)]/80 border border-[var(--pink)]/30 rounded-2xl py-2 px-3 flex flex-col items-center shadow-inner">
            <span className="text-xl md:text-2xl font-bold text-[var(--pink-deep)]">
              {String(timePassed.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-nunito font-bold text-[var(--plum-soft)] uppercase tracking-wider">
              Hours
            </span>
          </div>

          <div className="bg-[var(--cream)]/80 border border-[var(--pink)]/30 rounded-2xl py-2 px-3 flex flex-col items-center shadow-inner">
            <span className="text-xl md:text-2xl font-bold text-[var(--pink-deep)]">
              {String(timePassed.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-nunito font-bold text-[var(--plum-soft)] uppercase tracking-wider">
              Mins
            </span>
          </div>

          <div className="bg-[var(--cream)]/80 border border-[var(--pink)]/30 rounded-2xl py-2 px-3 flex flex-col items-center shadow-inner">
            <span className="text-xl md:text-2xl font-bold text-[var(--pink-deep)] animate-pulse">
              {String(timePassed.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-nunito font-bold text-[var(--plum-soft)] uppercase tracking-wider">
              Secs
            </span>
          </div>
        </div>

        {/* Living Hero Real-Time Context Flourish */}
        <div className="mt-4 pt-3.5 border-t border-[var(--pink)]/30 text-center w-full">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--pink-deep)] bg-[var(--cream)]/90 px-3 py-1 rounded-full border border-[var(--pink)]/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            LIVE MOMENT
          </span>
          <p className="font-caveat text-xl md:text-2xl text-[var(--plum)] font-bold mt-2 leading-snug">
            &ldquo;{liveMoment.combinedFlourish}&rdquo;
          </p>
        </div>
      </motion.div>

      <div className="scroll-cue mt-10 text-xs font-bold uppercase tracking-widest text-[var(--plum-soft)] opacity-80">
        keep scrolling, nushi &darr;
      </div>
    </section>
  );
}

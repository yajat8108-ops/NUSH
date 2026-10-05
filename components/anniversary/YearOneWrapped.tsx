'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { YEAR_STATS } from '@/lib/anniversaryYearStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface WrappedSlide {
  badge: string;
  headline: string;
  bigStat: string;
  statLabel: string;
  quote: string;
  bgGradient: string;
  icon: string;
}

const WRAPPED_SLIDES: WrappedSlide[] = [
  {
    badge: 'SLIDE 1 &middot; THE MILESTONE',
    headline: '365 Days of Us',
    bigStat: '8,760 Hours',
    statLabel: '525,600 minutes of loving you unconditionally',
    quote: 'From fake dating pacts to our real forever... what a golden year.',
    bgGradient: 'from-[#4a154b] to-[#120726]',
    icon: '👑',
  },
  {
    badge: 'SLIDE 2 &middot; LATE NIGHT DEDICATION',
    headline: 'FaceTime All-Nighters',
    bigStat: `${YEAR_STATS.facetimeHours}+ Hours`,
    statLabel: 'Screen brightness permanently at 1%, phone on charger',
    quote: 'Watching you fall asleep peacefully so you never feel alone.',
    bgGradient: 'from-[#191970] to-[#0c0c1e]',
    icon: '📱',
  },
  {
    badge: 'SLIDE 3 &middot; THE MIDNIGHT FUEL',
    headline: 'The 2 AM Maggi Index',
    bigStat: `${YEAR_STATS.maggiBowls} Bowls`,
    statLabel: 'Extra cheese, extra love, zero questions asked',
    quote: 'Certified 5-star hostel chef on standby for Queen Nush.',
    bgGradient: 'from-[#b45309] to-[#1e1005]',
    icon: '🍜',
  },
  {
    badge: 'SLIDE 4 &middot; SECURITY RUNS',
    headline: 'Campus Security Evictions',
    bigStat: `${YEAR_STATS.openAudiEvictions} Times`,
    statLabel: 'Kicked out of Open Audi at exactly 8:00 PM',
    quote: 'Guards can kick us out of Open Audi, but never out of each other’s hearts.',
    bgGradient: 'from-[#831843] to-[#1a0510]',
    icon: '🏛️',
  },
  {
    badge: 'SLIDE 5 &middot; ACADEMIC FRAUD',
    headline: 'Central Library Stare-Downs',
    bigStat: '0% Study &middot; 100% Stare',
    statLabel: `${YEAR_STATS.libraryStaringHours} hours admiring Nush across the desk`,
    quote: 'Violation fine: 100 forehead kisses if caught smiling too loudly.',
    bgGradient: 'from-[#14532d] to-[#061a0e]',
    icon: '📚',
  },
  {
    badge: 'SLIDE 6 &middot; OUR SOUNDTRACK',
    headline: 'Most Played Frequency',
    bigStat: 'Radio Nushi FM',
    statLabel: 'Velvety late-night radio voice & Agar Tum Saath Ho',
    quote: 'Why listen to Spotify when I have your voice singing to me?',
    bgGradient: 'from-[#581c87] to-[#140624]',
    icon: '📻',
  },
  {
    badge: 'SLIDE 7 &middot; FINAL VERDICT',
    headline: 'Certified Soulmates',
    bigStat: 'Top 0.0001%',
    statLabel: 'Compatibility Rating: Off the cosmological charts',
    quote: 'Year 1 is complete. Here is to 100 more years of us ❤️',
    bgGradient: 'from-[#be123c] to-[#20050c]',
    icon: '💖',
  },
];

export default function YearOneWrapped() {
  const { isYearWrappedOpen, setYearWrappedOpen, unlockAchievement } = useUniverseStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (isYearWrappedOpen) {
      unlockAchievement('year_one_legend');
    }
  }, [isYearWrappedOpen, unlockAchievement]);

  const handleNext = () => {
    SoundEngine.pop();
    if (currentSlide < WRAPPED_SLIDES.length - 1) {
      setCurrentSlide((p) => p + 1);
    } else {
      SoundEngine.confettiPop();
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
      });
      setYearWrappedOpen(false);
      setCurrentSlide(0);
    }
  };

  const handlePrev = () => {
    SoundEngine.click();
    if (currentSlide > 0) {
      setCurrentSlide((p) => p - 1);
    }
  };

  if (!isYearWrappedOpen) return null;

  const slide = WRAPPED_SLIDES[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 font-nunito select-none"
      >
        {/* Story Progress Bars */}
        <div className="w-full max-w-md flex items-center gap-1.5 mb-4 z-20">
          {WRAPPED_SLIDES.map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentSlide ? 'w-full' : idx === currentSlide ? 'w-full bg-pink-400' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Story Card */}
        <motion.div
          key={currentSlide}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-md h-[560px] rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br ${slide.bgGradient} border-2 border-white/20 shadow-2xl relative overflow-hidden`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 font-bold bg-white/10 px-3 py-1 rounded-full">
              {slide.badge}
            </span>
            <button
              onClick={() => setYearWrappedOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Center Stat & Icon */}
          <div className="my-auto text-center z-10 space-y-3">
            <div className="text-5xl">{slide.icon}</div>
            <h2 className="text-2xl font-bold font-mono text-white tracking-wide">
              {slide.headline}
            </h2>
            <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-yellow-200 to-white font-mono drop-shadow-md">
              {slide.bigStat}
            </div>
            <p className="text-xs text-white/80 max-w-xs mx-auto leading-relaxed">
              {slide.statLabel}
            </p>
          </div>

          {/* Bottom Quote & Nav Buttons */}
          <div className="z-10 space-y-4">
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 text-center">
              <p className="font-caveat text-lg sm:text-xl text-yellow-200">
                &ldquo;{slide.quote}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-pink-100 font-mono text-xs font-bold transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                {currentSlide === WRAPPED_SLIDES.length - 1 ? 'Finish Year 1 👑' : 'Next Milestone &rarr;'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

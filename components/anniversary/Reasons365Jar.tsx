'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from '../SectionHead';
import { useAnniversaryYearStore, DailyLoveReason } from '@/lib/anniversaryYearStore';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function Reasons365Jar() {
  const { reasons, activeReasonDay, setActiveReasonDay, bookmarkedDays, toggleBookmark } = useAnniversaryYearStore();
  const { unlockAchievement } = useUniverseStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchDay, setSearchDay] = useState('');

  const currentReason = reasons[activeReasonDay - 1] || reasons[0];

  const handleDrawRandom = () => {
    SoundEngine.pop();
    unlockAchievement('reasons_explorer');
    const randomDay = Math.floor(Math.random() * 365) + 1;
    setActiveReasonDay(randomDay);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const dayNum = parseInt(searchDay, 10);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 365) {
      SoundEngine.click();
      setActiveReasonDay(dayNum);
      setSearchDay('');
    }
  };

  const isBookmarked = bookmarkedDays.includes(activeReasonDay);

  return (
    <section id="reasons-365-jar" className="anniversary-section py-12 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="one reason for every single day of our year"
        title="The 365 Love Reasons Jar 🏺"
        subtitle="365 folded parchment notes for 365 days of us. Draw today’s note or jump straight to your favorite milestone."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-8">
        {/* Left Column: Visual Vintage Glass Jar (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-[45px] bg-gradient-to-b from-white/20 via-pink-500/10 to-purple-500/20 border-4 border-white/30 backdrop-blur-md shadow-[0_0_50px_rgba(255,92,142,0.3)] flex flex-col items-center justify-between p-4 overflow-hidden">
            {/* Wooden Cork Lid */}
            <div className="w-36 h-8 rounded-t-xl bg-[#8B5A2B] border-2 border-[#5c3a1b] shadow-md -mt-5 z-20 flex items-center justify-center">
              <span className="text-[10px] font-mono text-[#FEE2E2] font-bold tracking-widest uppercase">
                365 Days
              </span>
            </div>

            {/* Floating Origami Hearts & Scrolls inside Jar */}
            <div className="relative w-full flex-1 flex flex-wrap items-center justify-center gap-3 p-4">
              {['💌', '💖', '📜', '✨', '🌸', '🧸', '🍜', '🎸', '💋', '👑'].map((emoji, idx) => (
                <motion.span
                  key={idx}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, idx % 2 === 0 ? 10 : -10, 0],
                  }}
                  transition={{
                    duration: 3 + (idx % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-2xl sm:text-3xl select-none"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>

            {/* Jar Label */}
            <div className="w-full bg-[#FFFDF8] text-[#2B1B17] py-2 px-3 rounded-2xl border-2 border-[#8B5A2B] text-center shadow-lg z-20">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#8B5A2B] font-bold block">
                Yajat &middot; For Anushka
              </span>
              <span className="font-caveat text-lg font-bold">
                Why I Love You Jar
              </span>
            </div>
          </div>

          {/* Draw Button */}
          <button
            onClick={handleDrawRandom}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full font-bold text-xs tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Draw a Love Note</span>
            <span>📜✨</span>
          </button>
        </div>

        {/* Right Column: Displayed Folded Love Note Card (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {/* Quick Search & Day Slider Form */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                placeholder="Day (1–365)..."
                value={searchDay}
                onChange={(e) => setSearchDay(e.target.value)}
                className="w-28 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
              >
                Go &rarr;
              </button>
            </form>

            <button
              onClick={() => toggleBookmark(activeReasonDay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}</span>
            </button>
          </div>

          {/* Active Note Parchment */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReason.day}
              initial={{ opacity: 0, rotate: -1, scale: 0.95 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] text-[#2B1B17] border-4 border-[#3D261C] shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#8B5A2B]/40 pb-3 mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8B5A2B] font-bold">
                  Day #{currentReason.day} of 365
                </span>
                <span className="text-xs font-mono bg-[#FAF0E6] px-2.5 py-0.5 rounded-full border border-[#D2B48C] text-[#8B5A2B]">
                  #{currentReason.tag}
                </span>
              </div>

              <p className="font-serif text-lg sm:text-xl text-[#3D261C] leading-relaxed my-4">
                &ldquo;{currentReason.text}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#8B5A2B]/20 text-xs font-mono text-[#8B5A2B]">
                <span>Yours Forever &middot; Yajat</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveReasonDay(Math.max(1, activeReasonDay - 1))}
                    disabled={activeReasonDay === 1}
                    className="hover:text-[#2B1B17] disabled:opacity-30 cursor-pointer"
                  >
                    &larr; Prev
                  </button>
                  <span>&middot;</span>
                  <button
                    onClick={() => setActiveReasonDay(Math.min(365, activeReasonDay + 1))}
                    disabled={activeReasonDay === 365}
                    className="hover:text-[#2B1B17] disabled:opacity-30 cursor-pointer"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

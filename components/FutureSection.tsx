'use client';

import React, { useState, useEffect } from 'react';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { useUniverseStore } from '@/lib/universeStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface DailyDrop {
  dayNumber: number; // 1 to 14 (Sep 9 to Sep 22)
  dateLabel: string;
  title: string;
  category: string;
  badge: string;
  icon: string;
  teaser: string;
  secretContent: string;
  tokenReward: string;
  accentGradient: string;
  mediaType?: 'text' | 'photo' | 'audio' | 'diff' | 'arcade' | 'coupon' | 'quiz' | 'finale';
  mediaPayload?: string;
}

// Day 1 begins tomorrow at 12:00 AM (midnight, Sep 9, 2026)
const DAY_1_START = new Date('2026-09-09T00:00:00+05:30');
// Grand Anniversary on September 22, 2026
const ANNIVERSARY_TARGET = new Date('2026-09-22T00:00:00+05:30');

const RAW_DROPS: Omit<DailyDrop, 'dayNumber' | 'dateLabel'>[] = [
  // DAY 1 (Sep 9)
  {
    title: 'The Origin Story Revelation 🎸💻',
    category: 'Day 1 Drop',
    badge: 'The Genesis',
    icon: '🎸',
    teaser: 'Why a stubborn coder stayed up until 3 AM typing thousands of lines of code for you.',
    secretContent: '“It started when I realized that normal words were never going to be enough to hold all our memories. I am a coder—so when I love someone with my whole soul, I build her an entire interactive world where her smile, our 8 PM guard chases, and our sacred kiss past AB-2 are saved forever.”',
    tokenReward: '💌 Keepsake: Origin Story Note saved to Memory Vault',
    accentGradient: 'from-[#FF5C8E] to-[#B9AEF5]',
    mediaType: 'text',
  },
  // DAY 2 (Sep 10)
  {
    title: 'Never-Posted Secret Polaroid 📸',
    category: 'Day 2 Drop',
    badge: 'Unreleased Frame',
    icon: '📸',
    teaser: 'A private candid late-night call memory pulled straight from Yajat’s secret camera roll.',
    secretContent: '“That late-night call at 1:07 AM where you fell asleep under your pink floral blanket and I stayed awake with a blanket over my head just looking at you. You are breathtaking in every single unposed second of existence 🥹❤️”',
    tokenReward: '🖼️ Polaroid: Added to Corkboard & Photo Lightbox',
    accentGradient: 'from-[#FFDD8C] to-[#FF5C8E]',
    mediaType: 'photo',
    mediaPayload: '/photos/late-night-call.png',
  },
  // DAY 3 (Sep 11)
  {
    title: 'Radio Nushi FM Whispered Memo 🎙️',
    category: 'Day 3 Drop',
    badge: 'Audio Vault',
    icon: '🎙️',
    teaser: 'A personal voice note dedicated to your velvety singing voice.',
    secretContent: '“Every time I hear your velvety, late-night radio voice, my whole mind goes calm. I literally deleted my music streaming apps because nothing in the world compares to listening to you sing.”',
    tokenReward: '📻 Audio Memo: Unlocked in Radio Nushi Voice Studio',
    accentGradient: 'from-[#B9AEF5] to-[#3B82F6]',
    mediaType: 'audio',
  },
  // DAY 4 (Sep 12)
  {
    title: 'The Then vs. Now Diff ⚖️',
    category: 'Day 4 Drop',
    badge: 'Milestone Marker',
    icon: '⚖️',
    teaser: 'Our very first shy online text message compared to our 4 AM calls today.',
    secretContent: '“Then: ‘Hey, are you free for a walk around campus? 🙈’\nNow: ‘8:00 PM Open Audi mission, passing Dr. Morphin’s twice, screaming because guards are chasing us, and staying on FaceTime watching you sleep safely until 4:23 AM 😭❤️’\nLook how deeply we grew.”',
    tokenReward: '💬 Memory Diff: Added to Relationship Evolution Tracker',
    accentGradient: 'from-[#FF5C8E] to-[#FFDD8C]',
    mediaType: 'diff',
  },
  // DAY 5 (Sep 13)
  {
    title: 'Live Inside-Joke Injection 🤫',
    category: 'Day 5 Drop',
    badge: 'Real-Time Sync',
    icon: '🤫',
    teaser: 'A brand new memory injected live into the relationship database.',
    secretContent: '“This site is alive. Every new joke we share, every time you demand 2 AM extra cheese Maggi or hug Teddy Yajat, our universe expands in real time.”',
    tokenReward: '🔤 Inside Joke: Credited to relationship data layer',
    accentGradient: 'from-[#10B981] to-[#3B82F6]',
    mediaType: 'text',
  },
  // DAY 6 (Sep 14)
  {
    title: 'Secret Arcade: Hyper-Speed Love Slice 🥷',
    category: 'Day 6 Drop',
    badge: 'Arcade Bonus',
    icon: '🥷',
    teaser: 'A secret high-speed challenge unlocked in our 13-Game Arcade.',
    secretContent: '“Supersonic floating hearts, rare diamond hearts (+500 pts), and zero forgiveness for sliced red flags! Think you can beat Yajat’s all-time high score?”',
    tokenReward: '🎮 Game Mode: Hyper-Speed Love Slice unlocked in Arcade',
    accentGradient: 'from-[#F59E0B] to-[#EF4444]',
    mediaType: 'arcade',
  },
  // DAY 7 (Sep 15)
  {
    title: 'VIP Golden Date Pass 🎟️',
    category: 'Day 7 Drop',
    badge: 'Real-Life Token',
    icon: '🎟️',
    teaser: 'A stamped, holographic VIP pass redeemable in person.',
    secretContent: '“Redeemable on demand: 1x Midnight drive, warm cheese Maggi, 100 forehead kisses, and an uninterrupted 15-minute tight hug session with zero complaints.”',
    tokenReward: '🎟️ Physical Token: Stamped and redeemable whenever Nush wants',
    accentGradient: 'from-[#FFD700] to-[#FF5C8E]',
    mediaType: 'coupon',
  },
  // DAY 8 (Sep 16)
  {
    title: 'Our Stargazing Perfect Date 🌌✨',
    category: 'Day 8 Drop',
    badge: 'Constellation Memory',
    icon: '🌌',
    teaser: 'Looking up at the same night sky from Indore & Shajapur.',
    secretContent: '“Lying back under an open midnight sky, sharing earphones, and pointing at the constellations. Even when miles apart between SAGE University in Indore and your home in Shajapur, we are always under the exact same stars. You are my brightest constellation.”',
    tokenReward: '✨ Stargazing Memory: Inscribed into the Night Sky',
    accentGradient: 'from-[#6366F1] to-[#EC4899]',
    mediaType: 'text',
  },
  // DAY 9 (Sep 17)
  {
    title: 'Wax-Sealed Love Letter Fragment 📜',
    category: 'Day 9 Drop',
    badge: 'Unopened Scroll',
    icon: '📜',
    teaser: 'A newly penned paragraph appended to our anniversary love letter.',
    secretContent: '“And if I had to relive these months across a thousand different timelines, I would choose you in every single one. On every campus walk, at every 8 PM guard chase, and in every quiet second past AB-2. You are my forever.”',
    tokenReward: '📜 Letter Scroll: Appended to Anniversary Love Letter',
    accentGradient: 'from-[#EC4899] to-[#8B5CF6]',
    mediaType: 'text',
  },
  // DAY 10 (Sep 18)
  {
    title: 'The 100-Day Century Milestone 💯👑',
    category: 'Day 10 Drop',
    badge: '100 Days of Us',
    icon: '💯',
    teaser: 'A full century of days laughing, crying happy tears, and loving you.',
    secretContent: '“100 DAYS. Not just 100 days of dating, but 100 days of having my favorite person in the entire world by my side. You turned a random college into the place where I found my whole heart.”',
    tokenReward: '🏆 Century Trophy: 100-Day Centurion Badge Unlocked',
    accentGradient: 'from-[#FFD700] to-[#F59E0B]',
    mediaType: 'text',
  },
  // DAY 11 (Sep 19)
  {
    title: 'The Future Prophecy 🔮',
    category: 'Day 11 Drop',
    badge: 'Tarot Oracle',
    icon: '🔮',
    teaser: 'What the celestial stars predict for our future road ahead.',
    secretContent: '“Prophecy Card 1: Infinite laughter • Prophecy Card 2: Countless 2 AM Maggi dates • Prophecy Card 3: An unbreakable bond that only grows deeper with every sunrise.”',
    tokenReward: '🧠 Prophecy Bonus: +500 Love Points awarded to HUD',
    accentGradient: 'from-[#8B5CF6] to-[#3B82F6]',
    mediaType: 'quiz',
  },
  // DAY 12 (Sep 20)
  {
    title: 'The Reluctant Goodbye at Girls Block 2 🚪🥹',
    category: 'Day 12 Drop',
    badge: 'Sacred Routine',
    icon: '🚪',
    teaser: 'Why saying goodbye at GB-2 became the most precious part of every single day.',
    secretContent: '“Getting kicked out of Open Audi at 8, walking through AB-1, passing Dr. Morphin’s, stretching every last minute... until finally, reluctantly, saying goodbye at Girls Block 2. You turn back to look at me, and that is where I always wish time would legally freeze.”',
    tokenReward: '🏛️ Sacred Memory: GB-2 Route Inscription Unlocked',
    accentGradient: 'from-[#FF5C8E] to-[#F43F5E]',
    mediaType: 'text',
  },
  // DAY 13 (Sep 21)
  {
    title: 'The Anniversary Eve Sparkler 🎆✨',
    category: 'Day 13 Drop',
    badge: 'Eve Celebration',
    icon: '🎆',
    teaser: 'Tomorrow is September 22nd—our official anniversary! Prepare for the finale.',
    secretContent: '“The countdown has almost reached its summit. Exactly 24 hours until September 22nd. Tomorrow, the final master chapter unlocks. I love you more than all the code in the world.”',
    tokenReward: '✨ Aura: Golden Cosmic Celebration unlocked',
    accentGradient: 'from-[#FF5C8E] to-[#FFD700]',
    mediaType: 'text',
  },
  // DAY 14 (Sep 22 - 3 Month Anniversary)
  {
    title: 'OUR 3-MONTH ANNIVERSARY GRAND FINALE! 💍👑💖',
    category: 'Day 14 Anniversary',
    badge: 'September 22nd — 3-Month Anniversary',
    icon: '💍',
    teaser: 'HAPPY 3-MONTH ANNIVERSARY, MERI NUSHI! A whole quarter of a year of us.',
    secretContent: '“HAPPY 3-MONTH ANNIVERSARY, MERI NUSHI! ❤️🥹 Today is September 22nd—three full months of pure magic, our sacred Open Audi spots, our library notes, and watching you sleep on FaceTime until 4:23 AM. You are my best friend, my soulmate, my bbg, and my wifeyyy. Next stop: our 4-month anniversary on October 22nd! Happy Anniversary to us, baby! ❤️🎶😭”',
    tokenReward: '👑 Eternal Trophy: Best Girlfriend in the Universe Official Master Award',
    accentGradient: 'from-[#FFD700] via-[#FF5C8E] to-[#B9AEF5]',
    mediaType: 'finale',
  },
];

export default function FutureSection() {
  const { streakCount, checkAndUpdateStreak, unlockAchievement } = useUniverseStore();
  const [openedDrop, setOpenedDrop] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'mystery' | 'trail'>('mystery');
  const [now, setNow] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState<number>(1);

  useEffect(() => {
    checkAndUpdateStreak();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [checkAndUpdateStreak]);

  // Compute unlock dates: Day 1 unlocks on Sep 9, Day 14 unlocks on Sep 22
  const drops: (DailyDrop & { unlockDate: Date; isUnlocked: boolean })[] = RAW_DROPS.map((d, index) => {
    const dayNumber = index + 1; // 1 to 14
    const unlockTime = DAY_1_START.getTime() + index * 24 * 60 * 60 * 1000;
    const unlockDate = new Date(unlockTime);
    const isUnlocked = now.getTime() >= unlockDate.getTime();
    const dateLabel = unlockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      ...d,
      dayNumber,
      dateLabel,
      unlockDate,
      isUnlocked,
    };
  });

  // Set default selected tab
  useEffect(() => {
    const unlockedList = drops.filter((d) => d.isUnlocked);
    if (unlockedList.length > 0) {
      const latest = unlockedList[unlockedList.length - 1];
      setSelectedTab(latest.dayNumber);
      setOpenedDrop(latest.dayNumber);
    } else {
      setSelectedTab(1);
    }
  }, []);

  const activeFocusDrop = drops.find((d) => d.dayNumber === selectedTab) || drops[0];

  const handleCardClick = (drop: DailyDrop & { isUnlocked: boolean }) => {
    if (!drop.isUnlocked) {
      SoundEngine.error();
      return;
    }
    SoundEngine.pop();
    if (openedDrop === drop.dayNumber) {
      setOpenedDrop(null);
    } else {
      setOpenedDrop(drop.dayNumber);
      setSelectedTab(drop.dayNumber);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.5, y: 0.65 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#ffffff'],
      });
      if (drop.dayNumber === 14) {
        unlockAchievement('countdown_complete');
      }
    }
  };

  // Target calculations:
  // Grand countdown: Time remaining until September 22 Anniversary
  const grandDiff = Math.max(0, ANNIVERSARY_TARGET.getTime() - now.getTime());
  const grandDays = Math.floor(grandDiff / (1000 * 60 * 60 * 24));
  const grandHours = Math.floor((grandDiff / (1000 * 60 * 60)) % 24);
  const grandMins = Math.floor((grandDiff / (1000 * 60)) % 60);
  const grandSecs = Math.floor((grandDiff / 1000) % 60);

  // Next daily drop target
  const nextLockedDrop = drops.find((d) => !d.isUnlocked);
  const nextTargetTime = nextLockedDrop ? nextLockedDrop.unlockDate.getTime() : ANNIVERSARY_TARGET.getTime();
  const nextDiff = Math.max(0, nextTargetTime - now.getTime());
  const nextHours = Math.floor((nextDiff / (1000 * 60 * 60)) % 24);
  const nextMins = Math.floor((nextDiff / (1000 * 60)) % 60);
  const nextSecs = Math.floor((nextDiff / 1000) % 60);

  const isAnniversaryToday = now.getTime() >= ANNIVERSARY_TARGET.getTime();

  return (
    <section id="future" className="anniversary-section relative py-20 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="countdown to september 22nd anniversary"
        title="14 Days of Love: Road to Sep 22nd 💍✨"
        subtitle={
          isAnniversaryToday
            ? "HAPPY ANNIVERSARY, MERI NUSHI! All 14 chapters are unlocked forever ❤️"
            : "Every single day from tomorrow until our September 22nd Anniversary unlocks a brand new memory."
        }
      />

      {/* Top Banner: Visit Streak + Countdown Timer */}
      <div className="mt-8 mb-10 bg-gradient-to-r from-[#1c1428] via-[#241738] to-[#161024] p-5 md:p-6 rounded-3xl border-2 border-[var(--pink)] shadow-2xl text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          {/* Visit Streak */}
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🔥</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm md:text-base text-[var(--butter,#FFDD8C)] font-mono">
                  {streakCount}-Day Visit Streak
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">Checking in every day until September 22nd ❤️</p>
            </div>
          </div>

          {/* Grand Countdown Clock to Sep 22nd Anniversary */}
          <div className="flex flex-col items-end gap-1 font-mono text-center">
            <span className="text-[10px] uppercase tracking-widest text-[var(--butter,#FFDD8C)] font-bold">
              {isAnniversaryToday ? '💍 TODAY IS OUR ANNIVERSARY!' : '💍 Countdown to Sep 22nd Anniversary:'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-sm md:text-lg font-bold text-[var(--butter,#FFDD8C)] block">
                  {String(grandDays).padStart(2, '0')}
                </span>
                <span className="text-[8px] text-gray-400 uppercase">Days</span>
              </div>
              <span className="text-pink-400 font-bold">:</span>
              <div className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-sm md:text-lg font-bold text-white block">
                  {String(grandHours).padStart(2, '0')}
                </span>
                <span className="text-[8px] text-gray-400 uppercase">Hours</span>
              </div>
              <span className="text-pink-400 font-bold">:</span>
              <div className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-sm md:text-lg font-bold text-white block">
                  {String(grandMins).padStart(2, '0')}
                </span>
                <span className="text-[8px] text-gray-400 uppercase">Mins</span>
              </div>
              <span className="text-pink-400 font-bold">:</span>
              <div className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-sm md:text-lg font-bold text-pink-400 block">
                  {String(grandSecs).padStart(2, '0')}
                </span>
                <span className="text-[8px] text-gray-400 uppercase">Secs</span>
              </div>
            </div>
            {nextLockedDrop && (
              <span className="text-[10px] text-gray-400 mt-0.5">
                Next Drop ({nextLockedDrop.dateLabel}) in {nextHours}h : {nextMins}m : {nextSecs}s ⏳
              </span>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-full border border-white/10 w-fit text-xs font-mono">
          <button
            onClick={() => {
              SoundEngine.click();
              setActiveView('mystery');
            }}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              activeView === 'mystery'
                ? 'bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎁 3D Mystery Stage
          </button>
          <button
            onClick={() => {
              SoundEngine.click();
              setActiveView('trail');
            }}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              activeView === 'trail'
                ? 'bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 14-Day Calendar Trail
          </button>
        </div>
      </div>

      {/* VIEW 1: 3D MYSTERY FOCUS STAGE */}
      {activeView === 'mystery' && (
        <div className="space-y-6">
          {/* Day Selector Chips (14 Days) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {drops.map((d) => (
              <button
                key={d.dayNumber}
                onClick={() => {
                  SoundEngine.click();
                  setSelectedTab(d.dayNumber);
                  if (d.isUnlocked) setOpenedDrop(d.dayNumber);
                }}
                className={`px-3 py-2 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                  selectedTab === d.dayNumber
                    ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--lav)] text-white border-white/40 shadow-lg scale-105'
                    : d.isUnlocked
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    : 'bg-black/30 border-white/5 text-gray-500 opacity-60 hover:opacity-100'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.dateLabel}</span>
                {!d.isUnlocked && <span className="text-[10px]">🔒</span>}
              </button>
            ))}
          </div>

          {/* Active Mystery Card */}
          <motion.div
            key={activeFocusDrop.dayNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl p-6 md:p-8 border-2 shadow-2xl transition-all ${
              activeFocusDrop.isUnlocked
                ? 'bg-gradient-to-br from-[#1a1228] to-[#0f0a18] border-[var(--pink)]/60'
                : 'bg-gradient-to-br from-[#120e1a] to-[#08060c] border-white/10 opacity-90'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-3 bg-white/5 rounded-2xl border border-white/10">
                  {activeFocusDrop.icon}
                </span>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--butter,#FFDD8C)]">
                    {activeFocusDrop.badge} &middot; {activeFocusDrop.dateLabel}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-white mt-0.5">
                    {activeFocusDrop.title}
                  </h3>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  activeFocusDrop.isUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {activeFocusDrop.isUnlocked ? '✨ UNLOCKED' : '🔒 LOCKED'}
              </span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed font-nunito mb-6">
              {activeFocusDrop.teaser}
            </p>

            {/* If Unlocked: Content reveal */}
            {activeFocusDrop.isUnlocked ? (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="font-caveat text-xl md:text-2xl text-[var(--butter,#FFDD8C)] leading-relaxed italic">
                    {activeFocusDrop.secretContent}
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-2">
                  <span>🏆</span>
                  <span>{activeFocusDrop.tokenReward}</span>
                </div>
              </div>
            ) : (
              /* If Locked: Countdown to this specific drop */
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="text-gray-400">
                  🔒 Unlocks on{' '}
                  <strong className="text-white">
                    {activeFocusDrop.dateLabel} at 12:00 AM Midnight
                  </strong>
                </div>
                <span className="text-[var(--pink)] font-bold">
                  {activeFocusDrop.dayNumber === 1
                    ? 'Day 1 Drops Tomorrow at 12:00 AM Midnight ✨'
                    : `Unlocks on Day ${activeFocusDrop.dayNumber} of our Road to Sep 22nd ⏳`}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* VIEW 2: 14-DAY CONSTELLATION TRAIL */}
      {activeView === 'trail' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <motion.div
              key={drop.dayNumber}
              whileHover={{ scale: drop.isUnlocked ? 1.02 : 1 }}
              onClick={() => handleCardClick(drop)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                drop.isUnlocked
                  ? 'bg-gradient-to-br from-[#1c1328] to-[#120c1c] border-[var(--pink)]/40 hover:border-[var(--pink)] shadow-lg'
                  : 'bg-black/40 border-white/5 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{drop.icon}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      drop.isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                        : 'bg-white/5 text-gray-500 border-white/10'
                    }`}
                  >
                    {drop.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--butter,#FFDD8C)] uppercase tracking-wider">
                  {drop.dateLabel} Drop (Day {drop.dayNumber})
                </span>
                <h4 className="text-base font-bold font-serif text-white mt-1 mb-2 leading-snug">
                  {drop.title}
                </h4>
                <p className="text-xs text-gray-300 line-clamp-2">{drop.teaser}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-gray-400 flex items-center justify-between">
                <span>{drop.isUnlocked ? 'Tap to view 💖' : 'Locked 🔒'}</span>
                <span>{drop.dateLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

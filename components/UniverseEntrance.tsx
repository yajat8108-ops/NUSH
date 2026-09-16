'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface Slide {
  badge: string;
  line1: string;
  line2: string;
  emoji: string;
  accentColor: string;
}

const INTRO_SLIDES: Slide[] = [
  {
    badge: 'CHAPTER I &middot; TIME',
    line1: 'Three months.',
    line2: 'Just 90 days on a calendar...',
    emoji: '⏳',
    accentColor: '#B9AEF5',
  },
  {
    badge: 'CHAPTER II &middot; QUESTION',
    line1: 'That’s all?',
    line2: 'Just another summer that quickly passed by?',
    emoji: '💭',
    accentColor: '#FF9EC9',
  },
  {
    badge: 'CHAPTER III &middot; CERTAINTY',
    line1: 'No.',
    line2: 'Not even close.',
    emoji: '✨',
    accentColor: '#FFDD8C',
  },
  {
    badge: 'CHAPTER IV &middot; OUR STORY',
    line1: 'It’s three months of a whole universe.',
    line2: 'Our guitars, our late-night pacts, our kisses, and our little world ❤️',
    emoji: '🌌',
    accentColor: '#FF5C8E',
  },
];

export default function UniverseEntrance() {
  const { enteredUniverse, setEnteredUniverse, unlockAchievement, toggleSoundtrack } = useUniverseStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Slide progression & progress bar animation (3.2s pacing)
  useEffect(() => {
    if (!mounted || enteredUniverse || isReady) return;

    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 3.125));
    }, 100);

    const timer = setTimeout(() => {
      if (currentSlide < INTRO_SLIDES.length - 1) {
        SoundEngine.pop();
        setCurrentSlide((prev) => prev + 1);
      } else {
        SoundEngine.chime();
        setIsReady(true);
      }
    }, 3200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [currentSlide, isReady, enteredUniverse, mounted]);

  const handleEnterUniverse = () => {
    setIsDismissing(true);

    try {
      SoundEngine.confettiPop();
    } catch (e) {}

    try {
      // Grand celebratory multi-burst confetti
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9', '#ffffff'],
        scalar: 1.2,
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#FF5C8E', '#FFDD8C', '#3B82F6'],
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#B9AEF5', '#FF9EC9', '#FFDD8C'],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 90,
          spread: 140,
          origin: { x: 0.5, y: 0.8 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
          scalar: 1.4,
        });
      }, 400);
    } catch (e) {}

    setTimeout(() => {
      setEnteredUniverse(true);
      try {
        unlockAchievement('universe_entered');
      } catch (e) {}
      try {
        toggleSoundtrack();
      } catch (e) {}
    }, 550);
  };

  const handleNextOrEnter = () => {
    if (isReady) {
      handleEnterUniverse();
    } else if (currentSlide < INTRO_SLIDES.length - 1) {
      SoundEngine.pop();
      setCurrentSlide((prev) => prev + 1);
    } else {
      SoundEngine.chime();
      setIsReady(true);
    }
  };

  if (!mounted || enteredUniverse) return null;

  const slide = INTRO_SLIDES[currentSlide];

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="universe-entrance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.12, filter: 'blur(16px)' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999999] bg-[#09070f] text-white flex flex-col items-center justify-center p-6 select-none font-nunito overflow-hidden cursor-pointer"
          onClick={handleNextOrEnter}
        >
          {/* Layer 1: Parallax Cosmos Particle Grid & Twinkling Stars */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#FF9EC9_1.5px,transparent_1.5px)] [background-size:36px_36px] animate-pulse"
            style={{ animationDuration: '4s' }}
          />

          {/* Layer 2: Ethereal Aurora Glows */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 45, 0],
              opacity: [0.3, 0.55, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="absolute w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(255,92,142,0.35)_0%,rgba(185,174,245,0.2)_40%,transparent_70%)] blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,221,140,0.25)_0%,rgba(255,92,142,0.15)_50%,transparent_75%)] blur-3xl pointer-events-none"
          />

          {/* Top Floating Controls Bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50 pointer-events-auto">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] font-mono text-gray-300">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span>Yajat &amp; Nush Universe</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnterUniverse();
              }}
              className="px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-xs font-mono text-white font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Skip Intro</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Center Stage: Narrative Story Slide with Camera Breathing */}
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="relative z-10 max-w-2xl text-center space-y-8 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {!isReady ? (
                <motion.div
                  key={`slide-${currentSlide}`}
                  initial={{ opacity: 0, y: 30, scale: 0.92, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -25, scale: 0.94, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  {/* Badge */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] font-bold px-4 py-1.5 rounded-full bg-white/10 border border-white/20 inline-block shadow-sm"
                    style={{ color: slide.accentColor }}
                    dangerouslySetInnerHTML={{ __html: slide.badge }}
                  />

                  {/* Emoji Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 6, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="text-6xl md:text-7xl block py-2 drop-shadow-[0_0_25px_rgba(255,92,142,0.7)]"
                  >
                    {slide.emoji}
                  </motion.div>

                  {/* Heading */}
                  <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.9)] leading-tight">
                    {slide.line1}
                  </h1>

                  {/* Subtitle */}
                  <p className="font-caveat text-2xl md:text-3xl text-[var(--butter,#FFDD8C)] drop-shadow-md max-w-lg mx-auto leading-snug">
                    {slide.line2}
                  </p>

                  <p className="text-[11px] font-mono text-gray-400 pt-6 opacity-70">
                    (tap anywhere to step forward &middot; {currentSlide + 1} of {INTRO_SLIDES.length})
                  </p>
                </motion.div>
              ) : (
                /* The Grand Reveal Finale Card */
                <motion.div
                  key="grand-reveal"
                  initial={{ opacity: 0, scale: 0.85, y: 35, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.65, type: 'spring', damping: 16, stiffness: 120 }}
                  className="space-y-6 bg-black/60 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border-2 border-[var(--pink-deep,#FF5C8E)] shadow-[0_0_100px_rgba(255,92,142,0.55)]"
                >
                  <motion.span
                    animate={{ scale: [1, 1.22, 1], rotate: [0, 8, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="text-6xl md:text-8xl block drop-shadow-[0_0_35px_rgba(255,215,0,0.85)]"
                  >
                    👑🌌💖
                  </motion.span>

                  <div className="space-y-2">
                    <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#FFDD8C] font-bold px-4 py-1.5 rounded-full bg-white/10 border border-white/20 inline-block">
                      Three Months of Pure Magic &middot; 90 Days
                    </span>

                    <h1 className="text-3xl md:text-5xl font-black font-mono text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]">
                      Welcome to Our Universe
                    </h1>

                    <p className="font-caveat text-3xl md:text-4xl text-[var(--butter,#FFDD8C)] pt-1">
                      Ready for our story, Nushi? 🌸✨
                    </p>
                  </div>

                  <div className="pt-3">
                    <motion.button
                      whileHover={{ scale: 1.06, boxShadow: '0 0 60px rgba(255,92,142,0.95)' }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleEnterUniverse}
                      className="px-10 py-4 md:py-5 rounded-full bg-gradient-to-r from-[#FF5C8E] via-[#B9AEF5] to-[#FFDD8C] text-[#1a1528] font-black text-base md:text-xl font-mono shadow-[0_0_50px_rgba(255,92,142,0.75)] cursor-pointer inline-flex items-center gap-3 transition-all"
                    >
                      <span>✨ Open our little universe</span>
                      <span>&rarr;</span>
                    </motion.button>
                  </div>

                  <p className="text-xs font-mono text-gray-400 opacity-75">
                    (or press Enter / Space to unlock)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Dots & Live Timer Bar */}
            <div className="flex flex-col items-center gap-3 pt-4">
              <div className="flex items-center justify-center gap-2.5">
                {INTRO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      SoundEngine.click();
                      setCurrentSlide(idx);
                      setIsReady(idx === INTRO_SLIDES.length - 1);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx && !isReady
                        ? 'w-9 bg-[#FF5C8E] shadow-[0_0_12px_#FF5C8E]'
                        : isReady && idx === INTRO_SLIDES.length - 1
                        ? 'w-9 bg-[#FFDD8C] shadow-[0_0_12px_#FFDD8C]'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {!isReady && (
                <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--pink)] to-[var(--butter)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

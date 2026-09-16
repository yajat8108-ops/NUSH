'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// 21 Sections from page.tsx
const SECTIONS = [
  { id: 'hero', name: 'Anniversary Hero' },
  { id: 'origin', name: 'The Origin Story' },
  { id: 'kiss', name: 'The Kiss Milestone' },
  { id: 'arcade', name: 'Master Love Arcade' },
  { id: 'letter', name: '3-Month Love Letter' },
  { id: 'timeline', name: 'Relationship Constellations' },
  { id: 'diff', name: '3 Months Ago vs Now' },
  { id: 'route', name: '8 PM Escape Route' },
  { id: 'filmstrip', name: '35mm Filmstrip Reel' },
  { id: 'corkboard', name: 'Polaroid Corkboard' },
  { id: 'reasons', name: '60 Reasons Scratch Grid' },
  { id: 'vault', name: "Two-Way Vault & Moods" },
  { id: 'quiz', name: 'Couple Trivia Showdown' },
  { id: 'console', name: 'Ask Yajat Oracle' },
  { id: 'coupons', name: 'Redeemable Tokens' },
  { id: 'voice', name: 'Voice Memories & Radio' },
  { id: 'secret', name: 'Secret Room' },
  { id: 'future', name: '10-Day Countdown Drip' },
  { id: 'certificate', name: 'Certificate of Excellence' },
  { id: 'epilogue', name: 'Cinematic Ending' },
  { id: 'qr', name: 'Love Passport QR' },
];

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Gradient color shifts across scroll depth
  const tipColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C', '#FFD700']
  );

  const glowShadow = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      '0 0 12px 3px rgba(255, 92, 142, 0.8)',
      '0 0 12px 3px rgba(255, 158, 201, 0.8)',
      '0 0 12px 3px rgba(185, 174, 245, 0.8)',
      '0 0 14px 4px rgba(255, 221, 140, 0.85)',
      '0 0 16px 5px rgba(255, 215, 0, 0.95)'
    ]
  );

  const tipLeft = useTransform(
    smoothProgress,
    (v) => `${Math.min(100, Math.max(0, v * 100))}%`
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto h-2 select-none group">
      {/* Background track */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" />

      {/* Main Animated Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 bottom-0 origin-left bg-gradient-to-r from-[var(--pink)] via-[var(--lav)] to-[var(--butter)]"
        style={{ scaleX: smoothProgress, width: '100%' }}
      />

      {/* Glowing tip indicator */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full border border-white/80 pointer-events-none"
        style={{
          left: tipLeft,
          backgroundColor: tipColor,
          boxShadow: glowShadow,
        }}
      />

      {/* 21 Section boundary markers */}
      <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none">
        {SECTIONS.map((sec, idx) => {
          const isPassed = (scrollYProgress.get() >= idx / (SECTIONS.length - 1));
          return (
            <div
              key={sec.id}
              className="relative group/dot pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                const el = document.getElementById(sec.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Fallback: estimate scroll position
                  const targetY = (idx / (SECTIONS.length - 1)) * (document.body.scrollHeight - window.innerHeight);
                  window.scrollTo({ top: targetY, behavior: 'smooth' });
                }
              }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isPassed ? 'bg-white/90 shadow-[0_0_6px_#fff]' : 'bg-white/30 hover:bg-white/70 hover:scale-150'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Hover tooltip showing section name */}
      {hoveredIndex !== null && (
        <div
          className="absolute top-3 transform -translate-x-1/2 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-black/80 backdrop-blur-md border border-white/20 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${(hoveredIndex / (SECTIONS.length - 1)) * 100}%`,
          }}
        >
          <span className="text-[var(--butter)] mr-1">#{hoveredIndex + 1}</span>
          {SECTIONS[hoveredIndex].name}
        </div>
      )}
    </div>
  );
}

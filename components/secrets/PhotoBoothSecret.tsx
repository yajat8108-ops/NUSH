'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface PhotoBoothSecretProps {
  onClose: () => void;
}

const FRAMES = [
  { label: 'FRAME 01 · 8 PM ESCAPE', emoji: '🏃‍♂️🏛️', quote: 'Stolen walks from Open Audi' },
  { label: 'FRAME 02 · TEDDY YAJAT', emoji: '🧸💖', quote: 'Naming him after me 💀' },
  { label: 'FRAME 03 · THE FIRST KISS', emoji: '💋✨', quote: 'Quiet walkway behind AB-2' },
  { label: 'FRAME 04 · 4 AM FACETIME', emoji: '🌙📞', quote: 'Listening to you sleep' },
];

const FILTERS = [
  { id: 'vintage', name: 'Vintage Warm', css: 'sepia(40%) contrast(110%) brightness(105%)' },
  { id: 'pink', name: 'Rosy Pink', css: 'hue-rotate(320deg) saturate(130%)' },
  { id: 'bw', name: 'Classic Noir', css: 'grayscale(100%) contrast(120%)' },
  { id: 'dream', name: 'Dream Glow', css: 'brightness(115%) saturate(120%)' },
];

export default function PhotoBoothSecret({ onClose }: PhotoBoothSecretProps) {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const { unlockAchievement } = useUniverseStore();

  const handleDownload = () => {
    SoundEngine.chime();
    unlockAchievement('photogenic');
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
    });
    alert('Photo Strip captured! In an offline photobooth, your physical print would now slide out of the machine 📸✨');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center my-auto max-w-md w-full"
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-mono cursor-pointer"
        >
          ✕
        </button>

        {/* Filter Switcher */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f);
                SoundEngine.click();
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeFilter.id === f.id
                  ? 'bg-[var(--pink-deep)] text-white font-bold shadow'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* VINTAGE PHOTO STRIP */}
        <div
          className="w-64 bg-white text-black p-4 shadow-2xl rounded-xl border-4 border-gray-200 space-y-3"
          style={{ filter: activeFilter.css }}
        >
          {/* Header */}
          <div className="text-center border-b border-gray-300 pb-2">
            <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-gray-500">
              PHOTOMATON &middot; YAJAT &amp; NUSH
            </p>
            <p className="font-caveat text-base font-bold text-rose-600">
              Three Months of Pure Magic
            </p>
          </div>

          {/* 4 Photo Frames */}
          {FRAMES.map((frame, idx) => (
            <div
              key={idx}
              className="bg-[#1f1a29] text-white aspect-[4/3] rounded-lg flex flex-col items-center justify-center p-2 text-center relative overflow-hidden border border-gray-400 shadow-inner"
            >
              <span className="text-3xl mb-1">{frame.emoji}</span>
              <p className="font-mono text-[9px] text-[var(--butter)] font-bold">
                {frame.label}
              </p>
              <p className="font-caveat text-xs text-pink-200">
                &ldquo;{frame.quote}&rdquo;
              </p>
            </div>
          ))}

          {/* Footer Strip */}
          <div className="text-center pt-2 border-t border-gray-300 text-[9px] font-mono text-gray-400">
            STRIP #0822 &middot; FOREVER TOGETHER
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleDownload}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-mono font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>📸</span> Print Strip
          </button>
        </div>
      </div>
    </motion.div>
  );
}

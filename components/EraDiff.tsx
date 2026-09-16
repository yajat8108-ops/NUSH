'use client';

import React, { useState, useRef, useCallback } from 'react';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { motion } from 'framer-motion';

export default function EraDiff() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  const handlePointerDown = () => {
    isDragging.current = true;
    SoundEngine.pop();
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <section id="era-diff" className="anniversary-section py-16 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="evolution &amp; growth diff"
        title="3 Months Ago vs. Right Now ⏳⚡"
        subtitle="drag the split slider to compare where we started vs our entire universe today"
      />

      {/* Main Diff Slider Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        className="relative mt-10 rounded-3xl overflow-hidden border-3 border-[var(--pink-deep)] shadow-2xl h-[520px] md:h-[460px] cursor-ew-resize touch-none bg-black"
      >
        {/* RIGHT LAYER (Month 3 Universe - Base Layer) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b122c] via-[#2a1740] to-[#120a1f] p-6 md:p-10 flex flex-col justify-between text-white">
          <div className="flex items-center justify-end">
            <span className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-lg">
              👑 Month 3 (Today): Relationship Universe
            </span>
          </div>

          <div className="max-w-md ml-auto text-right space-y-3">
            <h3 className="font-caveat text-4xl md:text-5xl text-[var(--butter)] font-bold">
              Our Whole Multiverse 🌌
            </h3>
            <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-nunito">
              11-Game Master Arcade, 18 Relationship Badges, Sacred 22 August Kiss Past AB-2, Central Library Folded Notes, All-Night 4 AM Call, Radio Nushi FM, and 90 Reasons.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left pt-2 font-mono text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                <span className="text-[10px] text-gray-400 block">🎮 ARCADE GAMES</span>
                <span className="text-yellow-300 font-bold">11 Full Minigames</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                <span className="text-[10px] text-gray-400 block">💌 REASONS COUNT</span>
                <span className="text-[var(--pink)] font-bold">90 Reasons Revealed</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                <span className="text-[10px] text-gray-400 block">🧸 SACRED COMPANION</span>
                <span className="text-yellow-300 font-bold">Teddy Yajat 🐻</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                <span className="text-[10px] text-gray-400 block">✨ EASTER EGGS</span>
                <span className="text-[var(--pink)] font-bold">17 Heavy Secrets</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end text-[11px] font-mono text-gray-400">
            <span>Status: Irrevocably, deeply in love with Nush ❤️</span>
          </div>
        </div>

        {/* LEFT LAYER (Month 1 - Clipped Overlay) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#FFF5F8] via-[#FFF9EE] to-[#F2EBFF] p-6 md:p-10 flex flex-col justify-between text-[var(--plum)] overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <div className="flex items-center justify-start">
            <span className="bg-[var(--pink-deep)] text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-md">
              🌱 Month 1: The Apology Calci
            </span>
          </div>

          <div className="max-w-md text-left space-y-3">
            <h3 className="font-caveat text-4xl md:text-5xl text-[var(--pink-deep)] font-bold">
              Where It All Began 🧮
            </h3>
            <p className="text-xs md:text-sm text-[var(--plum)] leading-relaxed font-nunito">
              A single 13-mode scientific calculator built just to apologize, 30 early reasons, first nervous kisses, and shy walks wondering if we could steal 5 more minutes together.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left pt-2 font-mono text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-pink-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block">🧮 APPLICATION</span>
                <span className="text-[var(--pink-deep)] font-bold">1 Apology Calci</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-pink-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block">💌 REASONS COUNT</span>
                <span className="text-[var(--plum)] font-bold">30 Reasons</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-pink-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block">🫦 FIRST SMOOCH</span>
                <span className="text-[var(--pink-deep)] font-bold">July 23 Milestone</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-pink-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block">💭 VIBE</span>
                <span className="text-[var(--plum)] font-bold">Butterflies 🦋</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start text-[11px] font-mono text-[var(--plum-soft)]">
            <span>Status: Shy boy coding calculators for his dream girl 🧮</span>
          </div>
        </div>

        {/* Draggable Vertical Slider Divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-white border-2 border-white shadow-2xl flex items-center justify-center text-sm font-bold">
            ↔️
          </div>
        </div>
      </div>

      {/* Helper caption */}
      <p className="text-center text-xs font-mono text-[var(--plum-soft)] mt-4">
        💡 Drag or swipe the handle left &amp; right to compare Month 1 vs Month 3
      </p>
    </section>
  );
}

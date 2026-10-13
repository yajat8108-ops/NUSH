'use client';

import React, { useState } from 'react';
import SectionHead from '../SectionHead';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function ForeverVowsScroll() {
  const [yajatSigned, setYajatSigned] = useState(true);
  const [nushSigned, setNushSigned] = useState(false);
  const [isSealed, setIsSealed] = useState(false);

  const handleSeal = () => {
    SoundEngine.confettiPop();
    setIsSealed(true);
    setNushSigned(true);

    confetti({
      particleCount: 150,
      spread: 120,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FFD700', '#FF5C8E', '#FFFFFF', '#B9AEF5'],
    });
  };

  return (
    <section id="forever-vows" className="anniversary-section py-12 px-4 max-w-4xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="our eternal covenant"
        title="The Forever Vows Scroll 📜"
        subtitle="our sacred commitments to each other for Year 1, Year 2, and all the years that follow"
      />

      {/* Medieval Parchment Body */}
      <div className="mt-8 p-8 sm:p-12 rounded-[40px] bg-[#FFFDF8] text-[#2B1B17] border-8 border-[#3D261C] shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden font-serif">
        {/* Ornate Gold Border Details */}
        <div className="absolute top-4 left-4 text-2xl text-[#8B5A2B]">⚜️</div>
        <div className="absolute top-4 right-4 text-2xl text-[#8B5A2B]">⚜️</div>
        <div className="absolute bottom-4 left-4 text-2xl text-[#8B5A2B]">⚜️</div>
        <div className="absolute bottom-4 right-4 text-2xl text-[#8B5A2B]">⚜️</div>

        {/* Scroll Heading */}
        <div className="text-center pb-6 border-b-2 border-dashed border-[#8B5A2B]/40 mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#8B5A2B] font-bold block mb-1">
            Official Relationship Covenant &middot; June 22, 2026 &rarr; Forever
          </span>
          <h3 className="font-caveat text-3xl sm:text-4xl font-bold text-[#2B1B17]">
            The Sacred Vows of Yajat &amp; Anushka
          </h3>
        </div>

        {/* The Vows */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#3D261C] max-w-2xl mx-auto">
          <p>
            <strong>I. The Sacred Pact:</strong> We vow that no matter how loud the world gets, it will always be <em>You &amp; Me vs. The Problem</em>, never <em>You vs. Me</em>.
          </p>
          <p>
            <strong>II. The Late-Night Rule:</strong> We vow that late-night hunger will always be cured with 2 AM cheese Maggi, phone calls will always stretch until someone falls asleep peacefully, and no day will end without an emergency forehead kiss.
          </p>
          <p>
            <strong>III. The Open Audi Tradition:</strong> We vow to keep running from campus guards at 8:00 PM, finding one more route, one more lap past Dr. Morphin, and one more stolen second before Girls Block 2.
          </p>
          <p>
            <strong>IV. The Unconditional Anchor:</strong> We vow to be each other’s safest home, biggest cheerleader, and gentlest protector across all seasons of life.
          </p>
        </div>

        {/* Digital Signature & Wax Seal */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-[#8B5A2B]/40 flex flex-wrap items-center justify-between gap-6 max-w-2xl mx-auto font-nunito">
          {/* Yajat Signature */}
          <div className="flex flex-col items-center">
            <span className="font-caveat text-2xl text-[#8B5A2B] font-bold">
              Yajat Kataria ✍️
            </span>
            <span className="text-[10px] font-mono uppercase text-[#8B5A2B] font-bold mt-1">
              Signed &amp; Sealed (Year 1)
            </span>
          </div>

          {/* Central Wax Seal Stamp */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleSeal}
              disabled={isSealed}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all cursor-pointer ${
                isSealed
                  ? 'bg-[#B91C1C] text-amber-200 border-4 border-amber-300 shadow-[0_0_20px_rgba(185,28,28,0.6)] scale-110'
                  : 'bg-[#B91C1C]/90 hover:bg-[#B91C1C] text-white border-2 border-[#7F1D1D] hover:scale-105 active:scale-95'
              }`}
              title="Click to stamp the Gold Wax Seal"
            >
              <span>{isSealed ? '👑' : '✦'}</span>
            </button>
            <span className="text-[9px] font-mono text-[#8B5A2B] uppercase tracking-wider mt-1.5 font-bold">
              {isSealed ? 'Permanently Sealed 🤍' : 'Click to Stamp Seal'}
            </span>
          </div>

          {/* Anushka Signature */}
          <div className="flex flex-col items-center">
            {nushSigned ? (
              <span className="font-caveat text-2xl text-[#8B5A2B] font-bold">
                Anushka ✍️
              </span>
            ) : (
              <button
                onClick={() => {
                  SoundEngine.chime();
                  setNushSigned(true);
                }}
                className="px-4 py-1.5 rounded-full bg-[#3D261C] text-[#FFFDF8] text-xs font-bold font-mono shadow hover:scale-105 cursor-pointer transition-transform"
              >
                Sign as Nush ✍️
              </button>
            )}
            <span className="text-[10px] font-mono uppercase text-[#8B5A2B] font-bold mt-1">
              {nushSigned ? 'Signed & Sealed (Year 1)' : 'Awaiting Queen’s Signature'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

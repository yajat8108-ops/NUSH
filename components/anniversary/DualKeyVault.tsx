'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from '../SectionHead';
import { useAnniversaryYearStore } from '@/lib/anniversaryYearStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function DualKeyVault() {
  const {
    yajatKeyInserted,
    nushKeyInserted,
    isVaultUnsealed,
    setYajatKey,
    setNushKey,
  } = useAnniversaryYearStore();

  const handleTurnYajatKey = () => {
    SoundEngine.click();
    setYajatKey(true);
    if (nushKeyInserted) {
      triggerUnseal();
    }
  };

  const handleTurnNushKey = () => {
    SoundEngine.click();
    setNushKey(true);
    if (yajatKeyInserted) {
      triggerUnseal();
    }
  };

  const triggerUnseal = () => {
    SoundEngine.confettiPop();
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FF5C8E', '#FFFFFF'],
    });
  };

  return (
    <section id="dual-key-vault" className="anniversary-section py-12 px-4 max-w-4xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="cryptographic mutual unlock safe"
        title="The Dual-Key Time Safe 🔐"
        subtitle="this vault cannot be opened by one person alone. It requires both Yajat and Anushka to turn their keys simultaneously."
      />

      <div className="mt-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1b1529] via-[#211639] to-[#120a1f] border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
        {/* Safe Outer Frame */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Mechanical Dial Icon */}
          <motion.div
            animate={{ rotate: isVaultUnsealed ? 360 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl shadow-2xl ${
              isVaultUnsealed
                ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_50px_rgba(52,211,153,0.5)]'
                : 'border-amber-400/60 bg-black/50 text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
            }`}
          >
            <span>{isVaultUnsealed ? '🔓' : '🔒'}</span>
          </motion.div>

          {/* Key Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            {/* Key 1: Yajat's Key */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                Slot #1 &middot; Yajat’s Key
              </span>
              <span className="text-xs text-pink-300 font-serif italic">
                “In boys I trust only me”
              </span>
              <button
                onClick={handleTurnYajatKey}
                disabled={yajatKeyInserted}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  yajatKeyInserted
                    ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow'
                }`}
              >
                {yajatKeyInserted ? '✓ Key Inserted' : 'Turn Yajat’s Key 🗝️'}
              </button>
            </div>

            {/* Key 2: Nush's Key */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                Slot #2 &middot; Nush’s Key
              </span>
              <span className="text-xs text-pink-300 font-serif italic">
                “Forever and Always”
              </span>
              <button
                onClick={handleTurnNushKey}
                disabled={nushKeyInserted}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  nushKeyInserted
                    ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                    : 'bg-pink-600 hover:bg-pink-500 text-white shadow'
                }`}
              >
                {nushKeyInserted ? '✓ Key Inserted' : 'Turn Nush’s Key 🗝️'}
              </button>
            </div>
          </div>

          {/* Unsealed Master Letter & Content */}
          <AnimatePresence>
            {isVaultUnsealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full mt-6 p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] text-[#2B1B17] border-4 border-[#8B5A2B] shadow-2xl text-left font-serif space-y-4"
              >
                <div className="flex items-center justify-between border-b-2 border-dashed border-[#8B5A2B]/40 pb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#8B5A2B] font-bold">
                    Official 1-Year Anniversary Master Letter
                  </span>
                  <span className="text-2xl">👑❤️</span>
                </div>

                <p className="text-base sm:text-lg leading-relaxed text-[#3D261C]">
                  My dearest Anushka,
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-[#3D261C]">
                  365 days ago, I walked into your life with an acoustic guitar, a stubborn streak, and an unspoken gut feeling that you were going to be my whole universe. Today, looking back at our fake dating pact, our August 22 kiss past AB-2, running from Open Audi guards at 8 PM, and staying on FaceTime until 4:23 AM—I know with absolute certainty that choosing you was the best decision of my entire life.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-[#3D261C]">
                  Thank you for being my peace, my home, my favorite melody, and my best friend. Year 1 is permanently engraved in the stars. Here is to Year 2, Year 10, and forever.
                </p>

                <div className="pt-4 border-t border-[#8B5A2B]/30 flex items-center justify-between font-mono text-xs text-[#8B5A2B]">
                  <span>Yours Unconditionally, Yajat</span>
                  <span>June 22, 2026 &rarr; Forever ✦</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

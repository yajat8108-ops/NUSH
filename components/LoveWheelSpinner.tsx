'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';

// Fallback if SoundEngine is not available
const safeClickSound = () => {
  try {
    // @ts-ignore
    if (typeof SoundEngine !== 'undefined' && SoundEngine.click) {
      // @ts-ignore
      SoundEngine.click();
    }
  } catch (e) {}
};

const safeVictorySound = () => {
  try {
    // @ts-ignore
    if (typeof SoundEngine !== 'undefined' && SoundEngine.victory) {
      // @ts-ignore
      SoundEngine.victory();
    }
  } catch (e) {}
};

const PRIZES = [
  "1000 Forehead Kisses 😘",
  "2 AM Extra Cheese Maggi 🍜",
  "Campus Walk to Open Audi 🚶‍♂️",
  "Unlimited Cuddle Pass 🫢",
  "Nush Rules Everything 👑",
  "Movie of Your Choice 🎬",
  "Tight Hug Freezes Time 🫂",
  "Get Out of Trouble Free 🎟️"
];

const COLORS = [
  'var(--pink)',
  'var(--cream)',
  'var(--pink-deep)',
  'var(--lav)',
  'var(--butter)',
  'var(--mocha-light)',
  'var(--plum-soft)',
  'var(--white)'
];

export default function LoveWheelSpinner() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const spinDuration = 5000; // 5 seconds
  const numSlices = PRIZES.length;
  const sliceAngle = 360 / numSlices;
  
  // Confetti particles
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, color: string }[]>([]);

  const triggerConfetti = () => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // -50vw to 50vw
      y: Math.random() * 100 - 50, // -50vh to 50vh
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    
    setShowResult(false);
    setSelectedPrize(null);
    setIsSpinning(true);
    
    // Play tick sounds
    let ticks = 0;
    const tickInterval = setInterval(() => {
      safeClickSound();
      ticks++;
      if (ticks > 20) clearInterval(tickInterval);
    }, 200);

    // Randomize winning slice (0 to 7)
    // Wheel stops at (rotation % 360). The pointer is at top (0 deg).
    // Slice i is at (i * sliceAngle). We need to offset so slice centers at top.
    const winningIndex = Math.floor(Math.random() * numSlices);
    
    // Extra rotations
    const extraSpins = 5 + Math.floor(Math.random() * 4); // 5 to 8 spins
    const targetRotation = rotation + (extraSpins * 360) + (360 - (winningIndex * sliceAngle)) - (sliceAngle / 2);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(PRIZES[winningIndex]);
      setShowResult(true);
      safeVictorySound();
      triggerConfetti();
    }, spinDuration);
  };

  return (
    <section className="py-16 px-4 max-w-5xl mx-auto overflow-hidden">
      <SectionHead 
        eyebrow="arcade zone · lucky draw" 
        title="The Wheel of Love" 
        subtitle="spin to claim today's romantic reward from Yajat ✨" 
      />
      
      <div className="relative mt-12 flex flex-col items-center">
        {/* Pointer */}
        <div className="absolute top-0 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-[var(--plum)] drop-shadow-md origin-top animate-bounce" style={{ marginTop: '-10px' }} />
        
        {/* Wheel Container */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-[var(--plum)] shadow-2xl overflow-hidden bg-white">
          <motion.div 
            className="w-full h-full rounded-full relative"
            animate={{ rotate: rotation }}
            transition={{ duration: spinDuration / 1000, type: "tween", ease: "circOut" }}
            style={{
              background: `conic-gradient(
                ${COLORS[0]} 0deg 45deg,
                ${COLORS[1]} 45deg 90deg,
                ${COLORS[2]} 90deg 135deg,
                ${COLORS[3]} 135deg 180deg,
                ${COLORS[4]} 180deg 225deg,
                ${COLORS[5]} 225deg 270deg,
                ${COLORS[6]} 270deg 315deg,
                ${COLORS[7]} 315deg 360deg
              )`
            }}
          >
            {PRIZES.map((prize, i) => {
              const rotateAngle = i * sliceAngle + (sliceAngle / 2);
              return (
                <div 
                  key={i} 
                  className="absolute top-0 left-1/2 w-8 h-1/2 origin-bottom text-center flex items-center justify-start flex-col pt-4 font-nunito font-bold text-[10px] md:text-xs text-[var(--plum-deep)]"
                  style={{
                    transform: `translateX(-50%) rotate(${rotateAngle}deg)`
                  }}
                >
                  <span className="-rotate-90 origin-bottom w-32 translate-y-12 whitespace-nowrap block text-center overflow-hidden text-ellipsis">
                    {prize.split(" ").slice(-1)[0]} {/* Just show emoji or last word on wheel text to save space */}
                  </span>
                </div>
              );
            })}
          </motion.div>
          {/* Inner circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-[var(--plum)] shadow-inner flex items-center justify-center">
            <span className="text-xl">❤️</span>
          </div>
        </div>

        {/* Spin Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpin}
          disabled={isSpinning}
          className="mt-12 px-8 py-4 bg-[var(--pink-deep)] text-white font-nunito font-bold text-xl rounded-full shadow-lg hover:bg-[var(--plum-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {isSpinning ? "Spinning..." : "SPIN THE WHEEL 🎡"}
        </motion.button>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && selectedPrize && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            {/* Confetti */}
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: 0, x: p.x * 10, y: p.y * 10 - 200, scale: 1.5, rotate: 360 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-sm pointer-events-none"
                style={{ backgroundColor: p.color }}
              />
            ))}

            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white/80 backdrop-blur-md border-2 border-[var(--pink)] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--pink)]/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--butter)]/20 rounded-full blur-2xl" />
              
              <h3 className="font-caveat text-4xl text-[var(--plum)] mb-2 relative z-10">🎉 YOU WON!</h3>
              <div className="py-6 px-4 bg-[var(--cream)] rounded-xl border border-[var(--pink)] mb-6 relative z-10">
                <p className="font-quicksand font-bold text-2xl text-[var(--plum-deep)]">
                  {selectedPrize}
                </p>
              </div>
              <p className="font-nunito text-sm text-gray-600 mb-6 italic relative z-10">
                Issued by Yajat Kataria — Redeemable anytime, no expiry ❤️
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResult(false)}
                className="px-6 py-3 bg-[var(--plum)] text-white font-nunito font-bold rounded-full shadow-md hover:bg-[var(--plum-soft)] transition-colors relative z-10"
              >
                Spin Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

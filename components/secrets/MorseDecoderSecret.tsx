'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface MorseDecoderSecretProps {
  onClose: () => void;
}

const MORSE_SEQUENCE = [
  { char: 'I', code: '..' },
  { char: ' ', code: ' ' },
  { char: 'L', code: '.-..' },
  { char: 'O', code: '---' },
  { char: 'V', code: '...-' },
  { char: 'E', code: '.' },
  { char: ' ', code: ' ' },
  { char: 'Y', code: '-.--' },
  { char: 'O', code: '---' },
  { char: 'U', code: '..-' },
  { char: ' ', code: ' ' },
  { char: 'N', code: '-.' },
  { char: 'U', code: '..-' },
  { char: 'S', code: '...' },
  { char: 'H', code: '....' },
  { char: 'I', code: '..' },
];

export default function MorseDecoderSecret({ onClose }: MorseDecoderSecretProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { unlockAchievement } = useUniverseStore();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentIndex < MORSE_SEQUENCE.length) {
      const item = MORSE_SEQUENCE[currentIndex];

      if (item.char === ' ') {
        setDecodedMessage((prev) => prev + ' ');
        timeout = setTimeout(() => {
          setCurrentIndex((i) => i + 1);
        }, 500);
      } else {
        setIsLightOn(true);
        playBeep(0.18);
        timeout = setTimeout(() => {
          setIsLightOn(false);
          setDecodedMessage((prev) => prev + item.char);
          setTimeout(() => {
            setCurrentIndex((i) => i + 1);
          }, 250);
        }, 300);
      }
    } else if (!isComplete) {
      setIsComplete(true);
      SoundEngine.confettiPop();
      unlockAchievement('morse_coder');
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#FF5C8E', '#FFDD8C'],
      });
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, isComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#0a0f1d] border-2 border-cyan-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-mono cursor-pointer"
        >
          ✕
        </button>

        <span className="text-3xl block mb-2">📻📡</span>
        <h3 className="font-mono text-xl text-cyan-400 font-bold uppercase tracking-widest">
          Classified Morse Transmission
        </h3>
        <p className="text-xs font-mono text-gray-400 mt-1">
          Decoding secret radio signal from Yajat...
        </p>

        {/* TELEGRAPH SIGNAL LIGHT */}
        <div className="my-8 flex justify-center">
          <div
            className={`w-24 h-24 rounded-full border-4 transition-all duration-150 flex items-center justify-center ${
              isLightOn
                ? 'bg-cyan-400 border-white shadow-[0_0_80px_#22d3ee] scale-110'
                : 'bg-cyan-950/40 border-cyan-800/60 shadow-inner'
            }`}
          >
            <span className="text-2xl">{isLightOn ? '💡' : '📡'}</span>
          </div>
        </div>

        {/* MORSE CODE STREAM */}
        <div className="bg-black/60 p-4 rounded-2xl border border-cyan-900/50 mb-6 font-mono">
          <div className="text-cyan-300 text-sm tracking-widest min-h-[24px]">
            {MORSE_SEQUENCE.slice(0, currentIndex + 1)
              .map((s) => s.code)
              .join(' ')}
          </div>
        </div>

        {/* DECODED TEXT OUTPUT */}
        <div className="py-2">
          <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            Decrypted Message:
          </p>
          <motion.h2
            key={decodedMessage}
            className="font-mono text-3xl md:text-4xl font-black tracking-widest text-[var(--butter)]"
            style={{ textShadow: '0 0 20px rgba(255,221,140,0.8)' }}
          >
            {decodedMessage}
            {!isComplete && <span className="animate-pulse">_</span>}
          </motion.h2>
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400 text-xs font-mono text-cyan-200"
          >
            🏆 Achievement Unlocked: Royal Cryptographer &middot; Morse Code Decoded!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

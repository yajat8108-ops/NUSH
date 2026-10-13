'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';

export interface ConstellationInfo {
  id: string;
  name: string;
  symbol: string;
  subtitle: string;
  lore: string;
  quote: string;
  photoUrl?: string;
}

export default function ConstellationDetail({
  constellation,
  onClose,
}: {
  constellation: ConstellationInfo | null;
  onClose: () => void;
}) {
  if (!constellation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#130d24] via-[#1c1333] to-[#0d0917] text-white p-6 sm:p-8 rounded-3xl max-w-lg w-full border-2 border-pink-500/40 shadow-[0_0_60px_rgba(236,72,153,0.3)] relative"
        >
          {/* Constellation Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2.5 rounded-2xl bg-white/10 border border-white/15">
                {constellation.symbol}
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 font-bold block">
                  Sacred Celestial Alignment
                </span>
                <h3 className="font-bold text-xl text-white font-mono">
                  {constellation.name}
                </h3>
              </div>
            </div>
            <button
              onClick={() => {
                SoundEngine.pop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm text-zinc-300 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs font-mono text-amber-300/90 mb-3 uppercase tracking-wider">
            {constellation.subtitle}
          </p>

          <p className="text-sm text-zinc-200 leading-relaxed mb-4">
            {constellation.lore}
          </p>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center mb-4">
            <p className="font-caveat text-xl sm:text-2xl text-pink-300">
              &ldquo;{constellation.quote}&rdquo;
            </p>
          </div>

          {/* Interactive Celestial Audio / Whisper Note */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="text-[11px] font-mono text-zinc-300">Cosmic memory resonance</span>
            </div>
            <button
              onClick={() => {
                SoundEngine.chime();
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate([40, 30, 40]);
                }
              }}
              className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/40 border border-pink-500/40 rounded-full text-[11px] font-mono font-bold text-pink-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Play chime</span>
              <span>🎶</span>
            </button>
          </div>

          <button
            onClick={() => {
              SoundEngine.chime();
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-full font-bold text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-98 cursor-pointer"
          >
            Look Back at the Stars 🌌
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

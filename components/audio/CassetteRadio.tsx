'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';

const TRACKS = [
  { label: 'Campus Twilight & Rain', emoji: '🌧️' },
  { label: 'Acoustic Guitar Serenade', emoji: '🎸' },
  { label: 'Radio Nushi Velvety FM', emoji: '📻' },
  { label: 'Late Night Stargazing', emoji: '🌌' },
  { label: '2 AM Cheese Maggi Lofi', emoji: '🍜' },
];

export default function CassetteRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const track = TRACKS[trackIdx];

  // Restore state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nush_radio_state');
      if (saved) {
        const { idx, vol } = JSON.parse(saved);
        if (typeof idx === 'number') setTrackIdx(idx % TRACKS.length);
        if (typeof vol === 'number') setVolume(vol);
      }
    } catch {}
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('nush_radio_state', JSON.stringify({ idx: trackIdx, vol: volume }));
    } catch {}
  }, [trackIdx, volume]);

  const nextTrack = () => {
    SoundEngine.click();
    setTrackIdx((i) => (i + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    SoundEngine.click();
    setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  };

  const toggle = () => {
    SoundEngine.click();
    setIsPlaying((p) => !p);
  };

  return (
    <>
      {/* ── Floating Mini Player (always visible) ── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 24 }}
        className="fixed bottom-24 right-3 sm:bottom-20 sm:right-5 z-40 print:hidden"
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          className={`flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-full backdrop-blur-xl shadow-xl border transition-all cursor-pointer active:scale-95 ${
            isPlaying
              ? 'bg-[#1a0a2e]/90 border-pink-500/50 shadow-pink-500/20'
              : 'bg-black/70 border-white/10'
          }`}
          title="Radio Nushi"
        >
          {/* Spinning reel indicator */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className={`w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] ${
              isPlaying ? 'border-pink-400 text-pink-300' : 'border-white/20 text-white/30'
            }`}
          >
            ✦
          </motion.div>
          <div className="text-left">
            <p className="text-[9px] font-mono text-pink-400/70 uppercase tracking-widest leading-none">Radio Nushi</p>
            <p className={`text-[11px] font-mono font-bold leading-tight ${isPlaying ? 'text-white' : 'text-white/50'}`}>
              {track.emoji} {isPlaying ? track.label : 'Paused'}
            </p>
          </div>
        </button>
      </motion.div>

      {/* ── Expanded Cassette Deck Panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed bottom-36 right-3 sm:bottom-32 sm:right-5 z-50 w-64 print:hidden"
          >
            <div className="rounded-3xl bg-[#0f0a1a]/95 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-pink-300 uppercase tracking-widest font-bold">Radio Nushi 📻</span>
                </div>
                <button onClick={() => setExpanded(false)} className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors">×</button>
              </div>

              {/* Cassette window */}
              <div className="mx-4 mt-3 h-16 rounded-xl bg-black/60 border border-white/10 flex items-center justify-around px-3">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center text-amber-300 text-xs"
                >✦</motion.div>
                <div className="text-center">
                  <p className="text-[8px] font-mono text-pink-300/70 uppercase tracking-widest">Side A · 365 Days</p>
                  <p className="text-[10px] font-mono text-white font-bold truncate max-w-[90px]">{track.label}</p>
                </div>
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center text-amber-300 text-xs"
                >✦</motion.div>
              </div>

              {/* Track name */}
              <div className="px-4 pt-2.5 pb-1 text-center">
                <p className="text-lg">{track.emoji}</p>
                <p className="text-[11px] font-mono text-white/70">{track.label}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 px-4 py-3">
                <button onClick={prevTrack} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all">⏮</button>
                <button
                  onClick={toggle}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-lg cursor-pointer transition-all active:scale-95 ${
                    isPlaying ? 'bg-pink-600 text-white shadow-pink-500/40' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={nextTrack} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all">⏭</button>
              </div>

              {/* Volume */}
              <div className="px-4 pb-4 flex items-center gap-2">
                <span className="text-xs text-white/30">🔈</span>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-pink-500"
                />
                <span className="text-xs text-white/30">🔊</span>
              </div>

              {/* Note */}
              <div className="px-4 pb-3 text-center">
                <p className="text-[9px] font-mono text-white/20">🎵 Visual only · background score for our universe</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

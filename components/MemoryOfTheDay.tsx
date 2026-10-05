'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
}

// Day 0 = June 22 2026 (anniversary start)
const ANNIVERSARY_START = new Date('2026-06-22T00:00:00+05:30');

function getDayNumber() {
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_START.getTime()) / 86400000) + 1);
}

export default function MemoryOfTheDay() {
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/sync?key=photos', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data: MemoryPhoto[]) => {
        if (Array.isArray(data) && data.length > 0) setPhotos(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const dayNumber = getDayNumber();

  // Deterministic pick — same photo for both users on same day
  const todaysMemory = useMemo(() => {
    if (photos.length === 0) return null;
    return photos[dayNumber % photos.length];
  }, [photos, dayNumber]);

  if (!loaded || !todaysMemory) return null;

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <>
      {/* Floating pill — always visible */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 22 }}
        className="fixed top-14 left-1/2 -translate-x-1/2 z-40 print:hidden"
      >
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 border border-pink-500/30 backdrop-blur-xl shadow-lg text-white text-[11px] font-mono hover:border-pink-400/60 transition-all active:scale-95 cursor-pointer group"
        >
          <span className="text-base">📸</span>
          <span className="text-pink-300 font-bold">Day {dayNumber}</span>
          <span className="text-white/50 hidden sm:inline">·</span>
          <span className="text-white/60 truncate max-w-[120px] sm:max-w-[200px] hidden sm:inline">
            {todaysMemory.caption}
          </span>
          <span className="text-white/30 group-hover:text-pink-300 transition-colors">✦</span>
        </button>
      </motion.div>

      {/* Expanded memory card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0f0a1a] border border-pink-500/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Photo */}
              <div className="relative w-full aspect-[4/3] bg-black">
                <img
                  src={todaysMemory.url}
                  alt={todaysMemory.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Film grain */}
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '128px' }}
                />
                {/* Day badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 border border-pink-500/40 rounded-full px-3 py-1">
                  <span className="text-pink-400 text-[10px] font-mono font-bold tracking-widest">DAY {dayNumber}</span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 text-white/70 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >×</button>
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="text-[10px] font-mono text-pink-400/70 uppercase tracking-widest mb-1">{dateStr}</p>
                <p className="font-caveat text-white text-2xl font-bold leading-snug">{todaysMemory.caption}</p>
                <p className="text-white/40 text-[11px] font-mono mt-2">
                  Memory #{(dayNumber % photos.length) + 1} of {photos.length} · Surfaces daily 📸
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-white/30 text-[10px] font-mono">YAJAT &amp; NUSH · PRIVATE UNIVERSE</p>
                  <span className="text-pink-400 text-lg">💕</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

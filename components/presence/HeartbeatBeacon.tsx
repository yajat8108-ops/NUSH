'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresenceStore } from '@/lib/presenceStore';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

interface HeartbeatBeaconProps {
  variant?: 'pill' | 'icon';
}

export default function HeartbeatBeacon({ variant = 'pill' }: HeartbeatBeaconProps) {
  const {
    myRole,
    isHoldingHeartbeat,
    setIsHoldingHeartbeat,
    partnerOnline,
    partnerHeartbeatActive,
    syncPresence,
  } = usePresenceStore();

  const { unlockAchievement } = useUniverseStore();
  const [isPressing, setIsPressing] = useState(false);
  const [pulseRings, setPulseRings] = useState<number[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const partnerName = myRole === 'nush' ? 'Yajat' : 'Nush';

  // Sync presence periodically (every 10s when active)
  useEffect(() => {
    syncPresence();
    const interval = setInterval(syncPresence, 10000);
    return () => clearInterval(interval);
  }, [syncPresence]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 40, 80, 200]);
      } catch (_) {}
    }
  };

  const handleStartHold = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsPressing(true);
    setIsHoldingHeartbeat(true);
    unlockAchievement('heartbeat_synced');
    SoundEngine.heartbeat();
    triggerHaptic();

    // Rhythmic pulse expansion and floating hearts
    const now = Date.now();
    setPulseRings((prev) => [...prev.slice(-3), now]);
    setFloatingHearts((prev) => [...prev.slice(-6), { id: now, x: (Math.random() - 0.5) * 30 }]);

    intervalRef.current = setInterval(() => {
      SoundEngine.heartbeat();
      triggerHaptic();
      const t = Date.now();
      setPulseRings((prev) => [...prev.slice(-3), t]);
      setFloatingHearts((prev) => [...prev.slice(-6), { id: t, x: (Math.random() - 0.5) * 30 }]);
    }, 1000);
  };

  const handleEndHold = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsPressing(false);
    setIsHoldingHeartbeat(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const isSimultaneous = isPressing && partnerHeartbeatActive;

  // ── MOBILE ICON VARIANT ──────────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <div className="relative flex items-center justify-center">
        {pulseRings.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 0.8, opacity: 0.85 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl pointer-events-none bg-pink-500/30 border border-pink-400"
          />
        ))}

        <button
          onMouseDown={handleStartHold}
          onMouseUp={handleEndHold}
          onMouseLeave={handleEndHold}
          onTouchStart={handleStartHold}
          onTouchEnd={handleEndHold}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl gap-0.5 transition-all select-none cursor-pointer active:scale-90 ${
            isSimultaneous
              ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-[0_0_18px_rgba(251,191,36,0.8)] scale-105'
              : isPressing
              ? 'bg-pink-600 text-white scale-105 shadow-[0_0_15px_rgba(236,72,153,0.8)]'
              : partnerHeartbeatActive
              ? 'bg-rose-500/80 text-white animate-pulse'
              : 'text-pink-300 hover:bg-white/10'
          }`}
          title="Press and hold to send heartbeat pulse"
        >
          <span className={`text-lg leading-none ${isPressing ? 'scale-125' : 'animate-pulse'}`}>
            {isSimultaneous ? '✨' : isPressing ? '💓' : '💗'}
          </span>
          <span className="text-[9px] font-mono tracking-wide">
            {isPressing ? 'Pulse' : 'Beat'}
          </span>
        </button>
      </div>
    );
  }

  // ── DESKTOP PILL VARIANT ─────────────────────────────────────────────────
  return (
    <div className="relative select-none font-nunito">
      {/* Expanding Ripple Rings */}
      {pulseRings.map((id) => (
        <motion.div
          key={id}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className={`absolute inset-0 rounded-full pointer-events-none ${
            isSimultaneous
              ? 'bg-amber-400/35 border-2 border-amber-300'
              : 'bg-pink-500/25 border border-pink-400/70'
          }`}
        />
      ))}

      {/* Floating Micro-Hearts while holding */}
      <AnimatePresence>
        {floatingHearts.map((h) => (
          <motion.span
            key={h.id}
            initial={{ opacity: 1, y: 0, x: h.x, scale: 0.8 }}
            animate={{ opacity: 0, y: -45, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-sm pointer-events-none z-30"
          >
            {isSimultaneous ? '✨' : '💖'}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main Interactive Pill Button */}
      <button
        onMouseDown={handleStartHold}
        onMouseUp={handleEndHold}
        onMouseLeave={handleEndHold}
        onTouchStart={handleStartHold}
        onTouchEnd={handleEndHold}
        className={`h-11 px-4 rounded-full flex items-center gap-2.5 font-mono text-xs font-bold border shadow-xl backdrop-blur-2xl transition-all cursor-pointer relative z-10 select-none active:scale-95 ${
          isSimultaneous
            ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 border-amber-300 text-white shadow-[0_0_30px_rgba(251,191,36,0.6)] scale-105'
            : isPressing
            ? 'bg-gradient-to-r from-rose-600 to-pink-600 border-pink-300 text-white shadow-[0_0_24px_rgba(244,63,94,0.7)] scale-102'
            : partnerHeartbeatActive
            ? 'bg-gradient-to-r from-rose-500/80 to-purple-600/80 border-pink-400 text-white shadow-[0_0_18px_rgba(236,72,153,0.5)] animate-pulse'
            : 'bg-black/75 hover:bg-black/90 border-pink-500/30 text-white hover:border-pink-500/60'
        }`}
        title="Press & hold to broadcast your live pulse to your partner"
      >
        {/* Pulsing Heart Icon */}
        <span
          className={`text-base leading-none transition-transform duration-200 ${
            isPressing ? 'scale-125' : 'animate-pulse'
          }`}
        >
          {isSimultaneous ? '✨' : isPressing ? '💓' : '💗'}
        </span>

        {/* Dynamic Status Text */}
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-pink-200">
              {isSimultaneous
                ? 'Holding Hands ✨'
                : isPressing
                ? 'Sending Pulse... 💓'
                : partnerHeartbeatActive
                ? `${partnerName} Touching Screen!`
                : 'Heartbeat Pulse'}
            </span>
          </div>

          <span className="text-[9px] text-white/50 font-normal">
            {partnerOnline ? (
              <span className="text-emerald-300/90">● Partner Online</span>
            ) : isPressing ? (
              'Transmitting...'
            ) : (
              'Hold to send to Nush'
            )}
          </span>
        </div>
      </button>
    </div>
  );
}

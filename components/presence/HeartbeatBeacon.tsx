'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresenceStore } from '@/lib/presenceStore';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

export default function HeartbeatBeacon() {
  const {
    myRole,
    setMyRole,
    isHoldingHeartbeat,
    setIsHoldingHeartbeat,
    partnerOnline,
    partnerHeartbeatActive,
    lastHeartbeatReceivedAt,
    syncPresence,
  } = usePresenceStore();

  const { unlockAchievement } = useUniverseStore();
  const [isPressing, setIsPressing] = useState(false);
  const [pulseRings, setPulseRings] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync presence periodically (every 10s when active)
  useEffect(() => {
    syncPresence();
    const interval = setInterval(syncPresence, 10000);
    return () => clearInterval(interval);
  }, [syncPresence]);

  const handleStartHold = () => {
    setIsPressing(true);
    setIsHoldingHeartbeat(true);
    unlockAchievement('heartbeat_synced');
    SoundEngine.heartbeat();

    // Rhythmic pulse expansion
    setPulseRings((prev) => [...prev.slice(-3), Date.now()]);
    intervalRef.current = setInterval(() => {
      SoundEngine.heartbeat();
      setPulseRings((prev) => [...prev.slice(-3), Date.now()]);
    }, 1100);
  };

  const handleEndHold = () => {
    setIsPressing(false);
    setIsHoldingHeartbeat(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const isSimultaneous = isPressing && partnerHeartbeatActive;

  return (
    <div className="relative flex flex-col items-center select-none font-nunito">
      {/* Heartbeat Orb Button */}
      <div className="relative flex items-center justify-center">
        {/* Animated Expanding Ripple Rings */}
        {pulseRings.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`absolute w-14 h-14 rounded-full pointer-events-none ${
              isSimultaneous
                ? 'bg-amber-400/40 border-2 border-amber-300'
                : 'bg-pink-500/30 border border-pink-400'
            }`}
          />
        ))}

        <button
          onMouseDown={handleStartHold}
          onMouseUp={handleEndHold}
          onMouseLeave={handleEndHold}
          onTouchStart={handleStartHold}
          onTouchEnd={handleEndHold}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-xl active:scale-95 cursor-pointer relative z-10 ${
            isSimultaneous
              ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-[0_0_28px_rgba(251,191,36,0.8)] scale-110'
              : isPressing
              ? 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] scale-105'
              : partnerHeartbeatActive
              ? 'bg-pink-600 text-white animate-bounce shadow-[0_0_15px_rgba(236,72,153,0.6)]'
              : 'bg-white/10 hover:bg-white/15 text-pink-300 border border-white/20'
          }`}
          title="Press & Hold to send your live heartbeat to your partner"
        >
          <span>{isSimultaneous ? '✨' : isPressing ? '💓' : '💗'}</span>
        </button>
      </div>

      {/* Floating Status Label */}
      <span className="text-[10px] font-mono tracking-wider text-pink-200/90 mt-1">
        {isSimultaneous
          ? 'Holding Hands Across the Universe ✨'
          : isPressing
          ? 'Broadcasting Heartbeat... 💓'
          : partnerHeartbeatActive
          ? 'Partner is Touching Screen! 💖'
          : 'Hold for Heartbeat'}
      </span>
    </div>
  );
}

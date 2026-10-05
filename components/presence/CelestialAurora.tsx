'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresenceStore, PRESET_STATUSES } from '@/lib/presenceStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function CelestialAurora() {
  const {
    myRole,
    setMyRole,
    myStatus,
    setMyStatus,
    partnerOnline,
    partnerStatus,
    sendHeartbeatPing,
    isHoldingHeartbeat,
    setIsHoldingHeartbeat,
  } = usePresenceStore();

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const handleInstantHeartbeat = () => {
    SoundEngine.heartbeat();
    sendHeartbeatPing();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.5, y: 0.1 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-4 pb-2 font-nunito select-none">
      {/* Radiant Glowing Presence Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl bg-gradient-to-r from-[#1b1029]/90 via-[#271233]/90 to-[#1b1029]/90 backdrop-blur-2xl border-2 border-pink-500/50 shadow-[0_0_30px_rgba(255,92,142,0.3)] text-xs text-white"
      >
        {/* Left: Active Role Indicator & Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              SoundEngine.click();
              setMyRole(myRole === 'nush' ? 'yajat' : 'nush');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-white font-mono text-[11px] font-bold transition-all shadow cursor-pointer"
            title="Click to toggle identity between Yajat and Nush"
          >
            <span>{myRole === 'nush' ? '👑 Nush' : '🎸 Yajat'}</span>
            <span className="text-[10px] text-pink-300">⇄ Switch</span>
          </button>

          {/* Current Status Pill */}
          <button
            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-pink-200 hover:text-white text-[11px] font-mono truncate max-w-[200px] sm:max-w-xs transition-colors cursor-pointer"
            title="Update your current status"
          >
            {myStatus} ✏️
          </button>
        </div>

        {/* Right: Partner Presence & Send Heartbeat Action */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                partnerOnline
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="text-[11px] text-zinc-300 font-mono font-bold">
              {partnerOnline ? 'Partner in Universe ✨' : 'Partner Offline'}
            </span>
          </div>

          <span className="hidden sm:inline text-pink-200/80 text-[11px] border-l border-white/20 pl-2.5 truncate max-w-xs font-serif italic">
            &ldquo;{partnerStatus}&rdquo;
          </span>

          {/* Instant Heartbeat Pulse Button */}
          <button
            onClick={handleInstantHeartbeat}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-mono text-[11px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
            title="Send live heartbeat right now"
          >
            <span>💓</span>
            <span className="hidden sm:inline">Send Heartbeat</span>
          </button>
        </div>
      </motion.div>

      {/* Preset Status Picker Dropdown */}
      <AnimatePresence>
        {isStatusMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 p-4 rounded-3xl bg-zinc-950/95 backdrop-blur-2xl border-2 border-pink-500/40 shadow-2xl space-y-2 text-xs z-50 relative"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-pink-300 font-bold block mb-1">
              Select What You&apos;re Doing Right Now:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_STATUSES.map((status, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    SoundEngine.click();
                    setMyStatus(status);
                    setIsStatusMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                    myStatus === status
                      ? 'bg-pink-600 border-pink-400 text-white font-bold shadow'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

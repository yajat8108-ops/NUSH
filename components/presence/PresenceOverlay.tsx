'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresenceStore, PRESET_STATUSES } from '@/lib/presenceStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function PresenceOverlay() {
  const {
    myRole,
    setMyRole,
    myStatus,
    setMyStatus,
    partnerOnline,
    partnerStatus,
    partnerLastSeen,
    partnerHeartbeatActive,
    isHoldingHeartbeat,
    setIsHoldingHeartbeat,
    syncPresence,
  } = usePresenceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showAlignmentToast, setShowAlignmentToast] = useState(false);
  const [alignmentDismissed, setAlignmentDismissed] = useState(false);

  // Sync polling every 6.5s when active tab (reduces background CPU & eliminates scroll stutter)
  useEffect(() => {
    syncPresence();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncPresence();
      }
    }, 6500);
    return () => clearInterval(interval);
  }, [syncPresence]);

  // Check simultaneous presence (Celestial Alignment)
  useEffect(() => {
    if (partnerOnline && !alignmentDismissed) {
      setShowAlignmentToast(true);
    } else if (!partnerOnline) {
      setShowAlignmentToast(false);
      setAlignmentDismissed(false);
    }
  }, [partnerOnline, alignmentDismissed]);

  const partnerName = myRole === 'nush' ? 'Yajat' : 'Nush';
  const myName = myRole === 'nush' ? 'Nush 👑' : 'Yajat 💻';

  const formatLastSeen = () => {
    if (!partnerLastSeen) return 'Offline';
    const diffSecs = Math.floor((Date.now() - partnerLastSeen) / 1000);
    if (diffSecs < 40) return 'Active right now ✨';
    if (diffSecs < 120) return '1m ago';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  const handleSelectPreset = (status: string) => {
    SoundEngine.pop();
    setMyStatus(status);
    setIsModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    SoundEngine.chime();
    setMyStatus(customInput.trim());
    setCustomInput('');
    setIsModalOpen(false);
  };

  const toggleRole = () => {
    SoundEngine.click();
    setMyRole(myRole === 'nush' ? 'yajat' : 'nush');
  };

  return (
    <>
      {/* ── Partner Live Heartbeat Haptic Banner ── */}
      <AnimatePresence>
        {partnerHeartbeatActive && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 print:hidden pointer-events-none"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.8)] border border-white/30 backdrop-blur-xl animate-pulse">
              <span className="text-xl">💓</span>
              <span className="font-mono text-xs font-bold tracking-wide">
                {partnerName} is holding your hand right now 💖
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live Celestial Alignment Toast ── */}
      <AnimatePresence>
        {showAlignmentToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 print:hidden max-w-sm w-full px-4"
          >
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/90 via-pink-600/90 to-purple-700/90 border border-amber-300/40 text-white shadow-[0_0_35px_rgba(251,191,36,0.5)] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-spin" style={{ animationDuration: '6s' }}>✨</span>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-amber-200 font-bold">
                    Celestial Alignment
                  </p>
                  <p className="text-xs font-bold font-nunito">
                    You are both in our universe together right now 🌌
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAlignmentDismissed(true);
                  setShowAlignmentToast(false);
                }}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs text-white cursor-pointer ml-2"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Status Beacon Pill (Top Left, beside Panic Button) ── */}
      <div className="fixed top-2.5 left-20 sm:top-4 sm:left-24 z-40 print:hidden select-none font-nunito">
        <button
          onClick={() => {
            SoundEngine.click();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-black/65 hover:bg-black/85 border border-pink-500/30 backdrop-blur-xl shadow-lg text-white text-[11px] font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Where am I / Current Mood Beacon"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                partnerOnline ? 'bg-emerald-400' : 'bg-pink-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                partnerOnline ? 'bg-emerald-500' : 'bg-pink-500'
              }`}
            />
          </span>
          <span className="text-pink-300 font-bold hidden sm:inline">{partnerName}:</span>
          <span className="text-white/80 truncate max-w-[110px] sm:max-w-[150px]">
            {partnerOnline ? partnerStatus : formatLastSeen()}
          </span>
          <span className="text-white/30 group-hover:text-pink-300">✦</span>
        </button>
      </div>

      {/* ── Status Beacon Selector Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito select-none"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#130d24] border border-pink-500/30 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              {/* Header with Role Switch */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 font-bold block">
                    Current Mood &amp; Telepathy Beacon
                  </span>
                  <h3 className="font-bold text-lg text-white font-mono flex items-center gap-2">
                    <span>📡 Status Beacon</span>
                  </h3>
                </div>
                <button
                  onClick={toggleRole}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-mono text-amber-300 cursor-pointer transition-colors"
                  title="Click to switch who is browsing"
                >
                  I am: <strong>{myName}</strong> ⇄
                </button>
              </div>

              {/* Partner Live View */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        partnerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                      }`}
                    />
                    <span>{partnerName}&apos;s Live Status:</span>
                  </div>
                  <p className="font-bold text-sm text-pink-200 mt-0.5">{partnerStatus}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{formatLastSeen()}</span>
              </div>

              {/* Your Current Status */}
              <div>
                <p className="text-xs font-mono text-zinc-400 mb-2">Set your current status / mood:</p>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {PRESET_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleSelectPreset(status)}
                      className={`text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                        myStatus === status
                          ? 'bg-pink-600/30 border-pink-500 text-white font-bold'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Status Input */}
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or write custom status..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  maxLength={60}
                  className="flex-1 bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Set ✦
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-mono cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

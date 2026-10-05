'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from '../SectionHead';
import { useComfortStore, OpenWhenEnvelope } from '@/lib/comfortStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const BREATH_PHASES = ['Inhale', 'Hold', 'Exhale', 'Rest'] as const;
type BreathPhase = typeof BREATH_PHASES[number];
const BREATH_LABELS: Record<BreathPhase, string> = {
  Inhale: 'Breathe In…', Hold: 'Hold…', Exhale: 'Breathe Out…', Rest: 'Rest…',
};
const BREATH_COLORS: Record<BreathPhase, string> = {
  Inhale: '#319795', Hold: '#805AD5', Exhale: '#DD6B20', Rest: '#2D3748',
};

export default function OpenWhenVault() {
  const { envelopes, activeEnvelopeId, setActiveEnvelopeId, openEnvelope } = useComfortStore();
  const [selectedEnv, setSelectedEnv] = useState<OpenWhenEnvelope | null>(null);

  // ── Breathing pacer ──
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('Inhale');
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    if (selectedEnv?.toolType !== 'breathing_pacer') {
      setBreathPhase('Inhale');
      setBreathCount(0);
      return;
    }
    const interval = setInterval(() => {
      setBreathPhase((p) => {
        const idx = BREATH_PHASES.indexOf(p);
        const next = BREATH_PHASES[(idx + 1) % 4];
        if (next === 'Inhale') setBreathCount((c) => c + 1);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedEnv]);

  // ── Sleep timer ──
  const [sleepMins, setSleepMins] = useState<number | null>(null);
  const [sleepSecsLeft, setSleepSecsLeft] = useState(0);
  const [dimLevel, setDimLevel] = useState(0);
  const sleepRef = useRef<NodeJS.Timeout | null>(null);

  const startSleepTimer = (mins: number) => {
    setSleepMins(mins);
    setSleepSecsLeft(mins * 60);
    setDimLevel(0);
  };

  const cancelSleepTimer = () => {
    setSleepMins(null);
    setSleepSecsLeft(0);
    setDimLevel(0);
    if (sleepRef.current) clearTimeout(sleepRef.current);
  };

  useEffect(() => {
    if (sleepMins === null || sleepSecsLeft <= 0) return;
    sleepRef.current = setTimeout(() => {
      setSleepSecsLeft((s) => {
        const next = s - 1;
        const total = sleepMins * 60;
        setDimLevel(Math.min(0.97, ((total - next) / total)));
        return next;
      });
    }, 1000);
    return () => { if (sleepRef.current) clearTimeout(sleepRef.current); };
  }, [sleepSecsLeft, sleepMins]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleOpen = (env: OpenWhenEnvelope) => {
    SoundEngine.confettiPop();
    openEnvelope(env.id);
    setSelectedEnv(env);
  };

  return (
    <section id="open-when-vault" className="anniversary-section py-12 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="emergency emotional care vault"
        title='"Open When..." Sacred Letters 💌'
        subtitle="for the moments when you are alone in your room, can't sleep, feeling sick, or just need Yajat right beside you"
      />

      {/* Grid of envelopes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {envelopes.map((env) => (
          <motion.div
            key={env.id}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpen(env)}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#1c152a] to-[#251739] border-2 border-white/10 hover:border-pink-500/50 shadow-xl cursor-pointer transition-all flex flex-col justify-between overflow-hidden"
          >
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
              style={{ backgroundColor: env.waxColor }}
            />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-2.5 rounded-2xl bg-white/5 border border-white/10">{env.icon}</span>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                  style={{ backgroundColor: env.waxColor }}
                >✦</span>
              </div>
              <h4 className="font-bold text-base text-white font-mono group-hover:text-pink-300 transition-colors">{env.title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{env.subtitle}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
              <span className="text-pink-300 font-bold group-hover:translate-x-1 transition-transform">Break Wax Seal &rarr;</span>
              <span className="text-zinc-500">{env.unlockedAt ? 'Opened 📖' : 'Sealed ✨'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Letter Modal ── */}
      <AnimatePresence>
        {selectedEnv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => { setSelectedEnv(null); cancelSleepTimer(); }}
          >
            {/* Sleep dim overlay */}
            <AnimatePresence>
              {dimLevel > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: dimLevel }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100000] bg-black pointer-events-none"
                />
              )}
            </AnimatePresence>

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF8] text-[#2B1B17] p-6 sm:p-8 rounded-3xl max-w-xl w-full border-4 border-[#3D261C] shadow-2xl relative my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#8B5A2B]/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedEnv.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5A2B] font-bold block">
                      To My Beloved Anushka &middot; Private &amp; Confidential
                    </span>
                    <h3 className="font-bold text-lg font-mono text-[#2B1B17]">{selectedEnv.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedEnv(null); cancelSleepTimer(); }}
                  className="w-7 h-7 rounded-full bg-[#FAF0E6] hover:bg-[#F3E5D8] flex items-center justify-center text-xs font-bold text-[#8B5A2B] cursor-pointer"
                >✕</button>
              </div>

              {/* Letter */}
              <div className="space-y-3 font-serif text-sm sm:text-base leading-relaxed text-[#3D261C] my-4">
                {selectedEnv.letter.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* ── Care Tool ── */}
              <div className="mt-5 p-4 rounded-2xl bg-[#FAF0E6] border border-[#D2B48C] space-y-3 font-nunito">

                {/* SLEEP TIMER */}
                {selectedEnv.toolType === 'sleep_timer' && (
                  <div className="text-center space-y-3">
                    <span className="text-xs font-mono font-bold text-[#8B5A2B] block">🌙 Sleep Sanctuary</span>
                    <button
                      onClick={() => SoundEngine.heartbeat()}
                      className="px-4 py-2 bg-[#3D261C] text-[#FFFDF8] rounded-full text-xs font-bold shadow hover:scale-105 transition-transform cursor-pointer"
                    >
                      Play Calming Heartbeat 💓
                    </button>
                    {sleepMins === null ? (
                      <div>
                        <p className="text-[11px] text-[#8B5A2B] mb-2">Set a sleep timer — screen dims gently:</p>
                        <div className="flex justify-center gap-2">
                          {[10, 20, 30].map((m) => (
                            <button
                              key={m}
                              onClick={() => startSleepTimer(m)}
                              className="px-3 py-1.5 bg-[#3D261C]/80 text-[#FFFDF8] rounded-full text-xs font-mono font-bold cursor-pointer hover:scale-105 transition-transform"
                            >{m} min</button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <p className="text-2xl font-mono font-bold text-[#3D261C]">{fmtTime(sleepSecsLeft)}</p>
                          <p className="text-[10px] text-[#8B5A2B]">dimming screen…</p>
                        </div>
                        <button onClick={cancelSleepTimer} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-mono font-bold cursor-pointer">Cancel</button>
                      </div>
                    )}
                  </div>
                )}

                {/* CRAMP CARE */}
                {selectedEnv.toolType === 'cramp_care' && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-[#8B5A2B] block">🌸 Official Care Protocol</span>
                    <ul className="text-xs text-[#3D261C] space-y-1">
                      <li>• 🍵 Warm chamomile or ginger tea is en route.</li>
                      <li>• 🧸 Hug Teddy Yajat tight against your stomach.</li>
                      <li>• 🍜 2 AM Cheese Maggi is guaranteed on standby.</li>
                      <li>• 🛏️ Permission granted to do absolutely nothing today.</li>
                    </ul>
                    <button
                      onClick={() => { SoundEngine.chime(); confetti({ particleCount: 30, spread: 60 }); }}
                      className="w-full py-2 bg-[#E53E3E] text-white rounded-full text-xs font-bold shadow hover:scale-[1.02] transition-transform cursor-pointer"
                    >
                      Dispatch Unlimited Forehead Kisses 💋
                    </button>
                  </div>
                )}

                {/* BREATHING PACER */}
                {selectedEnv.toolType === 'breathing_pacer' && (
                  <div className="text-center space-y-3 py-2">
                    <span className="text-xs font-mono font-bold text-[#8B5A2B] block">🌿 Box Breathing — 4 Seconds Each</span>
                    <motion.div
                      animate={{
                        scale: breathPhase === 'Inhale' ? 1.45 : breathPhase === 'Hold' ? 1.45 : breathPhase === 'Exhale' ? 0.8 : 0.8,
                        backgroundColor: `${BREATH_COLORS[breathPhase]}22`,
                        borderColor: BREATH_COLORS[breathPhase],
                      }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                      className="w-24 h-24 mx-auto rounded-full border-2 flex flex-col items-center justify-center"
                      style={{ borderColor: BREATH_COLORS[breathPhase] }}
                    >
                      <span className="text-xs font-mono font-bold" style={{ color: BREATH_COLORS[breathPhase] }}>
                        {breathPhase}
                      </span>
                      <span className="text-[9px] text-[#8B5A2B] mt-0.5">{BREATH_LABELS[breathPhase]}</span>
                    </motion.div>
                    <p className="text-[11px] text-[#8B5A2B]">
                      Breath cycles: <strong>{breathCount}</strong> · Stay with me, breathe with me 💚
                    </p>
                  </div>
                )}

                {/* APOLOGY PACT */}
                {selectedEnv.toolType === 'apology_pact' && (
                  <div className="text-center space-y-2">
                    <span className="text-xs font-mono font-bold text-[#8B5A2B] block">🤝 The Reconciliation Voucher</span>
                    <p className="text-xs text-[#3D261C]">Entitles Anushka to: 1 silent long hug, 100% listening ear, and 0 arguments.</p>
                    <div className="text-left text-xs text-[#3D261C] bg-white/50 rounded-xl p-3 space-y-1">
                      <p>📌 Us vs. The Problem — never us vs. each other.</p>
                      <p>📌 Yajat chooses Nush over ego. Every time. Always.</p>
                      <p>📌 A bad day is not a bad relationship.</p>
                    </div>
                    <button
                      onClick={() => { SoundEngine.chime(); confetti({ particleCount: 40 }); }}
                      className="px-5 py-2 bg-[#805AD5] text-white rounded-full text-xs font-bold shadow cursor-pointer hover:scale-105 transition-transform"
                    >
                      Redeem Forehead Kiss Reset 💋
                    </button>
                  </div>
                )}

                {/* HUG SIMULATOR */}
                {selectedEnv.toolType === 'hug_simulator' && (
                  <div className="text-center space-y-2">
                    <span className="text-xs font-mono font-bold text-[#8B5A2B] block">🧸 Virtual Haptic Embrace</span>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onTouchStart={() => {
                        SoundEngine.heartbeat();
                        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                          navigator.vibrate([200, 100, 200, 100, 400, 200, 600]);
                        }
                      }}
                      onClick={() => {
                        SoundEngine.heartbeat();
                        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                          navigator.vibrate([200, 100, 200, 100, 400, 200, 600]);
                        }
                        confetti({ particleCount: 50, spread: 70 });
                      }}
                      className="px-6 py-3 bg-[#DD6B20] text-white rounded-full text-sm font-bold shadow hover:scale-105 transition-transform cursor-pointer active:scale-95"
                    >
                      Hold for a Tight Hug 🤗
                    </motion.button>
                    <p className="text-[10px] text-[#8B5A2B]">Your phone will buzz in a hug pattern 💛</p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setSelectedEnv(null); cancelSleepTimer(); }}
                  className="px-6 py-2.5 bg-[#3D261C] text-[#FFFDF8] rounded-full font-bold text-xs shadow hover:scale-105 transition-transform cursor-pointer"
                >
                  Keep in My Heart 🤍
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

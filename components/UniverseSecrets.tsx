'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function UniverseSecrets() {
  const {
    isLibraryBookOpen,
    setLibraryBookOpen,
    isVideoCallOpen,
    setVideoCallOpen,
  } = useUniverseStore();
  const [callConnecting, setCallConnecting] = useState(true);

  useEffect(() => {
    if (isVideoCallOpen) {
      setCallConnecting(true);
      const timer = setTimeout(() => {
        setCallConnecting(false);
        SoundEngine.chime();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isVideoCallOpen]);

  return (
    <>

      {/* Library Secret Modal */}
      <AnimatePresence>
        {isLibraryBookOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setLibraryBookOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF8] text-[#2B1B17] p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border-4 border-[#3D261C] relative"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#8B5A2B] pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5A2B] font-bold block">
                    VIT Bhopal Central Library Pass
                  </span>
                  <h3 className="font-bold text-lg font-mono text-[#2B1B17]">
                    0% STUDYING &middot; 100% STARING
                  </h3>
                </div>
                <span className="text-3xl">🤫📚</span>
              </div>

              <div className="bg-[#FAF0E6] p-4 rounded-2xl border border-[#D2B48C] space-y-3 text-xs mb-4">
                <p>
                  <strong>Issued to:</strong> Anushka &amp; Yajat
                </p>
                <p>
                  <strong>Permitted Activity:</strong> Sitting across from each other, passing folded sticky notes under the desk, whispering inside jokes, and admiring how cute Nush looks while pretending to study.
                </p>
                <p>
                  <strong>Violation Fee:</strong> 100 forehead kisses if caught smiling too loudly.
                </p>
              </div>

              <p className="font-caveat text-xl text-[#8B5A2B] text-center mb-4">
                &ldquo;You make even the quietest library feel like our personal sanctuary.&rdquo;
              </p>

              <button
                onClick={() => setLibraryBookOpen(false)}
                className="w-full py-2.5 bg-[#3D261C] text-[#FFFDF8] rounded-full font-bold text-xs shadow hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Close Library Note 📖
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Video Call Modal with Real Screenshot */}
      <AnimatePresence>
        {isVideoCallOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 font-nunito select-none"
            onClick={() => setVideoCallOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0d0d12] rounded-3xl border-2 border-[var(--pink)] overflow-hidden shadow-[0_0_80px_rgba(255,92,142,0.4)] flex flex-col text-white"
            >
              {/* WhatsApp Call Header */}
              <div className="p-3.5 bg-black/70 flex items-center justify-between border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold text-white text-sm">Nush🤎🤎</span>
                  <span className="text-[10px] text-gray-400 hidden sm:inline">&middot; 🔒 End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--butter)] font-bold text-xs">01:07 AM / 04:23 AM 🌙</span>
                  <button
                    onClick={() => setVideoCallOpen(false)}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-gray-300 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Real Video Call Screenshot View */}
              <div className="relative bg-black flex items-center justify-center overflow-hidden max-h-[60vh] group">
                <img
                  src="/photos/late-night-call.png"
                  alt="Late Night WhatsApp Call - Nush sleeping and Yajat watching over"
                  className="w-full h-auto object-contain"
                />

                {/* Romantic Overlay Caption */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/65 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
                  <p className="font-caveat text-lg md:text-xl text-[var(--butter)] leading-snug">
                    &ldquo;Watching you fall asleep peacefully under your blanket... I could stay on this call forever just so you know you&apos;re loved &amp; protected 🥹❤️&rdquo;
                  </p>
                </div>
              </div>

              {/* Call Controls Toolbar */}
              <div className="p-4 bg-black/80 flex items-center justify-center gap-6 border-t border-white/10">
                <button
                  onClick={() => {
                    SoundEngine.confettiPop();
                    confetti({
                      particleCount: 60,
                      spread: 80,
                      origin: { x: 0.5, y: 0.6 },
                      colors: ['#FF5C8E', '#FF9EC9', '#FFDD8C', '#B9AEF5'],
                    });
                  }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-mono text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Send Infinite Kisses</span>
                  <span>💋💖</span>
                </button>

                <button
                  onClick={() => setVideoCallOpen(false)}
                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-xl shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title="Close Call"
                >
                  📞
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

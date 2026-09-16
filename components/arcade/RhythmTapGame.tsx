'use client';

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface RhythmNote {
  id: number;
  lane: number; // 0, 1, 2
  y: number; // 0 to 100%
  hit: boolean;
}

const LANES = [
  { key: 'A', label: '🌸 D', emoji: '💖' },
  { key: 'S', label: '🎧 F', emoji: '🎙️' },
  { key: 'D', label: '🧸 J', emoji: '🧸' },
];

export default function RhythmTapGame() {
  const { rhythmHighScore, saveRhythmScore } = useUniverseStore();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  // Force re-render tick for smooth 60fps note descent
  const [, forceTick] = useReducer((x: number) => (x + 1) % 1000000, 0);

  const notesRef = useRef<RhythmNote[]>([]);
  const animRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const bestComboRef = useRef(0);

  useEffect(() => {
    bestComboRef.current = bestCombo;
  }, [bestCombo]);

  const triggerHit = (lane: number) => {
    if (gameState !== 'playing') return;

    // Find closest note in this lane near hit line (85%)
    const candidates = notesRef.current.filter((n) => n.lane === lane && !n.hit && n.y >= 65 && n.y <= 98);
    if (candidates.length > 0) {
      const target = candidates[0];
      target.hit = true;
      const diff = Math.abs(target.y - 85);

      if (diff <= 6) {
        SoundEngine.comboPing(combo + 1);
        setScore((s) => s + 30);
        setCombo((c) => {
          const next = c + 1;
          if (next > bestComboRef.current) {
            setBestCombo(next);
            bestComboRef.current = next;
          }
          return next;
        });
        setFeedback({ text: 'PERFECT SYNC 💗', color: '#FFDD8C' });
      } else if (diff <= 12) {
        SoundEngine.pop();
        setScore((s) => s + 15);
        setCombo((c) => {
          const next = c + 1;
          if (next > bestComboRef.current) {
            setBestCombo(next);
            bestComboRef.current = next;
          }
          return next;
        });
        setFeedback({ text: 'GREAT MATCH ✨', color: '#FF5C8E' });
      } else {
        SoundEngine.click();
        setScore((s) => s + 5);
        setFeedback({ text: 'PRETTY CLOSE 😭', color: '#B9AEF5' });
      }
    } else {
      // Miss tap
      SoundEngine.error();
      setCombo(0);
      setFeedback({ text: 'OFF-BEAT BOYFRIEND 💀', color: '#EF4444' });
    }
  };

  // Main 60fps Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Spawn notes periodically
      if (currentTime - lastSpawnRef.current > 550) {
        const lane = Math.floor(Math.random() * 3);
        notesRef.current.push({
          id: Date.now() + Math.random(),
          lane,
          y: -5,
          hit: false,
        });
        lastSpawnRef.current = currentTime;
      }

      // Update positions
      const nextNotes: RhythmNote[] = [];
      notesRef.current.forEach((note) => {
        note.y += 48 * dt;

        // Missed check (past hit line)
        if (note.y > 98 && !note.hit) {
          setCombo(0);
          setFeedback({ text: 'MISSED BEAT 💔', color: '#EF4444' });
          return;
        }

        if (note.y <= 105 && !note.hit) {
          nextNotes.push(note);
        }
      });

      notesRef.current = nextNotes;
      forceTick(); // Drive continuous React re-render every animation frame
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState]);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') triggerHit(0);
      if (e.key === 'f' || e.key === 'F') triggerHit(1);
      if (e.key === 'j' || e.key === 'J') triggerHit(2);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    bestComboRef.current = 0;
    notesRef.current = [];
    setGameState('playing');
    SoundEngine.whoosh();

    // 45s timer
    setTimeout(() => {
      setGameState('gameover');
    }, 45000);
  };

  useEffect(() => {
    if (gameState === 'gameover') {
      saveRhythmScore(score);
      if (score > rhythmHighScore) {
        SoundEngine.confettiPop();
        confetti({ particleCount: 70, spread: 80, origin: { x: 0.5, y: 0.5 } });
      }
    }
  }, [gameState, score, rhythmHighScore, saveRhythmScore]);

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>🎵💗</span> MINI RHYTHM TAP
          </h3>
          <p className="text-xs text-[var(--pink)]">Tap to the rhythm of our heartbeats (Keys: D, F, J)</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-black/40 px-3 py-1 rounded-full">Score: <b className="text-[var(--butter)]">{score}</b></span>
          <span className="bg-black/40 px-3 py-1 rounded-full">Combo: <b className="text-[var(--pink)]">{combo}x</b></span>
        </div>
      </div>

      {/* Rhythm Track */}
      <div className="relative w-full h-[380px] bg-black/50 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between">
        {/* Track Lanes */}
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-white/10 pointer-events-none">
          <div className="h-full bg-white/[0.02]" />
          <div className="h-full bg-white/[0.04]" />
          <div className="h-full bg-white/[0.02]" />
        </div>

        {/* Target Hit Line */}
        <div className="absolute inset-x-0 top-[85%] h-1.5 bg-[var(--pink)]/70 shadow-[0_0_15px_var(--pink)] pointer-events-none" />

        {/* Notes */}
        {notesRef.current.map((note) => (
          <div
            key={note.id}
            className="absolute pointer-events-none text-3xl filter drop-shadow-md transition-none will-change-transform"
            style={{
              left: `${note.lane * 33.33 + 16.66}%`,
              top: `${note.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {LANES[note.lane].emoji}
          </div>
        ))}

        {/* Floating Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={Date.now()}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1.1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold font-mono text-sm px-4 py-1.5 rounded-full bg-black/80 border border-white/20 shadow-xl pointer-events-none z-20"
              style={{ color: feedback.color }}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start / Gameover Overlays */}
        {gameState === 'ready' && (
          <div className="relative z-20 m-auto text-center p-6 bg-black/85 backdrop-blur-md rounded-2xl border border-[var(--pink)]/30 max-w-xs shadow-2xl">
            <span className="text-4xl mb-2 block">🎵❤️✨</span>
            <h4 className="text-xl font-bold text-[var(--butter)] font-mono mb-2">RHYTHM TAP</h4>
            <p className="text-xs text-gray-300 mb-4">Tap lanes when notes reach the pink line! Ready?</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-6 py-2.5 rounded-full font-bold shadow hover:scale-105 transition-transform"
            >
              Start Rhythm 🌸
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="relative z-20 m-auto text-center p-6 bg-black/90 backdrop-blur-md rounded-2xl border border-[var(--pink)]/30 max-w-xs shadow-2xl">
            <span className="text-4xl mb-2 block">🏆🎵</span>
            <h4 className="text-xl font-bold text-[var(--butter)] font-mono mb-1">SONG COMPLETE</h4>
            <p className="text-xs text-[var(--pink)] mb-3">Score: {score} | Best Combo: {bestCombo}x</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-5 py-2 rounded-full font-bold shadow hover:scale-105 transition-transform"
            >
              Play Again 🔄
            </button>
          </div>
        )}
      </div>

      {/* Tap Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {LANES.map((lane, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.94 }}
            onClick={() => triggerHit(i)}
            className="py-3 bg-white/10 hover:bg-white/20 active:bg-[var(--pink-deep)] border border-white/20 rounded-xl font-bold text-sm shadow transition-colors flex flex-col items-center gap-0.5"
          >
            <span>{lane.emoji}</span>
            <span className="text-[10px] text-gray-400 font-mono">{lane.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

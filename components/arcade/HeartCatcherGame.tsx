'use client';

import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: number;
  emoji: string;
  points: number;
  type: 'heart' | 'kiss' | 'golden' | 'memory' | 'guard';
  x: number;
  y: number;
  speed: number;
  size: number;
}

const MISS_ROASTS = [
  'Aww, missed a kiss 😭',
  'That one was for you baby!',
  'BRO HOW DID YOU MISS THAT 😭',
  'The heart was RIGHT THERE.',
  'Skill issue, Nush 😂❤️',
];

export default function HeartCatcherGame() {
  const { heartCatcherHighScore, saveHeartCatcherScore } = useUniverseStore();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage 0 - 100
  const [roast, setRoast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Force re-render tick for smooth 60fps DOM animation
  const [, forceTick] = useReducer((x: number) => (x + 1) % 1000000, 0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const basketXRef = useRef(50);
  const bestComboRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  useEffect(() => {
    bestComboRef.current = bestCombo;
  }, [bestCombo]);

  const spawnItem = useCallback(() => {
    const roll = Math.random();
    let type: FallingItem['type'] = 'heart';
    let emoji = '❤️';
    let points = 10;
    let size = 32;

    if (roll < 0.08) {
      type = 'golden'; emoji = '🌟'; points = 50; size = 38;
    } else if (roll < 0.2) {
      type = 'kiss'; emoji = '💋'; points = 25; size = 34;
    } else if (roll < 0.3) {
      type = 'memory'; emoji = '💌'; points = 35; size = 34;
    } else if (roll < 0.45) {
      type = 'guard'; emoji = '👮‍♂️'; points = 0; size = 36;
    }

    const newItem: FallingItem = {
      id: Date.now() + Math.random(),
      emoji,
      points,
      type,
      x: 10 + Math.random() * 80,
      y: -10,
      speed: 0.7 + Math.random() * 0.5,
      size,
    };
    itemsRef.current.push(newItem);
  }, []);

  // Main 60fps Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Spawn items periodically
      if (currentTime - lastSpawnRef.current > 650) {
        spawnItem();
        lastSpawnRef.current = currentTime;
      }

      // Update positions
      const nextItems: FallingItem[] = [];
      const currentBasketX = basketXRef.current;

      itemsRef.current.forEach((item) => {
        item.y += item.speed * 48 * dt;

        // Check catch collision at bottom basket position (y ~ 80% to 92%)
        if (item.y >= 78 && item.y <= 92) {
          const dist = Math.abs(item.x - currentBasketX);
          if (dist < 14) {
            // Caught!
            if (item.type === 'guard') {
              SoundEngine.error();
              setShake(true);
              setTimeout(() => setShake(false), 400);
              setStrikes((s) => {
                const next = s + 1;
                if (next >= 3) setGameState('gameover');
                return next;
              });
              setCombo(0);
            } else {
              SoundEngine.pop();
              setScore((s) => s + item.points);
              setCombo((c) => {
                const next = c + 1;
                if (next > bestComboRef.current) {
                  setBestCombo(next);
                  bestComboRef.current = next;
                }
                return next;
              });
            }
            return; // don't keep item
          }
        }

        // Missed check (fell off bottom)
        if (item.y > 100) {
          if (item.type !== 'guard') {
            const r = MISS_ROASTS[Math.floor(Math.random() * MISS_ROASTS.length)];
            setRoast(r);
            setTimeout(() => setRoast(null), 2000);
            setCombo(0);
          }
          return;
        }

        nextItems.push(item);
      });

      itemsRef.current = nextItems;
      forceTick(); // Drive React re-render every frame
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, spawnItem]);

  // Pointer movement tracking for basket
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || gameState !== 'playing') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(8, Math.min(92, x));
    setBasketX(clamped);
    basketXRef.current = clamped;
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    bestComboRef.current = 0;
    setStrikes(0);
    itemsRef.current = [];
    setGameState('playing');
    SoundEngine.whoosh();
  };

  useEffect(() => {
    if (gameState === 'gameover') {
      saveHeartCatcherScore(score);
      if (score > heartCatcherHighScore) {
        SoundEngine.confettiPop();
        confetti({ particleCount: 70, spread: 80, origin: { x: 0.5, y: 0.5 } });
      }
    }
  }, [gameState, score, heartCatcherHighScore, saveHeartCatcherScore]);

  return (
    <div className={`w-full max-w-xl mx-auto bg-gradient-to-b from-[#191524] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none transition-transform ${
      shake ? 'animate-shake border-red-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>🧺💗</span> CATCH THE HEARTS
          </h3>
          <p className="text-xs text-[var(--pink)]">Catch love items, avoid the 8 PM guards! 👮‍♂️</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-black/40 px-3 py-1 rounded-full">Score: <b className="text-[var(--butter)]">{score}</b></span>
          <span className="bg-black/40 px-3 py-1 rounded-full text-red-400">{'❌'.repeat(strikes) || '0 Strikes'}</span>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerMove}
        onPointerMove={handlePointerMove}
        className="relative w-full h-[400px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden cursor-ew-resize touch-none flex items-center justify-center"
      >
        {/* Render Falling Items */}
        {itemsRef.current.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none transition-none will-change-transform"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Basket */}
        <div
          className="absolute bottom-6 w-20 h-10 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] rounded-2xl flex items-center justify-center shadow-lg border border-white/40 pointer-events-none transition-none will-change-transform"
          style={{
            left: `${basketX}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="text-xl">🧺🧸</span>
        </div>

        {/* Start Overlay */}
        {gameState === 'ready' && (
          <div className="relative z-20 text-center p-6 bg-black/85 backdrop-blur-md rounded-2xl border border-[var(--pink)]/30 max-w-xs shadow-2xl">
            <span className="text-4xl mb-2 block">🧺❤️✨</span>
            <h4 className="text-xl font-bold text-[var(--butter)] font-mono mb-2">HEART CATCHER</h4>
            <p className="text-xs text-gray-300 mb-4">Move your basket to catch falling hearts! Watch out for guards 👮‍♂️</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-6 py-2.5 rounded-full font-bold shadow hover:scale-105 transition-transform"
            >
              Start Catching 🌸
            </button>
          </div>
        )}

        {/* Gameover Overlay */}
        {gameState === 'gameover' && (
          <div className="relative z-20 text-center p-6 bg-black/90 backdrop-blur-md rounded-2xl border border-[var(--pink)]/30 max-w-xs shadow-2xl">
            <span className="text-4xl mb-2 block">🏆🧺</span>
            <h4 className="text-xl font-bold text-[var(--butter)] font-mono mb-1">ROUND FINISHED</h4>
            <p className="text-xs text-[var(--pink)] mb-3">Score: {score} | Best Combo: {bestCombo}x</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-5 py-2 rounded-full font-bold shadow hover:scale-105 transition-transform"
            >
              Catch Again 🔄
            </button>
          </div>
        )}

        {/* Miss Toast */}
        <AnimatePresence>
          {roast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 bg-red-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-red-500 shadow z-30"
            >
              {roast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

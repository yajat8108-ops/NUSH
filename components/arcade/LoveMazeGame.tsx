'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

// 9x9 Maze Layout (0 = path, 1 = wall, 2 = inside joke dead-end)
const MAZE_GRID = [
  [0, 0, 1, 0, 0, 0, 1, 2, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 2, 1, 0, 0, 0, 0, 1, 0],
  [1, 0, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 2, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 0], // Exit at (8, 8)
];

const DEAD_END_ROASTS: Record<string, string> = {
  '0,7': 'Bro thought this was the shortcut 😭',
  '4,1': 'You really thought I was hiding here? 😂',
  '6,3': 'Wrong way! AB-1 guards are chasing you 💀',
  '8,7': 'Almost there... but this is a wall! 😭',
};

export default function LoveMazeGame() {
  const { setLoveMazeCompleted, loveMazeCompleted } = useUniverseStore();
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [roastMessage, setRoastMessage] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (!startTime || gameWon) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, gameWon]);

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (gameWon) return;
      if (!startTime) setStartTime(Date.now());

      const nextR = playerPos.r + dr;
      const nextC = playerPos.c + dc;

      // Bounds check
      if (nextR < 0 || nextR >= MAZE_GRID.length || nextC < 0 || nextC >= MAZE_GRID[0].length) {
        return;
      }

      // Wall check
      if (MAZE_GRID[nextR][nextC] === 1) {
        SoundEngine.error();
        return;
      }

      // Move allowed
      SoundEngine.pop();
      setPlayerPos({ r: nextR, c: nextC });
      setMoves((m) => m + 1);

      // Dead end check
      const key = `${nextR},${nextC}`;
      if (DEAD_END_ROASTS[key]) {
        setRoastMessage(DEAD_END_ROASTS[key]);
        setTimeout(() => setRoastMessage(null), 2500);
      }

      // Goal check (8, 8)
      if (nextR === 8 && nextC === 8) {
        setGameWon(true);
        setLoveMazeCompleted();
        SoundEngine.confettiPop();
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
        });
      }
    },
    [playerPos, gameWon, startTime, setLoveMazeCompleted]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const restartGame = () => {
    setPlayerPos({ r: 0, c: 0 });
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
    setGameWon(false);
    setRoastMessage(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f1a] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>🧭</span> LOVE MAZE
          </h3>
          <p className="text-xs text-[var(--pink)]">Guide Yajat 🐻 through the campus maze to Nush 🌸</p>
        </div>
        <div className="flex gap-3 text-xs font-mono">
          <span className="bg-white/10 px-3 py-1 rounded-full">Moves: {moves}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full">⏱️ {elapsedTime}s</span>
        </div>
      </div>

      {/* Maze Container */}
      <div className="relative aspect-square max-w-[360px] mx-auto bg-black/50 p-2 rounded-2xl border border-[var(--pink)]/20 shadow-inner flex flex-col justify-between">
        <div className="grid grid-cols-9 gap-1 w-full h-full">
          {MAZE_GRID.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = r === 8 && c === 8;
              const isWall = cell === 1;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative rounded-md flex items-center justify-center text-sm md:text-base transition-colors ${
                    isWall
                      ? 'bg-[var(--lav)]/20 border border-[var(--lav)]/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {isPlayer && (
                    <motion.span
                      layoutId="player"
                      className="text-xl filter drop-shadow-md z-10"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      🐻
                    </motion.span>
                  )}
                  {isGoal && !isPlayer && (
                    <span className="text-xl animate-pulse filter drop-shadow">🌸</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Floating Dead-End Toast */}
        <AnimatePresence>
          {roastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-red-950/90 border border-red-500 text-white text-xs font-bold text-center py-2 px-3 rounded-xl shadow-xl z-20"
            >
              {roastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Win Overlay */}
        <AnimatePresence>
          {gameWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            >
              <span className="text-4xl mb-2">🎉🐻❤️🌸</span>
              <h4 className="text-xl font-bold text-[var(--butter)] font-mono mb-1">YOU FOUND ME!</h4>
              <p className="text-xs text-gray-300 mb-4">
                Completed in <span className="text-[var(--pink)] font-bold">{moves} moves</span> and{' '}
                <span className="text-[var(--pink)] font-bold">{elapsedTime} seconds</span>!
              </p>
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-5 py-2 rounded-full font-bold shadow hover:scale-105 transition-transform"
              >
                Play Again 🔄
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls D-Pad */}
      <div className="mt-4 flex flex-col items-center gap-1.5 md:hidden">
        <button
          onClick={() => movePlayer(-1, 0)}
          className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center active:scale-95 text-lg"
        >
          ▲
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => movePlayer(0, -1)}
            className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center active:scale-95 text-lg"
          >
            ◀
          </button>
          <button
            onClick={() => movePlayer(1, 0)}
            className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center active:scale-95 text-lg"
          >
            ▼
          </button>
          <button
            onClick={() => movePlayer(0, 1)}
            className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center active:scale-95 text-lg"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

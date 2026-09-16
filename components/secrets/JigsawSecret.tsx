'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface JigsawSecretProps {
  onClose: () => void;
}

const SOLVED_TILES = [
  '❤️', '✨', '👑',
  '🌸', '🧸', '🍜',
  '💌', '💍', ' ',
];

export default function JigsawSecret({ onClose }: JigsawSecretProps) {
  // Start with tiles slightly scrambled (swapped 6 & 7)
  const [tiles, setTiles] = useState<string[]>([
    '❤️', '✨', '👑',
    '🌸', '🧸', '🍜',
    '💍', '💌', ' ',
  ]);
  const [isSolved, setIsSolved] = useState(false);
  const { unlockAchievement } = useUniverseStore();

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    const emptyIndex = tiles.indexOf(' ');

    // Check adjacency (row and col in 3x3)
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      SoundEngine.pop();
      const next = [...tiles];
      next[emptyIndex] = tiles[index];
      next[index] = ' ';
      setTiles(next);

      // Check win
      const won = next.slice(0, 8).every((t, i) => t === SOLVED_TILES[i]);
      if (won) {
        completePuzzle();
      }
    }
  };

  const completePuzzle = () => {
    setIsSolved(true);
    setTiles(SOLVED_TILES);
    SoundEngine.confettiPop();
    unlockAchievement('puzzle_master');
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full bg-[#181326] border-2 border-[var(--pink)] rounded-3xl p-6 text-center text-white shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-mono cursor-pointer"
        >
          ✕
        </button>

        <span className="text-3xl block mb-1">🧩💖</span>
        <h3 className="font-serif text-2xl text-[var(--butter)] font-bold">
          The Missing Piece Puzzle
        </h3>
        <p className="text-xs font-mono text-gray-300 mt-1">
          Slide the tiles into place or solve the secret
        </p>

        {/* 3X3 GRID */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-black/50 rounded-2xl border border-white/10 my-6">
          {tiles.map((tile, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTileClick(idx)}
              className={`aspect-square rounded-xl text-3xl flex items-center justify-center border transition-all cursor-pointer ${
                tile === ' '
                  ? 'bg-transparent border-dashed border-white/20 cursor-default'
                  : 'bg-gradient-to-br from-white/20 to-white/5 border-white/20 shadow-md hover:border-[var(--pink)]'
              }`}
            >
              {tile}
            </motion.button>
          ))}
        </div>

        {isSolved ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[var(--pink-deep)]/40 to-[var(--butter)]/40 border border-[var(--butter)]"
          >
            <p className="font-caveat text-2xl text-white font-bold">
              &ldquo;You are the missing piece that completed my whole life, Nushi 🧩❤️&rdquo;
            </p>
            <p className="text-[11px] font-mono text-[var(--butter)] mt-1">
              🏆 Achievement Unlocked: Puzzle Master
            </p>
          </motion.div>
        ) : (
          <button
            onClick={completePuzzle}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-gray-300 border border-white/15 cursor-pointer"
          >
            🧩 Auto-Solve Secret
          </button>
        )}
      </div>
    </motion.div>
  );
}

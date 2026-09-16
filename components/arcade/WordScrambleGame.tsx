'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface ScrambleLevel {
  id: number;
  word: string;
  scrambled: string[];
  hint: string;
  category: string;
}

const LEVELS: ScrambleLevel[] = [
  { id: 1, word: 'NUSH', scrambled: ['U', 'S', 'H', 'N'], hint: 'My whole universe in 4 letters', category: 'Nicknames 🌸' },
  { id: 2, word: 'WIFEYYY', scrambled: ['Y', 'F', 'I', 'E', 'W', 'Y', 'Y'], hint: 'The most affectionate title of all', category: 'Affection 💕' },
  { id: 3, word: 'OPEN AUDI', scrambled: ['D', 'U', 'I', ' ', 'A', 'N', 'E', 'P', 'O'], hint: 'Our sacred, pavitra memory place 🥹', category: 'Memories 📍' },
  { id: 4, word: 'FOREHEAD KISS', scrambled: ['R', 'E', 'H', 'E', 'A', 'D', ' ', 'F', 'O', 'S', 'S', 'I', 'K'], hint: 'Yajat’s signature affectionate move 😘', category: 'Moments 💋' },
  { id: 5, word: 'TEDDY YAJAT', scrambled: ['Y', 'A', 'J', 'A', 'T', ' ', 'T', 'E', 'D', 'D', 'Y'], hint: 'The bear named after me on your birthday 🧸', category: 'Inside Jokes 😂' },
  { id: 6, word: 'HAPPY THREE MONTHS', scrambled: ['T', 'H', 'R', 'E', 'E', ' ', 'P', 'A', 'P', 'H', 'Y', ' ', 'S', 'H', 'T', 'N', 'O', 'M'], hint: 'A whole quarter year together! 👑💖', category: 'Milestones 🌟' },
];

export default function WordScrambleGame() {
  const { scrambleLevelsCompleted, completeScrambleLevel } = useUniverseStore();
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [availableIndices, setAvailableIndices] = useState<number[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);

  const currentLevel = LEVELS[currentLevelIdx];

  // Initialize level
  useEffect(() => {
    if (!currentLevel) return;
    setAvailableIndices(currentLevel.scrambled.map((_, i) => i));
    setSelectedLetters([]);
    setHintShown(false);
    setIsWon(false);
    setTimer(0);
  }, [currentLevelIdx, currentLevel]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleSelectLetter = (index: number) => {
    if (!availableIndices.includes(index) || isWon) return;
    SoundEngine.pop();

    const nextSelected = [...selectedLetters, index];
    const nextAvailable = availableIndices.filter((i) => i !== index);

    setSelectedLetters(nextSelected);
    setAvailableIndices(nextAvailable);

    // Check completion
    const currentConstructed = nextSelected.map((i) => currentLevel.scrambled[i]).join('');
    if (currentConstructed === currentLevel.word) {
      setIsWon(true);
      completeScrambleLevel(currentLevel.id);
      SoundEngine.confettiPop();
      confetti({ particleCount: 50, spread: 60, origin: { x: 0.5, y: 0.5 } });
    } else if (nextSelected.length === currentLevel.scrambled.length) {
      SoundEngine.error();
    }
  };

  const handleDeselectLetter = (selectedIndex: number) => {
    if (isWon) return;
    SoundEngine.pop();

    const letterIndexInScrambled = selectedLetters[selectedIndex];
    const nextSelected = selectedLetters.filter((_, i) => i !== selectedIndex);
    const nextAvailable = [...availableIndices, letterIndexInScrambled];

    setSelectedLetters(nextSelected);
    setAvailableIndices(nextAvailable);
  };

  const handleNextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx((i) => i + 1);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>🔤💗</span> LOVE WORD SCRAMBLE
          </h3>
          <p className="text-xs text-[var(--pink)]">{currentLevel.category} &middot; Level {currentLevel.id}/{LEVELS.length}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-white/10 px-3 py-1 rounded-full">⏱️ {timer}s</span>
          <span className="bg-[var(--pink-deep)] text-white px-3 py-1 rounded-full">
            Done: {scrambleLevelsCompleted}/{LEVELS.length}
          </span>
        </div>
      </div>

      {/* Word Answer Slots */}
      <div className="min-h-[70px] bg-black/40 rounded-2xl border border-[var(--pink)]/30 p-3 mb-5 flex flex-wrap items-center justify-center gap-2">
        {selectedLetters.length === 0 ? (
          <span className="text-xs text-gray-400 italic">Tap the scrambled letters below in order...</span>
        ) : (
          selectedLetters.map((scrambledIdx, selIdx) => (
            <motion.button
              key={`${scrambledIdx}-${selIdx}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => handleDeselectLetter(selIdx)}
              className={`w-10 h-11 md:w-11 md:h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                currentLevel.scrambled[scrambledIdx] === ' '
                  ? 'bg-transparent border border-dashed border-gray-600 text-gray-500'
                  : 'bg-gradient-to-tr from-[var(--pink-deep)] to-[var(--lav)] text-white border border-white/40'
              }`}
            >
              {currentLevel.scrambled[scrambledIdx] === ' ' ? '␣' : currentLevel.scrambled[scrambledIdx]}
            </motion.button>
          ))
        )}
      </div>

      {/* Scrambled Letters Pool */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
        {currentLevel.scrambled.map((char, idx) => {
          const isUsed = !availableIndices.includes(idx);
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectLetter(idx)}
              disabled={isUsed || isWon}
              className={`w-11 h-12 md:w-12 md:h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow transition-all ${
                isUsed
                  ? 'opacity-20 bg-gray-700 pointer-events-none'
                  : 'bg-white/10 hover:bg-white/20 border border-white/30 text-[var(--butter)]'
              }`}
            >
              {char === ' ' ? '␣' : char}
            </motion.button>
          );
        })}
      </div>

      {/* Hint Area */}
      <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10 text-xs mb-4">
        <div>
          <span className="font-bold text-[var(--butter)]">Hint: </span>
          <span>{hintShown ? currentLevel.hint : 'Need a clue?'}</span>
        </div>
        {!hintShown && (
          <button
            onClick={() => setHintShown(true)}
            className="text-[var(--pink)] underline hover:text-white font-bold"
          >
            Show Hint 💡
          </button>
        )}
      </div>

      {/* Completion Modal / Next */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-950/80 border border-green-500 rounded-2xl text-center"
          >
            <span className="text-2xl mb-1 block">✨🎉💖</span>
            <h4 className="font-bold text-sm text-[var(--butter)] font-mono mb-1">WORD UNSCRAMBLED!</h4>
            <p className="text-xs text-gray-300 mb-3">{currentLevel.hint}</p>
            {currentLevelIdx < LEVELS.length - 1 ? (
              <button
                onClick={handleNextLevel}
                className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white text-xs px-5 py-2 rounded-full font-bold shadow hover:scale-105"
              >
                Next Word &rarr;
              </button>
            ) : (
              <span className="text-xs font-bold text-[var(--butter)]">🏆 You completed all Word Scramble levels!</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface Question {
  id: number;
  optionA: {
    text: string;
    emoji: string;
    yajatPicks: boolean;
    yajatComment: string;
  };
  optionB: {
    text: string;
    emoji: string;
    yajatPicks: boolean;
    yajatComment: string;
  };
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    optionA: {
      text: 'Late-night stargazing under the open sky',
      emoji: '🌌',
      yajatPicks: true,
      yajatComment: 'Our undisputed #1 perfect date forever 🥹❤️',
    },
    optionB: {
      text: '2 AM extra-cheese Maggi inside a blanket fort',
      emoji: '🍜',
      yajatPicks: false,
      yajatComment: 'Maggi is top tier, but holding you under the stars wins every time!',
    },
  },
  {
    id: 2,
    optionA: {
      text: 'Forehead kisses on loop for 10 minutes',
      emoji: '💋',
      yajatPicks: true,
      yajatComment: 'My signature move! Your forehead belongs to my lips 😘',
    },
    optionB: {
      text: 'A tight random hug where neither of us lets go',
      emoji: '🫢',
      yajatPicks: false,
      yajatComment: 'Our random tight hugs are magical too though!',
    },
  },
  {
    id: 3,
    optionA: {
      text: 'Get chased out of Open Audi by campus guards',
      emoji: '🏃‍♂️',
      yajatPicks: true,
      yajatComment: 'Our daily 8 PM mission! Makes getting kicked out romantic 💀😂',
    },
    optionB: {
      text: 'Get chased out of AB-1 by security guards',
      emoji: '🚨',
      yajatPicks: false,
      yajatComment: 'AB-1 is fun, but Open Audi will always be our sacred place.',
    },
  },
  {
    id: 4,
    optionA: {
      text: 'Yajat serenading you with his acoustic guitar',
      emoji: '🎸',
      yajatPicks: false,
      yajatComment: 'I will sing for you anytime bbg!',
    },
    optionB: {
      text: 'Nush hosting Radio Nushi FM till late night',
      emoji: '📻',
      yajatPicks: true,
      yajatComment: 'Your velvety radio voice is literally why I deleted music apps 🥹🎙️',
    },
  },
  {
    id: 5,
    optionA: {
      text: 'Cozy snow chalet in the Swiss Alps',
      emoji: '🏔️',
      yajatPicks: true,
      yajatComment: 'Hot cocoa, heavy snowfall, and you in my arms by the fireplace ❄️❤️',
    },
    optionB: {
      text: 'Cherry blossom picnic in Kyoto, Japan',
      emoji: '🌸',
      yajatPicks: false,
      yajatComment: 'Japan is on our bucket list too, but snow cuddles are unbeatable!',
    },
  },
  {
    id: 6,
    optionA: {
      text: 'Fall asleep peacefully on FaceTime at 4 AM',
      emoji: '🌙',
      yajatPicks: true,
      yajatComment: 'Keeping screen brightness at 1% so you never sleep alone 😴❤️',
    },
    optionB: {
      text: 'Stay awake till 5 AM laughing at inside jokes',
      emoji: '😂',
      yajatPicks: false,
      yajatComment: 'Both happen all the time anyway haha!',
    },
  },
  {
    id: 7,
    optionA: {
      text: 'Walk the long detour route past Dr. Morphin’s',
      emoji: '🚶‍♂️',
      yajatPicks: false,
      yajatComment: 'Buying extra minutes together is my favorite sport.',
    },
    optionB: {
      text: 'Stretch the reluctant goodbye at Girls Block 2',
      emoji: '🥹',
      yajatPicks: true,
      yajatComment: 'That last goodbye where neither of us wants to let go always gets me ❤️',
    },
  },
];

export default function WouldYouRatherGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { unlockAchievement } = useUniverseStore();

  const currentQ = QUESTIONS[currentIdx];

  const handleChoose = (choice: 'A' | 'B') => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);
    SoundEngine.pop();

    const isMatch =
      (choice === 'A' && currentQ.optionA.yajatPicks) ||
      (choice === 'B' && currentQ.optionB.yajatPicks);

    if (isMatch) {
      setMatchScore((s) => s + 1);
      SoundEngine.chime();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setIsFinished(true);
      SoundEngine.confettiPop();
      unlockAchievement('arcade_champion');
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
      });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedChoice(null);
    setMatchScore(0);
    setIsFinished(false);
  };

  return (
    <div className="p-6 text-white text-center font-nunito max-w-xl mx-auto select-none">
      <div className="mb-6">
        <span className="text-4xl block mb-1">⚖️💞</span>
        <h3 className="font-serif text-2xl md:text-3xl text-[var(--butter)] font-bold">
          Would You Rather: Couple Edition
        </h3>
        <p className="text-xs font-mono text-gray-300 mt-1">
          Pick your choice and see if your soul aligns with Yajat&apos;s!
        </p>
      </div>

      {!isFinished ? (
        <div>
          {/* Progress Pill */}
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-6 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <span>
              Question {currentIdx + 1} / {QUESTIONS.length}
            </span>
            <span className="text-[var(--pink)] font-bold">
              Soulmate Match: {matchScore} synced!
            </span>
          </div>

          {/* TWO CHOICES CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {/* OPTION A */}
            <motion.div
              whileHover={{ scale: selectedChoice ? 1 : 1.03 }}
              whileTap={{ scale: selectedChoice ? 1 : 0.97 }}
              onClick={() => handleChoose('A')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] text-left relative overflow-hidden ${
                selectedChoice === 'A'
                  ? 'bg-[var(--pink-deep)]/40 border-[var(--pink)] shadow-xl'
                  : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div>
                <span className="text-3xl block mb-2">{currentQ.optionA.emoji}</span>
                <p className="font-bold text-base text-white leading-snug">
                  {currentQ.optionA.text}
                </p>
              </div>

              {/* Reveal Yajat's pick when selected */}
              <AnimatePresence>
                {selectedChoice !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-3 border-t border-white/15"
                  >
                    {currentQ.optionA.yajatPicks ? (
                      <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">
                        ✓ Yajat Chose This Too! 🥹❤️
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-gray-400 block mb-1">
                        Yajat picked the other one!
                      </span>
                    )}
                    <p className="font-caveat text-sm text-[var(--butter)]">
                      &ldquo;{currentQ.optionA.yajatComment}&rdquo;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* OPTION B */}
            <motion.div
              whileHover={{ scale: selectedChoice ? 1 : 1.03 }}
              whileTap={{ scale: selectedChoice ? 1 : 0.97 }}
              onClick={() => handleChoose('B')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] text-left relative overflow-hidden ${
                selectedChoice === 'B'
                  ? 'bg-[var(--pink-deep)]/40 border-[var(--pink)] shadow-xl'
                  : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div>
                <span className="text-3xl block mb-2">{currentQ.optionB.emoji}</span>
                <p className="font-bold text-base text-white leading-snug">
                  {currentQ.optionB.text}
                </p>
              </div>

              {/* Reveal Yajat's pick when selected */}
              <AnimatePresence>
                {selectedChoice !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-3 border-t border-white/15"
                  >
                    {currentQ.optionB.yajatPicks ? (
                      <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">
                        ✓ Yajat Chose This Too! 🥹❤️
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-gray-400 block mb-1">
                        Yajat picked the other one!
                      </span>
                    )}
                    <p className="font-caveat text-sm text-[var(--butter)]">
                      &ldquo;{currentQ.optionB.yajatComment}&rdquo;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Next Button */}
          {selectedChoice !== null && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleNext}
              className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-mono font-bold text-xs shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              Next Dilemma &rarr;
            </motion.button>
          )}
        </div>
      ) : (
        /* FINISHED SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 p-8 rounded-3xl border border-[var(--pink)]/50 space-y-4"
        >
          <span className="text-5xl block mb-2">🎉💑</span>
          <h4 className="font-serif text-2xl font-bold text-white">
            Soul Alignment Test Complete!
          </h4>
          <p className="font-caveat text-3xl text-[var(--butter)] font-bold">
            You matched with Yajat on {matchScore} / {QUESTIONS.length} choices!
          </p>
          <p className="text-xs text-gray-300 max-w-md mx-auto font-nunito leading-relaxed">
            {matchScore >= 5
              ? "Astronomical 100% Soulmate Harmony! You two share the exact same brain cells, romantic impulses, and midnight cravings ❤️✨"
              : "Complementary Opposites! Even when you choose differently, that's why we fit together like puzzle pieces 🥰"}
          </p>

          <div className="pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 font-mono text-xs font-bold text-white border border-white/20 cursor-pointer"
            >
              Play Again ↺
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

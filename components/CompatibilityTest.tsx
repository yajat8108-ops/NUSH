'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import SectionHead from './SectionHead';
import { useUniverseStore } from '@/lib/universeStore';

interface Question {
  id: number;
  text: string;
  options: { label: string; value: string }[];
  yajatAnswer: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Perfect date night starts with...',
    options: [
      { label: '🍜 Late-night Maggi', value: 'maggi' },
      { label: '🍕 Ordering pizza', value: 'pizza' },
      { label: '🍳 Cooking together', value: 'cook' },
      { label: '🍦 Dessert first', value: 'dessert' },
    ],
    yajatAnswer: 'maggi',
  },
  {
    id: 2,
    text: 'How do you say "I love you" best?',
    options: [
      { label: '💋 Forehead kiss', value: 'kiss' },
      { label: '🫢 Random tight hug', value: 'hug' },
      { label: '✍️ Write a letter', value: 'letter' },
      { label: '🎁 A surprise gift', value: 'gift' },
    ],
    yajatAnswer: 'kiss',
  },
  {
    id: 3,
    text: 'After a fight, we should...',
    options: [
      { label: '🫢 Hug it out instantly', value: 'hug' },
      { label: '💬 Talk it through calmly', value: 'talk' },
      { label: '⏳ Take 10 mins then talk', value: 'space' },
      { label: '🍜 Eat and forget about it', value: 'eat' },
    ],
    yajatAnswer: 'hug',
  },
  {
    id: 4,
    text: 'The best lazy Sunday activity:',
    options: [
      { label: '🛌 Cuddling in bed all day', value: 'cuddle' },
      { label: '🎬 Movie marathon', value: 'movie' },
      { label: '🚶 Long walk, no destination', value: 'walk' },
      { label: '💻 Coding / studying together', value: 'code' },
    ],
    yajatAnswer: 'cuddle',
  },
  {
    id: 5,
    text: 'If we could teleport anywhere right now:',
    options: [
      { label: '🏔️ Swiss Alps cabin', value: 'swiss' },
      { label: '🌌 Under the Northern Lights', value: 'aurora' },
      { label: '🌸 Cherry blossoms in Japan', value: 'japan' },
      { label: '🏡 Back to Open Audi, VIT', value: 'vit' },
    ],
    yajatAnswer: 'aurora',
  },
  {
    id: 6,
    text: 'Most important thing in a relationship:',
    options: [
      { label: '🤝 Trust & honesty', value: 'trust' },
      { label: '😂 Laughter & fun', value: 'fun' },
      { label: '💬 Communication', value: 'comm' },
      { label: '❤️ All of the above', value: 'all' },
    ],
    yajatAnswer: 'all',
  },
  {
    id: 7,
    text: 'Song that reminds you of us:',
    options: [
      { label: '🎵 Agar Tum Saath Ho', value: 'atsh' },
      { label: '🎵 Perfect by Ed Sheeran', value: 'perfect' },
      { label: '🎵 Tum Hi Ho', value: 'tumhiho' },
      { label: '🎵 All of them honestly', value: 'all' },
    ],
    yajatAnswer: 'all',
  },
  {
    id: 8,
    text: 'Who falls asleep during movies first?',
    options: [
      { label: '😴 Definitely me', value: 'me' },
      { label: '😴 Definitely them', value: 'them' },
      { label: '🤝 We both pass out', value: 'both' },
      { label: '☕ Neither, we\'re caffeine-powered', value: 'neither' },
    ],
    yajatAnswer: 'them',
  },
  {
    id: 9,
    text: 'Dream future pet:',
    options: [
      { label: '🐕 Golden Retriever puppy', value: 'dog' },
      { label: '🐱 Fluffy cat', value: 'cat' },
      { label: '🐰 A bunny', value: 'bunny' },
      { label: '🐻 A literal teddy bear (alive)', value: 'teddy' },
    ],
    yajatAnswer: 'dog',
  },
  {
    id: 10,
    text: 'Biggest green flag in a partner:',
    options: [
      { label: '😊 Remembers small details', value: 'details' },
      { label: '💬 Communicates openly', value: 'comm' },
      { label: '😂 Makes you laugh every day', value: 'laugh' },
      { label: '🌙 Stays up late just to talk to you', value: 'latenight' },
    ],
    yajatAnswer: 'latenight',
  },
  {
    id: 11,
    text: 'How should mornings start?',
    options: [
      { label: '☀️ Good morning text', value: 'text' },
      { label: '📞 Quick voice call', value: 'call' },
      { label: '🤗 Waking up next to each other (future)', value: 'together' },
      { label: '🍜 Maggi in bed', value: 'maggi' },
    ],
    yajatAnswer: 'together',
  },
  {
    id: 12,
    text: 'Best way to surprise your partner:',
    options: [
      { label: '🎁 Handmade gift', value: 'handmade' },
      { label: '💌 Surprise letter', value: 'letter' },
      { label: '🧸 Show up unannounced', value: 'showup' },
      { label: '💻 Build them an entire website', value: 'website' },
    ],
    yajatAnswer: 'website',
  },
  {
    id: 13,
    text: 'If we were in a movie, our genre would be:',
    options: [
      { label: '💕 Bollywood romance', value: 'bollywood' },
      { label: '😂 RomCom', value: 'romcom' },
      { label: '✨ Fantasy epic', value: 'fantasy' },
      { label: '🌌 Sci-fi love story', value: 'scifi' },
    ],
    yajatAnswer: 'romcom',
  },
  {
    id: 14,
    text: 'Our relationship superpower is:',
    options: [
      { label: '😂 Making each other laugh', value: 'laugh' },
      { label: '🫢 Comfort in silence', value: 'silence' },
      { label: '💪 Growing together', value: 'growth' },
      { label: '🔥 All of the above', value: 'all' },
    ],
    yajatAnswer: 'all',
  },
  {
    id: 15,
    text: 'In 5 years, we will be...',
    options: [
      { label: '🏠 Living together, thriving', value: 'together' },
      { label: '✈️ Travelling the world', value: 'travel' },
      { label: '💍 Starting our forever', value: 'forever' },
      { label: '🌟 All of the above', value: 'all' },
    ],
    yajatAnswer: 'all',
  },
];

function getCompatibilityAnalysis(score: number): { emoji: string; title: string; desc: string; color: string } {
  if (score >= 90)
    return {
      emoji: '💫',
      title: 'COSMICALLY SOULMATES',
      desc: 'You two literally share the same brain. This is destiny-level compatibility. The universe conspired for you.',
      color: 'from-pink-500 via-purple-500 to-indigo-500',
    };
  if (score >= 75)
    return {
      emoji: '🔥',
      title: 'ON FIRE COMPATIBLE',
      desc: "You think alike, vibe alike, and love alike. You're basically the same person in two bodies.",
      color: 'from-orange-500 to-pink-500',
    };
  if (score >= 60)
    return {
      emoji: '💕',
      title: 'BEAUTIFULLY BALANCED',
      desc: "You complement each other perfectly. Where one zigs, the other zags. That's what makes you magic.",
      color: 'from-rose-400 to-pink-500',
    };
  return {
    emoji: '✨',
    title: 'OPPOSITES ATTRACT',
    desc: "You bring different perspectives, and that's your strength. Together you see the whole picture.",
    color: 'from-amber-400 to-rose-400',
  };
}

export default function CompatibilityTest() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [revealYajat, setRevealYajat] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { unlockAchievement, addExplorationPoint } = useUniverseStore();

  const question = QUESTIONS[currentQ];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentQ + (answers[currentQ + 1] !== undefined ? 1 : 0)) / totalQuestions) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);

    if (currentQ < totalQuestions - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 400);
    } else {
      // Calculate score
      setTimeout(() => {
        setShowResult(true);
        addExplorationPoint('compatibility_test');

        const matchCount = QUESTIONS.filter((q) => newAnswers[q.id - 1] === q.yajatAnswer).length;
        const score = Math.round((matchCount / totalQuestions) * 100);

        if (score >= 90) {
          unlockAchievement('perfect_match');
        }

        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
        });
      }, 500);
    }
  };

  const matchCount = QUESTIONS.filter((q) => answers[q.id - 1] === q.yajatAnswer).length;
  const score = Math.round((matchCount / totalQuestions) * 100);
  const analysis = getCompatibilityAnalysis(score);

  const downloadCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 800;
    const h = 560;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = '#FFF8F0';
    ctx.fillRect(0, 0, w, h);

    // Gold border
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.strokeStyle = '#E8C99B';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Title
    ctx.fillStyle = '#3D2B56';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Compatibility Certificate', w / 2, 80);

    // Subtitle
    ctx.fillStyle = '#6B5B7B';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('This certifies that', w / 2, 120);

    // Names
    ctx.fillStyle = '#FF5C8E';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('Yajat & Anushka', w / 2, 175);

    // Score
    ctx.fillStyle = '#3D2B56';
    ctx.font = 'bold 72px Georgia, serif';
    ctx.fillText(`${score}%`, w / 2, 270);

    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = '#6B5B7B';
    ctx.fillText(`${analysis.emoji} ${analysis.title}`, w / 2, 310);

    // Description (word wrap)
    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = '#8B7B9B';
    const words = analysis.desc.split(' ');
    let line = '';
    let y = 350;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 500) {
        ctx.fillText(line, w / 2, y);
        line = word + ' ';
        y += 22;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, w / 2, y);

    // Match details
    ctx.font = '14px monospace';
    ctx.fillStyle = '#A08BB0';
    ctx.fillText(`${matchCount} / ${totalQuestions} answers matched · Tested on ${new Date().toLocaleDateString()}`, w / 2, y + 50);

    // Footer
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillStyle = '#FF5C8E';
    ctx.fillText('Made with ❤️ in the Yajat × Nush Universe', w / 2, h - 50);

    // Gold seal circle
    ctx.beginPath();
    ctx.arc(w - 90, h - 100, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#D4A574';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 90, h - 100, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#E8C99B';
    ctx.fill();
    ctx.font = 'bold 16px serif';
    ctx.fillStyle = '#8B6914';
    ctx.fillText('✓', w - 90, h - 95);

    // Download
    const link = document.createElement('a');
    link.download = 'yajat-nush-compatibility.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [score, analysis, matchCount, totalQuestions]);

  return (
    <section className="anniversary-section py-20 px-4">
      <SectionHead
        eyebrow="the ultimate couple quiz"
        title="Compatibility Test 💕"
        subtitle="15 questions to prove we're soulmates (spoiler: we are)"
      />

      <div className="max-w-2xl mx-auto mt-6">
        <AnimatePresence mode="wait">
          {/* START SCREEN */}
          {!started && !showResult && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[var(--pink)] to-[var(--lavender)] flex items-center justify-center text-6xl shadow-2xl">
                💕
              </div>
              <h3 className="text-2xl font-bold text-[var(--plum)] font-serif">
                How Compatible Are We?
              </h3>
              <p className="text-[var(--plum-soft)] font-nunito max-w-md mx-auto">
                Answer 15 fun questions, then see how your answers compare to Yajat&apos;s. 
                Score 90%+ and unlock the <strong>Perfect Match</strong> achievement! 🏆
              </p>
              <button
                onClick={() => setStarted(true)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lavender)] text-white font-bold font-mono text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                START THE TEST 💗
              </button>
            </motion.div>
          )}

          {/* QUESTION SCREEN */}
          {started && !showResult && question && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="space-y-5"
            >
              {/* Progress Bar */}
              <div className="relative h-2.5 bg-white/30 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--pink)] to-[var(--lavender)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--plum-soft)]">
                <span>Question {currentQ + 1} / {totalQuestions}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>

              {/* Question */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-[var(--pink)]/20 shadow-xl">
                <h3 className="text-xl md:text-2xl font-bold text-[var(--plum)] font-serif mb-6 leading-snug">
                  {question.text}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((opt) => {
                    const selected = answers[currentQ] === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAnswer(opt.value)}
                        className={`p-4 rounded-2xl text-left font-nunito font-semibold text-sm transition-all cursor-pointer border-2 ${
                          selected
                            ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--lavender)] text-white border-transparent shadow-lg scale-105'
                            : 'bg-white hover:bg-[var(--pink)]/5 text-[var(--plum)] border-gray-200 hover:border-[var(--pink)]/40'
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT SCREEN */}
          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="space-y-6"
            >
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-[var(--pink)]/30 shadow-2xl text-center space-y-5">
                {/* Big Score */}
                <div className="text-7xl font-bold">{analysis.emoji}</div>
                <div className="relative w-36 h-36 mx-auto">
                  {/* Progress ring */}
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="#f3f4f6" strokeWidth="10" fill="none" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#ring-grad)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - score / 100) }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--pink)" />
                        <stop offset="100%" stopColor="var(--lavender)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-[var(--plum)] font-mono">{score}%</span>
                  </div>
                </div>

                <h3 className={`text-2xl font-bold bg-gradient-to-r ${analysis.color} bg-clip-text text-transparent`}>
                  {analysis.title}
                </h3>
                <p className="text-[var(--plum-soft)] font-nunito max-w-lg mx-auto leading-relaxed">
                  {analysis.desc}
                </p>

                <div className="text-sm font-mono text-gray-400 pt-2 border-t border-gray-200">
                  {matchCount} / {totalQuestions} answers matched with Yajat
                </div>

                {/* Reveal Yajat's Answers */}
                <button
                  onClick={() => setRevealYajat(!revealYajat)}
                  className="px-5 py-2 rounded-full bg-white border border-[var(--pink)]/30 text-[var(--plum)] font-mono text-xs font-bold hover:bg-[var(--pink)]/5 transition-all cursor-pointer"
                >
                  {revealYajat ? 'Hide' : 'Reveal'} Yajat&apos;s Answers 👀
                </button>

                <AnimatePresence>
                  {revealYajat && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-3 max-h-60 overflow-y-auto">
                        {QUESTIONS.map((q) => {
                          const userAns = q.options.find((o) => o.value === answers[q.id - 1]);
                          const yajatAns = q.options.find((o) => o.value === q.yajatAnswer);
                          const matched = answers[q.id - 1] === q.yajatAnswer;
                          return (
                            <div
                              key={q.id}
                              className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-mono ${
                                matched ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                              }`}
                            >
                              <span>{matched ? '✅' : '❌'}</span>
                              <span className="flex-1 text-left truncate">{q.text}</span>
                              <span className="font-bold">{yajatAns?.label.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-3 pt-3">
                  <button
                    onClick={downloadCertificate}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-mono text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    📸 Download Certificate
                  </button>
                  <button
                    onClick={() => {
                      setStarted(false);
                      setShowResult(false);
                      setCurrentQ(0);
                      setAnswers({});
                      setRevealYajat(false);
                    }}
                    className="px-6 py-2.5 rounded-full bg-white border border-gray-300 text-[var(--plum)] font-mono text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    🔄 Retake Test
                  </button>
                </div>
              </div>

              {/* Hidden canvas for certificate download */}
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

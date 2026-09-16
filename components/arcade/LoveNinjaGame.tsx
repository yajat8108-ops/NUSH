'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface SlicingItem {
  id: number;
  type: 'heart' | 'rose' | 'chocolate' | 'cupcake' | 'letter' | 'teddy' | 'photo' | 'golden' | 'diamond' | 'double' | 'broken' | 'cloud' | 'redflag' | 'oops';
  emoji: string;
  label: string;
  points: number;
  isBad: boolean;
  isSpecial: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  rotation: number;
  vRot: number;
  size: number;
  sliced: boolean;
  sliceAngle: number;
  sliceProgress: number;
  photoSrc?: string;
  photoCaption?: string;
}

interface SliceTrailPoint {
  x: number;
  y: number;
  time: number;
}

interface FloatingScore {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

const MEMORY_SNIPPETS = [
  { photo: '/photos/photo-1.jpg', caption: 'The teddy delivery day 🧸 named after me!' },
  { photo: '/photos/photo-new-1.jpg', caption: 'Our all-night call smiling till sunrise 🌙' },
  { photo: '/photos/photo-5.jpg', caption: '0% studying, 100% staring at you in the library 📚' },
  { photo: '/photos/photo-10.jpg', caption: 'Forehead kisses on loop forever 😘' },
];

const ROASTS = [
  'Arey bhai, ye nahi kaatna tha 😭',
  'BRO THAT WAS A RED FLAG 🚩💀',
  'Wrong target! Why are you slicing the drama? 😭',
  'Relationship status: in recovery 😂',
  'Skill issue, baby ❤️',
];

export default function LoveNinjaGame() {
  const {
    loveSliceBestScore,
    loveSliceBestCombo,
    saveLoveSliceScore,
    unlockAchievement,
    addExplorationPoint,
  } = useUniverseStore();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'gameover'>('ready');
  const [mode, setMode] = useState<'classic' | 'rush' | 'datenight' | 'memory' | 'redflag'>('classic');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierTimer, setMultiplierTimer] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [roastMessage, setRoastMessage] = useState<string | null>(null);
  const [activeMemory, setActiveMemory] = useState<{ photo: string; caption: string } | null>(null);
  const [goldenNote, setGoldenNote] = useState<string | null>(null);

  // Stats
  const [heartsSliced, setHeartsSliced] = useState(0);
  const [rosesSliced, setRosesSliced] = useState(0);
  const [specialsFound, setSpecialsFound] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const itemsRef = useRef<SlicingItem[]>([]);
  const trailRef = useRef<SliceTrailPoint[]>([]);
  const isPointerDownRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const floatingScoresRef = useRef<FloatingScore[]>([]);

  // Sound & SFX helper
  const playSliceEffect = useCallback((item: SlicingItem) => {
    if (item.isBad) {
      SoundEngine.error();
    } else if (item.type === 'diamond') {
      SoundEngine.diamondGlow();
    } else if (item.type === 'golden') {
      SoundEngine.chime();
    } else {
      SoundEngine.slice();
    }
  }, []);

  const spawnItem = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Determine type based on mode & weights
    const roll = Math.random();
    let type: SlicingItem['type'] = 'heart';
    let emoji = '❤️';
    let label = '+10';
    let points = 10;
    let isBad = false;
    let isSpecial = false;
    let photoSrc: string | undefined;
    let photoCaption: string | undefined;

    if (mode === 'redflag' && roll < 0.4) {
      const badRoll = Math.random();
      if (badRoll < 0.5) {
        type = 'redflag'; emoji = '🚩'; label = 'Red Flag!'; isBad = true; points = 0;
      } else {
        type = 'cloud'; emoji = '☁️'; label = 'Drama Cloud'; isBad = true; points = 0;
      }
    } else if (roll < 0.04) {
      type = 'diamond'; emoji = '💎'; label = '+250'; points = 250; isSpecial = true;
    } else if (roll < 0.09) {
      type = 'golden'; emoji = '💛'; label = '+100'; points = 100; isSpecial = true;
    } else if (roll < 0.15) {
      type = 'double'; emoji = '💕'; label = '3X Multiplier!'; points = 50; isSpecial = true;
    } else if (roll < 0.22) {
      type = 'photo'; emoji = '📸'; label = 'Memory!'; points = 60; isSpecial = true;
      const mem = MEMORY_SNIPPETS[Math.floor(Math.random() * MEMORY_SNIPPETS.length)];
      photoSrc = mem.photo;
      photoCaption = mem.caption;
    } else if (roll < 0.35) {
      type = 'letter'; emoji = '💌'; label = '+35'; points = 35;
    } else if (roll < 0.48) {
      type = 'chocolate'; emoji = '🍫'; label = '+25'; points = 25;
    } else if (roll < 0.60) {
      type = 'rose'; emoji = '🌹'; label = '+20'; points = 20;
    } else if (roll < 0.72) {
      type = 'cupcake'; emoji = '🧁'; label = '+15'; points = 15;
    } else if (roll < 0.85) {
      type = 'heart'; emoji = '❤️'; label = '+10'; points = 10;
    } else {
      // Bad objects (15% chance in normal modes)
      const badRoll = Math.random();
      if (badRoll < 0.4) {
        type = 'broken'; emoji = '💔'; label = 'Broken Heart'; isBad = true; points = 0;
      } else if (badRoll < 0.7) {
        type = 'redflag'; emoji = '🚩'; label = 'Red Flag'; isBad = true; points = 0;
      } else {
        type = 'oops'; emoji = '😭'; label = 'Drama'; isBad = true; points = 0;
      }
    }

    const startX = width * 0.15 + Math.random() * width * 0.7;
    const targetX = width * 0.5 + (Math.random() - 0.5) * width * 0.5;
    const vx = (targetX - startX) * 0.015 * (Math.random() * 0.4 + 0.8);
    const speedBase = mode === 'rush' ? 17 : 14;
    const vy = -(speedBase + Math.random() * 4);

    const newItem: SlicingItem = {
      id: Date.now() + Math.random(),
      type,
      emoji,
      label,
      points,
      isBad,
      isSpecial,
      x: startX,
      y: height + 20,
      vx,
      vy,
      gravity: 0.28,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.08,
      size: isSpecial ? 54 : 44,
      sliced: false,
      sliceAngle: 0,
      sliceProgress: 0,
      photoSrc,
      photoCaption,
    };

    itemsRef.current.push(newItem);
  }, [mode]);

  // Line segment collision detection
  const checkLineIntersection = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    item: SlicingItem
  ) => {
    const distToSegment = (
      px: number,
      py: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => {
      const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    };

    const d = distToSegment(item.x, item.y, p1.x, p1.y, p2.x, p2.y);
    return d < item.size * 0.65;
  };

  const handleSlice = (item: SlicingItem, angle: number) => {
    if (item.sliced) return;
    item.sliced = true;
    item.sliceAngle = angle;
    playSliceEffect(item);

    if (item.isBad) {
      // Bad item sliced!
      setCombo(0);
      setMultiplier(1);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) setGameState('gameover');
        return next;
      });
      const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
      setRoastMessage(roast);
      setTimeout(() => setRoastMessage(null), 2500);
    } else {
      // Good item sliced!
      const earned = item.points * multiplier;
      setScore((s) => s + earned);
      setCombo((c) => {
        const next = c + 1;
        if (next > bestCombo) setBestCombo(next);
        SoundEngine.comboPing(next);

        // Milestone achievements
        if (next === 23) {
          addExplorationPoint('slice_combo_23', 'Hit 23 Smooch Combo in Love Slice!');
        }
        return next;
      });

      if (item.type === 'heart') setHeartsSliced((h) => h + 1);
      if (item.type === 'rose') setRosesSliced((r) => r + 1);

      if (item.isSpecial) {
        setSpecialsFound((s) => s + 1);
        if (item.type === 'double') {
          setMultiplier(3);
          setMultiplierTimer(8);
        } else if (item.type === 'golden') {
          setGoldenNote("💛 Hidden Note: You make every normal day feel sacred, Nushi.");
        } else if (item.type === 'diamond') {
          unlockAchievement('diamond_heart');
        } else if (item.type === 'photo' && item.photoSrc) {
          setActiveMemory({ photo: item.photoSrc, caption: item.photoCaption || '' });
        }
      }

      floatingScoresRef.current.push({
        id: Date.now() + Math.random(),
        text: `+${earned}`,
        x: item.x,
        y: item.y,
        color: item.isSpecial ? '#FFDD8C' : '#FF5C8E',
        createdAt: Date.now(),
      });
    }
  };

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Resize canvas to display size
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn items
      const spawnInterval = mode === 'rush' ? 450 : 750;
      if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
        spawnItem();
        if (Math.random() < 0.35) spawnItem(); // Burst spawn
        lastSpawnTimeRef.current = currentTime;
      }

      // Update & draw slice trail
      const now = Date.now();
      trailRef.current = trailRef.current.filter((p) => now - p.time < 180);

      if (trailRef.current.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
        for (let i = 1; i < trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
        }
        ctx.strokeStyle = multiplier > 1 ? '#FFDD8C' : '#FF5C8E';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#FF9EC9';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // Update items
      itemsRef.current.forEach((item) => {
        item.x += item.vx;
        item.y += item.vy;
        item.vy += item.gravity;
        item.rotation += item.vRot;

        // Draw item
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (!item.sliced) {
          ctx.font = `${item.size}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.emoji, 0, 0);

          // Glow for special
          if (item.isSpecial) {
            ctx.strokeStyle = '#FFDD8C';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, item.size * 0.6, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Sliced halves splitting
          item.sliceProgress += dt * 4;
          const offset = item.sliceProgress * 30;
          ctx.save();
          ctx.rotate(item.sliceAngle);
          ctx.font = `${item.size * 0.8}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.emoji, -offset, 0);
          ctx.fillText(item.emoji, offset, 0);
          ctx.restore();
        }

        ctx.restore();
      });

      // Filter out offscreen items
      itemsRef.current = itemsRef.current.filter(
        (item) => item.y < canvas.height + 60 && (!item.sliced || item.sliceProgress < 1.5)
      );

      // Render floating scores
      const scoreNow = Date.now();
      floatingScoresRef.current.forEach((f) => {
        f.y -= 1.5;
        ctx.save();
        ctx.fillStyle = f.color;
        ctx.font = 'bold 20px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });
      floatingScoresRef.current = floatingScoresRef.current
        .filter((f) => scoreNow - f.createdAt < 800)
        .slice(-12);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, mode, multiplier, playSliceEffect, spawnItem]);

  // Pointer slice tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = { x, y, time: Date.now() };
    trailRef.current.push(point);

    if (trailRef.current.length > 2) {
      const p1 = trailRef.current[trailRef.current.length - 2];
      const p2 = point;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      itemsRef.current.forEach((item) => {
        if (!item.sliced && checkLineIntersection(p1, p2, item)) {
          handleSlice(item, angle);
        }
      });
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('gameover');
          return 0;
        }
        return t - 1;
      });

      setMultiplierTimer((mt) => {
        if (mt <= 1) {
          setMultiplier(1);
          return 0;
        }
        return mt - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Game over handler
  useEffect(() => {
    if (gameState === 'gameover') {
      saveLoveSliceScore(score, bestCombo, heartsSliced + rosesSliced);
      if (score > loveSliceBestScore) {
        SoundEngine.confettiPop();
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
        });
      }
    }
  }, [gameState, score, bestCombo, heartsSliced, rosesSliced, loveSliceBestScore, saveLoveSliceScore]);

  const startGame = (chosenMode: typeof mode) => {
    setMode(chosenMode);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setMultiplier(1);
    setMultiplierTimer(0);
    setLives(3);
    setTimeLeft(chosenMode === 'rush' ? 45 : 60);
    itemsRef.current = [];
    trailRef.current = [];
    floatingScoresRef.current = [];
    setGameState('playing');
    SoundEngine.whoosh();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-b from-[#1a1528] via-[#241a36] to-[#120f18] rounded-3xl border-2 border-[var(--pink)]/40 p-4 md:p-6 shadow-2xl overflow-hidden text-white font-nunito select-none">
      {/* Background ambient stars */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#FF9EC9_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header HUD */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🥷💗</span>
          <div>
            <h3 className="font-bold text-lg text-[var(--butter)] font-mono tracking-wider">LOVE SLICE</h3>
            <p className="text-xs text-[var(--pink)]">Slice the love, avoid the drama</p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-4 text-sm font-mono">
            <div className="bg-black/40 px-3 py-1 rounded-full border border-[var(--pink)]/30">
              Score: <span className="text-[var(--butter)] font-bold text-base">{score}</span>
            </div>
            <div className="bg-black/40 px-3 py-1 rounded-full border border-[var(--lav)]/30">
              Combo: <span className="text-[var(--pink)] font-bold">{combo}x</span>
            </div>
            {multiplier > 1 && (
              <div className="bg-[var(--pink-deep)] px-3 py-1 rounded-full text-white font-bold animate-pulse text-xs">
                {multiplier}X Multiplier ({multiplierTimer}s)
              </div>
            )}
            <div className="bg-black/40 px-3 py-1 rounded-full text-red-400">
              {'❤️'.repeat(lives)}
            </div>
            <div className="bg-black/40 px-3 py-1 rounded-full">
              ⏱️ {timeLeft}s
            </div>
          </div>
        )}

        <div className="text-xs text-white/60 font-mono">
          High: <span className="text-[var(--butter)]">{loveSliceBestScore}</span>
        </div>
      </div>

      {/* Play Area */}
      <div className="relative w-full h-[460px] md:h-[520px] my-3 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={() => (isPointerDownRef.current = true)}
          onPointerUp={() => (isPointerDownRef.current = false)}
          onPointerMove={handlePointerMove}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />

        {/* Start Overlay */}
        {gameState === 'ready' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-20 text-center p-6 bg-black/80 backdrop-blur-md rounded-2xl border border-[var(--pink)]/40 max-w-md mx-4"
          >
            <span className="text-5xl mb-3 block">🥷❤️✨</span>
            <h4 className="text-2xl font-bold text-[var(--butter)] mb-2 font-mono">LOVE SLICE ARCADE</h4>
            <p className="text-sm text-gray-300 mb-4">
              Swipe through hearts, roses, and love letters! Avoid red flags and drama clouds 🚩💔
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs mb-6 text-left bg-white/5 p-3 rounded-xl">
              <div><span className="text-green-400 font-bold">SLICE:</span> ❤️ 🌹 🍫 💌 💎</div>
              <div><span className="text-red-400 font-bold">AVOID:</span> 🚩 💔 ☁️ 😭</div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => startGame('classic')}
                className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Classic Mode 🌸
              </button>
              <button
                onClick={() => startGame('rush')}
                className="bg-white/10 border border-[var(--butter)] text-[var(--butter)] px-5 py-2.5 rounded-full font-bold hover:bg-white/20 transition-transform"
              >
                Kiss Rush (Fast!) 💋
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-20 text-center p-6 bg-black/85 backdrop-blur-md rounded-2xl border border-[var(--pink)]/50 max-w-md mx-4"
          >
            <span className="text-4xl mb-2 block">🏆💗</span>
            <h4 className="text-2xl font-bold text-[var(--butter)] mb-1 font-mono">LOVE SLICE COMPLETE</h4>
            <p className="text-xs text-[var(--pink)] mb-4">
              {score >= 2000
                ? 'Best boyfriend mode: ACTIVATED 👑💖'
                : score >= 1000
                ? 'Certified romantic gamer! 🥹❤️'
                : 'Not bad, Nushi! Keep slicing the romance 🌸'}
            </p>

            <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-xl mb-6 text-xs font-mono">
              <div>
                <span className="text-gray-400 block">Score</span>
                <span className="text-lg font-bold text-[var(--butter)]">{score}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Best Combo</span>
                <span className="text-lg font-bold text-[var(--pink)]">{bestCombo}x</span>
              </div>
              <div>
                <span className="text-gray-400 block">Hearts</span>
                <span className="text-lg font-bold text-white">{heartsSliced}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startGame('classic')}
                className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Play Again 🔄
              </button>
            </div>
          </motion.div>
        )}

        {/* Floating Roast Toast */}
        <AnimatePresence>
          {roastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-6 z-30 bg-red-900/90 text-white px-4 py-2 rounded-full border border-red-500 font-bold text-sm shadow-xl"
            >
              {roastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Golden Note Modal */}
        <AnimatePresence>
          {goldenNote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute z-40 p-4 bg-[var(--butter)] text-[#1a1528] rounded-2xl border-2 border-yellow-400 font-bold text-sm shadow-2xl max-w-xs text-center"
            >
              <p>{goldenNote}</p>
              <button
                onClick={() => setGoldenNote(null)}
                className="mt-3 bg-[#1a1528] text-white text-xs px-4 py-1.5 rounded-full"
              >
                Keep Slicing ❤️
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory Photo Popup */}
        <AnimatePresence>
          {activeMemory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute z-40 p-4 bg-white/95 text-[#1a1528] rounded-2xl border-4 border-[var(--pink-deep)] shadow-2xl max-w-xs text-center"
            >
              <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border mb-2">
                <img src={activeMemory.photo} alt="Memory" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-[var(--plum)]">{activeMemory.caption}</p>
              <button
                onClick={() => setActiveMemory(null)}
                className="mt-3 bg-[var(--pink-deep)] text-white text-xs px-4 py-1.5 rounded-full font-bold shadow hover:scale-105"
              >
                Resume Love Slice 💖
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';

type ItemType = {
  id: string;
  type: string;
  emoji: string;
  points: number;
  x: number; // 0 to 100 %
  y: number; // 0 to 100 %
  speed: number;
  sound?: string;
};

const ITEM_DEFS = [
  { type: 'teddy', emoji: '🧸', points: 50, sound: 'squeak' },
  { type: 'heart', emoji: '💖', points: 30, sound: 'pop' },
  { type: 'kiss', emoji: '💋', points: 60, sound: 'chime' },
  { type: 'maggi', emoji: '🍜', points: 80, sound: 'pop' },
  { type: 'guard', emoji: '🚨', points: -100, sound: 'buzzer' },
  { type: 'guard_cop', emoji: '👮‍♂️', points: -100, sound: 'buzzer' },
];

const MILESTONES = [
  {
    score: 1000,
    title: 'Open Audi Kickoff 🥹',
    message: 'Open Audi — our sacred, pavitra spot. Every time I think of our memories there, I tear up happy tears. You\'re already doing amazing, bbg! ❤️',
    badge: '🏛️ Level 1'
  },
  {
    score: 2000,
    title: 'The 8 PM Guard Escape 👮‍♂️',
    message: '"8 baj gaye, bahar niklo!" Getting kicked out by guards is literally our favorite routine because it means more time walking together 😭😂',
    badge: '🏃‍♂️ Level 2'
  },
  {
    score: 3000,
    title: 'AB-1 Mission 🚶‍♂️',
    message: 'Finding our way through AB-1, stretching every second. Walking slow on purpose just to hold your hand longer 🥹❤️',
    badge: '🏫 Level 3'
  },
  {
    score: 4000,
    title: 'Dr. Morphin\'s Pitstop ☕',
    message: 'Dr. Morphin\'s cafe right in between AB-1 and Open Audi. You make the simplest campus walks feel like our own little romantic movie 🎬',
    badge: '☕ Level 4'
  },
  {
    score: 5000,
    title: 'Teddy Yajat Delivery 🧸',
    message: 'You named the teddy bear after me... literally named him Yajat 😭💀 Whenever you miss me, hug that bear tight bbg! ❤️',
    badge: '🧸 Level 5'
  },
  {
    score: 6000,
    title: '2 AM Maggi & Late Night Calls 🍜',
    message: 'Extra cheese Maggi at 2 am and late night talks where neither of us wants to say goodbye first. My favorite world in the whole universe 🌌',
    badge: '🍜 Level 6'
  },
  {
    score: 7000,
    title: 'Forehead Kisses on Repeat 😘',
    message: 'Your forehead is my favorite place in the entire world to kiss. 1000 forehead kisses daily on unlimited refill 😘',
    badge: '💋 Level 7'
  },
  {
    score: 8000,
    title: 'Agar Tum Saath Ho 🎶',
    message: '"Agar Tum Saath Ho" playing on loop. Getting lost in the same songs and feeling the exact same emotions together ❤️🎶',
    badge: '🎵 Level 8'
  },
  {
    score: 9000,
    title: 'Girls Block 2 Goodbye 😭',
    message: 'Saying goodbye at GB-2 where I always wish time would legally freeze. You turning to walk to your hostel is the hardest goodbye every night 🥹',
    badge: '🌙 Level 9'
  },
  {
    score: 10000,
    title: '🏆 MASTER 10,000 PT GRAND CHAMPION 🏆',
    message: '🎉 HAPPY 2 MONTHS, MERI ANUSHKA! 😭❤️ 10,000 points of pure love! You are my Nush, Nushi, baby, bbg, and wifeyyy all in one. Two months that feel like a lifetime of the purest happiness. I love you endlessly, unconditionally, and forever! 🏆👑💖🧸',
    badge: '👑 Level 10'
  }
];

export default function TeddyArcadeCatcher() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [guardStrikes, setGuardStrikes] = useState(0); // 3 strikes = game over
  const [combo, setCombo] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  
  const [items, setItems] = useState<ItemType[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastItemTimeRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const handleStart = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setGuardStrikes(0);
    setCombo(0);
    setItems([]);
    setBasketX(50);
    lastItemTimeRef.current = performance.now();
    lastUpdateTimeRef.current = performance.now();
    
    try {
      SoundEngine.pop();
    } catch (e) {}
  };

  const handleGameOver = useCallback((reason: string) => {
    setIsPlaying(false);
    setIsGameOver(true);
    
    if (reason === 'guards') {
      try {
        SoundEngine.error();
      } catch (e) {}
    } else {
      try {
        SoundEngine.chime();
        SoundEngine.confettiPop();
      } catch (e) {}
    }
  }, []);

  // Game Loop
  const updateGame = useCallback((time: number) => {
    if (!isPlaying) return;
    
    const deltaTime = time - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = time;

    setItems((prevItems) => {
      let newItems = [...prevItems];
      let currentScore = score;
      let currentCombo = combo;
      let currentStrikes = guardStrikes;
      let scoreChanged = false;
      let strikesChanged = false;

      // Crisp, lively falling speed
      const speedMultiplier = 1.15 + Math.min(score / 8000, 0.45);

      // Update positions
      newItems = newItems.map(item => ({
        ...item,
        y: item.y + (item.speed * speedMultiplier * (deltaTime / 16))
      }));

      // Check collisions
      const basketY = 84; // % from top
      const basketWidth = 15; // % width
      
      const survivingItems: ItemType[] = [];

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        
        // If caught in basket
        if (item.y >= basketY && item.y <= basketY + 12) {
          if (Math.abs(item.x - basketX) < basketWidth) {
            const isGuard = item.type.startsWith('guard');
            
            if (isGuard) {
              // Caught a guard!
              currentStrikes += 1;
              currentCombo = 0;
              currentScore = Math.max(0, currentScore - 100);
              strikesChanged = true;
              scoreChanged = true;
              
              try {
                SoundEngine.error();
              } catch (e) {}

              // 3 Strikes = Terminated!
              if (currentStrikes >= 3) {
                handleGameOver('guards');
                return [];
              }
            } else {
              // Caught a good item!
              const comboMultiplier = 1 + Math.floor(currentCombo / 3) * 0.5;
              const pointsGained = Math.floor(item.points * comboMultiplier);
              
              currentScore += pointsGained;
              currentCombo += 1;
              scoreChanged = true;
              
              try {
                if (item.sound === 'squeak') SoundEngine.squeak();
                else if (item.sound === 'chime') SoundEngine.chime();
                else SoundEngine.pop();
              } catch (e) {}

              // Check 1,000 pt Milestones
              MILESTONES.forEach(m => {
                if (currentScore >= m.score && !unlockedMilestones.includes(m.score)) {
                  setUnlockedMilestones(prev => [...prev, m.score]);
                  setActiveToast(`🎉 Unlocked ${m.badge}: ${m.title}!`);
                  setTimeout(() => setActiveToast(null), 4000);
                  
                  try {
                    SoundEngine.chime();
                    SoundEngine.confettiPop();
                  } catch (e) {}
                  
                  confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.5 },
                    colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5']
                  });
                }
              });
            }
            
            continue; // Item caught and removed
          }
        }
        
        // If missed and fell off bottom
        if (item.y > 100) {
          if (!item.type.startsWith('guard')) {
            currentCombo = 0; // Break combo on miss
            currentScore = Math.max(0, currentScore - 15); // Miss penalty
            scoreChanged = true;
            try {
              SoundEngine.error();
            } catch (e) {}
          }
          continue; // Remove item
        }
        
        survivingItems.push(item);
      }
      
      if (scoreChanged) {
        setScore(currentScore);
        setCombo(currentCombo);
      }

      if (strikesChanged) {
        setGuardStrikes(currentStrikes);
      }

      // Ultra-Dense High-Frequency Spawn Stream (Spawns every 60ms–90ms with multi-item bursts)
      const spawnInterval = Math.max(60, 95 - Math.min(score / 40, 35));
      
      if (time - lastItemTimeRef.current > spawnInterval) {
        const countToSpawn = Math.random() < 0.45 ? 2 : 1;
        
        for (let s = 0; s < countToSpawn; s++) {
          const def = ITEM_DEFS[Math.floor(Math.random() * ITEM_DEFS.length)];
          const newItem: ItemType = {
            id: Math.random().toString(36).substr(2, 9) + s,
            type: def.type,
            emoji: def.emoji,
            points: def.points,
            sound: def.sound,
            x: 6 + Math.random() * 88, // 6% to 94%
            y: -10 - (s * 14),
            speed: 0.95 + Math.random() * 0.55
          };
          survivingItems.push(newItem);
        }
        lastItemTimeRef.current = time;
      }

      return survivingItems;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isPlaying, basketX, score, combo, guardStrikes, unlockedMilestones, handleGameOver]);

  // Keyboard controls with rapid movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setBasketX(prev => Math.max(6, prev - 14));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setBasketX(prev => Math.min(94, prev + 14));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Pointer/Touch controls
  const handlePointerMove = (e: React.PointerEvent | React.TouchEvent) => {
    if (!isPlaying || !containerRef.current) return;
    
    let clientX = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = (e as React.PointerEvent).clientX;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = (relativeX / rect.width) * 100;
    
    setBasketX(Math.min(Math.max(percentage, 6), 94));
  };

  const nextMilestone = MILESTONES.find(m => m.score > score) || MILESTONES[MILESTONES.length - 1];
  const progressToNext = Math.min(100, (score / nextMilestone.score) * 100);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, updateGame]);

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-3 sm:px-6 font-nunito">
      <SectionHead 
        eyebrow="arcade zone · endless survival"
        title="Teddy's Heart Catcher"
        subtitle="catch love tokens & dodge guards! unlock all 10 love milestones up to 10,000 points 🕹️❤️"
      />

      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-r from-[var(--pink-deep)] to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold font-caveat text-xl sm:text-2xl border-2 border-yellow-300 flex items-center gap-2"
          >
            {activeToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-8 bg-[#121218] p-2 sm:p-5 rounded-2xl shadow-2xl border-4 border-[var(--pink-deep)]">
        <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[inset_0_0_25px_rgba(0,0,0,0.8)] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 opacity-30" />

        <div className="flex justify-between items-center bg-[#1c1b26] text-[var(--pink)] px-4 py-3 rounded-t-xl border-b-2 border-zinc-800 font-mono text-sm sm:text-base z-10 relative">
          <div className="flex flex-col">
            <span className="text-gray-400 uppercase text-[10px] sm:text-xs">Love Score</span>
            <span className="text-xl sm:text-2xl font-bold text-yellow-300">{score.toLocaleString()}</span>
          </div>

          <div className="flex flex-col items-center flex-1 max-w-[160px] sm:max-w-[240px] mx-3">
            <span className="text-gray-400 uppercase text-[10px] truncate">Next: {nextMilestone.badge} ({nextMilestone.score.toLocaleString()})</span>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 mt-1">
              <div 
                className="h-full bg-gradient-to-r from-[var(--pink)] to-yellow-400 transition-all duration-300"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-gray-400 uppercase text-[10px] sm:text-xs">Guard Strikes (Max 3)</span>
            <div className="flex gap-1 text-lg sm:text-xl">
              <span className={guardStrikes >= 1 ? 'text-red-500 animate-pulse' : 'text-gray-600'}>
                {guardStrikes >= 1 ? '🚨' : '⚪'}
              </span>
              <span className={guardStrikes >= 2 ? 'text-red-500 animate-pulse' : 'text-gray-600'}>
                {guardStrikes >= 2 ? '🚨' : '⚪'}
              </span>
              <span className={guardStrikes >= 3 ? 'text-red-500 animate-pulse' : 'text-gray-600'}>
                {guardStrikes >= 3 ? '🚨' : '⚪'}
              </span>
            </div>
          </div>
        </div>
        
        {combo >= 3 && isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-10 font-black text-2xl sm:text-3xl italic text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none"
          >
            {combo}x COMBO! 🔥
          </motion.div>
        )}

        <div 
          ref={containerRef}
          className="relative h-[420px] sm:h-[520px] bg-gradient-to-b from-[#14131d] via-[#1f1d2e] to-[#2d2a45] overflow-hidden rounded-b-xl touch-none cursor-crosshair select-none"
          onPointerMove={handlePointerMove}
          onTouchMove={handlePointerMove}
        >
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="absolute text-xs" 
                style={{ 
                  left: `${(i * 17) % 100}%`, 
                  top: `${(i * 23) % 100}%`,
                }}
              >
                ✨
              </div>
            ))}
          </div>

          <AnimatePresence>
            {!isPlaying && !isGameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
              >
                <div className="text-6xl mb-3 animate-bounce">🧺🧸</div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 font-caveat tracking-wider">
                  ENDLESS LOVE CATCHER
                </h3>
                <p className="text-[var(--pink)] mb-5 max-w-md text-xs sm:text-sm font-nunito leading-relaxed">
                  Catch falling Teddies 🧸, Hearts 💖, Kisses 💋, &amp; Maggi 🍜! Avoid the campus guards 🚨. 
                  <br /><strong className="text-yellow-300">3 Guard Strikes = Busted!</strong> Unlock all 10 love milestones up to 10,000 pts!
                </p>
                <button 
                  onClick={handleStart}
                  className="px-8 py-3.5 bg-gradient-to-r from-[var(--pink)] to-[var(--pink-deep)] text-white font-black rounded-full shadow-[0_0_20px_var(--pink)] transition-transform hover:scale-105 active:scale-95 uppercase tracking-widest font-mono text-sm"
                >
                  Start Game 🕹️
                </button>
              </motion.div>
            )}

            {isGameOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center p-5 text-center backdrop-blur-md overflow-y-auto"
              >
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-1 font-caveat">
                  {guardStrikes >= 3 ? "Busted by Guards! 🚨👮‍♂️" : "Game Finished! 💖"}
                </h3>
                
                <div className="text-5xl my-2">
                  {score >= 5000 ? "🏆🧸" : guardStrikes >= 3 ? "💀🚓" : "🥹❤️"}
                </div>
                
                <p className="text-xl text-[var(--cream)] mb-2 font-mono">
                  Final Score: <span className="font-bold text-yellow-300">{score.toLocaleString()} pts</span>
                </p>

                <p className="text-xs font-mono text-[var(--pink)] mb-3">
                  Unlocked {unlockedMilestones.length} / 10 Love Milestones
                </p>
                
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 my-2 max-w-md text-left shadow-lg backdrop-blur-sm">
                  <p className="text-sm text-pink-100 font-caveat leading-relaxed">
                    {score >= 10000
                      ? "“🎉 10,000 PTS MASTER! You conquered the whole game, just like how you conquered my whole heart. Happy 2 Months, Nushi! Forever yours! 🥹❤️🏆”"
                      : score >= 5000
                      ? "“Over 5,000 points! You caught so much love bbg. You have my whole heart forever and ever. 🧸💖”"
                      : "“The guards got us at Open Audi tonight! But we will always find our way back through AB-1 and Girls Block 2. Try again bbg! 😭❤️”"}
                  </p>
                  <p className="text-right text-xs font-mono text-[var(--butter)] mt-2 font-bold">
                    — with all my love, Yajat 🐻
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center mt-3">
                  <button 
                    onClick={handleStart}
                    className="px-6 py-2.5 bg-white text-[var(--plum)] hover:bg-[var(--cream)] font-black rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase tracking-wider text-xs font-mono"
                  >
                    Play Again 🔄
                  </button>
                  {unlockedMilestones.length > 0 && (
                    <button 
                      onClick={() => {
                        SoundEngine.confettiPop();
                        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                      }}
                      className="px-6 py-2.5 bg-[var(--pink-deep)] text-white hover:bg-[var(--pink)] font-black rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-xs font-mono"
                    >
                      Celebrate Milestone ✨
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.map(item => (
            <div
              key={item.id}
              className="absolute text-3xl sm:text-4xl drop-shadow-xl transition-transform"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {item.emoji}
            </div>
          ))}

          <div 
            className="absolute bottom-[5%] w-[80px] sm:w-[100px] h-[60px] flex justify-center items-end"
            style={{ 
              left: `${basketX}%`, 
              transform: 'translateX(-50%)',
              transition: 'left 0.02s linear'
            }}
          >
            <div className="relative text-5xl sm:text-6xl drop-shadow-2xl z-10 w-full text-center select-none">
              🧺
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-4 bg-gradient-to-t from-[var(--pink)]/40 to-transparent rounded-t-full -z-10" />
            </div>
          </div>
        </div>

        <div className="flex md:hidden justify-between mt-3 px-4 pb-2">
          <button 
            className="w-16 h-14 bg-[#1c1b26] rounded-xl flex items-center justify-center text-white/70 hover:bg-[#2d2a45] hover:text-white transition-colors active:scale-90 border border-zinc-700 text-xl font-bold"
            onClick={() => isPlaying && setBasketX(prev => Math.max(6, prev - 20))}
          >
            ◀
          </button>
          <button 
            className="w-16 h-14 bg-[#1c1b26] rounded-xl flex items-center justify-center text-white/70 hover:bg-[#2d2a45] hover:text-white transition-colors active:scale-90 border border-zinc-700 text-xl font-bold"
            onClick={() => isPlaying && setBasketX(prev => Math.min(94, prev + 20))}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-pink-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-caveat text-2xl font-bold text-[var(--plum)] flex items-center gap-2">
            <span>💌</span> Unlocked Love Milestones ({unlockedMilestones.length} / 10)
          </h4>
          <span className="font-mono text-xs text-gray-500 font-bold">
            Target: 10,000 pts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-pink-300">
          {MILESTONES.map((m) => {
            const isUnlocked = unlockedMilestones.includes(m.score) || score >= m.score;
            return (
              <div
                key={m.score}
                className={`p-3.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-white border-pink-300 shadow-sm text-[var(--plum)]'
                    : 'bg-gray-100/60 border-gray-200 opacity-50 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs bg-pink-100 text-[var(--pink-deep)] px-2 py-0.5 rounded">
                    {m.badge} · {m.score.toLocaleString()} pts
                  </span>
                  <span>{isUnlocked ? '🔓' : '🔒'}</span>
                </div>
                <h5 className="font-bold text-sm font-caveat text-lg">{m.title}</h5>
                <p className="text-xs font-nunito leading-relaxed mt-1">
                  {isUnlocked ? m.message : 'Reach this score in the arcade game to unlock this message from Yajat! 💖'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}} />
    </div>
  );
}

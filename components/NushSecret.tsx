'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import { useUniverseStore } from '@/lib/universeStore';
import { useProgressStore } from '@/lib/progressStore';
import confetti from 'canvas-confetti';
import PianoSecret from '@/components/secrets/PianoSecret';
import ConstellationSecret from '@/components/secrets/ConstellationSecret';
import Magic8BallSecret from '@/components/secrets/Magic8BallSecret';
import MorseDecoderSecret from '@/components/secrets/MorseDecoderSecret';
import KonamiSecret from '@/components/secrets/KonamiSecret';
import PhotoBoothSecret from '@/components/secrets/PhotoBoothSecret';
import JigsawSecret from '@/components/secrets/JigsawSecret';

type Stage = 'idle' | 'heart' | 'text' | 'explode' | 'message';

// --- Yajat Arcade Minigame Overlay ---
function YajatMinigame({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboText, setComboText] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<{ id: number; x: number; y: number; emoji: string; speed: number; rot: number; vRot: number }[]>([]);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const idCounter = useRef(0);

  useEffect(() => {
    const emojis = ['💖', '🧸', '💋', '❤️', '💕', '🌹', '✨', '🍫', '👑', '🌸'];

    const update = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!won) {
        setItems((prev) => {
          let newItems = prev.map((item) => ({
            ...item,
            y: item.y + item.speed * dt,
            rot: item.rot + item.vRot * dt,
          }));

          // Check collisions with basket
          const catchY = window.innerHeight - 110;
          const caught = newItems.filter((item) => {
            if (item.y > catchY && item.y < catchY + 60) {
              const itemX = (item.x / 100) * window.innerWidth;
              const bX = (basketX / 100) * window.innerWidth;
              if (Math.abs(itemX - bX) < 75) return true;
            }
            return false;
          });

          if (caught.length > 0) {
            SoundEngine.pop();
            setCombo((c) => {
              const newCombo = c + caught.length;
              if (newCombo >= 3) {
                setComboText(`🔥 ${newCombo}X COMBO!`);
                setTimeout(() => setComboText(null), 1200);
              }
              return newCombo;
            });
            setScore((s) => {
              const newScore = s + caught.length;
              if (newScore >= 10) setWon(true);
              return newScore;
            });
          }

          newItems = newItems.filter((item) => item.y < window.innerHeight + 60 && !caught.includes(item));

          // Add new items
          if (Math.random() < 0.05 && newItems.length < 9) {
            newItems.push({
              id: idCounter.current++,
              x: Math.random() * 85 + 7.5,
              y: -60,
              emoji: emojis[Math.floor(Math.random() * emojis.length)],
              speed: Math.random() * 0.28 + 0.22,
              rot: Math.random() * 360,
              vRot: (Math.random() - 0.5) * 0.4,
            });
          }

          return newItems;
        });
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [basketX, won]);

  useEffect(() => {
    if (won) {
      SoundEngine.confettiPop();
      confetti({
        particleCount: 220,
        spread: 160,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
      });
      const t = setTimeout(onClose, 4500);
      return () => clearTimeout(t);
    }
  }, [won, onClose]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setBasketX((e.clientX / window.innerWidth) * 100);
    };
    const handleTouchMove = (e: TouchEvent) => {
      setBasketX((e.touches[0].clientX / window.innerWidth) * 100);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md overflow-hidden select-none font-nunito cursor-none"
    >
      <div className="absolute top-6 left-6 text-white font-mono text-xs flex items-center gap-3">
        <span className="text-xl">🎮</span>
        <div>
          <span className="text-gray-400 block text-[10px]">MINIGAME: YAJAT CATCHER</span>
          <span className="font-bold text-sm text-[var(--butter)]">Score: {score} / 10 💖</span>
        </div>
      </div>

      {comboText && (
        <motion.div
          initial={{ scale: 0.5, y: -20, opacity: 0 }}
          animate={{ scale: 1.2, y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-16 left-6 font-mono text-base font-black text-pink-400 drop-shadow-[0_0_15px_rgba(255,92,142,0.9)]"
        >
          {comboText}
        </motion.div>
      )}

      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono border border-white/20 shadow-lg cursor-pointer"
      >
        Exit ✕
      </button>

      {/* Falling Love Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-4xl md:text-5xl pointer-events-none filter drop-shadow-[0_0_12px_rgba(255,92,142,0.8)]"
          style={{
            left: `${item.x}%`,
            top: item.y,
            transform: `rotate(${item.rot}deg)`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Catcher Basket (Follows Cursor) */}
      <div
        className="absolute bottom-6 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        style={{ left: `${basketX}%` }}
      >
        <div className="text-6xl filter drop-shadow-[0_0_25px_rgba(255,221,140,0.8)] animate-bounce">
          🧺
        </div>
        <span className="text-[10px] font-mono text-[var(--butter)] font-bold bg-black/60 px-2 py-0.5 rounded-full border border-yellow-400/40">
          NUSH&apos;S BASKET
        </span>
      </div>

      {/* Win Banner */}
      {won && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur text-center p-6 text-white"
        >
          <span className="text-8xl mb-4 animate-bounce filter drop-shadow">👑💖🧸</span>
          <h2 className="text-4xl md:text-6xl font-bold font-mono text-[var(--butter)]">
            YOU CAUGHT ALL MY LOVE!
          </h2>
          <p className="text-lg md:text-xl font-caveat text-[var(--pink)] mt-2">
            10/10 caught &middot; Yajat belongs to Nush forever and ever 🥰
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function NushSecret() {
  const [activeSecret, setActiveSecret] = useState<string | null>(null);
  const [nushStage, setNushStage] = useState<Stage>('idle');
  const [infiniteLoveCount, setInfiniteLoveCount] = useState(0);
  const { unlockSecret, unlockAchievement, addExplorationPoint, isSecretsPickerOpen, setSecretsPickerOpen } = useUniverseStore();
  const bufferRef = useRef('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const schedule = (fn: () => void, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, ms);
  };

  const dismissSecret = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSecret(null);
    setNushStage('idle');
  };

  const triggerSecret = (secretName: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSecret(secretName);
    unlockSecret(secretName, `Discovered: ${secretName.toUpperCase()} Secret`);
    addExplorationPoint(`secret_${secretName}`, `${secretName.toUpperCase()} Easter Egg`);

    if (secretName === 'nush') {
      setNushStage('heart');
      SoundEngine.diamondGlow();
      schedule(() => {
        setNushStage('text');
        SoundEngine.chime();
        schedule(() => {
          setNushStage('explode');
          SoundEngine.confettiPop();
          confetti({
            particleCount: 160,
            spread: 140,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#FF5C8E', '#FF9EC9', '#B9AEF5', '#FFDD8C'],
          });
          schedule(() => {
            setNushStage('message');
            schedule(() => dismissSecret(), 8000);
          }, 600);
        }, 2200);
      }, 1600);
    } else if (secretName === 'yajat') {
      SoundEngine.pop();
    } else if (secretName === 'teddy') {
      SoundEngine.pop();
      schedule(() => dismissSecret(), 6500);
    } else if (secretName === 'pills') {
      SoundEngine.pop();
      schedule(() => dismissSecret(), 7500);
    } else if (secretName === 'maggi') {
      SoundEngine.pop();
      schedule(() => dismissSecret(), 7000);
    } else if (secretName === 'openaudi') {
      SoundEngine.diamondGlow();
      schedule(() => dismissSecret(), 9000);
    } else if (secretName === 'library') {
      SoundEngine.pop();
      schedule(() => dismissSecret(), 8000);
    } else if (secretName === 'kiss') {
      SoundEngine.pop();
      schedule(() => dismissSecret(), 6500);
    } else if (secretName === 'voice') {
      SoundEngine.chime();
      schedule(() => dismissSecret(), 8000);
    } else if (secretName === 'stomach') {
      SoundEngine.pop();
      schedule(() => dismissSecret(), 8000);
    } else if (secretName === 'escape') {
      SoundEngine.error();
      schedule(() => dismissSecret(), 8000);
    } else if (secretName === 'cuddle') {
      SoundEngine.chime();
      schedule(() => dismissSecret(), 8000);
    } else if (secretName === 'smile') {
      SoundEngine.diamondGlow();
      schedule(() => dismissSecret(), 8000);
    } else if (secretName === 'facetime') {
      SoundEngine.chime();
      schedule(() => dismissSecret(), 9500);
    } else if (secretName === 'wifey') {
      SoundEngine.confettiPop();
      confetti({ particleCount: 160, spread: 130, origin: { x: 0.5, y: 0.5 } });
      schedule(() => dismissSecret(), 7500);
    } else if (secretName === 'cheat') {
      SoundEngine.diamondGlow();
      useUniverseStore.getState().unlockAllCheat();
      try {
        useProgressStore.getState().setHundredPercent();
      } catch (e) {}
      confetti({
        particleCount: 240,
        spread: 160,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#00FF66', '#FFD700', '#FF5C8E', '#B9AEF5', '#38BDF8'],
      });
      schedule(() => dismissSecret(), 9500);
    } else if (secretName === '90' || secretName === '3month') {
      SoundEngine.confettiPop();
      const duration = 4500;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 8, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#FFD700', '#FFA500', '#FF5C8E'] });
        confetti({ particleCount: 8, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#FFD700', '#FFA500', '#B9AEF5'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
      schedule(() => dismissSecret(), 7000);
    } else if (secretName === 'fakedate' || secretName === 'guitar' || secretName === 'hackathon') {
      SoundEngine.diamondGlow();
      confetti({ particleCount: 180, spread: 140, origin: { x: 0.5, y: 0.5 }, colors: ['#FF5C8E', '#FFD700', '#B9AEF5', '#3B82F6'] });
      schedule(() => dismissSecret(), 9500);
    } else if (secretName === '60' || secretName === '2month') {
      schedule(() => dismissSecret(), 6000);
    } else if (secretName === 'realtime') {
      SoundEngine.diamondGlow();
      unlockAchievement('realtime_stalker');
    } else if (secretName === 'midnight') {
      SoundEngine.chime();
      unlockAchievement('midnight_visitor');
      schedule(() => dismissSecret(), 10000);
    } else if (secretName === 'hug') {
      SoundEngine.pop();
      unlockAchievement('virtual_hugger');
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      schedule(() => dismissSecret(), 6000);
    } else if (secretName === 'piano') {
      SoundEngine.chime();
    } else if (secretName === 'stars' || secretName === 'sky') {
      SoundEngine.diamondGlow();
    } else if (secretName === '8ball' || secretName === 'fortune') {
      SoundEngine.whoosh();
    } else if (secretName === 'decode' || secretName === 'morse') {
      SoundEngine.chime();
    } else if (secretName === 'konami') {
      SoundEngine.confettiPop();
    } else if (secretName === 'photo' || secretName === 'selfie') {
      SoundEngine.click();
    } else if (secretName === 'puzzle' || secretName === 'jigsaw') {
      SoundEngine.pop();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        dismissSecret();
        return;
      }

      if (e.key && e.key.length === 1) {
        bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-30);
        const b = bufferRef.current;

        if (b.includes('fakedate') || b.includes('guitar') || b.includes('hackathon')) triggerSecret('fakedate');
        else if (b.includes('nush')) triggerSecret('nush');
        else if (b.includes('yajat')) triggerSecret('yajat');
        else if (b.includes('teddy')) triggerSecret('teddy');
        else if (b.includes('pills')) triggerSecret('pills');
        else if (b.includes('maggi')) triggerSecret('maggi');
        else if (b.includes('openaudi') || b.includes('audi')) triggerSecret('openaudi');
        else if (b.includes('library')) triggerSecret('library');
        else if (b.includes('kiss') || b.includes('smooch')) triggerSecret('kiss');
        else if (b.includes('voice') || b.includes('radio') || b.includes('singing') || b.includes('music')) triggerSecret('voice');
        else if (b.includes('stomach') || b.includes('waist') || b.includes('brown')) triggerSecret('stomach');
        else if (b.includes('escape') || b.includes('guard') || b.includes('route')) triggerSecret('escape');
        else if (b.includes('cuddle') || b.includes('boob') || b.includes('soft')) triggerSecret('cuddle');
        else if (b.includes('smile') || b.includes('pretty') || b.includes('gorgeous')) triggerSecret('smile');
        else if (b.includes('call') || b.includes('facetime')) triggerSecret('facetime');
        else if (b.includes('wifey') || b.includes('wifeyyy')) triggerSecret('wifey');
        else if (b.includes('cheat') || b.includes('konami')) triggerSecret('cheat');
        else if (b.includes('now') || b.includes('realtime')) triggerSecret('realtime');
        else if (b.includes('piano')) triggerSecret('piano');
        else if (b.includes('stars') || b.includes('sky')) triggerSecret('stars');
        else if (b.includes('8ball') || b.includes('fortune')) triggerSecret('8ball');
        else if (b.includes('decode') || b.includes('morse')) triggerSecret('decode');
        else if (b.includes('konami')) triggerSecret('konami');
        else if (b.includes('photo') || b.includes('selfie')) triggerSecret('photo');
        else if (b.includes('puzzle') || b.includes('jigsaw')) triggerSecret('puzzle');
        else if (b.includes('90') || b.includes('3month') || b.includes('quarter')) triggerSecret('90');
        else if (b.includes('60') || b.includes('2month')) triggerSecret('60');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Midnight Special
  const midnightTriggeredRef = useRef(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 5) {
        if (!midnightTriggeredRef.current) {
          midnightTriggeredRef.current = true;
          triggerSecret('midnight');
        }
      } else {
        midnightTriggeredRef.current = false;
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Shake to Hug
  const lastHugTimeRef = useRef(0);
  const shakeCountRef = useRef(0);
  const lastShakeTimeRef = useRef(0);
  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastHugTimeRef.current < 30000) return;
      
      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (!acc) return;
      
      const maxAcc = Math.max(Math.abs(acc.x || 0), Math.abs(acc.y || 0), Math.abs(acc.z || 0));
      if (maxAcc > 15) {
        if (now - lastShakeTimeRef.current > 500) shakeCountRef.current = 0;
        shakeCountRef.current += 1;
        lastShakeTimeRef.current = now;
        
        if (shakeCountRef.current >= 3) {
          lastHugTimeRef.current = now;
          shakeCountRef.current = 0;
          triggerSecret('hug');
        }
      }
    };

    const initDeviceMotion = async () => {
      try {
        if (typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          await (DeviceMotionEvent as any).requestPermission();
        }
        window.addEventListener('devicemotion', handleMotion);
      } catch (e) {
        // Fallback if permission needs manual trigger, try attaching anyway
        window.addEventListener('devicemotion', handleMotion);
      }
    };
    initDeviceMotion();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  const handleSendInfiniteLove = () => {
    SoundEngine.confettiPop();
    setInfiniteLoveCount((c) => c + 1);
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
    });
  };

  return (
    <>
      <AnimatePresence>
        {/* 1. NUSH SECRET — 5-STAGE CINEMATIC HEART BLOOM */}
        {activeSecret === 'nush' && (
          <motion.div
            key="nush-secret"
            className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>

            {/* Pulsing Radial Aura */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(60,20,40,0.95) 0%, rgba(10,5,15,0.98) 100%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Concentric Expanding Shockwave Rings */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`shockwave-${i}`}
                className="absolute rounded-full border border-pink-400/30 pointer-events-none"
                style={{ width: '400px', height: '400px' }}
                animate={{
                  scale: [1, 2.5, 3.8],
                  opacity: [0.6, 0.25, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  delay: i * 0.9,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Ambient Floating Hearts */}
            {Array.from({ length: 22 }).map((_, i) => (
              <motion.div
                key={`bg-heart-${i}`}
                className="absolute text-3xl opacity-30 select-none pointer-events-none"
                style={{ left: `${5 + i * 4.4}%`, top: `${8 + (i % 4) * 22}%` }}
                animate={{
                  y: [0, -45, 0],
                  x: [0, i % 2 === 0 ? 20 : -20, 0],
                  opacity: [0.15, 0.5, 0.15],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{ repeat: Infinity, duration: 3 + (i % 3), delay: i * 0.15 }}
              >
                {['💖', '🩷', '💕', '💗', '🌸', '✨'][i % 6]}
              </motion.div>
            ))}

            <AnimatePresence mode="wait">
              {/* Stage 1: Giant 3D Heart */}
              {nushStage === 'heart' && (
                <motion.div
                  key="heart-stage"
                  className="relative z-10 select-none pointer-events-none"
                  initial={{ scale: 0, opacity: 0, rotate: -30 }}
                  animate={{ scale: [0, 0.5, 1, 1.15, 1, 1.08, 1], opacity: 1, rotate: [-30, 10, -5, 2, 0] }}
                  exit={{ scale: [1, 1.8, 4], opacity: [1, 0.8, 0], filter: ['blur(0px)', 'blur(0px)', 'blur(12px)'] }}
                  transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1], exit: { duration: 0.7, ease: 'easeIn' } }}
                >
                  <motion.span
                    className="block text-9xl md:text-[16rem]"
                    style={{ filter: 'drop-shadow(0 0 90px rgba(255,92,142,0.9))' }}
                    animate={{
                      scale: [1, 1.12, 1],
                      filter: [
                        'drop-shadow(0 0 60px rgba(255,92,142,0.7))',
                        'drop-shadow(0 0 120px rgba(255,92,142,1))',
                        'drop-shadow(0 0 60px rgba(255,92,142,0.7))',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  >
                    💖
                  </motion.span>
                </motion.div>
              )}

              {/* Stage 2: Letter by Letter Bouncing Text */}
              {nushStage === 'text' && (
                <motion.div
                  key="text-stage"
                  className="relative z-10 flex flex-col items-center gap-4 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ scale: [1, 1.15, 0.3], opacity: [1, 1, 0], filter: ['blur(0px)', 'blur(0px)', 'blur(20px)'] }}
                  transition={{ exit: { duration: 0.6, ease: 'easeIn' } }}
                >
                  <div className="flex items-center justify-center">
                    {'Nush'.split('').map((letter, i) => (
                      <motion.span
                        key={i}
                        className="font-caveat text-white inline-block text-8xl md:text-[12rem] font-bold"
                        style={{ textShadow: '0 0 70px rgba(255,92,142,0.9), 0 0 140px rgba(255,92,142,0.6)' }}
                        initial={{ opacity: 0, y: 100, scale: 0.3, rotate: -20 + i * 10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.5, type: 'spring', bounce: 0.5 }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>

                  <motion.p
                    className="font-caveat text-4xl md:text-7xl text-[var(--butter)] font-bold text-center leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #FF9EC9, #B9AEF5, #FFDD8C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 40px rgba(185,174,245,0.7))',
                    }}
                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.7, type: 'spring', bounce: 0.3 }}
                  >
                    I Love You Endlessly
                  </motion.p>
                </motion.div>
              )}

              {/* Stage 3: Supernova Shockwave */}
              {nushStage === 'explode' && (
                <motion.div
                  key="explode-stage"
                  className="relative z-10 pointer-events-none"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full"
                    style={{ width: 250, height: 250, margin: '-125px 0 0 -125px', left: '50%', top: '50%' }}
                    initial={{ scale: 0, opacity: 0.95 }}
                    animate={{ scale: 14, opacity: 0 }}
                    transition={{ duration: 0.75 }}
                  />
                </motion.div>
              )}

              {/* Stage 4: Glassmorphic Love Card */}
              {nushStage === 'message' && (
                <motion.div
                  key="message-stage"
                  className="relative z-10 flex flex-col items-center max-w-lg mx-4"
                  initial={{ opacity: 0, y: 60, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8, type: 'spring', bounce: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="p-8 md:p-10 rounded-3xl flex flex-col items-center text-center shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,92,142,0.25), rgba(185,174,245,0.25), rgba(255,221,140,0.18))',
                      backdropFilter: 'blur(35px)',
                      border: '2px solid rgba(255,158,201,0.5)',
                      boxShadow: '0 0 100px rgba(255,92,142,0.35), inset 0 0 50px rgba(255,158,201,0.15)',
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                      className="text-7xl md:text-8xl mb-4 filter drop-shadow-[0_0_35px_rgba(255,92,142,0.85)]"
                    >
                      💖
                    </motion.div>
                    <p
                      className="font-caveat text-4xl md:text-5xl font-bold mb-1"
                      style={{
                        background: 'linear-gradient(90deg, #FF9EC9, #fff, #FF9EC9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Anushka Mathur
                    </p>
                    <p className="font-caveat text-[var(--lav)] text-xl md:text-2xl mb-3 font-semibold">
                      (soon to be Anushka Kataria 💍)
                    </p>
                    <p className="font-nunito text-white font-bold leading-relaxed text-sm md:text-base mb-5">
                      I love you even more than your intelligent big brain can even fathom to imagine 🩷
                    </p>
                    <button
                      onClick={handleSendInfiniteLove}
                      className="bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 pointer-events-auto cursor-pointer"
                    >
                      <span>🩷 Send Infinite Love 🩷</span>
                      {infiniteLoveCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full">+{infiniteLoveCount}</span>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 2. YAJAT ARCADE MINIGAME */}
        {activeSecret === 'yajat' && <YajatMinigame onClose={dismissSecret} />}

        {/* 3. TEDDY SECRET (120 INTERACTIVE BOUNCING BEARS) */}
        {activeSecret === 'teddy' && (
          <motion.div
            key="teddy-secret"
            className="fixed inset-0 z-[99999] overflow-hidden select-none cursor-pointer"
            onClick={dismissSecret}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm pointer-events-none" />
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            {Array.from({ length: 110 }).map((_, i) => (
              <motion.div
                key={`teddy-${i}`}
                className="absolute text-5xl md:text-7xl filter drop-shadow-xl pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  SoundEngine.pop();
                  confetti({
                    particleCount: 20,
                    spread: 40,
                    origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                    colors: ['#FF5C8E', '#FFDD8C'],
                  });
                }}
                initial={{
                  x: `${Math.random() * 100}vw`,
                  y: -140,
                  rotate: Math.random() * 360,
                  scale: 0.6 + Math.random() * 1.6,
                }}
                animate={{
                  y: '115vh',
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2 + Math.random() * 2.5,
                  ease: 'easeIn',
                  delay: Math.random() * 1.2,
                }}
              >
                {i % 4 === 0 ? '💫' : i % 3 === 0 ? '🧸' : i % 2 === 0 ? '🎀' : '🧸'}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 4. PILLS SECRET (3D BOUNCING MEDICAL RX PAD) */}
        {activeSecret === 'pills' && (
          <motion.div
            key="pills-secret"
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <motion.div
              initial={{ y: -150, rotate: -15, scale: 0.8 }}
              animate={{ y: 0, rotate: 2, scale: 1 }}
              exit={{ y: -150, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-black p-6 md:p-8 rounded-3xl shadow-2xl border-l-[14px] border-red-500 max-w-sm w-full mx-4 border-2 border-gray-200 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-gray-300 pb-2">
                <span className="text-4xl animate-bounce">💊</span>
                <span className="font-bold text-xl tracking-wider text-red-600">OFFICIAL RX</span>
              </div>
              <div className="space-y-2 text-xs">
                <p className="font-bold text-base text-gray-900">PATIENT: Anushka (Nush)</p>
                <p className="text-lg text-[var(--pink-deep)] font-black leading-snug">
                  Rx: 1000 Forehead Kisses Daily 😘
                </p>
                <p className="text-gray-600 pt-2 font-semibold">Doctor: Dr. Yajat Kataria 🐻</p>
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="font-bold text-sm text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 text-center"
                >
                  Refills: UNLIMITED FOR LIFE ❤️
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 5. MAGGI SECRET (3D ROTATING CHEESE BOWL WITH RISING STEAM) */}
        {activeSecret === 'maggi' && (
          <motion.div
            key="maggi-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <motion.div
              initial={{ scale: 0, rotate: -220 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="text-[140px] md:text-[190px] relative filter drop-shadow-[0_0_70px_rgba(255,221,140,0.7)] pointer-events-none"
            >
              🍜
              {/* Rising Steam Clouds */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`steam-${i}`}
                  className="absolute -top-14 text-5xl"
                  style={{ left: `${25 + i * 11}%` }}
                  animate={{
                    y: [-10, -90],
                    opacity: [0, 0.95, 0],
                    x: [0, i % 2 === 0 ? 25 : -25],
                    scale: [0.8, 1.6],
                  }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.25 }}
                >
                  💨
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              className="font-caveat text-4xl md:text-6xl text-[var(--butter)] mt-8 text-center font-bold px-6 drop-shadow-xl pointer-events-none"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              2 AM Maggi loading... extra cheese, no questions asked 🍜🧀❤️
            </motion.p>
          </motion.div>
        )}

        {/* 6. OPEN AUDI SECRET (ETHEREAL SACRED GOLDEN HALO & CELESTIAL STARDUST) */}
        {activeSecret === 'openaudi' && (
          <motion.div
            key="openaudi-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl select-none cursor-pointer overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>

            {/* Sacred Ambient Radiant Glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.22) 0%, rgba(255,158,201,0.1) 40%, rgba(5,2,10,0.95) 75%)',
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            />

            {/* Rotating Divine God Rays Flare */}
            <motion.div
              className="absolute w-[800px] h-[800px] pointer-events-none opacity-35"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.25) 20deg, transparent 45deg, rgba(255,215,0,0.2) 90deg, transparent 135deg, rgba(255,215,0,0.25) 180deg, transparent 225deg, rgba(255,215,0,0.2) 270deg, transparent 315deg, rgba(255,215,0,0.25) 360deg)',
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            />

            {/* Inner Golden Halo Ring */}
            <motion.div
              className="absolute rounded-full border-2 border-yellow-300/60 pointer-events-none"
              style={{
                width: '320px',
                height: '320px',
                boxShadow: '0 0 90px rgba(255, 215, 0, 0.55), inset 0 0 45px rgba(255, 215, 0, 0.35)',
              }}
              animate={{ scale: [1.12, 0.98, 1.12], opacity: [0.85, 0.55, 0.85] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            />

            {/* Poetic Center Text Content */}
            <motion.div
              className="relative z-10 text-center px-6 max-w-2xl pointer-events-none"
              initial={{ opacity: 0, y: 25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.9, ease: 'easeOut' }}
            >
              <motion.div
                animate={{ y: [0, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                className="text-6xl md:text-7xl mb-3 filter drop-shadow-[0_0_35px_rgba(255,215,0,0.9)]"
              >
                ✨🏛️🥹❤️✨
              </motion.div>

              <h2
                className="font-caveat text-5xl md:text-7xl text-yellow-100 font-bold mb-2 leading-tight"
                style={{ textShadow: '0 0 40px rgba(255,215,0,0.85), 0 0 80px rgba(255,158,201,0.5)' }}
              >
                Open Audi — Our Sacred, Pavitra Place 🥹❤️
              </h2>

              <p
                className="font-caveat text-3xl md:text-4xl text-[var(--butter)] font-semibold mb-4 leading-snug"
                style={{ textShadow: '0 0 30px rgba(255,221,140,0.7)' }}
              >
                Where memories make us cry happy tears.
              </p>

              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-yellow-400/30 max-w-lg mx-auto shadow-2xl space-y-1.5">
                <p className="font-nunito text-xs md:text-sm text-white/95 leading-relaxed font-semibold">
                  &ldquo;8:00 baje guards hume Open Audi se bhaga dete hain... but every single moment spent sitting there with you will forever be the most sacred thing in my entire life.&rdquo;
                </p>
                <span className="text-[11px] font-mono text-yellow-300 block font-bold">
                  Pavitra Memory Vault &middot; June 22 &rarr; Forever 💫
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 7. CENTRAL LIBRARY SECRET (OFFICIAL PARCHMENT STUDY PASS) */}
        {activeSecret === 'library' && (
          <motion.div
            key="library-secret"
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <motion.div
              initial={{ scale: 0.8, rotate: -4, y: 30 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF8] text-[#2B1B17] p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border-4 border-[#3D261C] relative"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#8B5A2B] pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5A2B] font-bold block">
                    VIT Bhopal Central Library Pass
                  </span>
                  <h3 className="font-bold text-lg font-mono text-[#2B1B17]">
                    0% STUDYING &middot; 100% STARING 📚🤫
                  </h3>
                </div>
                <span className="text-3xl">🤫📖</span>
              </div>

              <div className="bg-[#FAF0E6] p-4 rounded-2xl border border-[#D2B48C] space-y-2.5 text-xs mb-4">
                <p>
                  <strong>Issued to:</strong> Anushka &amp; Yajat
                </p>
                <p>
                  <strong>Permitted Activity:</strong> Sitting across each other, passing folded sticky notes under the table, whispering inside jokes, and admiring how cute Nush looks while pretending to study.
                </p>
                <p>
                  <strong>Violation Fine:</strong> 100 forehead kisses if caught smiling too loudly. 😘
                </p>
              </div>

              <div className="bg-yellow-100 p-3 rounded-xl border border-yellow-300 text-xs text-yellow-900 font-caveat text-base transform -rotate-1 mb-4 shadow-sm">
                📝 Folded Note: &ldquo;Stop being so gorgeous, you&apos;re completely distracting my whole brain 😭❤️&rdquo;
              </div>

              <p className="font-caveat text-xl text-[#8B5A2B] text-center mb-4 font-bold">
                &ldquo;You make even the quietest library feel like our personal sanctuary.&rdquo;
              </p>

              <button
                onClick={dismissSecret}
                className="w-full py-2.5 bg-[#3D261C] text-[#FFFDF8] rounded-full font-bold text-xs shadow hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Close Library Pass 📖
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 8. KISSES RAIN SECRET (90 FLOATING KISS LIPS) */}
        {activeSecret === 'kiss' && (
          <motion.div
            key="kiss-secret"
            className="fixed inset-0 z-[99999] overflow-hidden select-none cursor-pointer"
            onClick={dismissSecret}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            {Array.from({ length: 90 }).map((_, i) => (
              <motion.div
                key={`kiss-${i}`}
                className="absolute text-5xl md:text-7xl filter drop-shadow-[0_0_20px_rgba(255,92,142,0.8)] pointer-events-none"
                initial={{
                  x: `${Math.random() * 100}vw`,
                  y: -100,
                  rotate: Math.random() * 360,
                  scale: 0.7 + Math.random() * 1.4,
                }}
                animate={{
                  y: '115vh',
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: 'easeIn',
                  delay: Math.random() * 1.2,
                }}
              >
                {i % 2 === 0 ? '💋' : '🫦'}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 9. RADIO VOICE & MUSIC SECRET (NEON STEREO EQUALIZER) */}
        {activeSecret === 'voice' && (
          <motion.div
            key="voice-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#241738] to-[#120f1a] p-8 rounded-3xl border-2 border-[var(--pink)] shadow-[0_0_70px_rgba(255,92,142,0.45)] text-center max-w-md text-white"
            >
              <span className="text-6xl block mb-3 animate-pulse">🎙️📻✨</span>
              <span className="font-mono text-xs text-[var(--butter)] font-bold block uppercase tracking-widest">
                Radio Nushi FM &middot; 99.9 Live
              </span>
              <h3 className="font-bold text-2xl text-white font-mono mt-1">VELVETY LATE-NIGHT VOICE</h3>

              {/* Jumping Audio Visualizer Bars */}
              <div className="flex items-center justify-center gap-1.5 h-12 my-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-[var(--pink-deep)] via-[var(--lav)] to-[var(--butter)]"
                    animate={{ height: ['15%', '100%', '30%', '80%', '20%'] }}
                    transition={{ repeat: Infinity, duration: 0.5 + (i % 5) * 0.12, ease: 'easeInOut' }}
                  />
                ))}
              </div>

              <div className="my-3 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-200 leading-relaxed">
                🚫 <strong>Spotify Uninstalled Forever:</strong> Why listen to any streaming app when your singing and velvety radio voice is the sweetest melody in the universe?
              </div>
              <p className="font-caveat text-2xl text-[var(--pink)] font-bold">
                &ldquo;Only your voice &amp; my band&apos;s songs get to exist in my ears.&rdquo;
              </p>
            </div>
          </motion.div>
        )}

        {/* 10. STOMACH & WAIST COMPLIMENT */}
        {activeSecret === 'stomach' && (
          <motion.div
            key="stomach-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#331c42] to-[#161026] p-8 rounded-3xl border-2 border-[var(--butter)] shadow-[0_0_80px_rgba(255,221,140,0.4)] text-center max-w-md text-white"
            >
              <span className="text-6xl block mb-2 filter drop-shadow">🫢✨❤️</span>
              <span className="font-mono text-xs text-[var(--butter)] uppercase font-bold tracking-widest block">
                Pure Natural Art
              </span>
              <h3 className="font-bold text-2xl text-white font-mono mt-1">IRRESISTIBLY BREATHTAKING</h3>
              <p className="font-caveat text-3xl text-[var(--pink)] leading-relaxed my-4">
                &ldquo;Your warm brown skin, that flawless stomach, and how naturally you fit in my arms during our random tight hugs... you are sculpted like pure perfection.&rdquo;
              </p>
              <span className="text-xs text-gray-300 font-mono bg-white/10 px-4 py-1.5 rounded-full inline-block">
                Status: 1000/10 Gorgeous 🥹❤️
              </span>
            </div>
          </motion.div>
        )}

        {/* 11. 8 PM CAMPUS ESCAPE ROUTE ALERT */}
        {activeSecret === 'escape' && (
          <motion.div
            key="escape-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#2a111a] to-[#14080e] p-8 rounded-3xl border-2 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.5)] text-center max-w-md text-white"
            >
              <span className="text-6xl block mb-3 animate-bounce">🚨🏃‍♂️👮‍♂️</span>
              <span className="font-mono text-xs text-red-400 uppercase font-bold tracking-widest block">
                8:00 PM Guard Alert
              </span>
              <h3 className="font-bold text-2xl text-white font-mono mt-1">OPERATION: STEAL 5 MORE MINUTES</h3>
              <p className="font-caveat text-2xl text-[var(--butter)] my-4">
                &ldquo;Open Audi &rarr; AB-1 &rarr; Dr. Morphin&apos;s &rarr; GB-1 &rarr; Girls Block 2. Finding one more route just to not say goodbye.&rdquo;
              </p>
              <span className="text-xs text-gray-300 font-mono bg-red-950/60 px-4 py-1.5 rounded-full border border-red-500/40 inline-block">
                Guard Status: Outsmarted with Love 😂❤️
              </span>
            </div>
          </motion.div>
        )}

        {/* 12. CUDDLE & SOFTNESS COMPLIMENT */}
        {activeSecret === 'cuddle' && (
          <motion.div
            key="cuddle-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#3b1932] to-[#170a16] p-8 rounded-3xl border-2 border-[var(--pink)] shadow-[0_0_80px_rgba(255,92,142,0.45)] text-center max-w-md text-white"
            >
              <span className="text-6xl block mb-2 filter drop-shadow">🫢💖🧸</span>
              <span className="font-mono text-xs text-[var(--pink)] uppercase font-bold tracking-widest block">
                Safe Haven
              </span>
              <h3 className="font-bold text-2xl text-[var(--butter)] font-mono mt-1">SOFTEST WARMTH</h3>
              <p className="font-caveat text-3xl text-white leading-relaxed my-4">
                &ldquo;Our random tight hugs where everything in the universe stops... holding you close is the softest, most peaceful place in the world.&rdquo;
              </p>
              <span className="text-xs text-pink-300 font-mono bg-pink-900/40 px-4 py-1.5 rounded-full border border-pink-500/30 inline-block">
                Comfort Level: Maximum Heaven 🥹✨
              </span>
            </div>
          </motion.div>
        )}

        {/* 13. SMILE & PRETTY COMPLIMENT */}
        {activeSecret === 'smile' && (
          <motion.div
            key="smile-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#3d2e14] to-[#1a1408] p-8 rounded-3xl border-2 border-[var(--butter)] shadow-[0_0_90px_rgba(255,221,140,0.5)] text-center max-w-md text-white"
            >
              <span className="text-6xl block mb-2 filter drop-shadow">🌸✨🥰</span>
              <span className="font-mono text-xs text-[var(--butter)] uppercase font-bold tracking-widest block">
                Radiance Overload
              </span>
              <h3 className="font-bold text-2xl text-[var(--butter)] font-mono mt-1">THAT EFFORTLESS SMILE</h3>
              <p className="font-caveat text-3xl text-[var(--pink)] leading-relaxed my-4">
                &ldquo;Your smile literally makes me want to jump up and down from excitement. You are so breathtakingly pretty without even trying.&rdquo;
              </p>
              <span className="text-xs text-yellow-200 font-mono bg-yellow-900/40 px-4 py-1.5 rounded-full border border-yellow-500/30 inline-block">
                Pretty Index: Off The Charts 👑💖
              </span>
            </div>
          </motion.div>
        )}

        {/* 14. ALL-NIGHT FACETIME VIDEO CALL SIMULATION */}
        {activeSecret === 'facetime' && (
          <motion.div
            key="facetime-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-3 md:p-6 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0d12] rounded-3xl border-2 border-green-500/60 shadow-[0_0_90px_rgba(34,197,94,0.4)] text-center max-w-2xl w-full text-white relative overflow-hidden"
            >
              {/* WhatsApp Call Header */}
              <div className="p-3.5 bg-black/80 flex items-center justify-between border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold text-white text-sm">Nush🤎🤎</span>
                  <span className="text-[10px] text-gray-400 hidden sm:inline">&middot; 🔒 End-to-end encrypted</span>
                </div>
                <span className="text-green-400 font-bold text-xs">01:07 AM / 04:23 AM 🌙</span>
              </div>

              {/* Real Video Call Screenshot */}
              <div className="relative bg-black flex items-center justify-center overflow-hidden max-h-[55vh]">
                <img
                  src="/photos/late-night-call.png"
                  alt="Late Night WhatsApp Call - Nush and Yajat"
                  className="w-full h-auto object-contain"
                />

                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
                  <p className="font-caveat text-lg md:text-xl text-[var(--butter)] leading-snug">
                    &ldquo;Watching you fall asleep peacefully under your pink floral blanket... I would stay on this call for eternity ❤️&rdquo;
                  </p>
                </div>
              </div>

              {/* Call Actions */}
              <div className="p-3.5 bg-black/80 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    SoundEngine.confettiPop();
                    confetti({ particleCount: 50, spread: 70, origin: { x: 0.5, y: 0.7 } });
                  }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-xs font-bold shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Send Love Burst</span>
                  <span>💖✨</span>
                </button>
                <button
                  onClick={dismissSecret}
                  className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-lg shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
                  title="Hang Up"
                >
                  📞
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 15. WIFEYYY SUPREME MODE */}
        {activeSecret === 'wifey' && (
          <motion.div
            key="wifey-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <motion.div
              initial={{ scale: 0.3, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="text-center font-mono text-white pointer-events-none"
            >
              <span className="text-8xl md:text-9xl block mb-4 animate-bounce filter drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]">
                👑💖💍
              </span>
              <h2 className="text-4xl md:text-6xl font-bold text-[var(--butter)]">WIFEYYY SUPREME MODE</h2>
              <p className="text-base text-[var(--pink)] mt-2 font-nunito font-bold">
                The undisputed queen of Yajat’s entire universe
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* 16. DEV CHEAT GOD MODE */}
        {activeSecret === 'cheat' && (
          <motion.div
            key="cheat-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 font-mono select-none cursor-pointer overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            {/* Background Cyber Rain / Binary Stream */}
            <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden flex justify-around text-green-500 text-xs font-mono select-none">
              {Array.from({ length: 16 }).map((_, col) => (
                <motion.div
                  key={col}
                  initial={{ y: -100 }}
                  animate={{ y: '100vh' }}
                  transition={{ repeat: Infinity, duration: 3.5 + (col % 4), ease: 'linear', delay: (col * 0.25) % 2 }}
                >
                  {'10101101LOVE_OVERLOAD_YAJAT_NUSH_3_MONTH_100_PERCENT'.split('').join(' ')}
                </motion.div>
              ))}
            </div>

            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>

            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="bg-[#080d1a]/95 p-6 md:p-8 rounded-3xl border-2 border-green-400 shadow-[0_0_90px_rgba(74,222,128,0.6)] text-center text-green-400 max-w-lg w-full relative z-10"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-green-500/30 pb-3 mb-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-green-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  [ ROOT ACCESS: GOD MODE OVERRIDE ]
                </span>
                <span className="text-yellow-400 font-bold">STATUS: 100% UNLOCKED</span>
              </div>

              <motion.span
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl block mb-2 filter drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]"
              >
                ⚡👑🎮💎
              </motion.span>

              <h3 className="font-bold text-2xl md:text-3xl text-white font-mono tracking-tight">
                FULL UNIVERSE 100% UNLOCKED
              </h3>
              <p className="text-xs text-green-300 font-mono mt-1">
                Yajat &amp; Nush 3-Month Universe &middot; All Restrictions Removed
              </p>

              {/* Glowing 100% Progress Bar */}
              <div className="my-5 p-3.5 bg-black/60 rounded-2xl border border-green-500/40 text-left">
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-white">Universe Exploration Meter</span>
                  <span className="text-[var(--butter)] animate-pulse">100% COMPLETED 🏆</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-green-400/30">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-[var(--butter)] to-[var(--pink)] shadow-[0_0_15px_rgba(74,222,128,0.9)]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Stat Highlights Grid */}
              <div className="grid grid-cols-2 gap-2 text-left mb-4 text-xs font-mono">
                <div className="bg-green-950/40 p-2.5 rounded-xl border border-green-500/30">
                  <span className="text-gray-400 text-[10px] block">🏆 ACHIEVEMENTS</span>
                  <span className="text-white font-bold text-sm">18 / 18 BADGES UNLOCKED</span>
                </div>
                <div className="bg-green-950/40 p-2.5 rounded-xl border border-green-500/30">
                  <span className="text-gray-400 text-[10px] block">⚡ LOVE POINTS</span>
                  <span className="text-[var(--butter)] font-bold text-sm">+100,000 CREDITED</span>
                </div>
                <div className="bg-green-950/40 p-2.5 rounded-xl border border-green-500/30">
                  <span className="text-gray-400 text-[10px] block">🔍 HIDDEN SECRETS</span>
                  <span className="text-pink-300 font-bold text-sm">ALL 17 DISCOVERED</span>
                </div>
                <div className="bg-green-950/40 p-2.5 rounded-xl border border-green-500/30">
                  <span className="text-gray-400 text-[10px] block">🤗 AFFECTION FLOOD</span>
                  <span className="text-cyan-300 font-bold text-sm">100 HUGS &amp; KISSES MAXED</span>
                </div>
              </div>

              <p className="text-xs text-gray-300 font-nunito italic mb-4">
                &ldquo;Developer backdoor executed. Everything in our universe is yours to explore forever.&rdquo;
              </p>

              <button
                onClick={dismissSecret}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-black font-bold font-mono text-xs rounded-full shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
              >
                RETURN TO UNIVERSE 🚀
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 17. 90 / 3 MONTH FULL SCREEN FIREWORKS CELEBRATION */}
        {activeSecret === '90' && (
          <motion.div
            key="90-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg text-center p-4 font-nunito select-none cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-8xl md:text-9xl block mb-4 filter drop-shadow-[0_0_50px_rgba(255,215,0,0.9)] pointer-events-none"
            >
              👑💖🧸
            </motion.span>
            <h1
              className="font-caveat text-6xl md:text-8xl text-[var(--butter)] font-bold pointer-events-none"
              style={{ textShadow: '0 0 50px rgba(255, 215, 0, 0.85)' }}
            >
              🎉 HAPPY 3 MONTHS, NUSHI! 🎉
            </h1>
            <p className="font-nunito font-black text-2xl md:text-4xl text-white mt-3 drop-shadow-2xl pointer-events-none">
              A Whole Quarter of a Year of Pure Magic ✨
            </p>
          </motion.div>
        )}

        {/* 18. FAKE DATING PACT & GUITAR ORIGIN OVERLAY */}
        {activeSecret === 'fakedate' && (
          <motion.div
            key="fakedate-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl text-center p-4 font-nunito select-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <button
              onClick={dismissSecret}
              className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
            >
              Close ✕
            </button>

            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1428] border-2 border-[var(--butter)] rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-[0_0_60px_rgba(255,215,0,0.35)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--butter)]/20 to-transparent rounded-bl-full pointer-events-none" />

              <span className="text-6xl md:text-7xl block mb-3 animate-bounce">🎸👑💻</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--butter)] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 inline-block mb-2">
                The Secret Origin Story
              </span>

              <h2 className="font-caveat text-4xl md:text-5xl text-[var(--butter)] font-bold mb-2">
                “In boys, I don’t trust anyone but me.”
              </h2>

              <p className="font-caveat text-2xl text-[var(--pink)] mb-4">
                The fake dating pact that became our real forever.
              </p>

              <div className="bg-black/50 p-4 rounded-2xl border border-white/10 text-left text-xs font-nunito space-y-2 text-gray-300 mb-4">
                <p>
                  🎸 <strong>The Guitar Meet:</strong> I sang for you on day one and knew in my gut you’d change my life forever.
                </p>
                <p>
                  💻 <strong>IIT Madras Hackathon:</strong> Working late online, you opened up about your past heartbreak, and I opened up about mine.
                </p>
                <p>
                  👑 <strong>The Pact:</strong> You asked for someone to pretend-date to move on. I said: “In boys, I don’t trust anyone but me.”
                </p>
                <p>
                  💖 <strong>The Result:</strong> We fell helplessly in love before even meeting in person again.
                </p>
              </div>

              <button
                onClick={dismissSecret}
                className="w-full py-3 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-xs rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                OUR LOVE IS REAL FOREVER 💖
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 19. RIGHT NOW SECRET */}
        {activeSecret === 'realtime' && (() => {
          const hour = new Date().getHours();
          let text = "";
          if (hour >= 2 && hour < 7) text = "Sleeping (dreaming about you obviously) 😴💕";
          else if (hour >= 7 && hour < 9) text = "Getting ready (thinking about how pretty you looked yesterday) 🪥";
          else if (hour >= 9 && hour < 13) text = "In class (secretly texting you under the desk) 📱";
          else if (hour >= 13 && hour < 14) text = "Lunch (wishing you were sitting across from me) 🍛";
          else if (hour >= 14 && hour < 17) text = "Library or coding (pretending to study, actually writing code for you) 💻";
          else if (hour >= 17 && hour < 20) text = "Walking around campus (taking the long route hoping to bump into you) 🚶";
          else if (hour >= 20 && hour < 23) text = "On call with you (the best part of every day) 📞💖";
          else text = "Coding this website for you (yes, at this hour) 🖥️❤️";

          return (
            <motion.div
              key="realtime-secret"
              className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#1e0a2d] to-[#0a0515] p-4 select-none cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissSecret}
            >
              <button
                onClick={dismissSecret}
                className="absolute top-6 right-6 text-white text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full font-mono z-50 border border-white/20 shadow-lg cursor-pointer"
              >
                Close ✕
              </button>
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, transparent 70%)' }}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center relative z-10"
              >
                <div className="text-8xl mb-6 filter drop-shadow-[0_0_40px_rgba(168,85,247,0.8)] animate-pulse">
                  🕒
                </div>
                <h3 className="font-mono text-xl text-purple-300 font-bold mb-2 tracking-widest uppercase">
                  Yajat Right Now
                </h3>
                <p className="font-caveat text-4xl md:text-5xl text-white max-w-lg mx-auto leading-relaxed">
                  {text}
                </p>
              </motion.div>
            </motion.div>
          );
        })()}

        {/* 20. MIDNIGHT SPECIAL */}
        {activeSecret === 'midnight' && (
          <motion.div
            key="midnight-secret"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none cursor-pointer"
            style={{ backgroundColor: 'rgba(30, 10, 60, 0.95)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            onClick={dismissSecret}
          >
            <motion.p
              className="font-caveat text-3xl md:text-5xl text-white text-center max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 2 }}
            >
              It&apos;s midnight. A new day just started. And the first thing I want you to know is: I love you. Goodnight, my Nushi. 🌙💜
            </motion.p>
          </motion.div>
        )}

        {/* 21. VIRTUAL HUG */}
        {activeSecret === 'hug' && (
          <motion.div
            key="hug-secret"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissSecret}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
              className="text-[120px] md:text-[180px] filter drop-shadow-[0_0_40px_rgba(255,158,201,0.8)]"
            >
              🧸
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-caveat text-4xl md:text-5xl text-[var(--pink)] font-bold mt-4"
            >
              Virtual tight hug from Yajat 🤗🧸
            </motion.p>
          </motion.div>
        )}

        {/* 22. PIANO SERENADE */}
        {activeSecret === 'piano' && <PianoSecret onClose={dismissSecret} />}

        {/* 23. CONSTELLATION OF US */}
        {(activeSecret === 'stars' || activeSecret === 'sky') && (
          <ConstellationSecret onClose={dismissSecret} />
        )}

        {/* 24. MAGIC 8-BALL ORACLE */}
        {(activeSecret === '8ball' || activeSecret === 'fortune') && (
          <Magic8BallSecret onClose={dismissSecret} />
        )}

        {/* 25. LOVE LANGUAGE MORSE DECODER */}
        {(activeSecret === 'decode' || activeSecret === 'morse') && (
          <MorseDecoderSecret onClose={dismissSecret} />
        )}

        {/* 26. RETRO KONAMI CODE PLAYER 2 */}
        {activeSecret === 'konami' && <KonamiSecret onClose={dismissSecret} />}

        {/* 27. PHOTO BOOTH STRIP */}
        {(activeSecret === 'photo' || activeSecret === 'selfie') && (
          <PhotoBoothSecret onClose={dismissSecret} />
        )}

        {/* 28. JIGSAW PUZZLE */}
        {(activeSecret === 'puzzle' || activeSecret === 'jigsaw') && (
          <JigsawSecret onClose={dismissSecret} />
        )}
      </AnimatePresence>

      {/* Quick Easter Egg Trigger Drawer */}
      <AnimatePresence>
        {isSecretsPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setSecretsPickerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c182b] border-2 border-[var(--pink)] rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
                    <span>✨🪄</span> RELATIONSHIP EASTER EGGS
                  </h3>
                  <p className="text-xs text-[var(--pink)]">Type these keywords anywhere on keyboard or tap below!</p>
                </div>
                <button
                  onClick={() => setSecretsPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'fakedate', name: '🎸 Fake Dating Pact', id: 'fakedate' },
                  { label: 'nush', name: '💖 Supernova Heart', id: 'nush' },
                  { label: 'yajat', name: '🧺 Arcade Catcher', id: 'yajat' },
                  { label: 'openaudi', name: '🥹 Sacred Audi Halo', id: 'openaudi' },
                  { label: 'library', name: '📚 Library Pass', id: 'library' },
                  { label: 'teddy', name: '🧸 Teddy Avalanche', id: 'teddy' },
                  { label: 'pills', name: '💊 Kisses Rx Pad', id: 'pills' },
                  { label: 'maggi', name: '🍜 2 AM Cheese Maggi', id: 'maggi' },
                  { label: 'kiss', name: '💋 Falling Kisses', id: 'kiss' },
                  { label: 'voice', name: '📻 Radio Nushi FM', id: 'voice' },
                  { label: 'stomach', name: '🫢 Natural Art Glow', id: 'stomach' },
                  { label: 'escape', name: '🚨 8 PM Guards Alert', id: 'escape' },
                  { label: 'cuddle', name: '💖 Soft Cuddles', id: 'cuddle' },
                  { label: 'smile', name: '🌸 Radiant Smile', id: 'smile' },
                  { label: 'call', name: '📱 All-Night Call', id: 'facetime' },
                  { label: 'wifey', name: '👑 Wifeyyy Mode', id: 'wifey' },
                  { label: '3month', name: '🎆 3-Month Fireworks', id: '90' },
                  { label: 'now', name: '🕒 Right Now', id: 'realtime' },
                  { label: 'auto', name: '🌙 Midnight Special', id: 'midnight' },
                  { label: 'shake', name: '🧸 Virtual Hug', id: 'hug' },
                  { label: 'piano', name: '🎹 Piano Serenade', id: 'piano' },
                  { label: 'stars', name: '✨ Star Constellations', id: 'stars' },
                  { label: '8ball', name: '🔮 Love 8-Ball', id: '8ball' },
                  { label: 'decode', name: '📡 Morse Code Decoder', id: 'decode' },
                  { label: 'konami', name: '👾 8-Bit Co-Op Player 2', id: 'konami' },
                  { label: 'photo', name: '📸 Vintage Photo Booth', id: 'photo' },
                  { label: 'puzzle', name: '🧩 Missing Piece Jigsaw', id: 'puzzle' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSecretsPickerOpen(false);
                      triggerSecret(item.id);
                    }}
                    className="p-3 bg-white/5 hover:bg-[var(--pink-deep)]/40 active:bg-[var(--pink-deep)] border border-white/10 rounded-2xl text-left transition-all hover:scale-105 active:scale-95 cursor-pointer flex flex-col justify-between"
                  >
                    <span className="font-bold text-gray-100">{item.name}</span>
                    <span className="font-mono text-[10px] text-[var(--butter)] mt-1">type: &quot;{item.label}&quot;</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

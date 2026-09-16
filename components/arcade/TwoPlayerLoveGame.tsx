'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SoundEngine } from '@/lib/audio';
import { useUniverseStore } from '@/lib/universeStore';

type GameMode = 'menu' | 'pong' | 'escape';
type PowerUpType = 'maggi' | 'kiss' | 'teddy' | 'siren' | 'multiball';
type SpeedMode = 'fast' | 'turbo' | 'hypersonic';

const SPEED_CONFIGS = {
  fast: { baseSpeed: 9.5, paddleSpeed: 11.5, accel: 1.08, label: '⚡ Fast (1.5x)' },
  turbo: { baseSpeed: 13.5, paddleSpeed: 15.0, accel: 1.10, label: '🔥 Turbo (2.2x)' },
  hypersonic: { baseSpeed: 17.5, paddleSpeed: 18.5, accel: 1.13, label: '🚀 Hypersonic (3x)' },
};

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  emoji: string;
  duration: number;
}

export default function TwoPlayerLoveGame({ onExit }: { onExit?: () => void }) {
  const [mode, setMode] = useState<GameMode>('menu');
  const [speedMode, setSpeedMode] = useState<SpeedMode>('turbo');
  const [vsAI, setVsAI] = useState<boolean>(false);
  const [aiSpeech, setAiSpeech] = useState<string>('');
  const [winner, setWinner] = useState<'yajat' | 'nush' | 'both' | null>(null);
  const [scores, setScores] = useState<{ yajat: number; nush: number }>({ yajat: 0, nush: 0 });
  const [coopCollected, setCoopCollected] = useState<number>(0);
  const [coopTimer, setCoopTimer] = useState<number>(60);
  const [gameActive, setGameActive] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const { unlockAchievement } = useUniverseStore();

  // Speech bubble helper for AI Yajat
  const triggerAiSpeech = (text: string) => {
    setAiSpeech(text);
    setTimeout(() => setAiSpeech(''), 3000);
  };

  // Keyboard listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling when using arrow keys or space in game
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && mode !== 'menu') {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.key] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [mode]);

  // ============================================================================
  // MODE 1: HEART PONG DUEL (VERSUS)
  // ============================================================================
  const startPongGame = (withAI: boolean) => {
    setVsAI(withAI);
    setScores({ yajat: 0, nush: 0 });
    setWinner(null);
    setMode('pong');
    setGameActive(true);
    SoundEngine.chime();
    if (withAI) {
      triggerAiSpeech("You're on, bbg! I'll try not to let you win too easily 😉❤️");
    }
  };

  useEffect(() => {
    if (mode !== 'pong' || !gameActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const cfg = SPEED_CONFIGS[speedMode];

    // Game state
    const p1 = { x: 30, y: H / 2 - 40, w: 14, h: 80, vy: 0, speed: cfg.paddleSpeed, sizeMult: 1, frozen: false };
    const p2 = { x: W - 44, y: H / 2 - 40, w: 14, h: 80, vy: 0, speed: cfg.paddleSpeed, sizeMult: 1, frozen: false };

    interface Ball {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      trail: { x: number; y: number }[];
    }

    const initialVx = cfg.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
    const initialVy = (Math.random() - 0.5) * (cfg.baseSpeed * 0.85);

    const balls: Ball[] = [
      { x: W / 2, y: H / 2, vx: initialVx, vy: initialVy, radius: 10, color: '#FF5C8E', trail: [] }
    ];

    let activePowerUps: PowerUp[] = [];
    let lastPowerUpSpawn = Date.now();
    let yajatScore = 0;
    let nushScore = 0;
    const WIN_SCORE = 5;

    const spawnPowerUp = () => {
      const types: { type: PowerUpType; emoji: string }[] = [
        { type: 'maggi', emoji: '🍜' },
        { type: 'kiss', emoji: '💋' },
        { type: 'teddy', emoji: '🧸' },
        { type: 'siren', emoji: '🚨' },
        { type: 'multiball', emoji: '⚡' },
      ];
      const pick = types[Math.floor(Math.random() * types.length)];
      activePowerUps.push({
        x: W / 3 + Math.random() * (W / 3),
        y: 60 + Math.random() * (H - 120),
        type: pick.type,
        emoji: pick.emoji,
        duration: 10000,
      });
    };

    const resetBall = (b: Ball, towardsRight: boolean) => {
      b.x = W / 2;
      b.y = H / 2;
      b.vx = towardsRight ? cfg.baseSpeed : -cfg.baseSpeed;
      b.vy = (Math.random() - 0.5) * (cfg.baseSpeed * 0.85);
      b.trail = [];
    };

    const loop = () => {
      // 1. Controls
      // Player 1 (Yajat) - WASD or AI
      if (vsAI) {
        // AI Yajat follows main ball with human-like responsiveness
        const targetBall = balls[0];
        const paddleCenter = p1.y + (p1.h * p1.sizeMult) / 2;
        const diff = targetBall.y - paddleCenter;
        if (Math.abs(diff) > 8) {
          p1.y += Math.sign(diff) * (p1.speed * 0.88);
        }
      } else {
        if (!p1.frozen) {
          if (keysRef.current['w'] || keysRef.current['W']) p1.y -= p1.speed;
          if (keysRef.current['s'] || keysRef.current['S']) p1.y += p1.speed;
        }
      }

      // Player 2 (Nush) - Arrow keys or I/K
      if (!p2.frozen) {
        if (keysRef.current['ArrowUp'] || keysRef.current['i'] || keysRef.current['I']) p2.y -= p2.speed;
        if (keysRef.current['ArrowDown'] || keysRef.current['k'] || keysRef.current['K']) p2.y += p2.speed;
      }

      // Clamp paddles
      const clampPaddle = (p: typeof p1) => {
        const height = p.h * p.sizeMult;
        if (p.y < 10) p.y = 10;
        if (p.y + height > H - 10) p.y = H - 10 - height;
      };
      clampPaddle(p1);
      clampPaddle(p2);

      // Power-up spawn
      if (Date.now() - lastPowerUpSpawn > 7000 && activePowerUps.length < 2) {
        spawnPowerUp();
        lastPowerUpSpawn = Date.now();
      }

      // 2. Physics & Collisions
      balls.forEach((b) => {
        // Longer glowing speed trail
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 14) b.trail.shift();

        b.x += b.vx;
        b.y += b.vy;

        // Top / Bottom wall bounce
        if (b.y - b.radius <= 10) {
          b.y = 10 + b.radius;
          b.vy = -b.vy;
          SoundEngine.click();
        } else if (b.y + b.radius >= H - 10) {
          b.y = H - 10 - b.radius;
          b.vy = -b.vy;
          SoundEngine.click();
        }

        // Paddle 1 (Yajat) collision - accelerating bounce
        const p1H = p1.h * p1.sizeMult;
        if (
          b.x - b.radius <= p1.x + p1.w &&
          b.x + b.radius >= p1.x &&
          b.y >= p1.y &&
          b.y <= p1.y + p1H &&
          b.vx < 0
        ) {
          b.vx = Math.min(26, Math.abs(b.vx) * cfg.accel + 0.35);
          const hitOffset = (b.y - (p1.y + p1H / 2)) / (p1H / 2);
          b.vy = hitOffset * (cfg.baseSpeed * 0.95);
          SoundEngine.pop();
        }

        // Paddle 2 (Nush) collision - accelerating bounce
        const p2H = p2.h * p2.sizeMult;
        if (
          b.x + b.radius >= p2.x &&
          b.x - b.radius <= p2.x + p2.w &&
          b.y >= p2.y &&
          b.y <= p2.y + p2H &&
          b.vx > 0
        ) {
          b.vx = -Math.min(26, Math.abs(b.vx) * cfg.accel + 0.35);
          const hitOffset = (b.y - (p2.y + p2H / 2)) / (p2H / 2);
          b.vy = hitOffset * (cfg.baseSpeed * 0.95);
          SoundEngine.pop();
        }

        // Power-Up collision
        activePowerUps.forEach((pu, puIdx) => {
          const dist = Math.hypot(b.x - pu.x, b.y - pu.y);
          if (dist < b.radius + 18) {
            SoundEngine.chime();
            const beneficiary = b.vx > 0 ? p1 : p2;
            const victim = b.vx > 0 ? p2 : p1;

            if (pu.type === 'maggi') {
              beneficiary.sizeMult = 1.6;
              setTimeout(() => { beneficiary.sizeMult = 1; }, 7000);
            } else if (pu.type === 'kiss') {
              b.vx *= 1.4;
            } else if (pu.type === 'siren') {
              victim.speed = 2.5;
              setTimeout(() => { victim.speed = 6; }, 4000);
            } else if (pu.type === 'multiball' && balls.length < 3) {
              balls.push({
                x: b.x,
                y: b.y,
                vx: -b.vx,
                vy: -b.vy,
                radius: 8,
                color: '#FFDD8C',
                trail: [],
              });
            }
            activePowerUps.splice(puIdx, 1);
          }
        });

        // Scoring
        if (b.x < 0) {
          // Nush scores!
          nushScore += 1;
          setScores({ yajat: yajatScore, nush: nushScore });
          SoundEngine.diamondGlow();
          if (vsAI) {
            const comments = [
              "NOOO she scored on me! 😭❤️",
              "Okay that was an insane angle bbg 🔥",
              "You're too cracked at this! 👑",
              "I'm letting you win, definitely not because you're better 💀😂",
            ];
            triggerAiSpeech(comments[Math.floor(Math.random() * comments.length)]);
          }
          if (nushScore >= WIN_SCORE) {
            endMatch('nush');
            return;
          }
          resetBall(b, false);
        } else if (b.x > W) {
          // Yajat scores!
          yajatScore += 1;
          setScores({ yajat: yajatScore, nush: nushScore });
          SoundEngine.pop();
          if (vsAI) {
            const comments = [
              "LET'S GOOO! Point for Yajat! 🐻⚡",
              "Calculated trajectory, trust me I'm a coder 💻❤️",
              "Don't be mad bbg, I still love you most! 😘",
            ];
            triggerAiSpeech(comments[Math.floor(Math.random() * comments.length)]);
          }
          if (yajatScore >= WIN_SCORE) {
            endMatch('yajat');
            return;
          }
          resetBall(b, true);
        }
      });

      // 3. Render
      ctx.fillStyle = '#0a0814';
      ctx.fillRect(0, 0, W, H);

      // Arena boundary glow
      ctx.strokeStyle = '#2d2247';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, W - 12, H - 12);

      // Center divider net
      ctx.strokeStyle = '#3d2f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 10);
      ctx.lineTo(W / 2, H - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center court heart circle
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 92, 142, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw PowerUps
      activePowerUps.forEach((pu) => {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.emoji, pu.x, pu.y);
      });

      // Draw Paddles
      // Yajat's Paddle (Left)
      const p1HReal = p1.h * p1.sizeMult;
      const p1Grad = ctx.createLinearGradient(p1.x, p1.y, p1.x + p1.w, p1.y + p1HReal);
      p1Grad.addColorStop(0, '#FF5C8E');
      p1Grad.addColorStop(1, '#FFDD8C');
      ctx.fillStyle = p1Grad;
      ctx.shadowColor = '#FF5C8E';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(p1.x, p1.y, p1.w, p1HReal, 7);
      ctx.fill();

      // Nush's Paddle (Right)
      const p2HReal = p2.h * p2.sizeMult;
      const p2Grad = ctx.createLinearGradient(p2.x, p2.y, p2.x + p2.w, p2.y + p2HReal);
      p2Grad.addColorStop(0, '#B9AEF5');
      p2Grad.addColorStop(1, '#FF9EC9');
      ctx.fillStyle = p2Grad;
      ctx.shadowColor = '#B9AEF5';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(p2.x, p2.y, p2.w, p2HReal, 7);
      ctx.fill();

      ctx.shadowBlur = 0; // reset

      // Draw Balls with Glowing Trail
      balls.forEach((b) => {
        const isHypersonic = Math.abs(b.vx) > 13;
        b.trail.forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (b.radius * (idx + 1)) / b.trail.length, 0, Math.PI * 2);
          ctx.fillStyle = isHypersonic
            ? `rgba(255, 180, 50, ${idx * 0.08})`
            : `rgba(255, 92, 142, ${idx * 0.07})`;
          ctx.fill();
        });

        // Glowing heart ball
        ctx.shadowColor = isHypersonic ? '#FFA500' : b.color;
        ctx.shadowBlur = isHypersonic ? 22 : 15;
        ctx.fillStyle = isHypersonic ? '#FFDD8C' : b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner white spark
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(b.x - 2, b.y - 2, b.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (gameActive) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    const endMatch = (matchWinner: 'yajat' | 'nush') => {
      setGameActive(false);
      setWinner(matchWinner);
      SoundEngine.confettiPop();
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
      });
      unlockAchievement('konami_player');
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [mode, gameActive, vsAI, speedMode]);

  // Continuous hold-to-move touch & pointer handlers for mobile / trackpad
  const startPaddleMove = (player: 'p1' | 'p2', direction: 'up' | 'down') => {
    const key = player === 'p1' ? (direction === 'up' ? 'w' : 's') : (direction === 'up' ? 'ArrowUp' : 'ArrowDown');
    keysRef.current[key] = true;
  };

  const stopPaddleMove = (player: 'p1' | 'p2', direction: 'up' | 'down') => {
    const key = player === 'p1' ? (direction === 'up' ? 'w' : 's') : (direction === 'up' ? 'ArrowUp' : 'ArrowDown');
    keysRef.current[key] = false;
  };

  // ============================================================================
  // MODE 2: 8 PM CAMPUS ESCAPE (CO-OP CAMPAIGN)
  // ============================================================================
  const startEscapeGame = (withAI: boolean) => {
    setVsAI(withAI);
    setCoopCollected(0);
    setCoopTimer(60);
    setWinner(null);
    setMode('escape');
    setGameActive(true);
    SoundEngine.chime();
    if (withAI) {
      triggerAiSpeech("I'll follow your lead bbg! Let's grab all our memories and reach GB-2! 🐻🏃‍♂️");
    }
  };

  useEffect(() => {
    if (mode !== 'escape' || !gameActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Characters
    const p1 = { x: 80, y: H / 2, size: 28, emoji: '🐻', name: 'Yajat', speed: 3.8 };
    const p2 = { x: 80, y: H / 2 + 40, size: 28, emoji: '👑', name: 'Nush', speed: 3.8 };

    interface MemoryToken {
      x: number;
      y: number;
      emoji: string;
      name: string;
      collected: boolean;
    }

    const tokens: MemoryToken[] = [
      { x: 160, y: 80, emoji: '🧸', name: 'Teddy Yajat', collected: false },
      { x: 260, y: 220, emoji: '🍜', name: '2 AM Maggi', collected: false },
      { x: 380, y: 70, emoji: '🎸', name: 'The Origin Guitar', collected: false },
      { x: 480, y: 240, emoji: '💌', name: 'Day 16 Note', collected: false },
      { x: 560, y: 110, emoji: '🏛️', name: 'Open Audi Key', collected: false },
      { x: 640, y: 200, emoji: '💋', name: '22 Aug Smooch', collected: false },
      { x: 200, y: 320, emoji: '☕', name: 'Morphin Tea', collected: false },
      { x: 420, y: 340, emoji: '🎧', name: 'Shared Earphone', collected: false },
    ];

    const guards = [
      { x: 220, y: 140, vx: 1.2, vy: 0.8, range: 100, angle: 0 },
      { x: 450, y: 280, vx: -1.0, vy: 1.1, range: 110, angle: Math.PI },
      { x: 580, y: 90, vx: 0.8, vy: -1.0, range: 90, angle: Math.PI / 2 },
    ];

    const gb2Goal = { x: W - 70, y: H / 2 - 35, w: 60, h: 70, label: 'Girls Block 2 🚪' };

    let collectedCount = 0;
    let timer = 60;
    const timerInterval = setInterval(() => {
      timer -= 1;
      setCoopTimer(timer);
      if (timer <= 0) {
        clearInterval(timerInterval);
        setGameActive(false);
        SoundEngine.error();
        triggerAiSpeech("8:00 baj gaye! The guards caught us! Let's try again ❤️😭");
      }
    }, 1000);

    const loop = () => {
      // 1. Controls
      // Yajat (P1)
      if (vsAI) {
        const target = tokens.find((t) => !t.collected) || gb2Goal;
        const dx = (p2.x + target.x) / 2 - p1.x;
        const dy = (p2.y + target.y) / 2 - p1.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 15) {
          p1.x += (dx / dist) * p1.speed * 0.9;
          p1.y += (dy / dist) * p1.speed * 0.9;
        }
      } else {
        if (keysRef.current['w'] || keysRef.current['W']) p1.y -= p1.speed;
        if (keysRef.current['s'] || keysRef.current['S']) p1.y += p1.speed;
        if (keysRef.current['a'] || keysRef.current['A']) p1.x -= p1.speed;
        if (keysRef.current['d'] || keysRef.current['D']) p1.x += p1.speed;
      }

      // Nush (P2)
      if (keysRef.current['ArrowUp']) p2.y -= p2.speed;
      if (keysRef.current['ArrowDown']) p2.y += p2.speed;
      if (keysRef.current['ArrowLeft']) p2.x -= p2.speed;
      if (keysRef.current['ArrowRight']) p2.x += p2.speed;

      // Clamp inside arena
      const clampChar = (c: typeof p1) => {
        c.x = Math.max(20, Math.min(W - 20, c.x));
        c.y = Math.max(20, Math.min(H - 20, c.y));
      };
      clampChar(p1);
      clampChar(p2);

      // Distance between Yajat and Nush
      const loveDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const isHoldingHands = loveDistance < 70;

      // 2. Token collection
      tokens.forEach((token) => {
        if (!token.collected) {
          const d1 = Math.hypot(p1.x - token.x, p1.y - token.y);
          const d2 = Math.hypot(p2.x - token.x, p2.y - token.y);
          if (d1 < 30 || d2 < 30) {
            token.collected = true;
            collectedCount += 1;
            setCoopCollected(collectedCount);
            SoundEngine.pop();
            confetti({ particleCount: 15, spread: 40, origin: { x: token.x / W, y: token.y / H } });
            if (vsAI && collectedCount % 2 === 0) {
              triggerAiSpeech(`Collected ${token.name}! Let's go bbg! 💖`);
            }
          }
        }
      });

      // 3. Guards movement & Flashlight cone
      guards.forEach((g) => {
        g.x += g.vx;
        g.y += g.vy;
        if (g.x < 120 || g.x > W - 120) g.vx = -g.vx;
        if (g.y < 50 || g.y > H - 50) g.vy = -g.vy;
        g.angle = Math.atan2(g.vy, g.vx);

        const distP1 = Math.hypot(p1.x - g.x, p1.y - g.y);
        const distP2 = Math.hypot(p2.x - g.x, p2.y - g.y);
        if (!isHoldingHands && (distP1 < 25 || distP2 < 25)) {
          p1.x = Math.max(40, p1.x - 30);
          p2.x = Math.max(40, p2.x - 30);
          SoundEngine.error();
          triggerAiSpeech("Guard: 'Beta 8:00 baj gaye, chalo chalo!' 👮‍♂️💨 Hold my hand!");
        }
      });

      // 4. Reach GB-2 Check
      const allTokensCollected = tokens.every((t) => t.collected);
      const p1AtGoal = p1.x > gb2Goal.x && p1.y > gb2Goal.y && p1.y < gb2Goal.y + gb2Goal.h;
      const p2AtGoal = p2.x > gb2Goal.x && p2.y > gb2Goal.y && p2.y < gb2Goal.y + gb2Goal.h;

      if (allTokensCollected && p1AtGoal && p2AtGoal) {
        clearInterval(timerInterval);
        setGameActive(false);
        setWinner('both');
        SoundEngine.confettiPop();
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
        });
        unlockAchievement('konami_player');
        return;
      }

      // 5. Render
      ctx.fillStyle = '#0f0c1b';
      ctx.fillRect(0, 0, W, H);

      // Campus pathways
      ctx.strokeStyle = '#231c38';
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(60, H / 2);
      ctx.lineTo(250, 150);
      ctx.lineTo(500, 260);
      ctx.lineTo(W - 60, H / 2);
      ctx.stroke();

      // Goal: Girls Block 2
      ctx.fillStyle = allTokensCollected ? 'rgba(255, 92, 142, 0.25)' : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = allTokensCollected ? '#FF5C8E' : '#4a3d69';
      ctx.lineWidth = 2;
      ctx.strokeRect(gb2Goal.x, gb2Goal.y, gb2Goal.w, gb2Goal.h);
      ctx.fillRect(gb2Goal.x, gb2Goal.y, gb2Goal.w, gb2Goal.h);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(gb2Goal.label, gb2Goal.x + gb2Goal.w / 2, gb2Goal.y + gb2Goal.h / 2);

      // Guard Flashlights
      guards.forEach((g) => {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.angle);
        const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, g.range);
        grad.addColorStop(0, 'rgba(255, 230, 120, 0.45)');
        grad.addColorStop(1, 'rgba(255, 230, 120, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, g.range, -0.4, 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👮‍♂️', g.x, g.y);
      });

      // Memory Tokens
      tokens.forEach((t) => {
        if (!t.collected) {
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#FFDD8C';
          ctx.shadowBlur = 10;
          ctx.fillText(t.emoji, t.x, t.y);
          ctx.shadowBlur = 0;
        }
      });

      // Love Tether Laser when holding hands
      if (loveDistance < 160) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isHoldingHands ? '#FF5C8E' : 'rgba(255, 92, 142, 0.4)';
        ctx.lineWidth = isHoldingHands ? 4 : 2;
        ctx.shadowColor = '#FF5C8E';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      }

      // Yajat (🐻)
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p1.emoji, p1.x, p1.y);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#FFDD8C';
      ctx.fillText('YAJAT', p1.x, p1.y - 20);

      // Nush (👑)
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p2.emoji, p2.x, p2.y);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#FF9EC9';
      ctx.fillText('NUSH', p2.x, p2.y - 20);

      if (gameActive) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      clearInterval(timerInterval);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, gameActive, vsAI]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-[#0f0c1b] border-2 border-[var(--pink)]/50 shadow-2xl p-4 md:p-6 text-white font-nunito overflow-hidden select-none">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👥💖</span>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[var(--butter)]">
              Yajat &amp; Nush: 2-Player Co-Op &amp; Duel
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Play together on one keyboard, phone, or vs AI Yajat 🎮❤️
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode !== 'menu' && (
            <button
              onClick={() => { setGameActive(false); setMode('menu'); }}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold cursor-pointer transition-all"
            >
              ◀ Exit to Menu
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* AI YAJAT LIVE SPEECH BUBBLE */}
      <AnimatePresence>
        {aiSpeech && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-[var(--pink)] flex items-center gap-3 shadow-lg"
          >
            <span className="text-2xl">🐻</span>
            <div className="text-xs font-mono">
              <strong className="text-[var(--butter)]">AI Yajat:</strong> &ldquo;{aiSpeech}&rdquo;
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN MENU */}
      {mode === 'menu' && (
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MODE 1 CARD: HEART PONG DUEL */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/40 hover:border-[var(--pink)] rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all"
            >
              <div>
                <div className="text-4xl mb-2">🥍❤️⚡</div>
                <h3 className="text-xl font-bold text-white font-mono mb-1">
                  Heart Pong Duel (1v1 Versus)
                </h3>
                <p className="text-xs text-gray-300 font-mono mb-4 leading-relaxed">
                  Fast, glowing neon air hockey duel! Powerups like 2 AM Maggi &amp; Forehead Kisses. Compete to see who loves who more!
                </p>
                <div className="text-[11px] font-mono text-gray-400 space-y-1 mb-4">
                  <div><strong>Player 1 (Yajat):</strong> W / S keys (or Left Touch)</div>
                  <div><strong>Player 2 (Nush):</strong> ↑ / ↓ keys (or Right Touch)</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startPongGame(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--pink-deep)] to-pink-600 text-white font-mono text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  🤖 Solo (vs AI Yajat)
                </button>
                <button
                  onClick={() => startPongGame(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-mono text-xs font-bold border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  👥 2 Players (Local)
                </button>
              </div>
            </motion.div>

            {/* MODE 2 CARD: 8 PM CAMPUS ESCAPE */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all"
            >
              <div>
                <div className="text-4xl mb-2">🏃‍♂️🏃‍♀️🏛️</div>
                <h3 className="text-xl font-bold text-white font-mono mb-1">
                  8 PM Campus Escape (Co-Op)
                </h3>
                <p className="text-xs text-gray-300 font-mono mb-4 leading-relaxed">
                  Both players on screen together! Collect all our shared memories, dodge the 8 PM guards, and reach Girls Block 2 hand-in-hand!
                </p>
                <div className="text-[11px] font-mono text-gray-400 space-y-1 mb-4">
                  <div><strong>Hold Hands Mechanic:</strong> Stay close to create a protective Love Tether!</div>
                  <div><strong>Yajat:</strong> WASD &middot; <strong>Nush:</strong> Arrow Keys</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEscapeGame(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-mono text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  🤖 Solo (with AI Yajat)
                </button>
                <button
                  onClick={() => startEscapeGame(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-mono text-xs font-bold border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  👥 2 Players (Co-Op)
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* PONG ARENA */}
      {mode === 'pong' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐻</span>
              <span className="font-bold text-[var(--butter)]">Yajat: {scores.yajat}</span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { setSpeedMode('fast'); SoundEngine.click(); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  speedMode === 'fast'
                    ? 'bg-amber-400 text-black shadow font-black scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="1.5x Speed"
              >
                ⚡ Fast
              </button>
              <button
                onClick={() => { setSpeedMode('turbo'); SoundEngine.click(); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  speedMode === 'turbo'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow font-black scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="2.2x Speed"
              >
                🔥 Turbo
              </button>
              <button
                onClick={() => { setSpeedMode('hypersonic'); SoundEngine.click(); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  speedMode === 'hypersonic'
                    ? 'bg-gradient-to-r from-red-500 via-amber-400 to-rose-500 text-black shadow font-black scale-105 animate-pulse'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="3x Hypersonic Speed"
              >
                🚀 Hypersonic
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--pink)]">Nush: {scores.nush}</span>
              <span className="text-xl">👑</span>
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] max-h-[460px] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} width={740} height={420} className="w-full h-full" />
          </div>

          {/* On-screen continuous touch / pointer buttons for mobile & laptop */}
          <div className="flex justify-between items-center px-4 pt-1">
            <div className="flex gap-2">
              <button
                onPointerDown={() => startPaddleMove('p1', 'up')}
                onPointerUp={() => stopPaddleMove('p1', 'up')}
                onPointerLeave={() => stopPaddleMove('p1', 'up')}
                className="w-12 h-12 rounded-xl bg-white/15 active:bg-[var(--pink)] flex items-center justify-center text-xl font-bold cursor-pointer select-none"
                title="P1 Up"
              >
                ▲
              </button>
              <button
                onPointerDown={() => startPaddleMove('p1', 'down')}
                onPointerUp={() => stopPaddleMove('p1', 'down')}
                onPointerLeave={() => stopPaddleMove('p1', 'down')}
                className="w-12 h-12 rounded-xl bg-white/15 active:bg-[var(--pink)] flex items-center justify-center text-xl font-bold cursor-pointer select-none"
                title="P1 Down"
              >
                ▼
              </button>
            </div>
            <span className="text-[10px] font-mono text-gray-400 text-center">
              Desktop: <strong>W / S</strong> (P1) &middot; <strong>↑ / ↓</strong> (P2) &middot; Hold buttons to glide
            </span>
            <div className="flex gap-2">
              <button
                onPointerDown={() => startPaddleMove('p2', 'up')}
                onPointerUp={() => stopPaddleMove('p2', 'up')}
                onPointerLeave={() => stopPaddleMove('p2', 'up')}
                className="w-12 h-12 rounded-xl bg-white/15 active:bg-[var(--pink)] flex items-center justify-center text-xl font-bold cursor-pointer select-none"
                title="P2 Up"
              >
                ▲
              </button>
              <button
                onPointerDown={() => startPaddleMove('p2', 'down')}
                onPointerUp={() => stopPaddleMove('p2', 'down')}
                onPointerLeave={() => stopPaddleMove('p2', 'down')}
                className="w-12 h-12 rounded-xl bg-white/15 active:bg-[var(--pink)] flex items-center justify-center text-xl font-bold cursor-pointer select-none"
                title="P2 Down"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMPUS ESCAPE ARENA */}
      {mode === 'escape' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🧸</span>
              <span>Memories Collected: <strong className="text-[var(--butter)]">{coopCollected} / 8</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <span>Curfew in: <strong className={coopTimer < 15 ? 'text-red-400 animate-ping' : 'text-emerald-400'}>{coopTimer}s</strong></span>
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] max-h-[460px] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} width={740} height={420} className="w-full h-full" />
          </div>

          <div className="text-center text-[11px] font-mono text-gray-400">
            💡 <strong>Tip:</strong> Keep Yajat &amp; Nush close together to create the glowing love bond that protects you from guards!
          </div>
        </div>
      )}

      {/* WIN / GAME OVER OVERLAY */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
          >
            <div className="max-w-md w-full bg-[#181326] border-2 border-[var(--pink)] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="text-5xl">
                {winner === 'nush' ? '👑🎉' : winner === 'yajat' ? '🐻🏆' : '💖👩‍❤️‍👨'}
              </div>

              <h3 className="text-2xl font-bold font-serif text-[var(--butter)]">
                {winner === 'nush'
                  ? 'QUEEN NUSHI WINS!'
                  : winner === 'yajat'
                  ? 'YAJAT WINS THE MATCH!'
                  : 'MISSION ACCOMPLISHED!'}
              </h3>

              <p className="text-sm text-gray-200 leading-relaxed font-mono">
                {winner === 'nush'
                  ? 'Official Verdict: Nush is the undisputed champion. Yajat must fulfill 3 love coupons immediately, make 2 AM Maggi, and give 100 forehead kisses! 💋❤️'
                  : winner === 'yajat'
                  ? 'Mathematically proven Yajat loves you more! But since Yajat is a simp, his penalty is to give Nush 1,000 forehead kisses anyway! 🥹❤️'
                  : 'You two made it through Open Audi, dodged the 8 PM guards, and reached Girls Block 2 hand-in-hand! Best co-op team in the entire universe. 😭❤️'}
              </p>

              <div className="pt-2 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setWinner(null);
                    if (mode === 'pong') startPongGame(vsAI);
                    else startEscapeGame(vsAI);
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-xs shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  PLAY AGAIN 🔄
                </button>
                <button
                  onClick={() => { setWinner(null); setMode('menu'); }}
                  className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
                >
                  MAIN MENU ◀
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

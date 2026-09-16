'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface ConstellationSecretProps {
  onClose: () => void;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  pulseSpeed: number;
}

export default function ConstellationSecret({ onClose }: ConstellationSecretProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const [starCount, setStarCount] = useState(0);
  const [achievementTriggered, setAchievementTriggered] = useState(false);
  const { unlockAchievement } = useUniverseStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial background ambient twinkle stars
    const backgroundStars: Star[] = Array.from({ length: 70 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      brightness: Math.random(),
      pulseSpeed: Math.random() * 0.03 + 0.01,
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background ambient stars
      for (const bs of backgroundStars) {
        bs.brightness += bs.pulseSpeed;
        const alpha = Math.abs(Math.sin(bs.brightness)) * 0.6 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(bs.x, bs.y, bs.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const placed = starsRef.current;

      // Draw constellation connection lines
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          const dx = placed[i].x - placed[j].x;
          const dy = placed[i].y - placed[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220) {
            const alpha = (1 - dist / 220) * 0.7;
            ctx.strokeStyle = `rgba(185, 174, 245, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(placed[i].x, placed[i].y);
            ctx.lineTo(placed[j].x, placed[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw user placed glowing stars
      for (const s of placed) {
        s.brightness += s.pulseSpeed;
        const glow = Math.abs(Math.sin(s.brightness)) * 4 + 4;

        // Outer glow
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * glow);
        grad.addColorStop(0, 'rgba(255, 221, 140, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 92, 142, 0.4)');
        grad.addColorStop(1, 'rgba(255, 92, 142, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * glow, 0, Math.PI * 2);
        ctx.fill();

        // Star Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    SoundEngine.pop();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStar: Star = {
      x,
      y,
      radius: Math.random() * 2 + 2.5,
      brightness: Math.random(),
      pulseSpeed: 0.05,
    };

    starsRef.current.push(newStar);
    const count = starsRef.current.length;
    setStarCount(count);

    if (count >= 6 && !achievementTriggered) {
      setAchievementTriggered(true);
      SoundEngine.diamondGlow();
      unlockAchievement('stargazer');
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ['#FFDD8C', '#B9AEF5', '#FF5C8E'],
      });
    }
  };

  const handleReset = () => {
    starsRef.current = [];
    setStarCount(0);
    SoundEngine.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-[#070512] flex flex-col items-center justify-between p-6 select-none overflow-hidden"
    >
      {/* Interactive Starfield Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Header HUD */}
      <div className="relative z-10 text-center pointer-events-none mt-4">
        <h2 className="font-serif text-3xl md:text-4xl text-[var(--butter)] font-bold drop-shadow-[0_0_20px_rgba(255,221,140,0.8)]">
          Constellation of Us ✨
        </h2>
        <p className="font-mono text-xs text-purple-200 mt-1">
          Tap anywhere in the cosmos to draw stars & connect our celestial map
        </p>
      </div>

      {/* Unlocked Message Banner */}
      {achievementTriggered && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg mx-auto bg-black/60 backdrop-blur-md border border-[var(--butter)] p-5 rounded-3xl text-center shadow-[0_0_40px_rgba(255,221,140,0.4)] pointer-events-auto"
        >
          <span className="text-3xl block mb-1">🌟</span>
          <p className="font-caveat text-3xl md:text-4xl text-white font-bold leading-tight">
            &ldquo;Even across infinite galaxies, every single star spells your name, Nushi ✨&rdquo;
          </p>
          <p className="font-mono text-xs text-[var(--butter)] mt-2">
            🏆 Achievement Unlocked: Celestial Stargazer
          </p>
        </motion.div>
      )}

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center gap-3 mb-4 pointer-events-auto">
        <span className="px-3.5 py-1.5 rounded-full bg-white/10 font-mono text-xs text-white border border-white/20">
          Stars: {starCount}
        </span>

        <button
          onClick={handleReset}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 font-mono text-xs text-white border border-white/20 cursor-pointer"
        >
          Clear Sky 🌌
        </button>

        <button
          onClick={onClose}
          className="px-5 py-1.5 rounded-full bg-[var(--pink-deep)] font-mono text-xs font-bold text-white shadow-lg cursor-pointer hover:bg-[var(--pink)]"
        >
          Close ✕
        </button>
      </div>
    </motion.div>
  );
}

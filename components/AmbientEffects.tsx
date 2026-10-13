'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AmbientParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; emoji: string;
  opacity: number; rotation: number; vRot: number;
}

interface CursorParticle {
  x: number; y: number;
  vx: number; vy: number;
  emoji: string; size: number;
  alpha: number; life: number; maxLife: number;
}

const LIGHT_EMOJIS = ['💖', '✨', '🌸', '🩷', '💕', '⭐'];
const DARK_EMOJIS  = ['✨', '💫', '🤍', '🤎', '⭐', '💛'];

export default function AmbientEffects() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef  = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const lastSpawnRef = useRef(0);
  const themeRef     = useRef<'light' | 'dark'>('light');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;

    // Theme detection
    const updateTheme = () => {
      themeRef.current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Hi-DPI resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Fewer particles: 8 desktop / 4 mobile
    const ambientCount = isMobile ? 4 : 8;
    const ambientPool: AmbientParticle[] = [];
    const emojis = themeRef.current === 'dark' ? DARK_EMOJIS : LIGHT_EMOJIS;

    for (let i = 0; i < ambientCount; i++) {
      ambientPool.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.5 + 0.3),
        size: Math.random() * 10 + 14,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        opacity: Math.random() * 0.4 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
      });
    }

    // Cursor particles — desktop only, max 6
    const cursorPool: CursorParticle[] = [];
    const CURSOR_THROTTLE_MS = 100; // 40ms → 100ms

    const spawnCursorParticle = (x: number, y: number) => {
      if (isMobile) return; // Skip on mobile entirely
      const now = Date.now();
      if (now - lastSpawnRef.current < CURSOR_THROTTLE_MS) return;
      lastSpawnRef.current = now;
      if (cursorPool.length >= 6) cursorPool.shift(); // max 6
      const ae = themeRef.current === 'dark' ? DARK_EMOJIS : LIGHT_EMOJIS;
      cursorPool.push({
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 1.5 + 1.2),
        emoji: ae[Math.floor(Math.random() * ae.length)],
        size: Math.random() * 8 + 14,
        alpha: 1, life: 0, maxLife: 45,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      spawnCursorParticle(e.clientX, e.clientY);
    };
    const handleMouseLeave = () => { mouseRef.current.active = false; };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2.5);
      lastTime = time;
      const width  = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      let lastFontSize = -1;
      const setFont = (size: number) => {
        const s = Math.round(size);
        if (s !== lastFontSize) {
          ctx.font = `${s}px -apple-system, BlinkMacSystemFont, sans-serif`;
          lastFontSize = s;
        }
      };

      // Ambient particles
      for (let i = 0; i < ambientPool.length; i++) {
        const p = ambientPool[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;

        // Mouse repulsion
        if (mouseActive && !isMobile) {
          const dx = p.x - mx, dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 1) {
            const force = (150 - dist) / 150;
            p.x += (dx / dist) * force * 4 * dt;
            p.y += (dy / dist) * force * 4 * dt;
          }
        }

        if (p.y < -30) { p.y = height + 20; p.x = Math.random() * width; }
        else if (p.y > height + 40) p.y = -20;
        if (p.x < -30) p.x = width + 20;
        else if (p.x > width + 30) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        setFont(p.size);
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      // Cursor trail
      for (let i = cursorPool.length - 1; i >= 0; i--) {
        const cp = cursorPool[i];
        cp.life += dt;
        cp.x += cp.vx * dt;
        cp.y += cp.vy * dt;
        const progress = cp.life / cp.maxLife;
        cp.alpha = Math.max(0, 1 - progress);
        if (progress >= 1) { cursorPool.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(cp.x, cp.y);
        ctx.globalAlpha = cp.alpha;
        ctx.scale(0.8 + progress * 0.5, 0.8 + progress * 0.5);
        setFont(cp.size);
        ctx.fillText(cp.emoji, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}
    />
  );
}

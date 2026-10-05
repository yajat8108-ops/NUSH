'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from '../SectionHead';
import ConstellationDetail, { ConstellationInfo } from './ConstellationDetail';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const CONSTELLATIONS: (ConstellationInfo & { x: number; y: number; stars: [number, number][] })[] = [
  {
    id: 'guitar',
    name: 'The Acoustic Guitar',
    symbol: '🎸',
    subtitle: 'The First Meet & Instant Gut Feeling',
    x: 22,
    y: 35,
    lore: 'On the very first day Yajat and Nush met in person, Yajat brought his acoustic guitar and sang for her. Right in that quiet moment, he knew in his gut that she was going to be his whole universe.',
    quote: 'The day I held my guitar and sang for you, I already knew my heart was in trouble.',
    stars: [[20, 25], [22, 35], [24, 45], [21, 55], [26, 38]],
  },
  {
    id: 'kiss_ab2',
    name: 'The Sacred AB-2 Kiss',
    symbol: '💋',
    subtitle: 'August 22, 2026 &middot; Quiet Walkway Colliding Hearts',
    x: 50,
    y: 28,
    lore: 'On the evening of August 22, 2026, just past AB-2 on their sacred walking route, the entire college world faded away and two hearts collided into an eternal memory.',
    quote: 'Two glowing hearts colliding into one eternal memory right past AB-2.',
    stars: [[45, 25], [50, 28], [55, 24], [58, 30], [52, 35], [50, 40]],
  },
  {
    id: 'teddy_yajat',
    name: 'Teddy Bear “Yajat”',
    symbol: '🧸',
    subtitle: 'The Fluffy Guardian & Emergency Cuddle Standby',
    x: 78,
    y: 32,
    lore: 'For her birthday, Yajat gave Anushka a fluffy teddy bear. She named the bear “Yajat” so she can hug him whenever she misses him. It remains the most adorable tribute in relationship history.',
    quote: 'Whenever you miss me, just hug that bear. Best tribute ever.',
    stars: [[74, 28], [82, 28], [78, 32], [73, 38], [83, 38], [78, 45]],
  },
  {
    id: 'maggi_2am',
    name: 'The 2 AM Cheese Maggi',
    symbol: '🍜',
    subtitle: 'Midnight Cravings Protocol & Extra Cheese',
    x: 32,
    y: 70,
    lore: 'Late-night hunger protocol: extra cheese, extra spicy, no questions asked, always on standby for Nush whenever she has midnight cravings.',
    quote: '2 AM Maggi loading... extra cheese, no questions asked 🍜❤️',
    stars: [[26, 66], [38, 66], [36, 75], [28, 75], [32, 60]],
  },
  {
    id: 'open_audi',
    name: 'Open Audi Under the Stars',
    symbol: '🏛️',
    subtitle: 'Pavitra Sacred Tears & The 8:00 PM Guards Sprint',
    x: 70,
    y: 68,
    lore: 'Open Audi is their sacred, pavitra spot under the cosmos where guards chase them out at 8:00 PM every single evening to start their long campus walk loop.',
    quote: '8:00 baje guards hume Open Audi se bhaga dete hain, but our hearts never leave this spot.',
    stars: [[64, 62], [70, 68], [76, 62], [73, 76], [67, 76]],
  },
];

export default function StargazingSky() {
  const { unlockAchievement } = useUniverseStore();
  const [selectedConstellation, setSelectedConstellation] = useState<ConstellationInfo | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background Starfield & Shooting Stars Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.6,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }));

    // Shooting stars system
    let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number } | null = null;
    let nextShootingStarTime = Date.now() + 3000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep celestial nebula gradient
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.45, 60, width * 0.5, height * 0.45, width * 0.75);
      grad.addColorStop(0, 'rgba(185, 174, 245, 0.12)');
      grad.addColorStop(0.4, 'rgba(255, 92, 142, 0.08)');
      grad.addColorStop(0.8, 'rgba(124, 58, 237, 0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw glowing constellation lines
      CONSTELLATIONS.forEach((c) => {
        ctx.strokeStyle = 'rgba(255, 158, 201, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        c.stars.forEach(([sx, sy], idx) => {
          const px = (sx / 100) * width;
          const py = (sy / 100) * height;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw star nodes
        c.stars.forEach(([sx, sy]) => {
          const px = (sx / 100) * width;
          const py = (sy / 100) * height;
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 221, 140, 0.9)';
          ctx.shadowColor = '#FF5C8E';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // Draw background twinkling stars
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
        ctx.fill();
      });

      // Manage shooting stars
      const now = Date.now();
      if (!shootingStar && now > nextShootingStarTime) {
        shootingStar = {
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 60,
          speed: Math.random() * 8 + 6,
          opacity: 1,
        };
        nextShootingStarTime = now + Math.random() * 6000 + 4000;
      }

      if (shootingStar) {
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + shootingStar.length, shootingStar.y + shootingStar.length * 0.6);
        ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        shootingStar.x += shootingStar.speed;
        shootingStar.y += shootingStar.speed * 0.6;
        shootingStar.opacity -= 0.025;

        if (shootingStar.opacity <= 0 || shootingStar.x > width) {
          shootingStar = null;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelect = (c: ConstellationInfo) => {
    SoundEngine.chime();
    unlockAchievement('stargazer_cosmic');
    setSelectedConstellation(c);
  };

  const handleWishOnStar = () => {
    SoundEngine.confettiPop();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FFDD8C', '#FF5C8E', '#B9AEF5', '#ffffff'],
    });
  };

  return (
    <section id="stargazing-sky" className="anniversary-section py-16 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="our #1 undisputed dream date"
        title="Late-Night Stargazing Observatory 🌌"
        subtitle="just the two of us under the infinite cosmos, connecting our sacred milestones into constellations"
      />

      {/* Prominent Constellation Quick-Navigation Strip */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-6 mb-4">
        {CONSTELLATIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelect(c)}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold transition-all shadow hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>{c.symbol}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Immersive Stargazing Canvas Container */}
      <div className="relative w-full h-[580px] rounded-[36px] overflow-hidden bg-gradient-to-b from-[#06040b] via-[#0d0718] to-[#140a25] border-4 border-pink-500/40 shadow-[0_0_90px_rgba(236,72,153,0.3)]">
        {/* Real-time star animation canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Ambient Top Indicator & Wish Trigger */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-zinc-300 z-10">
          <span className="flex items-center gap-1.5 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
            <span>VIT Bhopal Night Sky &middot; Live Coordinates</span>
          </span>

          <button
            onClick={handleWishOnStar}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white px-3.5 py-1.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer text-xs"
          >
            <span>✨</span>
            <span>Make a Wish on a Star</span>
          </button>
        </div>

        {/* Constellations Grid Placement with Radiant Glow */}
        {CONSTELLATIONS.map((c) => (
          <motion.div
            key={c.id}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => handleSelect(c)}
              className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
            >
              {/* Glowing Pulse Ring around constellation */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-14 h-14 rounded-full bg-pink-500/30 group-hover:bg-pink-500/50 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-black/70 border-2 border-pink-400 group-hover:border-pink-200 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,92,142,0.8)] backdrop-blur-md transition-all">
                  {c.symbol}
                </div>
              </div>

              {/* Label */}
              <span className="text-[11px] font-mono font-bold text-pink-200 group-hover:text-white bg-black/80 px-3 py-1 rounded-full border border-white/20 whitespace-nowrap shadow-lg transition-colors">
                {c.name}
              </span>
            </button>
          </motion.div>
        ))}

        {/* Bottom Romantic Quote Ribbon */}
        <div className="absolute bottom-5 left-4 right-4 text-center z-10 pointer-events-none">
          <p className="font-caveat text-2xl sm:text-3xl text-pink-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            &ldquo;Even across infinite galaxies, every single star spells your name, Nushi ✨&rdquo;
          </p>
        </div>
      </div>

      {/* Constellation Memory Card Modal */}
      <ConstellationDetail
        constellation={selectedConstellation}
        onClose={() => setSelectedConstellation(null)}
      />
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

const UPGRADES = [
  { id: 'maggi', name: '2 AM Extra Cheese Maggi 🍜', cost: 25, boost: 1, type: 'click' },
  { id: 'teddy', name: 'Teddy Yajat Cuddler 🧸', cost: 80, boost: 3, type: 'auto' },
  { id: 'radio', name: 'Radio Voice Hypnosis 🎙️', cost: 250, boost: 10, type: 'auto' },
  { id: 'facetime', name: 'All-Night Call Stream 📱', cost: 750, boost: 35, type: 'auto' },
  { id: 'wifey', name: 'Wifeyyy Supreme Multiplier 👑', cost: 2500, boost: 120, type: 'auto' },
];

export default function LoveClickerGame() {
  const { lovePoints, clickerMultiplier, clickerUpgrades, addLovePoints, buyClickerUpgrade } = useUniverseStore();
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Passive Auto Generation
  useEffect(() => {
    const autoBoost = UPGRADES.filter((u) => u.type === 'auto').reduce(
      (acc, u) => acc + (clickerUpgrades[u.id] || 0) * u.boost,
      0
    );

    if (autoBoost <= 0) return;
    const interval = setInterval(() => {
      addLovePoints(autoBoost);
    }, 1000);

    return () => clearInterval(interval);
  }, [clickerUpgrades, addLovePoints]);

  const clickBoost = UPGRADES
    .filter((u) => u.type === 'click')
    .reduce((acc, u) => acc + (clickerUpgrades[u.id] || 0) * u.boost, 1);

  const handleClickHeart = (e: React.MouseEvent) => {
    SoundEngine.pop();
    addLovePoints(clickBoost);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newId = Date.now() + Math.random();
    setFloatingParticles((prev) => [...prev.slice(-12), { id: newId, x, y }]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 700);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>❤️⚡</span> IDLE LOVE CLICKER
          </h3>
          <p className="text-xs text-[var(--pink)]">Generate unlimited Love Points for our relationship universe</p>
        </div>
        <div className="bg-black/40 px-3 py-1.5 rounded-full border border-[var(--pink)]/30 text-xs font-mono">
          ❤️ <span className="text-base font-bold text-[var(--butter)]">{lovePoints}</span> LP
        </div>
      </div>

      {/* Heart Click Area */}
      <div className="relative w-full h-[180px] bg-black/40 rounded-2xl border border-white/10 flex flex-col items-center justify-center mb-4 overflow-hidden">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleClickHeart}
          className="text-7xl filter drop-shadow-[0_0_25px_rgba(255,92,142,0.6)] cursor-pointer select-none"
        >
          💖
        </motion.button>
        <span className="text-xs text-gray-300 mt-2 font-mono">Tap the Heart to generate love</span>

        {/* Floating +LP feedback */}
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -45, scale: 1.2 }}
            transition={{ duration: 0.7 }}
            className="absolute pointer-events-none text-xs font-bold font-mono text-[var(--butter)]"
            style={{ left: p.x, top: p.y }}
          >
            +{clickBoost} LP ❤️
          </motion.div>
        ))}
      </div>

      {/* Upgrades Store */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300 block mb-1">Simp Upgrades &amp; Boosters 🛒</span>
        {UPGRADES.map((u) => {
          const owned = clickerUpgrades[u.id] || 0;
          const currentCost = Math.round(u.cost * Math.pow(1.25, owned));
          const canAfford = lovePoints >= currentCost;

          return (
            <div
              key={u.id}
              className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs"
            >
              <div>
                <span className="font-bold text-gray-100 block">{u.name}</span>
                <span className="text-[10px] text-gray-400">
                  {u.type === 'click' ? `+${u.boost} LP per click` : `+${u.boost} LP / sec`} &middot; Owned: {owned}
                </span>
              </div>
              <button
                onClick={() => buyClickerUpgrade(u.id, currentCost, 0)}
                disabled={!canAfford}
                className={`px-3 py-1.5 rounded-full font-bold font-mono text-xs transition-colors shadow ${
                  canAfford
                    ? 'bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white hover:scale-105 active:scale-95'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentCost} LP
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

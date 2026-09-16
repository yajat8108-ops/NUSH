'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WaxSealProps {
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  isUnlocked?: boolean;
  className?: string;
}

export default function WaxSeal({
  emoji = '💌',
  size = 'md',
  isUnlocked = false,
  className = '',
}: WaxSealProps) {
  const sizeMap = {
    sm: { outer: 'w-14 h-14', inner: 'w-10 h-10', text: 'text-xl', rim: 'border-2' },
    md: { outer: 'w-20 h-20', inner: 'w-14 h-14', text: 'text-2xl', rim: 'border-2' },
    lg: { outer: 'w-24 h-24', inner: 'w-16 h-16', text: 'text-3xl', rim: 'border-3' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
      transition={{ duration: 0.3 }}
      className={`relative inline-flex items-center justify-center select-none ${currentSize.outer} ${className}`}
      style={{
        filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.6)) drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
      }}
    >
      {/* Layer 1: Melted Wax Outer Organic Drip Shape */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isUnlocked
            ? 'radial-gradient(circle at 35% 35%, #be123c 0%, #9f1239 40%, #881337 70%, #4c0519 100%)'
            : 'radial-gradient(circle at 35% 35%, #e11d48 0%, #be123c 40%, #881337 75%, #450a1b 100%)',
          borderRadius: '48% 52% 49% 51% / 51% 48% 52% 49%',
          boxShadow:
            'inset 0 3px 6px rgba(255,255,255,0.45), inset 0 -4px 8px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.3)',
          transform: 'rotate(12deg)',
        }}
      />

      {/* Layer 2: Second wavy drip ring for organic poured wax edges */}
      <div
        className="absolute inset-0.5 rounded-full opacity-90"
        style={{
          background: isUnlocked
            ? 'radial-gradient(circle at 30% 30%, #be123c 0%, #881337 80%)'
            : 'radial-gradient(circle at 30% 30%, #fb7185 0%, #be123c 50%, #700a22 100%)',
          borderRadius: '52% 48% 54% 46% / 47% 53% 47% 53%',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.6)',
          transform: 'rotate(-18deg)',
        }}
      />

      {/* Layer 3: Sunken Coin Ring (The Pressed Die Cavity) */}
      <div
        className={`relative z-10 ${currentSize.inner} rounded-full flex items-center justify-center ${currentSize.rim} border-rose-950/60`}
        style={{
          background:
            'radial-gradient(circle at 40% 40%, #9f1239 0%, #881337 50%, #4c0519 100%)',
          boxShadow:
            'inset 0 4px 8px rgba(0,0,0,0.85), inset 0 -2px 4px rgba(255,255,255,0.25), 0 2px 4px rgba(255,255,255,0.15)',
        }}
      >
        {/* Subtle decorative concentric groove ring */}
        <div className="absolute inset-1 rounded-full border border-rose-400/25 pointer-events-none" />

        {/* Embossed Symbol (3D chiseled relief effect) */}
        <span
          className={`${currentSize.text} relative z-20 pointer-events-none`}
          style={{
            filter:
              'drop-shadow(0 2px 2px rgba(0,0,0,0.9)) drop-shadow(0 -1px 1px rgba(255,255,255,0.5))',
          }}
        >
          {emoji}
        </span>
      </div>

      {/* Gloss / Wax Specular Highlight */}
      <div
        className="absolute top-2 left-3 w-5 h-2.5 rounded-full pointer-events-none opacity-50 blur-[0.5px]"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(-35deg)',
        }}
      />
    </motion.div>
  );
}

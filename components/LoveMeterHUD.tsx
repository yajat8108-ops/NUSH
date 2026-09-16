'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '@/lib/progressStore';

export default function LoveMeterHUD() {
  const { progress, lastUnlockedToast } = useProgressStore();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Handle toast visibility
  useEffect(() => {
    if (lastUnlockedToast) {
      setToastMsg(lastUnlockedToast);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastUnlockedToast]);

  const isMaxed = progress >= 100;

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col items-end gap-3 pointer-events-none font-nunito">
      {/* Toast Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--pink)] pointer-events-auto max-w-[280px] sm:max-w-sm"
          >
            <p className="text-sm font-bold text-[var(--plum)] leading-snug">
              {toastMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Pill */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="pointer-events-auto"
      >
        <div
          className={`relative overflow-hidden rounded-full backdrop-blur-lg border-2 shadow-lg flex items-center gap-3 sm:gap-4 px-4 py-2 sm:px-5 sm:py-3 transition-all duration-700 ${
            isMaxed
              ? 'bg-gradient-to-r from-yellow-50/90 to-amber-50/90 border-yellow-400 shadow-yellow-300/50'
              : 'bg-white/70 border-[var(--pink-deep)] shadow-pink-300/30'
          }`}
        >
          {/* Heart Icon */}
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="text-2xl sm:text-3xl drop-shadow-sm flex-shrink-0"
          >
            {isMaxed ? '💖' : '🩷'}
          </motion.div>

          {/* Progress Section */}
          <div className="flex flex-col min-w-[120px] sm:min-w-[160px]">
            <div className="flex justify-between items-end mb-1">
              <span
                className={`text-xs sm:text-sm font-extrabold tracking-wide ${
                  isMaxed ? 'text-amber-600' : 'text-[var(--plum)]'
                }`}
              >
                {isMaxed ? '🏆 100% Master Love' : 'Love Meter'}
              </span>
              {!isMaxed && (
                <span className="text-xs sm:text-sm font-bold text-[var(--plum-soft)]">
                  {Math.min(progress, 100)}%
                </span>
              )}
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-2.5 sm:h-3 rounded-full bg-black/5 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                className={`h-full rounded-full ${
                  isMaxed
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500'
                    : 'bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)]'
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

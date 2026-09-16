'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';

export default function CamcorderViewfinder() {
  const { isCamcorderOn } = useUniverseStore();
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hrs}:${mins}:${secs}`);
    };

    updateTime(); // initial call
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Viewfinder Overlay */}
      <AnimatePresence>
        {isCamcorderOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-[9998] h-full w-full overflow-hidden text-white sm:text-lg"
            style={{ fontFamily: 'monospace' }}
          >
            {/* Scanlines & Grain */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 3px)',
                backgroundSize: '100% 4px',
              }}
            />

            {/* Vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
              }}
            />

            {/* HUD Elements Container */}
            <div className="absolute inset-0 p-6 md:p-12 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
              {/* Top Left: REC */}
              <div className="absolute left-6 top-6 flex items-center gap-2 md:left-12 md:top-12">
                <span className="h-4 w-4 animate-pulse rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                <span className="font-bold tracking-widest text-red-500 shadow-red-500/50 [text-shadow:0_0_8px_rgba(220,38,38,0.8)]">
                  REC
                </span>
              </div>

              {/* Top Right: Status */}
              <div className="absolute right-6 top-6 md:right-12 md:top-12">
                <span className="font-bold tracking-widest">SP ▷</span>
              </div>

              {/* Bottom Left: Time */}
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12">
                <span className="font-bold tracking-wider">{timeString}</span>
              </div>

              {/* Bottom Right: Battery */}
              <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12">
                <span className="font-bold tracking-widest text-green-400 [text-shadow:0_0_8px_rgba(74,222,128,0.6)]">
                  <span className="mr-2">▓▓▓░</span>87%
                </span>
              </div>

              {/* Center Crosshairs */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center opacity-50">
                <div className="flex h-32 w-48 justify-between">
                  <div className="h-full w-8 border-b-2 border-l-2 border-t-2 border-white/70" />
                  <div className="flex flex-col justify-center">
                    <div className="h-0.5 w-4 bg-white/70" />
                  </div>
                  <div className="h-full w-8 border-b-2 border-r-2 border-t-2 border-white/70" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

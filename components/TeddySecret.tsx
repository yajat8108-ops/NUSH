'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function TeddySecret() {
  const router = useRouter();
  const [stage, setStage] = useState<'initial' | 'main'>('initial');

  useEffect(() => {
    // Initial explosion of bears
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
        shapes: ['circle'],
        scalar: 2
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
        shapes: ['circle'],
        scalar: 2
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => {
      setStage('main');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--plum)] flex flex-col items-center justify-center z-[99999]">
      {/* Background gradients */}
      <div 
        className="absolute inset-0 opacity-40" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,92,142,0.4) 0%, rgba(60,20,40,1) 100%)'
        }}
      />

      {/* Floating bears and hearts background */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute text-4xl opacity-20 pointer-events-none select-none"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }}
          animate={{
            y: [0, -Math.random() * 100 - 50, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, Math.random() * 360, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8 + Math.random() * 5, 
            delay: Math.random() * 2 
          }}
        >
          {['🐻', '🧸', '💖', '🩷', '💕'][i % 5]}
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {stage === 'initial' && (
          <motion.div
            key="initial"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
            className="relative z-10 text-[10rem]"
          >
            🧸
          </motion.div>
        )}

        {stage === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            className="relative z-10 flex flex-col items-center max-w-2xl text-center px-6"
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(255,92,142,0.8)]"
            >
              🐻
            </motion.div>
            
            <h1 
              className="font-caveat text-5xl md:text-7xl mb-4 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #FF9EC9, #B9AEF5, #FFDD8C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(255,92,142,0.4))'
              }}
            >
              You found Yajat the Bear!
            </h1>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl mb-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="font-nunito text-xl text-white/90 leading-relaxed font-medium mb-4">
                The fact that you clicked on "teddy bear" 10 times just goes to show how adorable and curious you are. 
              </p>
              <p className="font-nunito text-lg text-[#FF9EC9] italic font-semibold">
                I love that you named him after me. Every time you hug him, just know it's a piece of me hugging you right back. 
                You are my whole world, Anushka. 🩷
              </p>
            </motion.div>

            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--pink)] text-white rounded-full font-nunito font-bold text-lg shadow-[0_0_20px_rgba(255,92,142,0.5)] hover:shadow-[0_0_30px_rgba(255,92,142,0.8)] transition-shadow flex items-center gap-2"
            >
              <span>&larr;</span> Back to our letter
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

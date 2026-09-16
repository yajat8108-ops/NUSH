'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { useProgressStore } from '@/lib/progressStore';

type CategoryId = 'food' | 'movie' | 'vibe' | 'kiss';

interface Option {
  id: string;
  title: string;
  desc: string;
}

interface Category {
  id: CategoryId;
  title: string;
  options: Option[];
}

const CATEGORIES: Category[] = [
  {
    id: 'food',
    title: 'Food 🍜',
    options: [
      { id: 'maggi', title: 'Maggi at 2am 🍜', desc: 'extra cheese, no questions asked' },
      { id: 'pizza', title: 'Pizza 🍕', desc: "because we're basic and proud" },
      { id: 'icecream', title: 'Ice Cream 🍨', desc: 'dessert first, always' }
    ]
  },
  {
    id: 'movie',
    title: 'Movie 🎬',
    options: [
      { id: 'hp', title: 'Harry Potter Marathon ⚡', desc: '10 points to Gryffindor!' },
      { id: 'romcom', title: 'RomCom 💕', desc: "pretending we're not crying" },
      { id: 'horror', title: 'Horror 👻', desc: 'Nush will definitely fall asleep in 10 mins' }
    ]
  },
  {
    id: 'vibe',
    title: 'Vibe ✨',
    options: [
      { id: 'blanket', title: 'Blanket Fort 🏰', desc: 'maximum coziness & movie snuggles' },
      { id: 'stargazing', title: 'Late-Night Stargazing 🌌✨', desc: 'OUR PERFECT DATE · lying under the stars, cold night air, talking about forever 🥹❤️' },
      { id: 'drive', title: 'Late Night Drive 🌃', desc: 'windows down, music up, hand in hand' }
    ]
  },
  {
    id: 'kiss',
    title: 'Kiss Type 💋',
    options: [
      { id: 'forehead', title: 'Forehead Kisses on Loop 💋', desc: "Yajat's signature move" },
      { id: 'nose', title: 'Nose Boop 👑', desc: "because you're a puppy" },
      { id: 'hug', title: 'Random Tight Hug 🫢', desc: 'no reason needed' }
    ]
  }
];

const Confetti = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ['#f472b6', '#c084fc', '#fbbf24', '#38bdf8', '#34d399'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
          animate={{
            y: window.innerHeight + 20,
            x: p.x + (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360 * 3,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: "easeOut",
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};

export default function DateSimulator() {
  const [selections, setSelections] = useState<Record<CategoryId, string | null>>({
    food: null,
    movie: null,
    vibe: null,
    kiss: null
  });
  const [showPass, setShowPass] = useState(false);

  const allSelected = Object.values(selections).every((val) => val !== null);

  const { addProgress } = useProgressStore();

  const handleSelect = (categoryId: CategoryId, optionId: string) => {
    SoundEngine.click();
    setSelections(prev => ({ ...prev, [categoryId]: optionId }));
  };

  const handleGeneratePass = () => {
    SoundEngine.confettiPop();
    setShowPass(true);
    addProgress('date_simulator', 15, 'Generated Official Date Pass!');
  };

  const getOptionTitle = (categoryId: CategoryId, optionId: string | null) => {
    if (!optionId) return '';
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.options.find(o => o.id === optionId)?.title || '';
  };

  return (
    <section className="py-16 px-4 max-w-4xl mx-auto w-full font-quicksand">
      <SectionHead
        eyebrow="plan our night"
        title="Date Night Simulator"
        subtitle="build our perfect evening, claim your pass"
      />

      <div className="mt-12 space-y-12">
        {!showPass ? (
          <>
            {CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-xl font-bold text-[var(--plum)] font-nunito">{category.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.options.map((option) => {
                    const isSelected = selections[category.id] === option.id;
                    return (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(category.id, option.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 relative ${
                          isSelected
                            ? 'border-[var(--pink)] bg-[var(--pink)]/10 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                            : 'border-[var(--mocha-light)] bg-white/50 hover:border-[var(--pink)]/50'
                        }`}
                      >
                        {option.id === 'stargazing' && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-mono text-[9px] font-bold shadow-md animate-pulse">
                            ✨ OUR #1 DREAM DATE
                          </span>
                        )}
                        <h4 className="font-bold text-[var(--plum)] mb-1">{option.title}</h4>
                        <p className="text-sm text-[var(--plum-soft)]">{option.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            <AnimatePresence>
              {allSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-center pt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGeneratePass}
                    className="px-8 py-4 bg-[var(--pink)] text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl hover:bg-[var(--pink-deep)] transition-all"
                  >
                    Generate Date Pass ✨
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center items-center py-8 relative"
            >
              <Confetti />
              
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border-4 border-[var(--pink)] relative">
                {/* Pass Header */}
                <div className="bg-[var(--pink)] p-6 text-center text-white relative">
                  <div className="absolute top-2 right-2 text-4xl opacity-20">🎟️</div>
                  <h2 className="text-3xl font-black tracking-wider mb-1 font-nunito">OFFICIAL DATE PASS</h2>
                  <p className="text-white/80 text-sm uppercase tracking-widest font-bold">Admit Two (You & Me)</p>
                </div>
                
                {/* Pass Body */}
                <div className="p-6 space-y-6 bg-[var(--cream)]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-[var(--pink)]/20 pb-3">
                      <span className="text-2xl w-8 text-center">🍜</span>
                      <div>
                        <p className="text-xs text-[var(--plum-soft)] uppercase font-bold tracking-wider">Food</p>
                        <p className="text-lg font-bold text-[var(--plum)]">{getOptionTitle('food', selections.food)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-[var(--pink)]/20 pb-3">
                      <span className="text-2xl w-8 text-center">🎬</span>
                      <div>
                        <p className="text-xs text-[var(--plum-soft)] uppercase font-bold tracking-wider">Movie</p>
                        <p className="text-lg font-bold text-[var(--plum)]">{getOptionTitle('movie', selections.movie)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-[var(--pink)]/20 pb-3">
                      <span className="text-2xl w-8 text-center">✨</span>
                      <div>
                        <p className="text-xs text-[var(--plum-soft)] uppercase font-bold tracking-wider">
                          Vibe {selections.vibe === 'stargazing' && <span className="text-[var(--pink-deep)]">· OUR PERFECT DATE! 🌌</span>}
                        </p>
                        <p className="text-lg font-bold text-[var(--plum)]">{getOptionTitle('vibe', selections.vibe)}</p>
                        {selections.vibe === 'stargazing' && (
                          <p className="text-xs font-caveat text-[var(--pink-deep)] font-bold">
                            &ldquo;Lying under the stars with you is my definition of forever ❤️&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-[var(--pink)]/20 pb-3">
                      <span className="text-2xl w-8 text-center">💋</span>
                      <div>
                        <p className="text-xs text-[var(--plum-soft)] uppercase font-bold tracking-wider">Kiss Type</p>
                        <p className="text-lg font-bold text-[var(--plum)]">{getOptionTitle('kiss', selections.kiss)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer details */}
                  <div className="bg-[var(--pink)]/10 p-4 rounded-xl border border-[var(--pink)]/30 text-sm space-y-2">
                    <p className="flex justify-between">
                      <span className="text-[var(--plum-soft)] font-bold">Valid for:</span>
                      <span className="text-[var(--plum)] font-black">Yajat & Nush</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-[var(--plum-soft)] font-bold">Issued:</span>
                      <span className="text-[var(--plum)] font-bold">August 22, 2026</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-[var(--plum-soft)] font-bold">Redeemable:</span>
                      <span className="text-[var(--plum)] font-bold">Whenever Nush wants ❤️</span>
                    </p>
                  </div>

                  <div className="pt-4 text-center">
                    <p className="font-caveat text-3xl text-[var(--pink-deep)]">Take a screenshot! 📸</p>
                  </div>
                </div>
                
                {/* Barcode decorative element */}
                <div className="h-12 bg-white flex items-center justify-center gap-1 px-8 pb-4 opacity-50">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className={`h-full bg-black ${Math.random() > 0.5 ? 'w-1' : 'w-2'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => {
                  setShowPass(false);
                  setSelections({food: null, movie: null, vibe: null, kiss: null});
                }}
                className="text-[var(--plum-soft)] hover:text-[var(--pink)] underline decoration-dotted transition-colors"
              >
                Plan another date
              </button>
            </div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

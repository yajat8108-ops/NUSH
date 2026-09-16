'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';

const COUPONS = [
  { id: 1, icon: "🎟️", title: "Movie Night", desc: "Your pick. I won't complain. (I might fall asleep though 😴)" },
  { id: 2, icon: "🥞", title: "Breakfast in Bed", desc: "Served hot, with love, and probably burnt toast" },
  { id: 3, icon: "🍜", title: "2 AM Maggi", desc: "Extra cheese, extra love, no judgment" },
  { id: 4, icon: "🫢", title: "Unlimited Cuddles", desc: "24/7, no expiry, terms and conditions: none" },
  { id: 5, icon: "🙅‍♂️", title: "Zero Argument Pass", desc: "You're right. I'm wrong. Valid once. Use wisely. 😂" },
  { id: 6, icon: "💋", title: "Forehead Kiss Refill", desc: "Unlimited forehead kisses, redeemable on demand" }
];

const QUIZ_OPTIONS = [
  { text: "Cleaning the apartment", correct: false },
  { text: "Going grocery shopping", correct: false },
  { text: "Doing laundry", correct: false },
  { text: "Cuddling and watching movies", correct: true }
];

export default function CouponsSection() {
  const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [redeemed, setRedeemed] = useState<number[]>([]);

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (quizStatus !== 'idle') return;
    setQuizStatus(isCorrect ? 'correct' : 'wrong');
  };

  const handleRedeem = (id: number) => {
    if (!redeemed.includes(id)) {
      setRedeemed((prev) => [...prev, id]);
    }
  };

  return (
    <section className="py-20 px-4 max-w-2xl mx-auto relative overflow-hidden" id="coupons">
      <SectionHead 
        eyebrow="bonus inclusions" 
        title="Redeemable Love Tokens" 
        subtitle="tear one off whenever you need it" 
      />

      <div className="mt-12 w-full">
        <AnimatePresence mode="wait">
          {quizStatus === 'idle' ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--white)] rounded-2xl p-6 md:p-8 shadow-xl border border-[var(--pink)]"
            >
              <h3 className="text-xl md:text-2xl font-quicksand font-bold text-[var(--plum)] mb-6 text-center">
                Gatekeeper Quiz: What is the absolute best thing to do on a lazy Sunday?
              </h3>
              <div className="flex flex-col gap-3">
                {QUIZ_OPTIONS.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuizAnswer(opt.correct)}
                    className="w-full p-4 rounded-xl border-2 border-[var(--pink)] text-[var(--plum)] font-nunito font-semibold hover:bg-[var(--pink)] hover:text-white transition-colors text-left"
                  >
                    {opt.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="coupons-view"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.4 }}
                className="mb-10 text-center"
              >
                <p className="font-caveat text-3xl md:text-4xl text-[var(--pink-deep)]">
                  {quizStatus === 'correct' 
                    ? "Obviously! 😏 Here are your tokens..." 
                    : "Jk... ALL of these are your redeemable tokens anyway 😂 whenever you want... your wish is my command ✨"}
                </p>
              </motion.div>

              <div className="w-full flex flex-col gap-6">
                {COUPONS.map((coupon, idx) => (
                  <CouponCard 
                    key={coupon.id} 
                    coupon={coupon} 
                    index={idx}
                    isRedeemed={redeemed.includes(coupon.id)}
                    onRedeem={() => handleRedeem(coupon.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CouponCard({ coupon, index, isRedeemed, onRedeem }: { coupon: any, index: number, isRedeemed: boolean, onRedeem: () => void }) {
  // Slight random rotation for depth
  const rotation = (index % 2 === 0 ? 1 : -1) * (1 + index * 0.2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.15, type: 'spring' }}
      whileHover={{ scale: 1.02, rotate: 0 }}
      style={{ rotate: rotation }}
      className="relative bg-[var(--cream)] rounded-lg shadow-lg border-2 border-[var(--pink)] w-full flex flex-col overflow-hidden"
    >
      {/* Tear-off dotted line at the top */}
      <div className="h-4 border-b-2 border-dashed border-[var(--pink-deep)] opacity-50 relative bg-[var(--pink)] bg-opacity-20 flex items-center justify-evenly">
        {/* Little cutouts to simulate perforation */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-[var(--white)] -mt-4 shadow-inner" />
        ))}
      </div>

      <div className="flex p-4 md:p-6 items-center gap-4 relative z-10">
        <div className="text-5xl md:text-6xl flex-shrink-0 drop-shadow-md">
          {coupon.icon}
        </div>
        
        <div className="flex-grow">
          <h4 className="font-quicksand font-bold text-xl md:text-2xl text-[var(--plum)] mb-1 uppercase tracking-wider">
            {coupon.title}
          </h4>
          <p className="font-nunito text-sm md:text-base text-[var(--mocha)] leading-tight">
            {coupon.desc}
          </p>
        </div>

        <div className="flex-shrink-0 border-l-2 border-dashed border-[var(--pink)] pl-4 h-full flex items-center justify-center">
          <button
            onClick={onRedeem}
            disabled={isRedeemed}
            className={`font-quicksand font-bold py-2 px-4 rounded-full transition-all border-2 ${
              isRedeemed 
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-[var(--pink)] text-white border-[var(--pink-deep)] hover:bg-[var(--pink-deep)] shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            {isRedeemed ? 'Used' : 'Redeem'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isRedeemed && (
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -15 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            {/* Confetti particles */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ 
                    x: Math.cos(angle * Math.PI / 180) * 100, 
                    y: Math.sin(angle * Math.PI / 180) * 100,
                    opacity: 0,
                    scale: 1.5,
                    rotate: 180
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute w-3 h-3 rounded-sm bg-[var(--pink-deep)]"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'var(--pink-deep)' : 'var(--plum-soft)'
                  }}
                />
              );
            })}
            
            <div className="border-4 border-red-500 text-red-500 font-black font-quicksand text-3xl md:text-5xl px-6 py-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl transform rotate-[-15deg] uppercase tracking-widest mix-blend-multiply">
              REDEEMED ❤️
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

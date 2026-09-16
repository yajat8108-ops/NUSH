'use client';

import React, { useState, useEffect } from 'react';
import SectionHead from './SectionHead';
import { motion } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';

const NINETY_REASONS = [
  // 1 - 10
  "your smile — the kind that makes me want to jump up and down from pure excitement",
  "your cute face, especially when you're angry (sorry, it's just effortlessly adorable)",
  "the way you get obsessed with things — though I'm still more obsessed with you",
  "day by day, my love for you just keeps increasing with zero signs of slowing down",
  "you doodled our names on your own arm like a middle schooler, and I loved it so much",
  "you hugged that teddy bear (named after me) tighter than you hug most people",
  "you've kept the Day 16 card I made you safe in your room this whole time",
  "you turn every dumb candid selfie into my new favorite wallpaper",
  "three months in, and I still look forward to your notifications like it's day one",
  "the way you say 'Yajat' when you're annoyed — it's weirdly the cutest sound on earth",

  // 11 - 20
  "our Open Audi memories that make us cry happy tears because we're just that lucky",
  "the fact that you named a whole teddy bear after me 💀😂",
  "how you hold on extra tight during our random unexpected hugs",
  "getting kicked out of Open Audi at 8:00 PM and turning it into a romantic escape",
  "the daily mission: walking through AB-1, past AB-2, Dr. Morphin's, GB-1 to GB-2",
  "that reluctant goodbye at Girls Block 2 where neither of us wants to turn around",
  "your birthday — celebrating you and seeing you glow was everything to me",
  "our shared love for music and getting completely lost in the exact same feelings",
  "the way you laugh at your own jokes before you even finish saying them 😂",
  "you make even getting kicked out by college guards feel like a movie scene",

  // 21 - 30
  "your forehead is my absolute favorite place to kiss in the entire universe 😘",
  "late night FaceTime calls where neither of us wants to be the one to hang up first",
  "how you remember the smallest, tinier details about us that I thought you forgot",
  "your flawless, warm brown stomach and how breathtaking you look when I pull you close",
  "the way your body fits perfectly against mine during our tightest embraces",
  "how soft and warm your hugs are — literally my safe place in this entire world",
  "your velvety, late-night radio speaking voice that instantly calms all my chaos",
  "your sweet singing voice that makes every Spotify artist sound like background noise",
  "the fact that I deleted my music apps because your voice is the only soundtrack I need",
  "how unbelievably pretty you are without even trying for a single second ✨",

  // 31 - 40
  "the way your eyes genuinely sparkle when you get excited about something small",
  "you're my favorite notification, favorite distraction, and favorite person 24/7",
  "how you always know when something is on my mind even if I don't say a word",
  "our Central Library study dates where we do 0% studying and 100% staring at you 📚",
  "passing silly folded sticky notes under the library desk so guards don't shush us",
  "staying on video call the entire night on our 2nd month anniversary so you weren't alone 🌙",
  "listening to your soft quiet breathing until the morning sun came up",
  "how you make even boring regular days feel like an exciting adventure",
  "our secret kiss spot walkway right after AB-2 💋",
  "the butterflies I still get when I hold your hand a little tighter before saying bye",

  // 41 - 50
  "2 AM Maggi with extra cheese — no questions asked, made with pure love 🍜",
  "every single day with you feels like an undeserved blessing I will never take for granted",
  "our little world that belongs exclusively to us and nobody else gets to understand",
  "the way you scrunch your nose when you're confused or trying to act tough 🥺",
  "how we can sit in complete silence for an hour and it still feels like home",
  "you make me want to be the best version of myself every single morning",
  "those random 'I miss you' texts right in the middle of a busy day",
  "the way you fight sleep during late night conversations and always end up dozing off",
  "our inside jokes that would make zero sense to anyone else on this campus",
  "the softness of your touch when you rest your head on my shoulder",

  // 51 - 60
  "how stunning your waist looks and how naturally my hands rest there during hugs",
  "the exact way you look at me when you think I'm looking somewhere else",
  "you turned a random college in the middle of nowhere into the place where I found love",
  "I love how we keep inventing new excuses to steal five more minutes together",
  "your smile — the real, effortless one that lights up every room you walk into",
  "how saying goodbye at Girls Block 2 has become our most sacred daily ritual",
  "every romantic song reminds me of you (which is why I don't need any other music)",
  "you're my Nush, Nushi, baby, bbg, and wifeyyy all packed into one perfect girl 😭❤️",
  "the fact that normal days with you become memories I replay in my head for weeks",
  "every happy tear we've shared together because we're just that deeply in love",

  // 61 - 70
  "our first smooch on 23 that set off fireworks in my chest 🫦",
  "our first actual kiss on 22 August where the entire universe stood completely still 💋",
  "the way you hold my arm when we're walking together late in the evening",
  "how you get sleepy and your voice gets all soft and baby-like 🥹",
  "your laugh — the loud, unhinged one that makes me burst out laughing instantly",
  "the fact that you trust me with your heart, your fears, and your secrets",
  "how you look in oversized hoodies — genuinely the cutest creature to exist",
  "the way you play with my fingers or bracelet when we're sitting together",
  "your confidence and how you carry yourself with so much grace",
  "how you always make sure I've eaten or slept even when you're tired yourself",

  // 71 - 80
  "the way you lean in a little closer when we're whispering in public places",
  "how you make me feel like the luckiest guy on this entire planet every single day",
  "your cute reactions whenever I tease you or give you unexpected compliments",
  "the warmth of your skin against mine when we hug after not seeing each other all day",
  "how proud I am to call you my girlfriend, my best friend, and my future wifey",
  "the way you remember our dates, our numbers, and our tiny milestones",
  "your passion when you talk about things you genuinely care about",
  "the way you steal glances across the room and give me that knowing little smile",
  "how you can turn my worst mood upside down in less than thirty seconds",
  "the pure comfort of just existing in the same room with you",

  // 81 - 90
  "your endless patience with my terrible jokes and coder humor 💻❤️",
  "the way you look in candid photos when you don't even know the camera is on you",
  "how three months already feel like a solid foundation for a whole lifetime together",
  "the excitement of planning our future dates, trips, and anniversary milestones",
  "the way your hugs make all the college stress and tiredness completely vanish",
  "how beautiful your soul is — kind, genuine, loving, and fiercely loyal",
  "the promise that no matter where life takes us, I will always choose you first",
  "how you are my home, my comfort, my favorite person, and my sweetest dream come true",
  "90 days down, and every single second with you has been pure poetry",
  "I love you, Anushka. Simply, deeply, completely, and endlessly. Happy 3 Months! 👑💖"
];

const COLORS = ["var(--pink)", "var(--lav)", "var(--butter)", "var(--mocha-light)"];

export default function ReasonsSection() {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('nush_90_reasons_revealed');
    if (saved) {
      try {
        setRevealed(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleReveal = (index: number) => {
    SoundEngine.scratch();
    if (!revealed.includes(index)) {
      const newRevealed = [...revealed, index];
      setRevealed(newRevealed);
      localStorage.setItem('nush_90_reasons_revealed', JSON.stringify(newRevealed));
    }
  };

  const handleRevealAll = () => {
    SoundEngine.confettiPop();
    const all = Array.from({ length: NINETY_REASONS.length }, (_, i) => i);
    setRevealed(all);
    localStorage.setItem('nush_90_reasons_revealed', JSON.stringify(all));
  };

  return (
    <section id="reasons" className="anniversary-section relative py-12">
      <SectionHead
        eyebrow="exhibit b · 90 days of us"
        title="90 Days, 90 Reasons"
        subtitle="Tap each numbered tile to scratch & reveal why I love you so deeply"
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Progress Counter & Reveal All */}
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-[var(--pink)]/30 mb-8 max-w-xl mx-auto font-mono text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="text-[var(--pink)] text-base">💖</span>
            <span>
              Revealed: <b className="text-[var(--butter)] text-sm">{mounted ? revealed.length : 0}</b> / 90
            </span>
          </div>
          <button
            onClick={handleRevealAll}
            className="bg-white/10 hover:bg-white/20 text-[var(--butter)] px-4 py-1.5 rounded-full border border-[var(--butter)]/40 font-bold transition-all hover:scale-105"
          >
            Scratch All 90 ✨
          </button>
        </div>

        {/* 90 Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {NINETY_REASONS.map((reason, idx) => {
            const isRevealed = mounted && revealed.includes(idx);
            const color = COLORS[idx % COLORS.length];

            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleReveal(idx)}
                className={`relative min-h-[110px] p-3 rounded-2xl border cursor-pointer select-none transition-colors duration-200 flex flex-col justify-between shadow-md ${
                  isRevealed
                    ? 'bg-gradient-to-br from-[#1d162b] via-[#241738] to-[#161124] border-[var(--pink)]/50'
                    : 'border-white/10 hover:border-white/30'
                }`}
                style={{
                  background: isRevealed ? undefined : color,
                  color: isRevealed ? '#FFF' : '#2B1A3D',
                  willChange: 'transform',
                }}
              >
                {/* Card Number Header */}
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className={isRevealed ? 'text-[var(--pink)]' : 'text-black/60'}>
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{isRevealed ? '❤️' : '✨'}</span>
                </div>

                {/* Reason Content */}
                {isRevealed ? (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-caveat text-base leading-snug text-gray-100 my-auto"
                  >
                    &ldquo;{reason}&rdquo;
                  </motion.p>
                ) : (
                  <div className="text-center my-auto">
                    <span className="font-bold text-xs font-mono tracking-wider opacity-80 uppercase">
                      Scratch to Reveal
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

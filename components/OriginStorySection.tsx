'use client';

import React, { useState } from 'react';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface StoryChapter {
  id: number;
  chapter: string;
  title: string;
  tagline: string;
  icon: string;
  badge: string;
  quote: string;
  content: string;
  subtext: string;
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    chapter: 'Act I',
    title: 'The First Meet & The Acoustic Guitar 🎸',
    tagline: 'Before everything started',
    icon: '🎸',
    badge: 'The Premonition',
    quote: '“That day itself, I had a gut feeling that you were going to play a massive role in my life.”',
    content: 'We had only met once in person before all of this began. I brought my guitar and sang for you. I still remember the way you listened. Even back then, before the late-night calls and the hackathons, my heart felt a quiet jolt in my chest. I knew right then that you were not just another person—you were going to become someone unforgettable in my life.',
    subtext: 'One guitar • One song • An instant gut feeling 🎶✨',
  },
  {
    id: 2,
    chapter: 'Act II',
    title: 'IIT Madras Hackathon & 2 AM Confessions 💻',
    tagline: 'Summer vacation online connection',
    icon: '💻',
    badge: 'The Stubbornness',
    quote: '“Coding late into the night... we traded our deepest heartbreaks and healed together.”',
    content: 'Summer vacation arrived. Due to my pure stubbornness, I insisted that we join the IIT Madras Hackathon together with my team. Working online for hours on end, the code slowly took a back seat to our conversations. You opened up and told me your raw heartbreak, and I shared mine. Two healing hearts finding comfort across the screen in the dead of night.',
    subtext: 'IIT Madras Hackathon Team • Trading heartbreaks • Healing together 🌙',
  },
  {
    id: 3,
    chapter: 'Act III',
    title: 'The Legendary Pact 👑',
    tagline: '“In boys, I don’t trust anyone but me.”',
    icon: '👑',
    badge: 'The Iconic Move',
    quote: '“You asked for someone to pretend-date. I said: In boys, I don’t trust anyone but me.”',
    content: 'In order to move on and leave the past behind, you asked me to give you someone you could pretend to date. I didn’t search for anyone else. I told you straight up: “In boys, I don’t trust anyone but me.” So right then and there, the pact was sealed. We agreed to start fake dating online to help each other move on.',
    subtext: 'The best line ever spoken • The fake dating contract begins 📝😏',
  },
  {
    id: 4,
    chapter: 'Act IV',
    title: 'Fake Dating → Real, Irreversible Love ❤️',
    tagline: 'When the pretend became forever',
    icon: '💖',
    badge: 'Pure Reality',
    quote: '“We fell deeply in love online before we even met in person again.”',
    content: 'What started as pretending slowly turned into the most genuine, overwhelming feelings either of us had ever experienced. Between the 4 AM FaceTime calls, the butterflies in our stomachs, and the way we couldn’t stop talking, the ‘fake’ part completely disappeared. Before we even saw each other in person again, both of us had fallen head-over-heels, madly in love. What started as moving on became our forever.',
    subtext: 'Pretending dissolved • True love conquered • 3 months and forever to go 🥹❤️',
  },
];

export default function OriginStorySection() {
  const [activeChapter, setActiveChapter] = useState(1);

  const handleSelectChapter = (id: number) => {
    SoundEngine.pop();
    setActiveChapter(id);
    if (id === 4) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#3B82F6'],
      });
    }
  };

  const chapter = STORY_CHAPTERS.find((c) => c.id === activeChapter) || STORY_CHAPTERS[0];

  return (
    <section id="origin-story" className="anniversary-section py-20 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="the untold prologue"
        title="The &lsquo;Fake Dating&rsquo; Pact That Turned Into Forever 🎸👑"
        subtitle="how an acoustic guitar, an IIT Madras hackathon, and one legendary line started our whole universe"
      />

      {/* Progress Timeline Stepper */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mt-10 mb-8 px-2 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--pink)]/30 -translate-y-1/2 z-0" />

        {STORY_CHAPTERS.map((c) => {
          const isActive = activeChapter === c.id;
          const isPassed = activeChapter >= c.id;

          return (
            <button
              key={c.id}
              onClick={() => handleSelectChapter(c.id)}
              className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center text-xl md:text-2xl font-bold transition-all shadow-lg border-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-tr from-[var(--pink-deep)] to-[var(--butter)] border-white text-white scale-110 ring-4 ring-pink-300'
                  : isPassed
                  ? 'bg-[var(--butter)] border-[var(--pink-deep)] text-black'
                  : 'bg-white border-zinc-300 text-zinc-400 hover:scale-105'
              }`}
              title={c.title}
            >
              <span>{c.icon}</span>
            </button>
          );
        })}
      </div>

      {/* Active Chapter Card */}
      <div className="bg-gradient-to-br from-[#1c1428] via-[#28183c] to-[#140f20] p-6 md:p-10 rounded-3xl border-2 border-[var(--pink)] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[var(--pink-deep)]/20 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl md:text-5xl">{chapter.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--butter)] font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                  {chapter.chapter} &middot; {chapter.badge}
                </span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  {chapter.tagline}
                </span>
              </div>
              <h3 className="font-bold text-2xl md:text-3xl text-white font-mono mt-1">
                {chapter.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => handleSelectChapter(Math.max(1, activeChapter - 1))}
              disabled={activeChapter === 1}
              className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              &larr; Prev Act
            </button>
            <button
              onClick={() => handleSelectChapter(Math.min(STORY_CHAPTERS.length, activeChapter + 1))}
              disabled={activeChapter === STORY_CHAPTERS.length}
              className="px-3.5 py-1.5 rounded-full border border-[var(--pink)] bg-[var(--pink-deep)] text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
            >
              Next Act &rarr;
            </button>
          </div>
        </div>

        {/* Featured Quote */}
        <div className="p-4 md:p-5 bg-black/40 rounded-2xl border border-[var(--butter)]/30 mb-6">
          <p className="font-caveat text-2xl md:text-3xl text-[var(--butter)] leading-snug">
            {chapter.quote}
          </p>
        </div>

        {/* Narrative Prose */}
        <p className="text-sm md:text-base text-gray-200 font-nunito leading-relaxed mb-6">
          {chapter.content}
        </p>

        {/* Footer Subtext */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-gray-400">
          <span className="text-[var(--pink)] font-bold">{chapter.subtext}</span>
          <span>Chapter {chapter.id} of 4</span>
        </div>
      </div>
    </section>
  );
}

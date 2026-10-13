'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from '../SectionHead';
import { SoundEngine } from '@/lib/audio';

interface SeasonChapter {
  id: string;
  name: string;
  timeframe: string;
  icon: string;
  themeColor: string;
  gradient: string;
  headline: string;
  story: string[];
  keyMemory: string;
  tags: string[];
}

const SEASONS: SeasonChapter[] = [
  {
    id: 'summer_2026',
    name: 'Summer 2026',
    timeframe: 'June – July 2026',
    icon: '☀️',
    themeColor: '#F59E0B',
    gradient: 'from-[#2e1d05] to-[#120a02]',
    headline: 'The Acoustic Guitar & The Fake Dating Pact',
    story: [
      'It started with one single in-person meet before everything changed. Yajat brought his acoustic guitar and sang for Anushka, knowing in his gut she would change his entire world.',
      'During summer vacation, Yajat’s stubbornness pulled their team into the IIT Madras Hackathon. Late-night coding turned into pouring their hearts out, healing past hurts, and making the legendary pact: “In boys, I don’t trust anyone but me.”',
      'What started as fake dating became the most real, deep, unstoppable love story.',
    ],
    keyMemory: '“In boys, I don’t trust anyone but me.” 👑',
    tags: ['Guitar Serenade', 'IIT Madras Hackathon', 'Fake Dating Pact', 'Origin'],
  },
  {
    id: 'monsoon_2026',
    name: 'Monsoon 2026',
    timeframe: 'July – August 2026',
    icon: '🌧️',
    themeColor: '#3B82F6',
    gradient: 'from-[#082f49] to-[#041521]',
    headline: 'The July 23 Smooch & August 22 AB-2 Kiss',
    story: [
      'Campus rain, soaked walkways, and hearts racing. On July 23, the first smooch milestone made the entire world dissolve.',
      'Then came August 22, 2026: just past AB-2 on their evening walk, two glowing souls collided into their first actual kiss.',
      'Every single evening at 8:00 PM, guards would kick them out of Open Audi, kicking off the daily mission: looping past Dr. Morphin, stretching every second before Girls Block 2.',
    ],
    keyMemory: 'August 22, 2026 &middot; Walkway Just Past AB-2 💋',
    tags: ['Smooch 23', 'AB-2 Sacred Kiss', 'Open Audi Guards', 'Campus Rain'],
  },
  {
    id: 'autumn_2026',
    name: 'Autumn 2026',
    timeframe: 'September – November 2026',
    icon: '🍁',
    themeColor: '#EC4899',
    gradient: 'from-[#3b0764] to-[#160226]',
    headline: '100-Day Milestone & The Teddy Named “Yajat”',
    story: [
      'Hitting the 100-day century milestone and knowing this was forever. For her birthday, Yajat gifted Nush a fluffy teddy bear—and she literally named the bear “Yajat” so she could hug him whenever she misses him.',
      'Central Library study dates: 0% studying, 100% staring across the desk, whispering inside jokes, and passing folded notes under the desk.',
      'All-night video calls running past 4:23 AM with screen brightness at 1%, watching each other sleep peacefully.',
    ],
    keyMemory: 'Teddy Bear named Yajat on Nush’s bed 🧸',
    tags: ['100 Days', 'Teddy Yajat', 'Library Study Dates', '4 AM FaceTime'],
  },
  {
    id: 'winter_spring_2027',
    name: 'Winter & Spring',
    timeframe: 'December 2026 – June 2027',
    icon: '❄️',
    themeColor: '#10B981',
    gradient: 'from-[#064e3b] to-[#021d16]',
    headline: 'Shared Hoodies, Midnight Stargazing & Day 365',
    story: [
      'Freezing campus evenings, sharing oversized hoodies, and steaming bowls of 2 AM cheese Maggi while the rest of the college was dead asleep.',
      'Lying side by side under the infinite open sky on cold nights, looking at the stars and knowing that 365 days was just Chapter 1.',
      'One full year together. 12 months of laughter, comfort, growth, and loving each other more today than yesterday.',
    ],
    keyMemory: '365 Days of Us & Forever to Go 🌌❤️',
    tags: ['Shared Hoodies', '2 AM Cheese Maggi', 'Stargazing Sanctuary', 'Day 365'],
  },
];

export default function FourSeasonsOdyssey() {
  const [activeSeason, setActiveSeason] = useState(SEASONS[0]);

  const handleSelectSeason = (season: SeasonChapter) => {
    SoundEngine.click();
    setActiveSeason(season);
  };

  return (
    <section id="four-seasons-odyssey" className="anniversary-section py-12 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="our 365-day journey across 4 seasons"
        title="The Four Seasons Odyssey 🍃"
        subtitle="how our love bloomed from a summer hackathon into an unbreakable four-season forever"
      />

      {/* Season Scrubber Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-6">
        {SEASONS.map((season) => (
          <button
            key={season.id}
            onClick={() => handleSelectSeason(season)}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSeason.id === season.id
                ? 'bg-white text-zinc-950 shadow-xl scale-105'
                : 'bg-white/10 hover:bg-white/15 text-zinc-300'
            }`}
          >
            <span>{season.icon}</span>
            <span>{season.name}</span>
          </button>
        ))}
      </div>

      {/* Season Interactive Showcase Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSeason.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className={`mt-6 p-6 sm:p-10 rounded-3xl bg-gradient-to-br ${activeSeason.gradient} border-2 border-white/15 shadow-2xl relative overflow-hidden`}
        >
          {/* Subtle Season Timeframe Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/80 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
              {activeSeason.timeframe}
            </span>
            <span className="text-3xl">{activeSeason.icon}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-4">
            {activeSeason.headline}
          </h3>

          <div className="space-y-3 text-sm sm:text-base text-zinc-200 leading-relaxed font-serif mb-6">
            {activeSeason.story.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Key Canonical Memory Highlight */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/15 text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-pink-300 block mb-1">
              Sacred Season Milestone
            </span>
            <p className="font-caveat text-xl sm:text-2xl text-yellow-200">
              {activeSeason.keyMemory}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {activeSeason.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/90"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

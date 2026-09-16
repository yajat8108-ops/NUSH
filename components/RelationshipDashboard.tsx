'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import { useUniverseStore } from '@/lib/universeStore';

/* ── XP Level System ── */
const LEVELS = [
  { name: 'Bronze Heart', minXP: 0, icon: '🥉', color: 'from-amber-700 to-amber-500' },
  { name: 'Silver Soul', minXP: 200, icon: '🥈', color: 'from-gray-400 to-gray-300' },
  { name: 'Gold Flame', minXP: 500, icon: '🥇', color: 'from-yellow-500 to-amber-300' },
  { name: 'Diamond Heart', minXP: 1000, icon: '💎', color: 'from-cyan-400 to-blue-400' },
  { name: 'Cosmic Soulmate', minXP: 2000, icon: '🌌', color: 'from-purple-500 to-pink-500' },
];

function getLevel(xp: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) level = l;
  }
  const idx = LEVELS.indexOf(level);
  const nextLevel = LEVELS[idx + 1];
  const currentMin = level.minXP;
  const nextMin = nextLevel ? nextLevel.minXP : level.minXP + 1000;
  const progress = Math.min(100, ((xp - currentMin) / (nextMin - currentMin)) * 100);
  return { ...level, progress, nextLevel, idx };
}

/* ── Animated Ring ── */
function ProgressRing({
  value,
  max,
  label,
  icon,
  color = 'var(--pink)',
  size = 100,
}: {
  value: number;
  max: number;
  label: string;
  icon: string;
  color?: string;
  size?: number;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="currentColor"
            className="text-white/10"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
      <span className="text-lg font-bold text-white font-mono">{value}</span>
      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ── Stat Row ── */
function StatRow({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-mono text-gray-300">{label}</span>
      </div>
      <span className="text-sm font-bold font-mono text-[var(--butter)]">{value}</span>
    </div>
  );
}

export default function RelationshipDashboard() {
  const {
    explorationPoints,
    getExplorationPercent,
    discoveredSecrets,
    achievements,
    virtualHugs,
    virtualKisses,
    lovePoints,
    streakCount,
    loveSliceBestScore,
    loveSliceTotalSliced,
    heartCatcherHighScore,
    rhythmHighScore,
    scrambleLevelsCompleted,
    loveMazeCompleted,
    savedScenes,
    savedCollages,
    fortuneHistory,
    favoritePrompts,
  } = useUniverseStore();

  const [mounted, setMounted] = useState(false);
  const [daysTogether, setDaysTogether] = useState(0);
  const [hoursTogether, setHoursTogether] = useState(0);
  const [minutesTogether, setMinutesTogether] = useState(0);

  useEffect(() => {
    setMounted(true);
    const anniversaryDate = new Date('2026-06-22T00:00:00+05:30');

    const update = () => {
      const now = new Date();
      const diff = now.getTime() - anniversaryDate.getTime();
      setDaysTogether(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setHoursTogether(Math.floor(diff / (1000 * 60 * 60)));
      setMinutesTogether(Math.floor(diff / (1000 * 60)));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const totalAchievements = achievements.length;
  const totalSecrets = Object.keys(discoveredSecrets).length;
  const explorationPct = getExplorationPercent();

  // Calculate total XP
  const xp =
    lovePoints +
    virtualHugs * 2 +
    virtualKisses * 2 +
    totalSecrets * 50 +
    unlockedAchievements.length * 30 +
    explorationPct * 5 +
    (loveMazeCompleted ? 100 : 0) +
    scrambleLevelsCompleted * 25 +
    heartCatcherHighScore +
    rhythmHighScore +
    loveSliceBestScore +
    savedScenes.length * 15 +
    savedCollages.length * 15 +
    fortuneHistory.length * 5 +
    favoritePrompts.length * 5 +
    streakCount * 20;

  const level = getLevel(xp);

  return (
    <section className="anniversary-section py-20 px-4 select-none">
      <SectionHead
        eyebrow="mission control · live relationship telemetry"
        title="Our Universe Dashboard 🛸"
        subtitle="every hug, every secret, every click — all tracked, all counted, all loved"
      />

      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        {/* ── TOP ROW: Time Together + Level ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Time Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1a1030] to-[#0d0d1a] rounded-3xl p-6 border border-[var(--pink)]/20 shadow-2xl"
          >
            <div className="text-xs font-mono text-[var(--pink)] mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Since June 2, 2026
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-4xl font-bold text-white font-mono">{daysTogether}</div>
                <div className="text-[10px] font-mono text-gray-500 uppercase mt-1">Days</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[var(--pink)] font-mono">{hoursTogether.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-gray-500 uppercase mt-1">Hours</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[var(--butter)] font-mono">{minutesTogether.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-gray-500 uppercase mt-1">Minutes</div>
              </div>
            </div>
            <div className="mt-4 text-center font-caveat text-lg text-[var(--lavender)]">
              ...and counting, forever 💜
            </div>
          </motion.div>

          {/* Relationship Level XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#1a1030] to-[#0d0d1a] rounded-3xl p-6 border border-[var(--lavender)]/20 shadow-2xl"
          >
            <div className="text-xs font-mono text-[var(--lavender)] mb-3 uppercase tracking-widest">
              Relationship Level
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{level.icon}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                    {level.name}
                  </span>
                  <span className="text-xs font-mono text-gray-500">Lv.{level.idx + 1}</span>
                </div>
                <div className="text-xs font-mono text-gray-400 mt-0.5">{xp.toLocaleString()} XP total</div>
              </div>
            </div>
            {/* XP Progress Bar */}
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${level.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
              <span>{level.name}</span>
              <span>{level.nextLevel ? `Next: ${level.nextLevel.name} (${level.nextLevel.minXP} XP)` : 'MAX LEVEL 🌟'}</span>
            </div>
          </motion.div>
        </div>

        {/* ── PROGRESS RINGS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#1a1030] to-[#0d0d1a] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
        >
          <div className="text-xs font-mono text-gray-400 mb-5 uppercase tracking-widest text-center">
            Exploration Progress
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <ProgressRing
              value={explorationPct}
              max={100}
              label="Universe Explored"
              icon="🌌"
              color="var(--pink)"
            />
            <ProgressRing
              value={unlockedAchievements.length}
              max={totalAchievements}
              label="Achievements"
              icon="🏆"
              color="var(--butter)"
            />
            <ProgressRing
              value={totalSecrets}
              max={20}
              label="Secrets Found"
              icon="🔍"
              color="var(--lavender)"
              size={100}
            />
            <ProgressRing
              value={virtualHugs}
              max={100}
              label="Virtual Hugs"
              icon="🤗"
              color="#f472b6"
            />
            <ProgressRing
              value={virtualKisses}
              max={100}
              label="Virtual Kisses"
              icon="💋"
              color="#fb7185"
            />
          </div>
        </motion.div>

        {/* ── DETAILED STATS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Arcade Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#1a1030] to-[#0d0d1a] rounded-3xl p-5 border border-white/10 shadow-xl"
          >
            <div className="text-xs font-mono text-[var(--pink)] mb-3 uppercase tracking-widest flex items-center gap-2">
              🕹️ Arcade Stats
            </div>
            <StatRow icon="🥷" label="Love Slice Best" value={loveSliceBestScore} />
            <StatRow icon="🍉" label="Items Sliced" value={loveSliceTotalSliced} />
            <StatRow icon="💗" label="Heart Catcher High" value={heartCatcherHighScore} />
            <StatRow icon="🎵" label="Rhythm Tap High" value={rhythmHighScore} />
            <StatRow icon="🔤" label="Scramble Levels" value={`${scrambleLevelsCompleted} / 5`} />
            <StatRow icon="🧭" label="Love Maze" value={loveMazeCompleted ? '✅ Completed' : '⏳ Pending'} />
          </motion.div>

          {/* Creation & Collection Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-[#1a1030] to-[#0d0d1a] rounded-3xl p-5 border border-white/10 shadow-xl"
          >
            <div className="text-xs font-mono text-[var(--butter)] mb-3 uppercase tracking-widest flex items-center gap-2">
              ✨ Collections & Creations
            </div>
            <StatRow icon="❤️" label="Love Points" value={lovePoints.toLocaleString()} />
            <StatRow icon="🎨" label="Saved Scenes" value={savedScenes.length} />
            <StatRow icon="🖼️" label="Photo Collages" value={savedCollages.length} />
            <StatRow icon="🔮" label="Fortunes Drawn" value={fortuneHistory.length} />
            <StatRow icon="⭐" label="Favorite Prompts" value={favoritePrompts.length} />
            <StatRow icon="🔥" label="Visit Streak" value={`${streakCount} day${streakCount !== 1 ? 's' : ''}`} />
          </motion.div>
        </div>

        {/* ── ACHIEVEMENTS GALLERY ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a1030] to-[#0d0d1a] rounded-3xl p-5 md:p-6 border border-white/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono text-[var(--lavender)] uppercase tracking-widest flex items-center gap-2">
              🏆 Achievement Wall
            </div>
            <span className="text-xs font-mono text-gray-500">
              {unlockedAchievements.length} / {totalAchievements} unlocked
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {achievements.map((a) => {
              const unlocked = !!a.unlockedAt;
              return (
                <motion.div
                  key={a.id}
                  whileHover={unlocked ? { scale: 1.15, rotate: 5 } : undefined}
                  className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center text-center gap-0.5 border transition-all ${
                    unlocked
                      ? 'bg-white/10 border-[var(--butter)]/30 shadow-md cursor-pointer'
                      : 'bg-white/3 border-white/5 opacity-30 grayscale'
                  }`}
                  title={unlocked ? `${a.title}: ${a.desc}` : '???'}
                >
                  <span className="text-2xl">{unlocked ? a.icon : '🔒'}</span>
                  <span className="text-[8px] font-mono text-gray-400 leading-tight px-1 truncate w-full">
                    {unlocked ? a.title.split(' ').slice(0, 2).join(' ') : '???'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

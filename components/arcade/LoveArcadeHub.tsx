'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoveNinjaGame from './LoveNinjaGame';
import LoveMazeGame from './LoveMazeGame';
import HeartCatcherGame from './HeartCatcherGame';
import RhythmTapGame from './RhythmTapGame';
import WordScrambleGame from './WordScrambleGame';
import FortuneSpinnerGame from './FortuneSpinnerGame';
import TruthOrDareGame from './TruthOrDareGame';
import SceneBuilderGame from './SceneBuilderGame';
import CollageMakerGame from './CollageMakerGame';
import LoveClickerGame from './LoveClickerGame';
import AffectionCounterGame from './AffectionCounterGame';
import WouldYouRatherGame from './WouldYouRatherGame';
import TwoPlayerLoveGame from './TwoPlayerLoveGame';
import SectionHead from '../SectionHead';
import { SoundEngine } from '@/lib/audio';

type Category = 'play' | 'think' | 'create' | 'unnecessary';

interface ArcadeGameMeta {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  tagline: string;
  component: React.ComponentType<any>;
}

const ARCADE_GAMES: ArcadeGameMeta[] = [
  // 🕹️ PLAY
  { id: 'twoplayer', name: '2-Player Co-Op & Duel', category: 'play', emoji: '👥💖', tagline: 'Play together! Heart Pong Duel vs each other or AI Yajat, plus 8 PM Campus Escape', component: TwoPlayerLoveGame },
  { id: 'slice', name: 'Love Slice (Ninja)', category: 'play', emoji: '🥷💗', tagline: 'Slice romantic hearts & roses, avoid red flags', component: LoveNinjaGame },
  { id: 'maze', name: 'Love Maze', category: 'play', emoji: '🧭🐻', tagline: 'Guide Yajat through campus to Nush', component: LoveMazeGame },
  { id: 'catcher', name: 'Catch the Hearts', category: 'play', emoji: '🧺💖', tagline: 'Reflex catching game with combos & special items', component: HeartCatcherGame },
  { id: 'rhythm', name: 'Mini Rhythm Tap', category: 'play', emoji: '🎵✨', tagline: 'Tap to the rhythm of our heartbeats', component: RhythmTapGame },

  // 🧠 THINK
  { id: 'rather', name: 'Would You Rather?', category: 'think', emoji: '⚖️💞', tagline: 'Hilarious couple dilemmas & compare picks with Yajat', component: WouldYouRatherGame },
  { id: 'scramble', name: 'Word Scramble', category: 'think', emoji: '🔤🌸', tagline: 'Unscramble our secret relationship memories', component: WordScrambleGame },
  { id: 'fortune', name: 'Fortune Spinner', category: 'think', emoji: '🥠🔮', tagline: 'Crack golden fortune cookies & relationship predictions', component: FortuneSpinnerGame },

  // 🎨 CREATE
  { id: 'scene', name: 'Scene & Outfit Builder', category: 'create', emoji: '👗📍', tagline: 'Design our dream date night scenes & save to gallery', component: SceneBuilderGame },
  { id: 'collage', name: 'Photo Collage Maker', category: 'create', emoji: '📸🎀', tagline: 'Decorate polaroids with stickers & handwritten notes', component: CollageMakerGame },

  // 💗 ABSOLUTELY UNNECESSARY
  { id: 'clicker', name: 'Idle Love Clicker', category: 'unnecessary', emoji: '❤️⚡', tagline: 'Click for Love Points with hilarious simp upgrades', component: LoveClickerGame },
  { id: 'affection', name: 'Virtual Hug / Kiss Counter', category: 'unnecessary', emoji: '🤗💋', tagline: 'Tactile hug & kiss buttons with secret combo mode', component: AffectionCounterGame },
  { id: 'truth_dare', name: 'Truth or Soft-Dare', category: 'unnecessary', emoji: '💞💡', tagline: 'Wholesome couple truths and cute soft dares', component: TruthOrDareGame },
];

export default function LoveArcadeHub() {
  const [activeCategory, setActiveCategory] = useState<Category>('play');
  const [activeGameId, setActiveGameId] = useState<string>('slice');

  const filteredGames = ARCADE_GAMES.filter((g) => g.category === activeCategory);
  const activeGame = ARCADE_GAMES.find((g) => g.id === activeGameId) || ARCADE_GAMES[0];
  const ActiveComponent = activeGame.component;

  const handleSelectGame = (id: string) => {
    SoundEngine.pop();
    setActiveGameId(id);
  };

  const handleSelectCategory = (cat: Category) => {
    SoundEngine.click();
    setActiveCategory(cat);
    const firstInCat = ARCADE_GAMES.find((g) => g.category === cat);
    if (firstInCat) setActiveGameId(firstInCat.id);
  };

  return (
    <section id="arcade" className="anniversary-section relative py-12">
      <SectionHead
        eyebrow="exhibit d · love arcade"
        title="The Relationship Playground"
        subtitle="11 fully interactive mini-games crafted for our 3-month universe"
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={() => handleSelectCategory('play')}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold border transition-all ${
              activeCategory === 'play'
                ? 'bg-[var(--pink-deep)] text-white border-[var(--pink-deep)] shadow-lg scale-105'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            🕹️ PLAY ({ARCADE_GAMES.filter((g) => g.category === 'play').length})
          </button>
          <button
            onClick={() => handleSelectCategory('think')}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold border transition-all ${
              activeCategory === 'think'
                ? 'bg-[var(--lav)] text-white border-[var(--lav)] shadow-lg scale-105'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            🧠 THINK ({ARCADE_GAMES.filter((g) => g.category === 'think').length})
          </button>
          <button
            onClick={() => handleSelectCategory('create')}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold border transition-all ${
              activeCategory === 'create'
                ? 'bg-[var(--butter)] text-[#1a1528] border-[var(--butter)] shadow-lg scale-105'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            🎨 CREATE ({ARCADE_GAMES.filter((g) => g.category === 'create').length})
          </button>
          <button
            onClick={() => handleSelectCategory('unnecessary')}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold border transition-all ${
              activeCategory === 'unnecessary'
                ? 'bg-gradient-to-r from-[var(--pink)] to-[var(--lav)] text-white border-white/30 shadow-lg scale-105'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            💗 ABSOLUTELY UNNECESSARY ({ARCADE_GAMES.filter((g) => g.category === 'unnecessary').length})
          </button>
        </div>

        {/* Game Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {filteredGames.map((game) => (
            <button
              key={game.id}
              onClick={() => handleSelectGame(game.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-nunito font-bold transition-all ${
                activeGameId === game.id
                  ? 'bg-white text-[#1a1528] border-white shadow-xl scale-105'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>{game.emoji}</span>
              <span>{game.name}</span>
            </button>
          ))}
        </div>

        {/* Active Game Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGameId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

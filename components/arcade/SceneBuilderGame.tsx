'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore, SavedScene } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const BACKGROUNDS = [
  { id: 'audi', name: 'Open Audi 🥹', bg: 'linear-gradient(135deg, #2b1a3d, #522759, #873d6b)' },
  { id: 'library', name: 'Central Library 📚', bg: 'linear-gradient(135deg, #1c2738, #2a3d54, #415e7e)' },
  { id: 'campus', name: '8 PM Campus Route 🌙', bg: 'linear-gradient(135deg, #12101f, #221a36, #3b2a52)' },
  { id: 'rooftop', name: 'Starlit Rooftop ✨', bg: 'linear-gradient(135deg, #090914, #18152e, #362954)' },
];

const OUTFITS = [
  { id: 'hoodie', name: 'Oversized Hoodie 🧸', emoji: '🧥' },
  { id: 'casual', name: 'Campus Casual 👟', emoji: '👕' },
  { id: 'datenight', name: 'Cute Date Dress 👗', emoji: '👗' },
  { id: 'pajamas', name: '2 AM Pajama Set 🌙', emoji: '👚' },
];

const ACCESSORIES = [
  { id: 'maggi', name: '2 AM Maggi 🍜', emoji: '🍜' },
  { id: 'teddy', name: 'Teddy Yajat 🧸', emoji: '🧸' },
  { id: 'books', name: 'Study Notes 📚', emoji: '📚' },
  { id: 'chai', name: 'Warm Chai ☕', emoji: '☕' },
  { id: 'airpods', name: 'AirPods 🎧', emoji: '🎧' },
  { id: 'rose', name: 'Red Rose 🌹', emoji: '🌹' },
  { id: 'letter', name: 'Folded Note 💌', emoji: '💌' },
];

export default function SceneBuilderGame() {
  const { savedScenes, saveScene } = useUniverseStore();
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [selectedOutfit, setSelectedOutfit] = useState(OUTFITS[0]);
  const [activeItems, setActiveItems] = useState<string[]>(['teddy', 'maggi']);
  const [sceneTitle, setSceneTitle] = useState('Our Perfect Date Night');
  const [showGallery, setShowGallery] = useState(false);

  const toggleItem = (itemId: string) => {
    SoundEngine.pop();
    setActiveItems((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]
    );
  };

  const handleSaveScene = () => {
    SoundEngine.confettiPop();
    const newScene: SavedScene = {
      id: Date.now().toString(),
      name: sceneTitle || 'Our Perfect Date',
      bg: selectedBg.name,
      outfit: selectedOutfit.name,
      items: activeItems,
      createdAt: new Date().toLocaleDateString(),
    };
    saveScene(newScene);
    confetti({ particleCount: 50, spread: 70, origin: { x: 0.5, y: 0.5 } });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>👗✨</span> OUTFIT & SCENE BUILDER
          </h3>
          <p className="text-xs text-[var(--pink)]">Build our dream date scene and save it to the gallery</p>
        </div>
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-mono transition-colors"
        >
          {showGallery ? 'Build ✕' : `Gallery (${savedScenes.length}) 🖼️`}
        </button>
      </div>

      {showGallery ? (
        <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
          {savedScenes.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">No saved scenes yet. Create your first date scene!</p>
          ) : (
            savedScenes.map((s) => (
              <div key={s.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[var(--butter)]">{s.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{s.createdAt}</span>
                </div>
                <p className="text-gray-300">📍 {s.bg} &middot; 👗 {s.outfit}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.items.map((it) => (
                    <span key={it} className="bg-white/10 px-2 py-0.5 rounded-md text-[10px]">
                      {ACCESSORIES.find((a) => a.id === it)?.name || it}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Visual Scene Canvas */}
          <div
            className="w-full h-[220px] rounded-2xl p-4 shadow-inner flex flex-col justify-between relative overflow-hidden border border-white/20 mb-4 transition-all duration-500"
            style={{ background: selectedBg.bg }}
          >
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-mono bg-black/40 backdrop-blur px-3 py-1 rounded-full text-white">
                📍 {selectedBg.name}
              </span>
              <span className="text-xs font-mono bg-black/40 backdrop-blur px-3 py-1 rounded-full text-[var(--butter)]">
                👗 {selectedOutfit.name}
              </span>
            </div>

            {/* Center Avatars */}
            <div className="flex items-center justify-center gap-4 z-10 my-auto">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl filter drop-shadow-lg"
              >
                🐻
              </motion.div>
              <span className="text-2xl text-[var(--pink)]">❤️</span>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                className="text-5xl filter drop-shadow-lg"
              >
                🌸
              </motion.div>
            </div>

            {/* Floating Props */}
            <div className="flex flex-wrap gap-2 justify-center z-10">
              {activeItems.map((itemId) => {
                const itemObj = ACCESSORIES.find((a) => a.id === itemId);
                if (!itemObj) return null;
                return (
                  <motion.span
                    key={itemId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-black/50 backdrop-blur px-2.5 py-1 rounded-full text-xs flex items-center gap-1 border border-white/20"
                  >
                    <span>{itemObj.emoji}</span>
                    <span className="text-[10px] text-gray-200">{itemObj.name.split(' ')[0]}</span>
                  </motion.span>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 text-xs">
            {/* Backgrounds */}
            <div>
              <span className="font-bold text-gray-300 block mb-1.5">1. Choose Location 📍</span>
              <div className="grid grid-cols-2 gap-1.5">
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { SoundEngine.click(); setSelectedBg(b); }}
                    className={`py-1.5 px-2.5 rounded-xl border text-left truncate transition-colors ${
                      selectedBg.id === b.id
                        ? 'border-[var(--butter)] bg-[var(--butter)]/20 text-[var(--butter)] font-bold'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Outfits */}
            <div>
              <span className="font-bold text-gray-300 block mb-1.5">2. Choose Vibe &amp; Outfit 👗</span>
              <div className="grid grid-cols-2 gap-1.5">
                {OUTFITS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { SoundEngine.click(); setSelectedOutfit(o); }}
                    className={`py-1.5 px-2.5 rounded-xl border text-left truncate transition-colors ${
                      selectedOutfit.id === o.id
                        ? 'border-[var(--pink)] bg-[var(--pink)]/20 text-[var(--pink)] font-bold'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessories Toggle */}
            <div>
              <span className="font-bold text-gray-300 block mb-1.5">3. Add Props &amp; Memories 🎁</span>
              <div className="flex flex-wrap gap-1.5">
                {ACCESSORIES.map((a) => {
                  const active = activeItems.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleItem(a.id)}
                      className={`px-2.5 py-1 rounded-full border text-xs transition-colors flex items-center gap-1 ${
                        active
                          ? 'border-green-400 bg-green-500/20 text-green-300 font-bold'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{a.emoji}</span>
                      <span>{a.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveScene}
                className="w-full py-2.5 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] rounded-2xl font-bold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                📸 Save Date to Gallery
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

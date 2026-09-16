'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUniverseStore, SavedCollage } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

const STICKER_OPTIONS = ['🧸', '💖', '🌹', '💋', '✨', '🌟', '🍜', '☕', '💌', '🎀'];

const PHOTOS = [
  '/photos/photo-1.jpg',
  '/photos/photo-new-1.jpg',
  '/photos/photo-5.jpg',
  '/photos/photo-9.jpg',
];

export default function CollageMakerGame() {
  const { savedCollages, saveCollage } = useUniverseStore();
  const [selectedPhoto, setSelectedPhoto] = useState(PHOTOS[0]);
  const [stickers, setStickers] = useState<{ id: string; emoji: string; x: number; y: number; rotate: number }[]>([
    { id: '1', emoji: '🧸', x: 20, y: 70, rotate: -12 },
    { id: '2', emoji: '💖', x: 75, y: 15, rotate: 15 },
  ]);
  const [caption, setCaption] = useState('Our 3-Month Memory Snapshot 🌸');
  const [showGallery, setShowGallery] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const addSticker = (emoji: string) => {
    SoundEngine.pop();
    const newSticker = {
      id: Date.now().toString(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      rotate: (Math.random() - 0.5) * 40,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const removeSticker = (id: string) => {
    SoundEngine.pop();
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    SoundEngine.confettiPop();
    const newCollage: SavedCollage = {
      id: Date.now().toString(),
      title: caption || 'Our Collage',
      layout: 'Polaroid Scrapbook',
      stickers,
      note: caption,
      createdAt: new Date().toLocaleDateString(),
    };
    saveCollage(newCollage);
    confetti({ particleCount: 50, spread: 60, origin: { x: 0.5, y: 0.5 } });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-[#1c182b] to-[#120f18] rounded-3xl border border-[var(--pink)]/30 p-5 shadow-2xl text-white font-nunito select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
            <span>📸✨</span> PHOTO COLLAGE MAKER
          </h3>
          <p className="text-xs text-[var(--pink)]">Decorate our memories with stickers and polaroid notes</p>
        </div>
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-mono transition-colors"
        >
          {showGallery ? 'Canvas ✕' : `Collages (${savedCollages.length}) 🖼️`}
        </button>
      </div>

      {showGallery ? (
        <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
          {savedCollages.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">No saved collages yet. Create your first scrapbook piece!</p>
          ) : (
            savedCollages.map((c) => (
              <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[var(--butter)]">{c.title}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{c.createdAt}</span>
                </div>
                <p className="font-caveat text-base text-[var(--pink)]">&ldquo;{c.note}&rdquo;</p>
                <div className="flex gap-2 mt-2">
                  {c.stickers.map((s) => (
                    <span key={s.id} className="text-lg">{s.emoji}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Collage Canvas */}
          <div className="relative w-full max-w-[320px] mx-auto bg-white p-3 pb-8 rounded-2xl shadow-2xl border-4 border-white transform -rotate-1 hover:rotate-0 transition-transform mb-4">
            <div ref={canvasRef} className="w-full aspect-square rounded-xl overflow-hidden bg-black/10 border relative">
              <img src={selectedPhoto} alt="Collage Photo" className="w-full h-full object-cover pointer-events-none" />

              {/* Draggable/Placed Stickers */}
              {stickers.map((st) => (
                <motion.div
                  key={st.id}
                  drag
                  dragConstraints={canvasRef}
                  dragElastic={0.1}
                  whileHover={{ scale: 1.15 }}
                  whileDrag={{ scale: 1.25, cursor: 'grabbing' }}
                  className="absolute text-3xl filter drop-shadow-md cursor-grab group select-none"
                  style={{
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    transform: `translate(-50%, -50%) rotate(${st.rotate}deg)`,
                  }}
                >
                  <div className="relative">
                    <span>{st.emoji}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSticker(st.id);
                      }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Delete sticker"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Handwritten Caption */}
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full mt-3 text-center font-caveat text-xl text-[#2b1a3d] font-bold outline-none bg-transparent"
              placeholder="Write a cute memory note..."
            />
          </div>

          {/* Photo Selector */}
          <div className="mb-3">
            <span className="text-xs font-bold text-gray-300 block mb-1.5">1. Select Photo 📸</span>
            <div className="flex gap-2 justify-center">
              {PHOTOS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { SoundEngine.click(); setSelectedPhoto(p); }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-transform ${
                    selectedPhoto === p ? 'border-[var(--pink)] scale-105' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Stickers Selector */}
          <div className="mb-4">
            <span className="text-xs font-bold text-gray-300 block mb-1.5">2. Tap to Add Stickers (Drag &amp; hover to remove) ✨</span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {STICKER_OPTIONS.map((em) => (
                <button
                  key={em}
                  onClick={() => addSticker(em)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl flex items-center justify-center text-lg transition-transform"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] rounded-2xl font-bold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            💌 Save Collage to Memory Scrapbook
          </button>
        </>
      )}
    </div>
  );
}

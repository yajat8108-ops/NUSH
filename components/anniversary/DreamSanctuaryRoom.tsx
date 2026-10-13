'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from '../SectionHead';
import { useAnniversaryYearStore } from '@/lib/anniversaryYearStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function DreamSanctuaryRoom() {
  const {
    guitarStrumCount,
    teddyHugCount,
    strumGuitar,
    hugTeddy,
    stickyNotes,
    addStickyNote,
  } = useAnniversaryYearStore();

  const [teddySpeech, setTeddySpeech] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState<'nush' | 'yajat'>('nush');

  const handleHugTeddy = () => {
    SoundEngine.squeak();
    hugTeddy();
    const quotes = [
      'Teddy Yajat: “I love Nushi the most! 🧸❤️”',
      'Teddy Yajat: “Emergency tight hug dispatched! 🤗”',
      'Teddy Yajat: “2 AM Cheese Maggi is ready! 🍜”',
      'Teddy Yajat: “Forehead kisses booked for tonight! 💋”',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setTeddySpeech(quote);
    setTimeout(() => setTeddySpeech(null), 3000);
  };

  const handleStrumGuitar = () => {
    SoundEngine.chime();
    strumGuitar();
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { x: 0.3, y: 0.5 },
      colors: ['#F59E0B', '#F43F5E'],
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    SoundEngine.pop();
    addStickyNote(newNoteText.trim(), noteAuthor);
    setNewNoteText('');
  };

  return (
    <section id="dream-sanctuary-room" className="anniversary-section py-12 px-4 max-w-5xl mx-auto font-nunito select-none">
      <SectionHead
        eyebrow="our cozy private world"
        title="Our Shared Dream Sanctuary 🏡"
        subtitle="an interactive cozy space built just for us. Strum Yajat’s acoustic guitar, hug Teddy Yajat, or leave sticky notes on the wall."
      />

      <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#181124] to-[#251538] border-2 border-pink-500/30 shadow-2xl relative">
        {/* Interactive Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: The Bed & Teddy Bear "Yajat" */}
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-between text-center relative overflow-hidden group">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold mb-2">
              The Cozy Plush Bed
            </span>

            {/* Teddy Speech Bubble */}
            <AnimatePresence>
              {teddySpeech && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-10 bg-white text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-xl z-20 border border-zinc-200"
                >
                  {teddySpeech}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleHugTeddy}
              className="text-6xl sm:text-7xl my-4 cursor-pointer focus:outline-none"
              title="Click to hug Teddy Yajat"
            >
              🧸
            </motion.button>

            <div>
              <p className="text-xs font-bold text-white">Teddy “Yajat”</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Total Cuddles Given: {teddyHugCount}
              </p>
              <button
                onClick={handleHugTeddy}
                className="mt-3 px-4 py-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow cursor-pointer transition-colors"
              >
                Hug Teddy 🧸
              </button>
            </div>
          </div>

          {/* Card 2: The Acoustic Guitar Stand */}
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-between text-center group">
            <span className="text-[10px] font-mono uppercase tracking-widest text-pink-300 font-bold mb-2">
              Music Corner &middot; The First Meet
            </span>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStrumGuitar}
              className="text-6xl sm:text-7xl my-4 cursor-pointer focus:outline-none"
              title="Click to strum acoustic chords"
            >
              🎸
            </motion.button>

            <div>
              <p className="text-xs font-bold text-white">Yajat’s Acoustic Guitar</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Strummed {guitarStrumCount} times for Nush
              </p>
              <button
                onClick={handleStrumGuitar}
                className="mt-3 px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow cursor-pointer transition-colors"
              >
                Strum a Chord 🎶
              </button>
            </div>
          </div>

          {/* Card 3: The 2 AM Kitchenette */}
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-between text-center group">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold mb-2">
              Late-Night Kitchenette
            </span>

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-6xl sm:text-7xl my-4"
            >
              🍜
            </motion.div>

            <div>
              <p className="text-xs font-bold text-white">2 AM Cheese Maggi</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Status: Steaming hot &middot; Extra cheese
              </p>
              <button
                onClick={() => {
                  SoundEngine.chime();
                  confetti({ particleCount: 20 });
                }}
                className="mt-3 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-colors"
              >
                Taste a Bite 😋
              </button>
            </div>
          </div>
        </div>

        {/* Corkboard Sticky Notes Pinboard */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-white font-mono flex items-center gap-2">
              <span>📌</span>
              <span>Our Corkboard Sticky Notes</span>
            </h4>
          </div>

          {/* Sticky Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stickyNotes.map((note) => (
              <div
                key={note.id}
                style={{ backgroundColor: note.color }}
                className="p-4 rounded-2xl text-zinc-900 shadow-md font-caveat text-lg flex flex-col justify-between min-h-[90px]"
              >
                <p>&ldquo;{note.text}&rdquo;</p>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-700 text-right mt-2">
                  &mdash; {note.author}
                </span>
              </div>
            ))}
          </div>

          {/* Add Sticky Note Form */}
          <form onSubmit={handleAddNote} className="mt-4 flex flex-wrap gap-2 text-xs">
            <input
              type="text"
              placeholder="Leave a sticky note for your partner..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-400 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setNoteAuthor(noteAuthor === 'nush' ? 'yajat' : 'nush')}
              className="px-3 py-2 rounded-xl bg-white/10 text-zinc-300 font-mono text-xs"
            >
              As: {noteAuthor}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold font-mono text-xs shadow cursor-pointer"
            >
              Pin Note 📌
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

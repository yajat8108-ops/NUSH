'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { useJournalStore, JournalEntry } from '@/lib/journalStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

const MOODS: { emoji: JournalEntry['mood']; label: string }[] = [
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🥹', label: 'Emotional' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😴', label: 'Sleepy' },
  { emoji: '🫢', label: 'Goofy' },
  { emoji: '🍜', label: 'Maggi Mode' },
];

export default function RelationshipJournal() {
  const { entries, addEntry } = useJournalStore();
  const [mounted, setMounted] = useState(false);
  const [activeMood, setActiveMood] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Form State
  const [author, setAuthor] = useState<'Nush' | 'Yajat'>('Nush');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('🥰');
  const [tagsInput, setTagsInput] = useState('#us #latenight');

  const { unlockAchievement } = useUniverseStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    SoundEngine.confettiPop();

    // Check Easter egg
    const lower = (content + ' ' + title).toLowerCase();
    if (lower.includes('i love yajat') || lower.includes('love you yajat')) {
      unlockAchievement('secret_diarist');
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
      });
    } else {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    const tags = tagsInput
      .split(' ')
      .filter((t) => t.startsWith('#') && t.length > 1);

    const moodObj = MOODS.find((m) => m.emoji === mood);

    addEntry({
      author,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString(),
      mood,
      moodLabel: moodObj ? moodObj.label : 'Loved',
      tags: tags.length > 0 ? tags : ['#us'],
    });

    // Reset Form
    setTitle('');
    setContent('');
    setTagsInput('#us #latenight');
    setIsComposing(false);
  };

  const filteredEntries =
    activeMood === 'all'
      ? entries
      : entries.filter((entry) => entry.mood === activeMood);

  return (
    <section id="relationship-journal" className="anniversary-section py-20 px-4 select-none">
      <SectionHead
        eyebrow="daily chronicles · our private diary"
        title="Relationship Journal & Diary"
        subtitle="candid thoughts, real memories, and quiet late-night reflections 📖✍️"
      />

      <div className="max-w-4xl mx-auto mt-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-black/25 backdrop-blur-md border border-white/10 shadow-lg mb-8">
          {/* Mood Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                SoundEngine.click();
                setActiveMood('all');
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeMood === 'all'
                  ? 'bg-[var(--pink-deep)] text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All Moods
            </button>

            {MOODS.map((m) => (
              <button
                key={m.emoji}
                onClick={() => {
                  SoundEngine.click();
                  setActiveMood(m.emoji);
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                  activeMood === m.emoji
                    ? 'bg-white/20 text-white border border-[var(--butter)] shadow'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              SoundEngine.click();
              setIsComposing(true);
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-mono text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✍️</span> Write Entry
          </button>
        </div>

        {/* DIARY ENTRY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry) => (
            <motion.div
              key={entry.id}
              whileHover={{ y: -4 }}
              onClick={() => {
                SoundEngine.click();
                setSelectedEntry(entry);
              }}
              className="relative p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-[var(--pink)]/50 transition-all cursor-pointer shadow-xl flex flex-col justify-between select-none"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{entry.mood}</span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[var(--butter)] font-bold block">
                        {entry.moodLabel}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-gray-300">
                    By {entry.author}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-serif mb-2 leading-snug">
                  {entry.title}
                </h3>

                <p className="text-xs font-nunito text-gray-300 line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {entry.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono text-[var(--pink)] opacity-80">
                      {t}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-[var(--butter)] font-mono font-bold">
                  Read &rarr;
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* READ DIARY ENTRY MODAL */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#1b152b] border-2 border-[var(--pink)] rounded-3xl p-8 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-mono cursor-pointer"
              >
                ✕
              </button>

              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{selectedEntry.mood}</span>
                  <div>
                    <span className="text-xs font-mono text-[var(--butter)] font-bold uppercase">
                      {selectedEntry.moodLabel}
                    </span>
                    <p className="text-[11px] font-mono text-gray-400">
                      Written by <strong className="text-[var(--pink)]">{selectedEntry.author}</strong> on{' '}
                      {new Date(selectedEntry.date).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <h2 className="font-serif text-2xl font-bold text-white leading-tight">
                  {selectedEntry.title}
                </h2>
              </div>

              <div className="font-caveat text-2xl text-gray-200 leading-relaxed whitespace-pre-line py-2">
                {selectedEntry.content}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-2">
                  {selectedEntry.tags.map((t) => (
                    <span key={t} className="text-xs font-mono text-[var(--pink)]">
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPOSE DIARY ENTRY MODAL */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setIsComposing(false)}
          >
            <motion.form
              onSubmit={handleCreateEntry}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#161224] border-2 border-[var(--pink)] rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
                  <span>📖</span> New Diary Entry
                </h3>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs cursor-pointer font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Author Toggle */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Author:</label>
                <div className="flex gap-2">
                  {(['Nush', 'Yajat'] as const).map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setAuthor(person)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                        author === person
                          ? 'bg-[var(--pink-deep)] border-[var(--pink-deep)] text-white shadow'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      {person === 'Nush' ? '👑 Nush' : '🐻 Yajat'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Today&apos;s Mood:</label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.emoji}
                      type="button"
                      onClick={() => setMood(m.emoji)}
                      className={`flex-1 py-1.5 rounded-xl text-lg flex items-center justify-center border cursor-pointer transition-transform ${
                        mood === m.emoji
                          ? 'bg-white/20 border-[var(--butter)] scale-110 shadow'
                          : 'bg-white/5 border-white/10 hover:scale-105'
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Entry Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walking back from Dr. Morphin's tonight"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Diary Thoughts:</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Pour your heart out into our diary..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)] resize-none font-nunito leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Tags (space separated):</label>
                <input
                  type="text"
                  placeholder="#openaudi #latenight #cuddles"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[var(--pink)] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                📖 SAVE TO DIARY
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

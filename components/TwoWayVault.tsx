'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { useVaultStore, VaultEntry } from '@/lib/vaultStore';
import { SoundEngine } from '@/lib/audio';

const MOODS = [
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🥱', label: 'Sleepy / Cuddly' },
  { emoji: '🍜', label: 'Hungry for Maggi' },
  { emoji: '😤', label: 'Needing Attention' },
  { emoji: '👑', label: 'Queen Mode' },
  { emoji: '🫦', label: 'Kiss Deprived' },
];

const ENTRY_TYPES: { id: VaultEntry['type']; label: string; icon: string }[] = [
  { id: 'love_note', label: 'Love Note', icon: '💌' },
  { id: 'date_wish', label: 'Date Wish', icon: '🎟️' },
  { id: 'secret_request', label: 'Secret Demand', icon: '🤫' },
  { id: 'mood', label: 'Mood Log', icon: '✨' },
];

export default function TwoWayVault() {
  const { entries, currentMood, setCurrentMood, addEntry, deleteEntry, syncWithServer, isSyncing, isLoading } = useVaultStore();
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState<'nush' | 'yajat'>('nush');
  const [selectedType, setSelectedType] = useState<VaultEntry['type']>('love_note');
  const [selectedMood, setSelectedMood] = useState(MOODS[0].emoji);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    syncWithServer();

    const interval = setInterval(() => {
      syncWithServer();
    }, 15000);

    const onFocus = () => {
      syncWithServer();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [syncWithServer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addEntry({
      author,
      type: selectedType,
      content: content.trim(),
      moodEmoji: selectedMood,
      sticker: selectedType === 'date_wish' ? '🎟️' : selectedType === 'love_note' ? '💌' : '✨',
    });

    setContent('');
  };

  return (
    <section id="two-way-vault" className="anniversary-section py-16 px-4 max-w-5xl mx-auto font-nunito">
      <SectionHead
        eyebrow="reciprocal memory vault"
        title="Nush’s Authorship Corner ✍️"
        subtitle="write permanent notes to Yajat, log your mood, or file 2 AM Maggi demands"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
        {/* Left Column: Interactive Creator Pad (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[var(--white)]/95 backdrop-blur-md rounded-3xl p-6 md:p-7 border-2 border-[var(--pink-deep)]/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--pink)]/20 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <h3 className="font-bold text-lg text-[var(--plum)] font-mono">
                  Post to Our Vault
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isSyncing ? 'Syncing...' : 'Global Cloud ☁️'}</span>
              </span>
            </div>

            {/* Author Toggle */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--plum-soft)] block mb-1.5 font-mono">
                Posting As:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthor('nush')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                    author === 'nush'
                      ? 'bg-[var(--pink-deep)] border-[var(--pink-deep)] text-white shadow'
                      : 'bg-white/60 border-zinc-200 text-zinc-600'
                  }`}
                >
                  👑 Anushka (Nush)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthor('yajat')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                    author === 'yajat'
                      ? 'bg-[var(--pink-deep)] border-[var(--pink-deep)] text-white shadow'
                      : 'bg-white/60 border-zinc-200 text-zinc-600'
                  }`}
                >
                  🐻 Yajat
                </button>
              </div>
            </div>

            {/* Mood Picker Chips */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--plum-soft)] block mb-2 font-mono">
                Current Mood:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => {
                  const active = selectedMood === m.emoji;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => {
                        setSelectedMood(m.emoji);
                        setCurrentMood(`${m.emoji} ${m.label}`);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        active
                          ? 'bg-[var(--pink-deep)] text-white border-[var(--pink-deep)] shadow-md scale-105'
                          : 'bg-[var(--cream)]/80 text-[var(--plum)] border-[var(--pink)]/30 hover:bg-[var(--pink)]/20'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entry Type Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--plum-soft)] block mb-2 font-mono">
                Category:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ENTRY_TYPES.map((t) => {
                  const active = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        SoundEngine.click();
                        setSelectedType(t.id);
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        active
                          ? 'bg-[var(--pink)]/30 border-[var(--pink-deep)] text-[var(--pink-deep)] shadow-sm'
                          : 'bg-white/60 border-zinc-200 text-zinc-600 hover:bg-white'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Textarea */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell Yajat something sweet, ask for 100 kisses, or write your mood..."
                  className="w-full bg-[var(--cream)]/60 border border-[var(--pink)]/40 rounded-2xl p-3.5 text-sm text-[var(--plum)] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--pink-deep)] resize-none font-caveat text-xl leading-snug"
                />
              </div>

              <button
                type="submit"
                disabled={!content.trim()}
                className="w-full py-3 bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-bold font-mono text-sm rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>Pin to Relationship Vault</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pinned Sticky Notes & Vault History (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="font-bold text-sm text-[var(--plum)] font-mono flex items-center gap-2">
              <span>📌</span>
              <span>Vault Memory Wall ({mounted ? entries.length : 0} Entries)</span>
            </h4>
            <span className="text-xs font-mono text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced globally between Yajat &amp; Nush ☁️</span>
            </span>
          </div>

          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {isLoading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-3xl border-2 border-zinc-100 bg-white shadow-md animate-pulse flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2 border-b border-black/5 pb-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-200" />
                      <div className="flex flex-col gap-1">
                        <div className="h-2.5 w-20 rounded bg-zinc-200" />
                        <div className="h-2 w-28 rounded bg-zinc-200" />
                      </div>
                    </div>
                    <div className="h-6 w-full rounded bg-zinc-100" />
                    <div className="h-6 w-4/5 rounded bg-zinc-100" />
                  </div>
                ))}
              </>
            ) : (
            <AnimatePresence initial={false}>
              {(mounted ? entries : []).map((entry) => {
                const isNush = entry.author === 'nush';
                const formattedDate = new Date(entry.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className={`p-5 rounded-3xl border-2 shadow-md relative transition-all ${
                      isNush
                        ? 'bg-[#FFF9FA] border-[var(--pink)]/50 shadow-[0_4px_20px_rgba(255,92,142,0.12)]'
                        : 'bg-[#FAF8FF] border-[var(--lav)]/50 shadow-[0_4px_20px_rgba(185,174,245,0.12)]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/5 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{entry.moodEmoji}</span>
                        <div>
                          <span className="font-mono text-xs font-bold text-[var(--plum)] block">
                            {isNush ? 'Anushka (Nush)' : 'Yajat'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 shadow-xs">
                          {entry.type.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-zinc-400 hover:text-red-500 text-xs p-1 cursor-pointer transition-colors"
                          title="Delete note"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <p className="font-caveat text-2xl text-[var(--plum)] leading-relaxed whitespace-pre-wrap">
                      &ldquo;{entry.content}&rdquo;
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

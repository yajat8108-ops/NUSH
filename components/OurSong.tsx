'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export interface PlaylistItem {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  category: 'Our Song' | 'Reminds me of you' | 'Late Night Vibes' | 'Campus Walk';
  dedication?: string;
  addedBy?: 'Yajat' | 'Nush';
}

const DEFAULT_PLAYLIST: PlaylistItem[] = [
  {
    id: 'sK7riqg2mr4',
    title: 'Agar Tum Saath Ho',
    artist: 'Alka Yagnik, Arijit Singh (Tamasha)',
    category: 'Our Song',
    dedication: 'bhete bhete bhaagi phiru... khade khade..... 👻 (our all-time inside joke song)',
    addedBy: 'Yajat',
  },
  {
    id: '2Vv-BfVoq4g',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    category: 'Reminds me of you',
    dedication: "because you're perfect to me, always and in all ways ❤️",
    addedBy: 'Yajat',
  },
  {
    id: 'vGJTaP6anOU',
    title: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    category: 'Our Song',
    dedication: 'falling in love with you more every single day 🥹',
    addedBy: 'Yajat',
  },
  {
    id: 'A32w-D4-04s',
    title: 'I Love You (Bodyguard)',
    artist: 'Ash King, Clinton Cerejo',
    category: 'Late Night Vibes',
    dedication: 'our late night call soundtrack when the world is quiet 🎶',
    addedBy: 'Yajat',
  },
  {
    id: 'Dr1ncu71p0E',
    title: 'Chaar Kadam',
    artist: 'Shaan, Shreya Ghoshal',
    category: 'Campus Walk',
    dedication: 'walking together across campus from AB-1 to GB-2 forever 🚶‍♂️🚶‍♀️',
    addedBy: 'Yajat',
  },
  {
    id: 'JFcgOboQZ08',
    title: 'Dildariyaan',
    artist: 'Amrinder Gill',
    category: 'Campus Walk',
    dedication: 'warm smiles and strolls around the campus lake ✨',
    addedBy: 'Nush',
  },
];

const CATEGORIES = ['All', 'Our Song', 'Reminds me of you', 'Late Night Vibes', 'Campus Walk'] as const;

export default function OurSong() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(DEFAULT_PLAYLIST);
  const [activeSong, setActiveSong] = useState<PlaylistItem>(DEFAULT_PLAYLIST[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Add form states
  const [ytUrl, setYtUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newCategory, setNewCategory] = useState<PlaylistItem['category']>('Our Song');
  const [newDedication, setNewDedication] = useState('');
  const [newAddedBy, setNewAddedBy] = useState<'Yajat' | 'Nush'>('Nush');

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('yajat_nush_playlist_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlaylist(parsed);
          setActiveSong(parsed[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const savePlaylist = (updated: PlaylistItem[]) => {
    setPlaylist(updated);
    try {
      localStorage.setItem('yajat_nush_playlist_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) return null;

  // Extract YouTube ID helper
  const extractVideoId = (url: string) => {
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractVideoId(ytUrl);
    if (!vidId) {
      alert('Please enter a valid YouTube video URL or 11-character video ID!');
      return;
    }
    if (!newTitle.trim()) return;

    SoundEngine.chime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    const newItem: PlaylistItem = {
      id: vidId,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Unknown Artist',
      category: newCategory,
      dedication: newDedication.trim() || undefined,
      addedBy: newAddedBy,
    };

    const updated = [newItem, ...playlist];
    savePlaylist(updated);
    setActiveSong(newItem);
    setIsPlaying(true);

    // Reset Form
    setYtUrl('');
    setNewTitle('');
    setNewArtist('');
    setNewDedication('');
    setIsAddModalOpen(false);
  };

  const handleShuffle = () => {
    SoundEngine.pop();
    const filtered = activeCategory === 'All' ? playlist : playlist.filter((s) => s.category === activeCategory);
    if (filtered.length === 0) return;
    const randomSong = filtered[Math.floor(Math.random() * filtered.length)];
    setActiveSong(randomSong);
    setIsPlaying(true);
  };

  const filteredPlaylist =
    activeCategory === 'All'
      ? playlist
      : playlist.filter((s) => s.category === activeCategory);

  return (
    <section id="our-song" className="anniversary-section py-20 px-4 select-none">
      <SectionHead
        eyebrow="shared frequencies · collaborative mixtape"
        title="Our Song & Shared Playlist"
        subtitle="the songs we get lost in together, understanding every feeling 🎶❤️"
      />

      <div className="max-w-4xl mx-auto mt-6">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-black/20 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-lg">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  SoundEngine.click();
                  setActiveCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[var(--pink-deep)] text-white shadow-md scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer shadow"
              title="Shuffle Play"
            >
              <span>🔀</span> Shuffle
            </button>

            <button
              onClick={() => {
                SoundEngine.click();
                setViewMode((v) => (v === 'grid' ? 'list' : 'grid'));
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
              title="Toggle View Mode"
            >
              {viewMode === 'grid' ? '☰' : '☷'}
            </button>

            <button
              onClick={() => {
                SoundEngine.click();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--pink)] to-[var(--butter)] text-black text-xs font-mono font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>+</span> Add Song
            </button>
          </div>
        </div>

        {/* NOW PLAYING HERO PLAYER */}
        <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md border-2 border-[var(--pink)] rounded-3xl p-6 shadow-2xl mb-10 overflow-hidden relative">
          {/* Animated Equalizer Waveform in Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">📻</span>
              <div>
                <span className="font-mono text-[10px] text-[var(--butter)] font-bold uppercase tracking-wider block">
                  Now Playing &middot; {activeSong.category}
                </span>
                <h3 className="font-bold text-xl text-white leading-snug">
                  {activeSong.title}
                </h3>
                <p className="text-xs text-gray-300 font-nunito">{activeSong.artist}</p>
              </div>
            </div>

            {/* Equalizer Bars */}
            <div className="flex items-end gap-1 h-6">
              {[0.4, 0.9, 0.6, 1, 0.7, 0.3].map((height, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[var(--pink-deep)] rounded-full"
                  animate={{ height: ['4px', `${height * 24}px`, '4px'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>

          {/* YouTube Video Embed Player */}
          <motion.div
            key={activeSong.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/20"
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeSong.id}?autoplay=1&rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={true}
              className="w-full h-full"
              title={activeSong.title}
            />
          </motion.div>

          {/* Dedication Banner */}
          {activeSong.dedication && (
            <div className="mt-4 p-3.5 bg-black/40 rounded-2xl border border-[var(--butter)]/30 flex items-center gap-3">
              <span className="text-2xl">💌</span>
              <div>
                <p className="text-[11px] font-mono text-[var(--butter)] font-bold">
                  Dedication by {activeSong.addedBy || 'Yajat'}:
                </p>
                <p className="font-caveat text-xl text-white/95 leading-tight">
                  &ldquo;{activeSong.dedication}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PLAYLIST COLLECTION (Grid or List View) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPlaylist.map((song) => {
              const isCurrent = song.id === activeSong.id;
              return (
                <motion.div
                  key={song.id + song.title}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    SoundEngine.click();
                    setActiveSong(song);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isCurrent
                      ? 'bg-[var(--pink-deep)]/30 border-[var(--pink-deep)] shadow-lg shadow-[var(--pink-deep)]/20'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">🎵</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {song.category}
                    </span>
                  </div>

                  <div className="my-3">
                    <h4 className="font-bold text-sm text-white line-clamp-1">{song.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{song.artist}</p>
                  </div>

                  <div className="text-[10px] font-mono text-[var(--butter)] truncate">
                    {song.dedication ? `“${song.dedication}”` : `Added by ${song.addedBy || 'Yajat'}`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPlaylist.map((song, idx) => {
              const isCurrent = song.id === activeSong.id;
              return (
                <div
                  key={song.id + song.title}
                  onClick={() => {
                    SoundEngine.click();
                    setActiveSong(song);
                  }}
                  className={`px-4 py-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                    isCurrent
                      ? 'bg-[var(--pink-deep)]/30 border-[var(--pink-deep)] text-white shadow'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-500 w-5">#{idx + 1}</span>
                    <span className="text-lg">🎶</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{song.title}</h4>
                      <p className="text-xs text-gray-400">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-[var(--butter)]">
                      {song.category}
                    </span>
                    {isCurrent && <span className="text-xs animate-pulse">▶</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD SONG MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.form
              onSubmit={handleAddSong}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#181424] border-2 border-[var(--pink)] rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
                  <span>🎵</span> Add to Our Playlist
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Added By */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Added By:</label>
                <div className="flex gap-2">
                  {(['Nush', 'Yajat'] as const).map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setNewAddedBy(person)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                        newAddedBy === person
                          ? 'bg-[var(--pink-deep)] border-[var(--pink-deep)] text-white shadow'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      {person === 'Nush' ? '👑 Nush' : '🐻 Yajat'}
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube Link */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">YouTube URL or Video ID:</label>
                <input
                  type="text"
                  required
                  placeholder="https://youtu.be/... or watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)] font-mono"
                />
              </div>

              {/* Song Title & Artist */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Song Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasoor"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Artist / Movie:</label>
                  <input
                    type="text"
                    placeholder="e.g. Prateek Kuhad"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#231e33] border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                >
                  <option value="Our Song">Our Song</option>
                  <option value="Reminds me of you">Reminds me of you</option>
                  <option value="Late Night Vibes">Late Night Vibes</option>
                  <option value="Campus Walk">Campus Walk</option>
                </select>
              </div>

              {/* Dedication */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Dedication Note (optional):</label>
                <input
                  type="text"
                  placeholder="Why this song reminds me of us..."
                  value={newDedication}
                  onChange={(e) => setNewDedication(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                🎶 ADD TO OUR PLAYLIST
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

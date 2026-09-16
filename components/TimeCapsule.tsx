'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { useCapsuleStore, CapsuleLetter } from '@/lib/capsuleStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import WaxSeal from './WaxSeal';

export default function TimeCapsule() {
  const { letters, devBypass, addCapsule, openCapsule, toggleDevBypass } = useCapsuleStore();
  const [mounted, setMounted] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<CapsuleLetter | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Form states
  const [author, setAuthor] = useState<'Nush' | 'Yajat'>('Nush');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [sealEmoji, setSealEmoji] = useState('💌');

  // Live timer tick
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const handleOpenLetter = (letter: CapsuleLetter) => {
    const isUnlocked = new Date(letter.unlockDate) <= now || devBypass;
    if (!isUnlocked) {
      SoundEngine.pop();
      return;
    }

    SoundEngine.chime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
    });

    if (!letter.isOpened) {
      openCapsule(letter.id);
    }
    setSelectedLetter(letter);
  };

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !unlockDate) return;

    SoundEngine.confettiPop();
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.5 },
    });

    addCapsule({
      sender: author,
      title: title.trim(),
      content: content.trim(),
      writtenDate: new Date().toISOString(),
      unlockDate: new Date(unlockDate).toISOString(),
      sealEmoji,
      tag: 'Custom Capsule',
    });

    // Reset
    setTitle('');
    setContent('');
    setUnlockDate('');
    setIsComposing(false);
  };

  const formatCountdown = (targetDateStr: string) => {
    const diff = new Date(targetDateStr).getTime() - now.getTime();
    if (diff <= 0) return 'Ready to Open! ✨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m left`;
    return `${hours}h ${mins}m ${secs}s left`;
  };

  return (
    <section id="time-capsule" className="anniversary-section relative py-20 px-4">
      <SectionHead
        eyebrow="sealed until the future · write now, read later"
        title="Time Capsule Letters"
        subtitle="letters locked in time until our next milestones"
      />

      {/* Control Bar */}
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-10 px-2">
        <button
          onClick={() => {
            SoundEngine.click();
            setIsComposing(true);
          }}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>✍️</span> Compose New Capsule
        </button>

        <button
          onClick={() => {
            SoundEngine.pop();
            toggleDevBypass();
          }}
          className={`px-4 py-2 rounded-full font-mono text-xs border transition-all cursor-pointer ${
            devBypass
              ? 'bg-[var(--butter)] text-black border-[var(--butter)] shadow-md font-bold'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          {devBypass ? '🔓 Dev Unlock: ACTIVE' : '🔒 Dev Preview Mode'}
        </button>
      </div>

      {/* Capsule Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {letters.map((letter) => {
          const isUnlocked = new Date(letter.unlockDate) <= now || devBypass;
          const unlockObj = new Date(letter.unlockDate);

          return (
            <motion.div
              key={letter.id}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => handleOpenLetter(letter)}
              className="relative rounded-3xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[350px] shadow-2xl overflow-hidden bg-[#241a2f] border-[#B9AEF5]/30 hover:border-[#FF5C8E] group"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Envelope Triangular Top Flap */}
              <div
                className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#3a2b4d] to-[#1e1329] border-b border-black/40 z-10 pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.6))',
                }}
              />

              {/* Air Mail Stamp in Top-Right */}
              <div className="absolute top-3 right-4 z-20 flex flex-col items-end pointer-events-none opacity-85">
                <div className="border border-dashed border-amber-300/60 px-2 py-0.5 rounded text-[9px] font-mono text-amber-200">
                  AIR MAIL 📯
                </div>
                <span className="text-[8px] font-mono text-gray-400 mt-0.5">
                  {unlockObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Milestone Tag in Top-Left */}
              <div className="absolute top-3 left-4 z-20 pointer-events-none">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-[var(--butter)] border border-white/10">
                  {letter.tag}
                </span>
              </div>

              {/* PROMINENT 3D EMBOSSED WAX SEAL (Centered right on the point of the flap) */}
              <div className="relative z-30 flex justify-center pt-16">
                <WaxSeal size="lg" emoji={letter.sealEmoji} isUnlocked={isUnlocked} />
              </div>

              {/* Envelope Destination & Title */}
              <div className="relative z-20 px-6 pt-3 pb-1 text-center">
                <p className="font-caveat text-xl text-[var(--butter)] font-bold">
                  For: Anushka Kataria 💌
                </p>
                <h3 className="font-bold text-base text-white leading-snug line-clamp-2 mt-1">
                  {letter.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-1">
                  Sealed with love by <strong className="text-[var(--pink)]">{letter.sender}</strong>
                </p>
              </div>

              {/* Countdown / Unlock Action Bar */}
              <div className="relative z-20 px-6 pb-5 pt-3 border-t border-white/10 flex items-center justify-between">
                {isUnlocked ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    SEAL UNLOCKED &middot; TAP TO READ
                  </span>
                ) : (
                  <div>
                    <div className="text-[11px] font-mono text-[var(--butter)] font-bold">
                      {formatCountdown(letter.unlockDate)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Unlocks: {unlockObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )}

                <span className="text-xl">
                  {isUnlocked ? '💌' : '🔒'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* READ MODAL */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-[#FFFBF4] text-[#2A1A12] rounded-3xl p-8 shadow-2xl border-4 border-[#EAD2B8] max-h-[85vh] overflow-y-auto"
              style={{
                backgroundImage: 'radial-gradient(#d6c0a7 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center font-mono font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center pb-4 border-b border-[#EAD2B8]/80 mb-6">
                <div className="flex justify-center mb-3">
                  <WaxSeal size="lg" emoji={selectedLetter.sealEmoji} isUnlocked={true} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#8A5A34]">
                  {selectedLetter.title}
                </h2>
                <div className="text-xs font-mono text-gray-500 mt-1">
                  Written by <strong className="text-[#FF5C8E]">{selectedLetter.sender}</strong> &middot; Sealed on {new Date(selectedLetter.writtenDate).toLocaleDateString()}
                </div>
              </div>

              <div className="font-caveat text-2xl md:text-3xl text-gray-800 leading-relaxed whitespace-pre-line px-2">
                {selectedLetter.content}
              </div>

              <div className="mt-8 pt-4 border-t border-[#EAD2B8]/80 text-center">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-6 py-2.5 rounded-full bg-[#8A5A34] text-white font-mono font-bold text-xs hover:bg-[#6b4221] cursor-pointer shadow-md"
                >
                  KEEP IN VAULT ❤️
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPOSE MODAL */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsComposing(false)}
          >
            <motion.form
              onSubmit={handleCreateCapsule}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#181424] border-2 border-[var(--pink)] rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
                  <span>✉️</span> Seal a Time Capsule
                </h3>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Author Switch */}
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

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Capsule Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read this on our trip together 🌴"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              {/* Unlock Date */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Unlock Date & Time:</label>
                <input
                  type="datetime-local"
                  required
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              {/* Seal Emoji with Live 3D Preview */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Select Wax Seal Crest & Preview:</label>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div className="flex-shrink-0">
                    <WaxSeal size="md" emoji={sealEmoji} />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {['💌', '👑', '💍', '🍁', '❄️', '✨', '🧸', '💖'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSealEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border cursor-pointer transition-transform ${
                          sealEmoji === emoji
                            ? 'bg-white/20 border-[var(--butter)] scale-110 shadow'
                            : 'bg-white/5 border-white/10 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Letter Content:</label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear future us... write your heart out."
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)] leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                🔒 SEAL & LOCK THIS CAPSULE
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { useUniverseStore } from '@/lib/universeStore';

interface ArchiveItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  tag: string;
  badgeColor: string;
  icon: string;
  description: string;
  url: string;
  isExternal?: boolean;
}

const ARCHIVES: ArchiveItem[] = [
  {
    id: 'calculator',
    title: 'The Apology Scientific Calci',
    subtitle: 'The 13-Mode Calculator that started it all',
    date: 'Day 0 · Before Month 1',
    tag: 'WebAssembly & Next.js',
    badgeColor: 'bg-blue-500',
    icon: '🧮',
    description: 'A whole scientific calculator built just to apologize to Nush. Has 13 working modes, graphing, and secret Anniversary commands like daysTogether() and iLoveYou()!',
    url: '/calculator'
  },
  {
    id: 'card',
    title: 'Day 16 Handwritten Love Card',
    subtitle: 'The original illustrated card',
    date: 'Day 16 · July 8, 2026',
    tag: 'Handmade Letter',
    badgeColor: 'bg-rose-500',
    icon: '💌',
    description: 'The physical, handmade card created on Day 16 with heartfelt notes that Nush kept safe all this time.',
    url: '#card'
  },
  {
    id: 'gfday',
    title: 'Girlfriend Day Edition (GF Day)',
    subtitle: 'The original interactive GF Day experience',
    date: 'August 1, 2026',
    tag: 'Retro Audio & Filmstrip',
    badgeColor: 'bg-pink-500',
    icon: '🌸',
    description: 'The complete GF Day interactive website featuring custom audio jukebox, horizontal GSAP photo scroller, and secret minigames!',
    url: '/gfday/index.html'
  },
  {
    id: 'month2',
    title: 'Month 2 Anniversary Edition',
    subtitle: '60 Days of Us & The 8 PM Campus Escape',
    date: 'August 22, 2026',
    tag: 'Campus Map & 60 Reasons',
    badgeColor: 'bg-purple-500',
    icon: '🐻',
    description: 'The iconic 2-month milestone: The 8:00 PM VIT Bhopal guard escape route map, 60 reasons scratch grid, teddy Yajat, and 35mm photo reel.',
    url: '#route-map'
  },
  {
    id: 'month3',
    title: 'Month 3 Live Edition (Quarter Year!)',
    subtitle: '90 Days of Us, Library Dates & All-Night Call',
    date: 'September 22, 2026 · Current',
    tag: 'Active Live Milestone',
    badgeColor: 'bg-amber-500',
    icon: '👑',
    description: 'The newest chapter: Library study dates, the 2nd month all-night video call, deleting music apps for her voice, and endless arcade survival mode!',
    url: '#'
  }
];

export default function TimeMachineVault() {
  const { isTimeMachineOpen, setTimeMachineOpen } = useUniverseStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const openModal = () => {
    SoundEngine.pop();
    setTimeMachineOpen(true);
  };

  const closeModal = () => {
    SoundEngine.click();
    setTimeMachineOpen(false);
    setPreviewUrl(null);
  };

  const handleOpenSite = (item: ArchiveItem) => {
    SoundEngine.chime();
    if (item.url.startsWith('#')) {
      closeModal();
      const el = document.querySelector(item.url);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setPreviewUrl(item.url);
      setPreviewTitle(item.title);
    }
  };

  return (
    <>
      {/* Section inside main flow */}
      <section id="time-machine" className="anniversary-section py-12 px-4 max-w-5xl mx-auto">
        <SectionHead
          eyebrow="the multiverse vault"
          title="Anniversary Time Machine"
          subtitle="jump through time & explore every single website, card, and app ever made for you ⏳✨"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {ARCHIVES.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-pink-200 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className={`text-[10px] font-mono font-bold text-white px-2.5 py-1 rounded-full ${item.badgeColor} shadow-sm`}>
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-nunito font-bold text-lg text-[var(--plum)] leading-tight">
                  {item.title}
                </h4>
                <p className="font-caveat font-bold text-sm text-[var(--pink-deep)] mt-0.5">
                  {item.subtitle}
                </p>
                <p className="font-mono text-[10px] text-gray-500 mt-1">
                  📅 {item.date}
                </p>
                <p className="font-nunito text-xs text-gray-600 mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleOpenSite(item)}
                  className="flex-1 py-2 bg-[var(--pink-deep)] hover:bg-[var(--pink)] text-white font-mono text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 text-center"
                >
                  🚀 Launch Site
                </button>
                {item.url.startsWith('/') && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-xs font-bold rounded-xl transition-all shadow-sm"
                    title="Open in new tab"
                  >
                    ↗️
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Modal / In-App Live Previewer */}
      <AnimatePresence>
        {isTimeMachineOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181824] border-2 border-[var(--pink-deep)] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="bg-[#12121c] px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⏳</span>
                  <div>
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-yellow-300">
                      {previewUrl ? previewTitle : 'Anniversary Time Machine Vault'}
                    </h3>
                    <p className="font-mono text-[10px] text-gray-400">
                      {previewUrl ? previewUrl : 'Select an edition from our love history'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono rounded-lg border border-zinc-700 transition-colors"
                    >
                      Open Full Tab ↗
                    </a>
                  )}
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-red-500/80 flex items-center justify-center text-gray-300 hover:text-white font-bold transition-all text-base"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden relative bg-black">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0 bg-white"
                    title={previewTitle}
                  />
                ) : (
                  <div className="p-6 overflow-y-auto h-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ARCHIVES.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenSite(item)}
                        className="bg-[#21202e] hover:bg-[#2c2b3d] p-4 rounded-xl border border-zinc-700 cursor-pointer transition-all hover:border-[var(--pink)] group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-[10px] font-mono text-gray-400">{item.date}</span>
                          </div>
                          <h4 className="font-bold text-base text-white group-hover:text-[var(--pink)] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-mono text-[var(--pink)] font-bold">
                          <span>Enter Timeline &rarr;</span>
                          <span>{item.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import Link from 'next/link';
import { SoundEngine } from '@/lib/audio';
import { useUniverseStore } from '@/lib/universeStore';
import confetti from 'canvas-confetti';

interface TimelineNode {
  id: string;
  date: string;
  title: string;
  desc: string;
  emoji: string;
  type: 'milestone' | 'kiss' | 'project';
  targetUrl: string;
  previewType: 'iframe' | 'image' | 'scroll' | 'action';
  cardImg?: string;
  isExternal?: boolean;
}

const TIMELINE_NODES: TimelineNode[] = [
  {
    id: 'day16_card',
    date: 'July 8, 2026 (Day 16)',
    title: '💌 Day 16 — Handwritten Love Card',
    desc: 'The original handwritten card with genuine words, safe in your room forever.',
    emoji: '💌',
    type: 'project',
    targetUrl: '/photos/card.jpg',
    previewType: 'image',
    cardImg: '/photos/card.jpg',
  },
  {
    id: 'smooch',
    date: 'July 2026',
    title: '🫦 23 — The First Smooch',
    desc: 'Our very first playful smooch. The butterflies were out of control.',
    emoji: '💋',
    type: 'kiss',
    targetUrl: '#the-kiss',
    previewType: 'scroll',
  },
  {
    id: 'month1_site',
    date: 'July 22, 2026',
    title: '🌙 Month 1 Anniversary Site',
    desc: 'The original 1-Month Anniversary website with 3D Three.js hearts, letter, and reasons.',
    emoji: '🌸',
    type: 'project',
    targetUrl: '/onemonth/index.html',
    previewType: 'iframe',
    isExternal: true,
  },
  {
    id: 'month1_calc',
    date: 'July 22, 2026',
    title: '🧮 The Apology Scientific Calci',
    desc: '13-mode WebAssembly Scientific Calculator created just to apologize with code.',
    emoji: '🧮',
    type: 'project',
    targetUrl: '/calculator',
    previewType: 'iframe',
  },
  {
    id: 'gfday',
    date: 'August 1, 2026',
    title: '📼 GF Day Rewind VHS Tape',
    desc: 'Retro camcorder VHS scrapbook tape celebrating every candid smile.',
    emoji: '🌸',
    type: 'project',
    targetUrl: '/gfday/index.html',
    previewType: 'iframe',
    isExternal: true,
  },
  {
    id: 'kiss_22_aug',
    date: 'August 22, 2026',
    title: '💋 22 August — The First Actual Kiss',
    desc: 'The sacred night when time stopped. Holding you close and kissing you for real for the first time.',
    emoji: '💋',
    type: 'kiss',
    targetUrl: '#the-kiss',
    previewType: 'scroll',
  },
  {
    id: 'month2',
    date: 'August 22, 2026',
    title: '🐻 Month 2 — 8 PM Escape Route & All-Night Call',
    desc: 'Getting chased by Open Audi guards, Dr. Morphin’s walk, and our entire all-night FaceTime.',
    emoji: '🌙',
    type: 'project',
    targetUrl: '#month2-archive',
    previewType: 'scroll',
  },
  {
    id: 'month3_now',
    date: 'September 22, 2026 (Live Today!)',
    title: '👑 Month 3 — A Quarter of a Year Universe',
    desc: 'Three months of pure magic, library study dates, deleted music apps for your voice, and forever to go.',
    emoji: '💖',
    type: 'milestone',
    targetUrl: '#letter',
    previewType: 'scroll',
  },
];

export default function UniverseTimeline() {
  const { addExplorationPoint } = useUniverseStore();
  const [activeModalNode, setActiveModalNode] = useState<TimelineNode | null>(null);

  const handleNodeClick = (node: TimelineNode) => {
    SoundEngine.pop();
    addExplorationPoint(`timeline_${node.id}`, `Explored Milestone: ${node.title}`);

    if (node.previewType === 'scroll') {
      const el = document.querySelector(node.targetUrl);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        SoundEngine.chime();
      }
    } else {
      // Open in-app live preview modal
      setActiveModalNode(node);
      SoundEngine.confettiPop();
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
      });
    }
  };

  return (
    <section id="timeline" className="anniversary-section relative py-12">
      <SectionHead
        eyebrow="exhibit e · relationship timeline & memory lane"
        title="Constellation Through Time"
        subtitle="Tap any milestone below to launch and play with all our previous sites & archives"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Constellation Path */}
        <div className="relative border-l-2 border-[var(--pink)]/40 ml-4 md:ml-32 space-y-8 py-4">
          {TIMELINE_NODES.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative pl-6 group"
            >
              {/* Glowing Node Dot */}
              <button
                onClick={() => handleNodeClick(node)}
                className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shadow-md transition-transform hover:scale-125 ${
                  node.type === 'kiss'
                    ? 'bg-[var(--pink-deep)] border-[var(--butter)] text-white animate-pulse'
                    : node.type === 'project'
                    ? 'bg-[var(--lav)] border-white text-white'
                    : 'bg-[#1c182b] border-[var(--pink)] text-white'
                }`}
              >
                {node.emoji}
              </button>

              {/* Card Container */}
              <div
                onClick={() => handleNodeClick(node)}
                className="bg-gradient-to-r from-[#1c182b] via-[#241a38] to-[#1a1226] p-5 rounded-2xl border border-white/10 hover:border-[var(--pink)]/60 shadow-lg cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs text-[var(--pink)] font-bold">{node.date}</span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                      node.type === 'kiss'
                        ? 'bg-[var(--pink-deep)]/30 text-[var(--pink)] border border-[var(--pink-deep)]'
                        : node.type === 'project'
                        ? 'bg-[var(--lav)]/30 text-[var(--lav)] border border-[var(--lav)]'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    Tap to Open 🚀
                  </span>
                </div>

                <h4 className="text-base md:text-lg font-bold text-[var(--butter)] font-mono mb-1 group-hover:text-white transition-colors">
                  {node.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-3">{node.desc}</p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-mono text-[var(--pink)] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore / Open Project</span> &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive In-App Memory Vault Modal */}
      <AnimatePresence>
        {activeModalNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col p-3 md:p-6 font-nunito"
            onClick={() => setActiveModalNode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#181524] rounded-3xl border-2 border-[var(--pink)] overflow-hidden shadow-2xl flex flex-col w-full max-w-5xl h-full mx-auto"
            >
              {/* Modal Top Bar */}
              <div className="p-4 bg-black/60 flex items-center justify-between border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeModalNode.emoji}</span>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--butter)] font-mono">
                      {activeModalNode.title}
                    </h3>
                    <span className="text-[10px] text-gray-400">{activeModalNode.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeModalNode.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs text-[var(--pink)] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Full Screen</span> ↗
                  </a>
                  <button
                    onClick={() => setActiveModalNode(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content / Live Preview Frame */}
              <div className="flex-1 w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
                {activeModalNode.previewType === 'iframe' ? (
                  <iframe
                    src={activeModalNode.targetUrl}
                    title={activeModalNode.title}
                    className="w-full h-full border-none"
                  />
                ) : activeModalNode.previewType === 'image' && activeModalNode.cardImg ? (
                  <div className="p-4 flex items-center justify-center w-full h-full">
                    <img
                      src={activeModalNode.cardImg}
                      alt={activeModalNode.title}
                      className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 text-white">
                    <p className="text-lg text-[var(--butter)] font-mono mb-2">{activeModalNode.title}</p>
                    <p className="text-xs text-gray-300 mb-4">{activeModalNode.desc}</p>
                    <a
                      href={activeModalNode.targetUrl}
                      className="bg-[var(--pink-deep)] text-white text-xs px-6 py-2.5 rounded-full font-bold shadow"
                    >
                      Jump to Section &rarr;
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

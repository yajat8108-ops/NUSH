'use client';

import React from 'react';
import { useUniverseStore } from '@/lib/universeStore';
import { motion } from 'framer-motion';

export default function CinematicEnding() {
  const { getExplorationPercent } = useUniverseStore();
  const percent = getExplorationPercent();

  return (
    <section className="relative py-20 bg-gradient-to-t from-[#09070f] via-[#140e21] to-transparent text-center font-nunito select-none">
      <div className="max-w-2xl mx-auto px-6 space-y-6">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl block"
        >
          👑💖🐻
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-2xl md:text-4xl font-bold text-[var(--butter)]"
        >
          3 Months. A Whole Quarter of a Year.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-caveat text-2xl md:text-3xl text-[var(--pink)] leading-relaxed"
        >
          &ldquo;A lot happened. The guards at Open Audi, our all-night video calls, the library notes, our first actual kiss on 22 August, and every single second since. And somehow... you are still my favorite part of every single day.&rdquo;
        </motion.p>

        {percent >= 100 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-gradient-to-r from-[var(--pink-deep)] via-[var(--lav)] to-[var(--butter)] text-[#1a1528] rounded-3xl font-bold font-mono text-sm shadow-2xl"
          >
            🌟 You explored 100% of our universe. You found everything. Except one thing... You are my whole universe, Nush. ❤️
          </motion.div>
        ) : (
          <div className="text-xs font-mono text-gray-400">
            Relationship Universe: <span className="text-[var(--butter)] font-bold">{percent}% Explored</span>
          </div>
        )}

        <div className="pt-6 text-xs text-gray-500 font-mono">
          Yajat Kataria &times; Anushka &middot; Forever &amp; Always
        </div>
      </div>
    </section>
  );
}

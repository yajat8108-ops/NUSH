'use client';

import React, { useState, useEffect } from 'react';
import SectionHead from './SectionHead';
import { useUniverseStore } from '@/lib/universeStore';
import { motion } from 'framer-motion';

const DEV_NOTES = [
  '“Yes, I coded this 3-month universe instead of touching grass.” 💻❤️',
  '“This feature was completely unnecessary, but your smile made it mandatory.” ✨',
  '“You weren’t supposed to find this secret room, but obviously you are a detective.” 🕵️‍♀️',
  '“Fun Fact: The all-night video call on Month 2 reached 8 hours 42 minutes.” 🌙',
];

const UNUSED_JOKES = [
  'Nush when asked to get ready on time: "I will be ready in 5 minutes (repeats 6 times)" 😂',
  'Yajat pretending to understand math in the library while just staring at Nush’s nose scrunch 🥺',
  'The VIT Bhopal guards wondering why two people keep doing 5 laps around Girls Block 2 💀',
];

export default function SecretRoom() {
  const { isSecretRoomUnlocked, discoveredSecrets } = useUniverseStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const unlocked = isSecretRoomUnlocked();
  if (!unlocked) return null;

  return (
    <section id="secret-room" className="anniversary-section relative py-12">
      <SectionHead
        eyebrow="confidential · 5+ secrets found"
        title="The Secret Vault Room"
        subtitle="Developer notes, behind-the-scenes memories, and unused inside jokes"
      />

      <div className="max-w-4xl mx-auto px-4 space-y-6 font-nunito">
        {/* Developer Notes */}
        <div className="bg-gradient-to-br from-[#1d162b] to-[#2b173d] p-6 rounded-3xl border-2 border-[var(--butter)] shadow-2xl">
          <span className="text-xs font-mono text-[var(--butter)] uppercase font-bold block mb-2">
            👨‍💻 Dev Logs &middot; Behind The Code
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEV_NOTES.map((note, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-200">
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Unused Jokes */}
        <div className="bg-gradient-to-br from-[#241738] to-[#171224] p-6 rounded-3xl border border-[var(--pink)]/40 shadow-xl">
          <span className="text-xs font-mono text-[var(--pink)] uppercase font-bold block mb-2">
            😂 Vault Jokes &middot; Pure Us
          </span>
          <ul className="space-y-2 text-xs text-gray-300">
            {UNUSED_JOKES.map((joke, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span>&bull;</span>
                <span>{joke}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

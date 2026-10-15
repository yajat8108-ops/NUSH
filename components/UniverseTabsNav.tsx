'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUniverseStore, UniverseTab } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';

interface TabItem {
  id: UniverseTab;
  label: string;
  icon: string;
  badge?: string;
  description: string;
}

export const TABS: TabItem[] = [
  {
    id: 'story',
    label: 'Our Story',
    icon: '💖',
    badge: 'Pact & Smooch',
    description: 'Hero, Origin Story, The Kiss & 3-Month Love Letter',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: '⏳',
    badge: 'Milestones',
    description: 'Escape Route, Stargazing, Constellations & 4 Seasons',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: '📸',
    badge: '35mm & 3D',
    description: 'Filmstrip, Cloud Photos, Corkboard, 3D Room & Radio',
  },
  {
    id: 'games',
    label: 'Arcade',
    icon: '🎮',
    badge: '11 Games',
    description: 'Love Ninja, Heart Catcher, Trivia, Quiz & Date Simulator',
  },
  {
    id: 'vault',
    label: 'Sanctuary & Vault',
    icon: '💌',
    badge: '365 Notes',
    description: '60 Reasons, 365 Jar, Two-Way Vault, Open When & Journal',
  },
];

export default function UniverseTabsNav() {
  const { activeTab, setActiveTab } = useUniverseStore();
  const navRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Sync with URL query or hash on load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashOrQuery = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryTab = searchParams.get('tab') as UniverseTab | null;
      const hashTab = window.location.hash.replace('#', '') as UniverseTab | null;

      const validTabs: UniverseTab[] = ['story', 'timeline', 'gallery', 'games', 'vault'];
      const target = (queryTab && validTabs.includes(queryTab)) ? queryTab :
                     (hashTab && validTabs.includes(hashTab)) ? hashTab : null;

      if (target && target !== activeTab) {
        setActiveTab(target);
      }
    };

    handleHashOrQuery();
    window.addEventListener('hashchange', handleHashOrQuery);
    return () => window.removeEventListener('hashchange', handleHashOrQuery);
  }, [activeTab, setActiveTab]);

  // Keep active tab in view horizontally on mobile
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  const handleSelectTab = (tabId: UniverseTab) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tabId}`);
      // Smooth scroll to just below the presence banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="Universe Navigation Tabs"
      className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-black/75 dark:bg-[#0c0a14]/85 border-b border-pink-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all select-none"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Scrollable Tab Strip */}
        <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeBtnRef : null}
                onClick={() => handleSelectTab(tab.id)}
                className={`relative group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl font-mono text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-pink-200 hover:bg-white/5'
                }`}
                title={tab.description}
              >
                {/* Active Glowing Background Pill with Framer Motion layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="activeUniverseTabPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-600/90 via-rose-500/90 to-purple-600/90 shadow-[0_0_20px_rgba(244,63,94,0.5)] border border-pink-300/40 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="text-base sm:text-lg leading-none">{tab.icon}</span>
                <span className="tracking-wide font-semibold">{tab.label}</span>

                {/* Sub-badge */}
                {tab.badge && (
                  <span
                    className={`hidden md:inline-block text-[9px] uppercase px-1.5 py-0.5 rounded-full font-mono tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'bg-white/5 text-pink-300/70 group-hover:bg-white/10'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useUniverseStore, UniverseTab } from '@/lib/universeStore';
import { usePresenceStore } from '@/lib/presenceStore';
import { useStore } from '@/lib/store';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

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
    label: 'Story',
    icon: '💖',
    badge: 'Our Love',
    description: 'Hero, Origin Story, The Kiss & 4-Month Love Letter',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: '⏳',
    badge: 'Milestones',
    description: 'Campus Map, Stargazing, Constellations & Four Seasons',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: '📸',
    badge: '35mm & 3D',
    description: 'Filmstrip, Cloud Photos, Corkboard, Dorm Room & Mixtape',
  },
  {
    id: 'games',
    label: 'Arcade',
    icon: '🎮',
    badge: '11 Games',
    description: 'Love Arcade, Quiz, Trivia, Date Simulator & Ask Yajat',
  },
  {
    id: 'vault',
    label: 'Vault',
    icon: '💌',
    badge: '365 Notes',
    description: '60 Reasons, 365 Jar, Two-Way Vault, Open When & Sanctuary',
  },
  {
    id: 'sorry',
    label: 'Sorry 🥺',
    icon: '🧸',
    badge: 'Apology',
    description: "I'm Sorry: Apology Letter, Promises & Healing Sanctuary",
  },
];

export default function UniverseTabsNav() {
  const {
    activeTab,
    setActiveTab,
    streakCount,
    getExplorationPercent,
    soundtrackPlaying,
    toggleSoundtrack,
    isCamcorderOn,
    setCamcorderOn,
    checkAndUpdateStreak,
  } = useUniverseStore();

  const { theme, toggleTheme } = useStore();
  const { sendHeartbeatPing, myRole } = usePresenceStore();

  const navRef = useRef<HTMLElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [heartSending, setHeartSending] = useState(false);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  // Sync with URL query or hash on load & hashchange
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashOrQuery = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryTab = searchParams.get('tab') as UniverseTab | null;
      const hashTab = window.location.hash.replace('#', '') as UniverseTab | null;

      const validTabs: UniverseTab[] = ['story', 'timeline', 'gallery', 'games', 'vault', 'sorry'];
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
    SoundEngine.click();
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tabId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen for user typing "sorry" anywhere on the keyboard to instantly open the sorry section
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDetection = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs, textareas, or contenteditables
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (e.key && e.key.length === 1) {
        keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10);
        if (keyBuffer.endsWith('sorry')) {
          keyBuffer = '';
          handleSelectTab('sorry');
          SoundEngine.pop();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDetection);
    return () => window.removeEventListener('keydown', handleKeyDetection);
  }, []);

  const handleSendLoveCTA = async () => {
    SoundEngine.heartbeat();
    setHeartSending(true);
    sendHeartbeatPing();

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x: 0.85, y: 0.1 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9'],
    });

    // Also trigger Android local notification test if running inside WebView
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.testLocalNotification) {
      try {
        (window as any).AndroidBridge.testLocalNotification(
          'Calculator',
          '💓 Heartbeat sent to your partner!'
        );
      } catch (_) {}
    }

    setTimeout(() => setHeartSending(false), 2000);
  };

  const percent = getExplorationPercent();
  const [headerHeight, setHeaderHeight] = useState<number>(100);

  // Dynamically measure header height so the spacer is pixel-perfect on all screen sizes
  useEffect(() => {
    if (!navRef.current) return;
    const updateHeight = () => {
      if (navRef.current) {
        setHeaderHeight(navRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <>
      <header
        ref={navRef}
        aria-label="Universe Header & Navigation"
        className="fixed top-0 left-0 right-0 z-50 w-full select-none backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] border-b border-pink-500/20 print:hidden"
      >
      {/* ─────────────────────────────────────────────────────────────
          TIER 1: TOP UTILITY STRIP (Like Reference's Blue Bar)
          Translucent theme: Mocha Brown in light mode, Pink in dark mode
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full backdrop-blur-xl bg-[#FFF4ED]/75 dark:bg-[#090412]/50 border-b border-[#8A5A34]/15 dark:border-white/10 text-[#8A5A34]/85 dark:text-pink-200/85 text-[10px] sm:text-xs font-mono py-0.5 sm:py-1 px-2.5 sm:px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
          {/* Left: Romantic Greeting (Brown in light mode, Pink in dark mode) */}
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="sm:hidden font-extrabold tracking-wide text-[#8A5A34] dark:text-[#FF9EC9] truncate">
              Nush &amp; Yajat ✨
            </span>
            <span className="hidden sm:inline font-extrabold tracking-wide text-[#8A5A34] dark:text-[#FF9EC9] truncate transition-colors duration-300">
              Welcome to Yajat &amp; Nush&apos;s Infinite Universe ✨
            </span>
          </div>

          {/* Right: Quick Stats & Anniversary Milestone */}
          <div className="flex items-center gap-2 sm:gap-5 flex-shrink-0">
            {/* Days Together */}
            <div className="flex items-center gap-1 text-[#8A5A34] dark:text-pink-300">
              <span>📅</span>
              <span className="hidden sm:inline text-[#8A5A34]/70 dark:text-white/70">Milestone:</span>
              <span className="text-[#8A5A34] dark:text-[var(--butter)] font-bold">Aug 22<span className="hidden sm:inline">, 2024</span></span>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 text-[#8A5A34] dark:text-pink-200">
              <span>🔥</span>
              <span className="text-[#8A5A34] dark:text-[var(--butter)] font-bold">{streakCount}d</span>
              <span className="hidden sm:inline text-[#8A5A34]/70 dark:text-white/60">streak</span>
            </div>

            {/* Explored Percentage */}
            <div className="hidden md:flex items-center gap-1.5 text-[#8A5A34] dark:text-purple-300">
              <span>🌌</span>
              <span className="text-[#8A5A34]/70 dark:text-white/70">Explored:</span>
              <span className="text-[#8A5A34] dark:text-[var(--butter)] font-bold">{percent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 2: MAIN NAVIGATION BAR (Like Reference's Main Header)
          Translucent frosted glass with Logo, Tabs, and Action Icons
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full backdrop-blur-2xl bg-white/65 dark:bg-[#0c0a14]/55 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6">
          <div className="flex items-center justify-between h-11 sm:h-16 gap-1.5 sm:gap-4">
            
            {/* 1. LEFT: Sleek Brand Logo */}
            <div
              onClick={() => handleSelectTab('story')}
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0"
              title="Go to Our Story"
            >
              {/* Geometric Heart Emblem */}
              <div className="relative w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/10 border border-pink-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.35)] group-hover:scale-105 group-hover:border-pink-300 transition-all duration-300">
                <span className="text-sm sm:text-xl transform group-hover:scale-110 transition-transform">
                  💖
                </span>
                <span className="hidden sm:block absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping opacity-75" />
              </div>

              {/* Brand Title */}
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-extrabold text-sm sm:text-xl tracking-wider bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 bg-clip-text text-transparent group-hover:brightness-110 transition-all font-sans">
                    NUSH
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono px-1 sm:px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-500 dark:text-pink-300 border border-pink-400/30 uppercase tracking-wider font-semibold">
                    &amp; Yajat
                  </span>
                </div>
                <span className="hidden sm:block text-[9px] sm:text-[10px] text-pink-400/70 dark:text-pink-300/60 font-mono tracking-widest uppercase mt-0.5">
                  Our Universe
                </span>
              </div>
            </div>

            {/* 2. CENTER: Tabs Navigation (Desktop) */}
            <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`relative px-3.5 py-2 rounded-xl font-mono text-xs xl:text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'text-white'
                        : 'text-[#8A5A34]/80 dark:text-zinc-400 hover:text-[#8A5A34] dark:hover:text-pink-200 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    title={tab.description}
                  >
                    {/* Active Glowing Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeUniverseHeaderPill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/85 via-rose-500/85 to-purple-600/85 shadow-[0_0_18px_rgba(244,63,94,0.5)] border border-pink-300/40 -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>

                    {tab.badge && (
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-mono tracking-widest ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 dark:bg-white/5 text-[#8A5A34]/70 dark:text-pink-300/60'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3. RIGHT: Quick Control Icons + "Send Love 💓" CTA */}
            <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
              
              {/* Soundtrack Toggle */}
              <button
                onClick={() => {
                  SoundEngine.click();
                  toggleSoundtrack();
                }}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-sm backdrop-blur text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  soundtrackPlaying
                    ? 'bg-pink-600/80 border-pink-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/15 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
                title={soundtrackPlaying ? 'Pause Soundtrack' : 'Play Soundtrack'}
                aria-label="Toggle Soundtrack"
              >
                {soundtrackPlaying ? '🔊' : '🔈'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  SoundEngine.pop();
                  toggleTheme();
                }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 shadow-sm backdrop-blur text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer text-zinc-700 dark:text-zinc-300"
                title={theme === 'dark' ? 'Switch to Light Mode 🌸' : 'Switch to Dark Mode ✨'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '✨' : '🌸'}
              </button>

              {/* Camcorder Toggle */}
              <button
                onClick={() => {
                  SoundEngine.click();
                  setCamcorderOn(!isCamcorderOn);
                }}
                className={`hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl items-center justify-center border shadow-md backdrop-blur text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isCamcorderOn
                    ? 'bg-red-600 border-red-300 text-white animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.7)]'
                    : 'bg-white/5 border-white/15 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title={isCamcorderOn ? 'Exit Camcorder' : 'Vintage Camcorder Mode 🎥'}
                aria-label="Toggle Camcorder Mode"
              >
                🎥
              </button>

              {/* "Send Love 💓" CTA Button */}
              <button
                onClick={handleSendLoveCTA}
                disabled={heartSending}
                className="relative group overflow-hidden flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-pink-300/40 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Send an instant heartbeat to partner!"
              >
                <span className={`text-xs sm:text-sm ${heartSending ? 'animate-ping' : ''}`}>
                  💓
                </span>
                <span className="font-semibold text-[11px] sm:text-xs">
                  {heartSending ? 'Sent!' : 'Love'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MOBILE TAB STRIP (Visible on mobile/tablet screens < lg)
            Scrollable, swipeable, with auto-centering active tab
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:hidden relative w-full border-t border-black/5 dark:border-white/10 bg-white/60 dark:bg-[#0c0a14]/45 backdrop-blur-xl">
          {/* Subtle scroll hints on left and right */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/40 dark:from-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/40 dark:from-black/40 to-transparent pointer-events-none z-10" />

          <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto no-scrollbar scroll-smooth">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeBtnRef : null}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#8A5A34]/80 dark:text-zinc-400 hover:text-[#8A5A34] dark:hover:text-pink-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeUniverseMobileTabPill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-600/90 via-rose-500/90 to-purple-600/90 shadow-[0_0_12px_rgba(244,63,94,0.5)] border border-pink-300/40 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="text-xs leading-none">{tab.icon}</span>
                  <span className="tracking-wide uppercase leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
    {/* Dynamic pixel-perfect spacer so the content starts right below the fixed header */}
    <div
      style={{ height: `${headerHeight}px` }}
      className="w-full pointer-events-none transition-all duration-150"
      aria-hidden="true"
    />
  </>
  );
}

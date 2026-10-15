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
    description: 'Hero, Origin Story, The Kiss & 3-Month Love Letter',
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
    SoundEngine.click();
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tabId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        className="fixed top-0 left-0 right-0 z-50 w-full select-none shadow-[0_10px_35px_rgba(0,0,0,0.65)] print:hidden"
      >
      {/* ─────────────────────────────────────────────────────────────
          TIER 1: TOP UTILITY STRIP (Like Reference's Blue Bar)
          Cosmic dark theme with romantic accents & live telemetry
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-r from-[#090412] via-[#1b0826] to-[#090412] border-b border-pink-500/20 text-pink-200/80 text-[10px] sm:text-xs font-mono py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Romantic Greeting */}
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold tracking-wide text-white/90 truncate">
              Welcome to Yajat &amp; Nush&apos;s Infinite Universe ✨
            </span>
          </div>

          {/* Right: Quick Stats & Anniversary Milestone */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* Days Together */}
            <div className="flex items-center gap-1 text-pink-300">
              <span>📅</span>
              <span className="hidden sm:inline text-white/70">Milestone:</span>
              <span className="text-[var(--butter)] font-bold">Aug 22, 2024</span>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span className="text-[var(--butter)] font-bold">{streakCount}d</span>
              <span className="hidden sm:inline text-white/60">streak</span>
            </div>

            {/* Explored Percentage */}
            <div className="hidden md:flex items-center gap-1.5 text-purple-300">
              <span>🌌</span>
              <span className="text-white/70">Explored:</span>
              <span className="text-[var(--butter)] font-bold">{percent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 2: MAIN NAVIGATION BAR (Like Reference's Main Header)
          Logo on Left, Center Tabs, Right Action Icons & "Send Love" CTA
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full backdrop-blur-2xl bg-black/85 dark:bg-[#0c0a14]/90 border-b border-pink-500/25 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* 1. LEFT: Sleek Brand Logo */}
            <div
              onClick={() => handleSelectTab('story')}
              className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
              title="Go to Our Story"
            >
              {/* Geometric Heart Emblem */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/10 border border-pink-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.35)] group-hover:scale-105 group-hover:border-pink-300 transition-all duration-300">
                <span className="text-lg sm:text-xl transform group-hover:scale-110 transition-transform">
                  💖
                </span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping opacity-75" />
              </div>

              {/* Brand Title */}
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-widest bg-gradient-to-r from-pink-300 via-rose-200 to-purple-300 bg-clip-text text-transparent group-hover:brightness-110 transition-all font-sans">
                    NUSH
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-400/30 uppercase tracking-wider font-semibold">
                    &amp; Yajat
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-pink-300/60 font-mono tracking-widest uppercase mt-0.5">
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
                        : 'text-zinc-400 hover:text-pink-200 hover:bg-white/5'
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
                            : 'bg-white/5 text-pink-300/60'
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
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              
              {/* Soundtrack Toggle */}
              <button
                onClick={() => {
                  SoundEngine.click();
                  toggleSoundtrack();
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shadow-md backdrop-blur text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  soundtrackPlaying
                    ? 'bg-pink-600/80 border-pink-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'bg-white/5 border-white/15 text-zinc-400 hover:text-white hover:bg-white/10'
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-white/15 bg-white/5 shadow-md backdrop-blur text-xs sm:text-sm hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer text-zinc-300"
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

              {/* "Send Love 💓" CTA Button (Like the Green "Contact Us" Button in Reference) */}
              <button
                onClick={handleSendLoveCTA}
                disabled={heartSending}
                className="relative group overflow-hidden flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_18px_rgba(244,63,94,0.5)] border border-pink-300/40 hover:shadow-[0_0_25px_rgba(244,63,94,0.7)] active:scale-95 transition-all duration-200 cursor-pointer"
                title="Send an instant heartbeat to partner!"
              >
                <span className={`text-sm ${heartSending ? 'animate-ping' : 'group-hover:scale-125 transition-transform'}`}>
                  💓
                </span>
                <span className="font-semibold hidden xs:inline">
                  {heartSending ? 'Sent!' : 'Send Love'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MOBILE TAB STRIP (Visible on mobile/tablet screens < lg)
            Scrollable, swipeable, with auto-centering active tab
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:hidden w-full border-t border-white/10 bg-black/60 backdrop-blur-md px-2 py-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1.5 min-w-max mx-auto justify-start sm:justify-center">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeBtnRef : null}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-pink-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeUniverseMobileTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/90 via-rose-500/90 to-purple-600/90 shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-pink-300/40 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="text-sm">{tab.icon}</span>
                  <span className="tracking-wide uppercase">{tab.label}</span>
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

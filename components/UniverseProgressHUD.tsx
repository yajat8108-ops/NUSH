'use client';

import { useEffect } from 'react';
import { useUniverseStore } from '@/lib/universeStore';
import { useStore } from '@/lib/store';

export default function UniverseProgressHUD() {
  const { checkAndUpdateStreak } = useUniverseStore();
  const { theme } = useStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // HUD controls (Streak, % Explored, Theme, Soundtrack, Camcorder)
  // are now unified into the sticky UniverseTabsNav header to prevent overlap.
  return null;
}

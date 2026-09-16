'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}

/**
 * lib/utils.ts
 * ============================================================================
 * Shared utility functions for SciCalc.
 * ============================================================================
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Generate a unique ID for history entries. */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a string represents a valid partial number input.
 */
export function isValidNumberInput(s: string): boolean {
  return /^-?\d*\.?\d*$/.test(s);
}

/**
 * Get matching bracket position in a string.
 */
export function getOpenParenCount(expr: string): number {
  let count = 0;
  for (const ch of expr) {
    if (ch === '(') count++;
    else if (ch === ')') count--;
  }
  return Math.max(0, count);
}

/**
 * Auto-close unclosed parentheses in an expression.
 */
export function autoCloseParen(expr: string): string {
  const open = getOpenParenCount(expr);
  return expr + ')'.repeat(open);
}

/**
 * Format a timestamp as a short relative time string.
 */
export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

/**
 * Detect if the device prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

import { useStore } from './store';

/**
 * Haptic feedback (mobile).
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  if (!useStore.getState().hapticsEnabled) return;
  
  const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 40;
  navigator.vibrate(duration);
}

/**
 * Map keyboard key to calculator button value.
 */
export function keyToButton(key: string, shiftKey: boolean): string | null {
  const map: Record<string, string> = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '.': '.', ',': '.',
    '+': '+', '-': '−', '*': '×', '/': '÷',
    '%': '%',
    '^': '^',
    'Enter': '=', '=': '=',
    'Backspace': 'DEL',
    'Escape': 'AC',
    'Delete': 'AC',
    '(': '(',
    ')': ')',
    's': shiftKey ? '' : 'sin(',
    'c': shiftKey ? '' : 'cos(',
    't': shiftKey ? '' : 'tan(',
    'l': shiftKey ? '' : 'ln(',
    'r': 'sqrt(',
    'p': 'π',
    'e': 'e',
  };
  return map[key] ?? null;
}

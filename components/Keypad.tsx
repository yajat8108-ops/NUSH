'use client';

/**
 * components/Keypad.tsx
 * ============================================================================
 * Standard calculator keypad (numbers, basic operators, equals).
 * Implements Material You ripple + press animations.
 * ============================================================================
 */

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { BASIC_BUTTONS, type CalcButton } from '@/lib/calculator';
import { cn } from '@/lib/utils';

interface KeypadProps {
  onButton: (value: string) => void;
  clearLabel: string;
  memoryHasValue: boolean;
  pendingOp: string | null;
}

// ── Ripple hook ──────────────────────────────────────────────────────────────

function useRipple() {
  const ref = useRef<HTMLButtonElement>(null);

  const trigger = useCallback((e: React.PointerEvent) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  return { ref, trigger };
}

// ── Single Button ─────────────────────────────────────────────────────────────

interface CalcBtnProps {
  btn: CalcButton;
  onPress: (value: string) => void;
  overrideLabel?: string;
  isActive?: boolean;
}

function CalcBtn({ btn, onPress, overrideLabel, isActive }: CalcBtnProps) {
  const { ref, trigger } = useRipple();
  const [pressed, setPressed] = React.useState(false);

  const typeClass = {
    number:   'btn-number',
    operator: 'btn-operator',
    equals:   'btn-equals',
    function: 'btn-function',
    constant: 'btn-function',
    memory:   'btn-memory',
    clear:    'btn-clear',
    special:  'btn-special',
  }[btn.type] ?? 'btn-number';

  return (
    <motion.button
      ref={ref}
      className={cn('calc-btn', typeClass, btn.wide && 'btn-wide', isActive && 'active')}
      onClick={() => onPress(btn.value)}
      onPointerDown={(e) => {
        trigger(e);
        setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={btn.label}
    >
      <span className="btn-label">{overrideLabel ?? btn.label}</span>
    </motion.button>
  );
}

// ── Keypad Grid ───────────────────────────────────────────────────────────────

export default function Keypad({ onButton, clearLabel, memoryHasValue, pendingOp }: KeypadProps) {
  return (
    <div className="keypad" role="group" aria-label="Calculator keypad">
      {BASIC_BUTTONS.map((row, rIdx) => (
        <div key={rIdx} className="keypad-row">
          {row.map((btn) => (
            <CalcBtn
              key={btn.value}
              btn={btn}
              onPress={onButton}
              isActive={btn.value === pendingOp}
              overrideLabel={btn.value === 'AC' ? clearLabel : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { CalcBtn };

'use client';

/**
 * components/ScientificKeypad.tsx
 * ============================================================================
 * Scientific function keypad. Shows trig, log, power, and constant buttons
 * in a 5-column grid with DEG/RAD toggle at top and memory row at bottom.
 * Supports INV (inverse) mode toggle and long-press for secondary functions.
 * ============================================================================
 */

import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SCIENTIFIC_BUTTONS, MEMORY_BUTTONS, type CalcButton, type AngleMode } from '@/lib/calculator';
import { cn, hapticFeedback } from '@/lib/utils';

interface ScientificKeypadProps {
  onButton: (value: string) => void;
  invMode: boolean;
  angleMode: AngleMode;
  onAngleToggle: () => void;
}

// ── Scientific Button ─────────────────────────────────────────────────────────

interface SciBtnProps {
  btn: CalcButton;
  onPress: (value: string) => void;
  invMode: boolean;
}

function SciBtn({ btn, onPress, invMode }: SciBtnProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const effectiveLabel = invMode && btn.shiftLabel
    ? (btn.shiftLabel === '⁻¹' ? `${btn.label}⁻¹` : btn.shiftLabel)
    : btn.label;
  const effectiveValue = invMode && btn.shiftValue ? btn.shiftValue : btn.value;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    didLongPress.current = false;
    // Long press for secondary function (even without INV)
    if (btn.shiftValue) {
      pressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        onPress(btn.shiftValue!);
        // Haptic
        if (navigator.vibrate) navigator.vibrate(30);
      }, 600);
    }
    // Ripple
    const b = btnRef.current;
    if (!b) return;
    const rect = b.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple ripple-sci';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top) + 'px';
    b.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, [btn, onPress]);

  const handlePointerUp = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!didLongPress.current) {
      onPress(effectiveValue);
      hapticFeedback('light');
    }
  }, [effectiveValue, onPress]);

  return (
    <motion.button
      ref={btnRef}
      className={cn('calc-btn btn-science', invMode && btn.shiftLabel ? 'btn-science-inv' : '')}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      whileTap={{ scale: 0.91 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={effectiveLabel}
      title={btn.shiftLabel ? `Long press: ${btn.shiftLabel}` : undefined}
    >
      <span className="btn-label sci-label">{effectiveLabel}</span>
      {btn.shiftLabel && !invMode && (
        <span className="btn-sublabel">{btn.shiftLabel}</span>
      )}
    </motion.button>
  );
}

// ── Memory Button ────────────────────────────────────────────────────────────

function MemBtn({ btn, onPress, invMode }: { btn: CalcButton; onPress: (v: string) => void; invMode: boolean }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const effectiveLabel = invMode && btn.shiftLabel ? btn.shiftLabel : btn.label;
  const effectiveValue = invMode && btn.shiftValue ? btn.shiftValue : btn.value;

  return (
    <motion.button
      ref={btnRef}
      className="calc-btn btn-memory"
      onClick={() => {
        onPress(effectiveValue);
        hapticFeedback('light');
      }}
      onPointerDown={(e) => {
        const b = btnRef.current;
        if (!b) return;
        const rect = b.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top  = (e.clientY - rect.top) + 'px';
        b.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={effectiveLabel}
    >
      <span className="btn-label mem-label">{effectiveLabel}</span>
    </motion.button>
  );
}

// ── Scientific Keypad ─────────────────────────────────────────────────────────

export default function ScientificKeypad({ onButton, invMode, angleMode, onAngleToggle }: ScientificKeypadProps) {
  return (
    <div className="sci-keypad" role="group" aria-label="Scientific functions">

      {/* DEG/RAD/INV Toggle */}
      <div className="angle-toggle">
        <button
          className={`angle-btn ${angleMode === 'DEG' ? 'active' : ''}`}
          onClick={() => {
            if (angleMode !== 'DEG') {
              onAngleToggle();
              hapticFeedback('light');
            }
          }}
        >
          DEG
        </button>
        <button
          className={`angle-btn ${angleMode === 'RAD' ? 'active' : ''}`}
          onClick={() => {
            if (angleMode !== 'RAD') {
              onAngleToggle();
              hapticFeedback('light');
            }
          }}
        >
          RAD
        </button>
        <button
          className="angle-btn"
          onClick={() => {
            onButton('INV');
            hapticFeedback('medium');
          }}
          style={{
            background: invMode ? 'var(--sci)' : 'none',
            color: invMode ? '#1c1d2e' : 'var(--lo)',
          }}
        >
          INV
        </button>
      </div>

      {/* Scientific function rows - 5 columns each */}
      {SCIENTIFIC_BUTTONS.map((row, rIdx) => (
        <div key={rIdx} className="keypad-row sci-row">
          {row.map((btn) => (
            <SciBtn
              key={btn.label}
              btn={btn}
              onPress={onButton}
              invMode={invMode}
            />
          ))}
        </div>
      ))}

      {/* Memory row - 5 columns */}
      <div className="keypad-row memory-row">
        {MEMORY_BUTTONS.map((btn) => (
          <MemBtn key={btn.value} btn={btn} onPress={onButton} invMode={invMode} />
        ))}
      </div>
    </div>
  );
}

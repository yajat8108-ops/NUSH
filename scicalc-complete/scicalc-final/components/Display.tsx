'use client';

/**
 * components/Display.tsx
 * ============================================================================
 * Calculator display area. Shows WASM badge, status pills, expression,
 * and primary result with auto-scaling font size. Supports fractions,
 * matrix grid formatting, and history navigation.
 * ============================================================================
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { decimalToFraction } from '@/lib/calculator';
import { hapticFeedback, formatTimestamp } from '@/lib/utils';

interface DisplayProps {
  primaryDisplay: string;
  expressionDisplay: string;
  error: string | null;
  memoryHasValue: boolean;
  memory: number;
  angleMode: string;
  isWasm: boolean;
  isReplay?: boolean;
  replayTimestamp?: number | null;
  liveResult?: string;
  onOpenQr?: () => void;
  onOpenVars?: () => void;
  onReplayUp?: () => void;
  onReplayDown?: () => void;
}

export default function Display({
  primaryDisplay,
  expressionDisplay,
  error,
  memoryHasValue,
  angleMode,
  isWasm,
  isReplay,
  replayTimestamp,
  liveResult,
  onOpenQr,
  onOpenVars,
  onReplayUp,
  onReplayDown,
}: DisplayProps) {
  const [showAsFraction, setShowAsFraction] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset fraction state when primary display updates
  useEffect(() => {
    setShowAsFraction(false);
    setCopied(false);
  }, [primaryDisplay]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(primaryDisplay.replace(/,/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      hapticFeedback('light');
    }
  };

  // Check if result is a matrix
  const isMatrix = useMemo(() => {
    return primaryDisplay.startsWith('[') && primaryDisplay.includes('\n');
  }, [primaryDisplay]);

  // Parse matrix rows for grid layout
  const matrixRows = useMemo(() => {
    if (!isMatrix) return null;
    return primaryDisplay.split('\n').map((row) => {
      const cleaned = row.replace(/[\[\]]/g, '').trim();
      return cleaned.split(',').map((x) => x.trim());
    });
  }, [primaryDisplay, isMatrix]);

  // Compute fraction display if numeric
  const fractionStr = useMemo(() => {
    const num = parseFloat(primaryDisplay.replace(/,/g, ''));
    if (isNaN(num)) return null;
    return decimalToFraction(num);
  }, [primaryDisplay]);

  // Auto-scale large numbers
  const fontSize = useMemo(() => {
    const len = primaryDisplay.length;
    if (len <= 9) return '3.4rem';
    if (len <= 12) return '2.6rem';
    if (len <= 16) return '2rem';
    return '1.4rem';
  }, [primaryDisplay]);

  return (
    <div className="display-area" role="region" aria-label="Calculator display">
      {/* WASM / JS Badge */}
      <div className={`wasm-badge ${isWasm ? 'wasm-active' : 'wasm-fallback'}`}>
        {isWasm ? 'WASM' : 'JS'}
      </div>

      {/* Status Row */}
      <div className="status-row">
        {onReplayUp && (
          <button
            onClick={onReplayUp}
            className="pill"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--mid)',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              padding: '2px 6px',
            }}
            title="Previous Calculation"
          >
            ▲
          </button>
        )}
        {onReplayDown && (
          <button
            onClick={onReplayDown}
            className="pill"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--mid)',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              padding: '2px 6px',
            }}
            title="Next Calculation"
          >
            ▼
          </button>
        )}
        {onOpenQr && (
          <button
            onClick={onOpenQr}
            className="pill"
            style={{
              background: 'rgba(168, 199, 250, 0.12)',
              color: 'var(--accent)',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            QR
          </button>
        )}
        {onOpenVars && (
          <button
            onClick={onOpenVars}
            className="pill"
            style={{
              background: 'rgba(192, 179, 245, 0.12)',
              color: 'var(--sci)',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            VAR
          </button>
        )}
        <span className="pill pill-a">{angleMode}</span>
        {memoryHasValue && <span className="pill pill-m">M</span>}
        {error && <span className="pill pill-e">ERR</span>}
        {isReplay && (
          <span
            className="pill"
            style={{
              background: 'rgba(232, 184, 109, 0.15)',
              color: 'var(--op)',
              fontWeight: 700,
            }}
          >
            REPLAY
          </span>
        )}
        {isReplay && replayTimestamp && (
          <span
            className="pill"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--mid)',
            }}
          >
            {formatTimestamp(replayTimestamp)}
          </span>
        )}
      </div>

      {/* Expression / formula line */}
      <div className="expression-line" aria-label="Expression">
        <motion.span
          key={expressionDisplay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="expression-text"
        >
          {expressionDisplay || '\u00A0'}
        </motion.span>
        {liveResult && !error && !isMatrix && !isReplay && (
          <span
            className="live-result"
            style={{
              fontSize: '0.85em',
              color: 'var(--mid)',
              marginLeft: '12px',
              fontWeight: 500,
            }}
          >
            = {liveResult}
          </span>
        )}
      </div>

      {/* Primary result display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', gap: '12px' }}>
        {fractionStr && !error && !isMatrix && (
          <button
            onClick={() => setShowAsFraction((prev) => !prev)}
            style={{
              background: showAsFraction ? 'rgba(168, 199, 250, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: showAsFraction ? 'var(--accent)' : 'var(--mid)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--t)',
            }}
            title="Toggle Fraction/Decimal"
          >
            S⇔D
          </button>
        )}

        {!error && !isMatrix && primaryDisplay !== '0' && (
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: copied ? '#4caf50' : 'var(--mid)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--t)',
            }}
            title="Copy Result"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}

        <motion.div
          className={`primary-display ${error ? 'error-display' : ''}`}
          style={{ fontSize }}
          aria-label="Result"
          aria-live="polite"
          key={primaryDisplay + (showAsFraction ? '-frac' : '-dec')}
          initial={{ scale: 0.97, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
        >
          {error ? (
            error
          ) : isMatrix && matrixRows ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  padding: '6px 12px',
                  borderLeft: '2px solid var(--accent)',
                  borderRight: '2px solid var(--accent)',
                  borderRadius: '4px',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '2px', background: 'var(--accent)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '6px', height: '2px', background: 'var(--accent)' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '2px', background: 'var(--accent)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '2px', background: 'var(--accent)' }}></div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${matrixRows[0].length}, auto)`,
                    gap: '4px 12px',
                    fontFamily: 'inherit',
                    fontSize: '0.45em',
                    textAlign: 'center',
                  }}
                >
                  {matrixRows.flat().map((cell, cIdx) => (
                    <span key={cIdx} style={{ color: 'var(--hi)' }}>
                      {cell}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : showAsFraction && fractionStr ? (
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1, fontSize: '0.75em', verticalAlign: 'middle' }}>
              <span style={{ borderBottom: '1px solid var(--hi)', padding: '0 4px 2px', textAlign: 'center' }}>
                {fractionStr.split('/')[0]}
              </span>
              <span style={{ padding: '2px 4px 0', textAlign: 'center' }}>
                {fractionStr.split('/')[1]}
              </span>
            </div>
          ) : (
            primaryDisplay
          )}
        </motion.div>
      </div>
    </div>
  );
}

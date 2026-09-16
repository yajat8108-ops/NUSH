'use client';

/**
 * components/HistoryPanel.tsx
 * ============================================================================
 * Embedded history panel showing last 20 calculations.
 * Matches the Android Calculator history panel aesthetic.
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { HistoryEntry } from '@/lib/calculator';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  onRemove?: (id: string) => void;
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
  if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
  return Math.floor(d / 86400000) + 'd ago';
}

export default function HistoryPanel({ history, onSelect, onClear, onRemove }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="hempty">
        <div className="hempty-icon">∑</div>
        <p>No calculations yet</p>
        <span className="hint">Results appear here as you calculate</span>
      </div>
    );
  }

  return (
    <div className="hist">
      <div className="hdr">
        <span className="hcnt">{history.length} result{history.length !== 1 ? 's' : ''}</span>
        <button className="hclr" onClick={onClear}>Clear all</button>
      </div>
      <div className="hlist">
        {history.map((entry, i) => (
          <motion.div
            key={entry.id}
            className="hi"
            onClick={() => onSelect(entry)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.15 }}
            whileTap={{ scale: 0.98 }}
            style={{ position: 'relative' }}
          >
            <span className="hex" style={{ paddingRight: '20px' }}>{entry.expression}</span>
            <div className="hbot">
              <span className="hres">= {entry.result}</span>
              <span className="htm">{timeAgo(entry.timestamp)}</span>
            </div>
            
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(entry.id);
                }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--lo)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                  transition: 'color var(--t)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--err)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--lo)')}
                aria-label="Delete entry"
                title="Delete"
              >
                ×
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { hapticFeedback } from '@/lib/utils';

export default function SettingsPanel() {
  const { 
    theme, toggleTheme, 
    hapticsEnabled, setHapticsEnabled,
    formatMode, setFormatMode
  } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      <h3 style={{ margin: 0, color: 'var(--hi)', fontSize: '18px', fontWeight: 600 }}>Settings</h3>
      
      {/* Theme Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--hi)', fontWeight: 500, fontSize: '14px' }}>App Theme</div>
          <div style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '4px' }}>Toggle light and dark mode</div>
        </div>
        <button
          onClick={() => {
            toggleTheme();
            hapticFeedback('medium');
          }}
          style={{
            background: 'var(--bg3)',
            color: 'var(--hi)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'var(--t)'
          }}
        >
          {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Haptics Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--hi)', fontWeight: 500, fontSize: '14px' }}>Haptic Feedback</div>
          <div style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '4px' }}>Vibrate on key presses</div>
        </div>
        <button
          onClick={() => {
            setHapticsEnabled(!hapticsEnabled);
            if (!hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(10);
            }
          }}
          style={{
            background: hapticsEnabled ? 'var(--accent)' : 'var(--bg3)',
            color: hapticsEnabled ? '#000' : 'var(--hi)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: hapticsEnabled ? 600 : 400,
            transition: 'var(--t)'
          }}
        >
          {hapticsEnabled ? 'Enabled On' : 'Disabled Off'}
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Number Format */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--hi)', fontWeight: 500, fontSize: '14px' }}>Number Format</div>
          <div style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '4px' }}>Default output style</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['decimal', 'fraction', 'eng'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => {
                setFormatMode(fmt);
                hapticFeedback('light');
              }}
              style={{
                background: formatMode === fmt ? 'var(--accent-dim)' : 'var(--bg3)',
                color: formatMode === fmt ? '#fff' : 'var(--hi)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'var(--t)'
              }}
            >
              {fmt === 'eng' ? 'Engineering' : fmt}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}

'use client';

import React from 'react';
import { useStore } from '@/lib/store';

interface VariableModalProps {
  currentValue: number; // current value in display / Ans to store
  isOpen: boolean;
  onClose: () => void;
  onRecall: (val: number) => void;
}

export default function VariableModal({ currentValue, isOpen, onClose, onRecall }: VariableModalProps) {
  const { variables, setVariable, clearVariables } = useStore();

  if (!isOpen) return null;

  const handleStore = (name: string) => {
    setVariable(name, currentValue);
  };

  const handleRecall = (name: string) => {
    onRecall(variables[name] || 0);
    onClose();
  };

  return (
    <div className="history-backdrop" style={{ zIndex: 100 }} onClick={onClose}>
      <div
        className="history-panel"
        style={{
          height: 'auto',
          maxHeight: '85vh',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          width: 'min(360px, 92vw)',
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          position: 'fixed',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hdr" style={{ marginBottom: 0 }}>
          <h3 className="history-title">Variables</h3>
          <button className="hclr" onClick={clearVariables}>Clear all</button>
        </div>

        <p style={{ color: 'var(--mid)', fontSize: '12px' }}>
          Current Display: <strong style={{ color: 'var(--accent)' }}>{currentValue}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {Object.entries(variables).map(([name, val]) => (
            <div
              key={name}
              style={{
                background: 'var(--bg3)',
                padding: '10px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--sci)' }}>{name}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--hi)',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={val.toString()}
              >
                {val}
              </span>
              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button
                  onClick={() => handleStore(name)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-op)',
                    color: 'var(--op)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '10px',
                    padding: '6px 0',
                    cursor: 'pointer',
                  }}
                >
                  STO
                </button>
                <button
                  onClick={() => handleRecall(name)}
                  style={{
                    flex: 1,
                    background: 'rgba(168, 199, 250, 0.1)',
                    color: 'var(--accent)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '10px',
                    padding: '6px 0',
                    cursor: 'pointer',
                  }}
                >
                  RCL
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="hclr"
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

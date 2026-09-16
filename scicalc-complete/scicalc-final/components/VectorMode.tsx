'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getCalcModule } from '@/lib/wasm';
import { formatNumber } from '@/lib/calculator';
import { hapticFeedback } from '@/lib/utils';

interface VectorModeProps {
  onOutputResult: (val: string, expr: string) => void;
}

export default function VectorMode({ onOutputResult }: VectorModeProps) {
  const { vectors, setVector } = useStore();
  const [selectedVct, setSelectedVct] = useState<string>('VctA');
  const [opLeft, setOpLeft] = useState<string>('VctA');
  const [opRight, setOpRight] = useState<string>('VctB');

  const currentVector = vectors[selectedVct] || { dim: 3, data: [0, 0, 0] };

  const handleDimensionChange = (dim: number) => {
    const newData = dim === 2 ? [currentVector.data[0] || 0, currentVector.data[1] || 0] : [
      currentVector.data[0] || 0,
      currentVector.data[1] || 0,
      currentVector.data[2] || 0,
    ];
    setVector(selectedVct, { dim, data: newData });
  };

  const handleCoordinateChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newData = [...currentVector.data];
    newData[index] = num;
    setVector(selectedVct, { ...currentVector, data: newData });
  };

  // ── Operations ────────────────────────────────────────────────────────────

  const handleMagnitude = () => {
    const calc = getCalcModule();
    try {
      const mag = calc.vectorMagnitude(currentVector.data, currentVector.dim);
      const formatted = formatNumber(mag);
      onOutputResult(formatted, `|${selectedVct}|`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `|${selectedVct}|`);
      hapticFeedback('heavy');
    }
  };

  const handleNormalize = () => {
    const calc = getCalcModule();
    try {
      const mag = calc.vectorMagnitude(currentVector.data, currentVector.dim);
      if (mag === 0) {
        onOutputResult('Domain Error: zero vector', `unit(${selectedVct})`);
        hapticFeedback('heavy');
        return;
      }
      const unit = currentVector.data.map(x => x / mag);
      const formatted = `[${unit.map(x => formatNumber(x)).join(', ')}]`;
      onOutputResult(formatted, `unit(${selectedVct})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `unit(${selectedVct})`);
      hapticFeedback('heavy');
    }
  };

  const handleDotProduct = () => {
    const calc = getCalcModule();
    const left = vectors[opLeft];
    const right = vectors[opRight];
    if (!left || !right) return;

    if (left.dim !== right.dim) {
      onOutputResult('Dimension Error', `${opLeft} • ${opRight}`);
      hapticFeedback('heavy');
      return;
    }

    try {
      const dot = calc.vectorDot(left.data, right.data, left.dim);
      const formatted = formatNumber(dot);
      onOutputResult(formatted, `${opLeft} • ${opRight}`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `${opLeft} • ${opRight}`);
      hapticFeedback('heavy');
    }
  };

  const handleCrossProduct = () => {
    const calc = getCalcModule();
    const left = vectors[opLeft];
    const right = vectors[opRight];
    if (!left || !right) return;

    if (left.dim !== 3 || right.dim !== 3) {
      onOutputResult('Dimension Error: 3D only', `${opLeft} × ${opRight}`);
      hapticFeedback('heavy');
      return;
    }

    try {
      const cross = calc.vectorCross(left.data, right.data);
      const formatted = `[${cross.map(x => formatNumber(x)).join(', ')}]`;
      onOutputResult(formatted, `${opLeft} × ${opRight}`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `${opLeft} × ${opRight}`);
      hapticFeedback('heavy');
    }
  };

  const handleAngle = () => {
    const calc = getCalcModule();
    const left = vectors[opLeft];
    const right = vectors[opRight];
    if (!left || !right) return;

    if (left.dim !== right.dim) {
      onOutputResult('Dimension Error', `∠(${opLeft}, ${opRight})`);
      hapticFeedback('heavy');
      return;
    }

    try {
      const dot = calc.vectorDot(left.data, right.data, left.dim);
      const magLeft = calc.vectorMagnitude(left.data, left.dim);
      const magRight = calc.vectorMagnitude(right.data, right.dim);
      
      if (magLeft === 0 || magRight === 0) {
        onOutputResult('Domain Error: zero vector', `∠(${opLeft}, ${opRight})`);
        hapticFeedback('heavy');
        return;
      }

      const cosTheta = dot / (magLeft * magRight);
      // Clamp for numerical errors
      const clamped = Math.max(-1, Math.min(1, cosTheta));
      const angleRad = Math.acos(clamped);
      
      // Convert to degrees if set (default is degrees)
      const isDeg = calc.getAngleMode() === 0;
      const angle = isDeg ? angleRad * (180 / Math.PI) : angleRad;
      const unitLabel = isDeg ? '°' : ' rad';
      
      const formatted = formatNumber(angle) + unitLabel;
      onOutputResult(formatted, `∠(${opLeft}, ${opRight})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `∠(${opLeft}, ${opRight})`);
      hapticFeedback('heavy');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key;
      if (key === '.') { e.preventDefault(); handleDotProduct(); }
      else if (key === '*') { e.preventDefault(); handleCrossProduct(); }
      else if (key === 'a' || key === 'A') { e.preventDefault(); handleAngle(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVct, opLeft, opRight, vectors]);

  const labels = ['X', 'Y', 'Z'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['VctA', 'VctB', 'VctC'].map((name) => (
          <button
            key={name}
            onClick={() => setSelectedVct(name)}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: selectedVct === name ? 'var(--bg-sci)' : 'var(--bg2)',
              color: selectedVct === name ? 'var(--sci)' : 'var(--mid)',
              borderBottom: selectedVct === name ? '2px solid var(--sci)' : 'none',
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Resize Vector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Dimensions</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '2D (X, Y)', dim: 2 },
            { label: '3D (X, Y, Z)', dim: 3 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleDimensionChange(item.dim)}
              style={{
                fontSize: '10px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: currentVector.dim === item.dim ? 'var(--bg3)' : 'transparent',
                color: 'var(--hi)',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate inputs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          background: 'var(--bg2)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
        }}
      >
        {currentVector.data.map((val, idx) => (
          <div key={idx} style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: 'var(--mid)', display: 'block', textAlign: 'center', marginBottom: '4px' }}>
              {labels[idx]}
            </label>
            <input
              type="number"
              value={val || ''}
              placeholder="0"
              onChange={(e) => handleCoordinateChange(idx, e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--hi)',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Single Vector Operations */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleMagnitude}
          style={{
            flex: 1,
            background: 'var(--bg4)',
            color: 'var(--fn)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 0',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Magnitude (|v|)
        </button>
        <button
          onClick={handleNormalize}
          style={{
            flex: 1,
            background: 'var(--bg4)',
            color: 'var(--fn)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 0',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Unit Vector
        </button>
      </div>

      {/* Vector Arithmetic / Products */}
      <div
        style={{
          background: 'var(--bg2)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--mid)', display: 'block' }}>Vector Arithmetic</span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={opLeft}
            onChange={(e) => setOpLeft(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg3)',
              color: 'var(--hi)',
              border: '1px solid var(--border)',
              padding: '6px',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '12px',
            }}
          >
            {['VctA', 'VctB', 'VctC'].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <span style={{ color: 'var(--mid)', fontSize: '14px' }}>op</span>

          <select
            value={opRight}
            onChange={(e) => setOpRight(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg3)',
              color: 'var(--hi)',
              border: '1px solid var(--border)',
              padding: '6px',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '12px',
            }}
          >
            {['VctA', 'VctB', 'VctC'].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={handleDotProduct}
            style={{
              flex: 1,
              background: 'var(--bg-op)',
              color: 'var(--op)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Dot Product (•)
          </button>
          <button
            onClick={handleCrossProduct}
            style={{
              flex: 1,
              background: 'var(--bg-op)',
              color: 'var(--op)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cross Product (×)
          </button>
          <button
            onClick={handleAngle}
            style={{
              flex: 1,
              background: 'var(--bg-op)',
              color: 'var(--op)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Angle (∠)
          </button>
        </div>
      </div>

    </div>
  );
}

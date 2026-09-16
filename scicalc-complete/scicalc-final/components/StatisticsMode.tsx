'use client';

import React, { useState, useEffect } from 'react';
import { useStore, type StatRow } from '@/lib/store';
import { getCalcModule } from '@/lib/wasm';
import { formatNumber } from '@/lib/calculator';
import { hapticFeedback } from '@/lib/utils';

interface StatisticsModeProps {
  onOutputResult: (val: string, expr: string) => void;
}

export default function StatisticsMode({ onOutputResult }: StatisticsModeProps) {
  const { statRows, setStatRows, statModeType, setStatModeType } = useStore();
  const [normX, setNormX] = useState<string>('0');
  
  const currentMatrix = statRows[0] || { x: 0, y: 0, freq: 1 };

  // Initialize with some default rows if empty
  useEffect(() => {
    if (statRows.length === 0) {
      setStatRows([
        { x: 1, y: 2, freq: 1 },
        { x: 2, y: 4, freq: 1 },
        { x: 3, y: 5, freq: 1 },
      ]);
    }
  }, [statRows, setStatRows]);

  const handleRowChange = (index: number, field: keyof StatRow, val: string) => {
    const num = parseFloat(val) || 0;
    const newRows = [...statRows];
    newRows[index] = { ...newRows[index], [field]: num };
    setStatRows(newRows);
  };

  const addRow = () => {
    const lastRow = statRows[statRows.length - 1];
    setStatRows([
      ...statRows,
      {
        x: (lastRow?.x || 0) + 1,
        y: (lastRow?.y || 0) + 1,
        freq: 1,
      },
    ]);
    hapticFeedback('light');
  };

  const removeRow = (index: number) => {
    if (statRows.length <= 1) return;
    setStatRows(statRows.filter((_, idx) => idx !== index));
    hapticFeedback('light');
  };

  const clearTable = () => {
    setStatRows([{ x: 0, y: 0, freq: 1 }]);
    hapticFeedback('light');
  };

  // ── Helper to expand rows by frequency ─────────────────────────────────────
  const getFlatData = () => {
    const flatX: number[] = [];
    const flatY: number[] = [];
    for (const r of statRows) {
      const f = Math.max(1, Math.round(r.freq));
      for (let i = 0; i < f; i++) {
        flatX.push(r.x);
        flatY.push(r.y);
      }
    }
    return { flatX, flatY };
  };

  // ── Computations ───────────────────────────────────────────────────────────

  const handleCalculateBasic = () => {
    const calc = getCalcModule();
    const { flatX, flatY } = getFlatData();
    if (flatX.length === 0) {
      onOutputResult('Empty Dataset', 'Stats');
      hapticFeedback('heavy');
      return;
    }

    try {
      const hasSampleX = flatX.length > 1;
      const meanX = calc.statMean(flatX, flatX.length);
      const stdDevX = hasSampleX ? calc.statStdDev(flatX, flatX.length, true) : NaN;
      const popDevX = calc.statStdDev(flatX, flatX.length, false);

      let output = `Mean(x) = ${formatNumber(meanX)}\ns(x) = ${hasSampleX ? formatNumber(stdDevX) : 'N/A (N≤1)'}\nσ(x) = ${formatNumber(popDevX)}`;

      if (statModeType === '2-VAR') {
        const hasSampleY = flatY.length > 1;
        const meanY = calc.statMean(flatY, flatY.length);
        const stdDevY = hasSampleY ? calc.statStdDev(flatY, flatY.length, true) : NaN;
        const popDevY = calc.statStdDev(flatY, flatY.length, false);
        output += `\nMean(y) = ${formatNumber(meanY)}\ns(y) = ${hasSampleY ? formatNumber(stdDevY) : 'N/A (N≤1)'}\nσ(y) = ${formatNumber(popDevY)}`;
      }

      onOutputResult(output, `${statModeType} Summary`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Error: Calculation failed', 'Stats');
      hapticFeedback('heavy');
    }
  };

  const handleNormalCDF = () => {
    const calc = getCalcModule();
    const { flatX } = getFlatData();
    if (flatX.length === 0) {
      onOutputResult('Empty Dataset', 'Normal CDF');
      hapticFeedback('heavy');
      return;
    }
    try {
      const meanX = calc.statMean(flatX, flatX.length);
      const stdDevX = calc.statStdDev(flatX, flatX.length, false);
      if (stdDevX <= 0) {
        onOutputResult('Domain Error: σ = 0', 'Normal CDF');
        hapticFeedback('heavy');
        return;
      }
      const x = parseFloat(normX);
      if (isNaN(x)) {
        onOutputResult('Syntax Error: invalid x', 'Normal CDF');
        hapticFeedback('heavy');
        return;
      }

      const p = calc.normalCDF(x, meanX, stdDevX);
      const formatted = formatNumber(p);
      onOutputResult(formatted, `NormalCDF(x=${x}, μ=${formatNumber(meanX)}, σ=${formatNumber(stdDevX)})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', 'Normal CDF');
      hapticFeedback('heavy');
    }
  };

  const handleNormalPDF = () => {
    const calc = getCalcModule();
    const { flatX } = getFlatData();
    if (flatX.length === 0) {
      onOutputResult('Empty Dataset', 'Normal PDF');
      hapticFeedback('heavy');
      return;
    }
    try {
      const meanX = calc.statMean(flatX, flatX.length);
      const stdDevX = calc.statStdDev(flatX, flatX.length, false);
      if (stdDevX <= 0) {
        onOutputResult('Domain Error: σ = 0', 'Normal PDF');
        hapticFeedback('heavy');
        return;
      }
      const x = parseFloat(normX);
      if (isNaN(x)) {
        onOutputResult('Syntax Error: invalid x', 'Normal PDF');
        hapticFeedback('heavy');
        return;
      }

      const p = calc.normalPDF(x, meanX, stdDevX);
      const formatted = formatNumber(p);
      onOutputResult(formatted, `NormalPDF(x=${x}, μ=${formatNumber(meanX)}, σ=${formatNumber(stdDevX)})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', 'Normal PDF');
      hapticFeedback('heavy');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['1-VAR', '2-VAR'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setStatModeType(type)}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: statModeType === type ? 'var(--bg-sci)' : 'var(--bg2)',
              color: statModeType === type ? 'var(--sci)' : 'var(--mid)',
            }}
          >
            {type === '1-VAR' ? '1-VAR (Single)' : '2-VAR (Bivariate)'}
          </button>
        ))}
      </div>

      {/* Quick CSV / Space Paste Importer */}
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
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Quick CSV / Space Paste</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder={statModeType === '2-VAR' ? "e.g. 10,20; 30,40" : "e.g. 10, 20, 30, 40"}
            id="quick-stat-import"
            style={{
              flex: 1,
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--hi)',
              padding: '6px 10px',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => {
              const el = document.getElementById('quick-stat-import') as HTMLInputElement;
              if (!el || !el.value.trim()) return;
              
              const hasSemicolon = el.value.includes(';');
              if (hasSemicolon || statModeType === '2-VAR') {
                const tokens = el.value.split(';').map(x => x.trim()).filter(Boolean);
                const newRows = tokens.map(token => {
                  const parts = token.split(/[\s,]+/).map(parseFloat).filter(x => !isNaN(x));
                  return {
                    x: parts[0] || 0,
                    y: parts[1] || 0,
                    freq: parts[2] || 1
                  };
                });
                setStatRows(newRows);
              } else {
                const values = el.value.split(/[\s,]+/).map(parseFloat).filter(x => !isNaN(x));
                if (values.length > 0) {
                  const newRows = values.map(val => ({ x: val, y: 0, freq: 1 }));
                  setStatRows(newRows);
                }
              }
              el.value = '';
              hapticFeedback('light');
            }}
            style={{
              background: 'rgba(168, 199, 250, 0.15)',
              color: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'var(--t)',
            }}
          >
            Import
          </button>
        </div>
      </div>

      {/* Scrollable Data Table */}
      <div
        style={{
          background: 'var(--bg2)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxHeight: '180px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* Table Header */}
          <div style={{ display: 'flex', gap: '6px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ flex: 1, fontSize: '10px', color: 'var(--mid)', textAlign: 'center' }}>X</span>
            {statModeType === '2-VAR' && (
              <span style={{ flex: 1, fontSize: '10px', color: 'var(--mid)', textAlign: 'center' }}>Y</span>
            )}
            <span style={{ width: '60px', fontSize: '10px', color: 'var(--mid)', textAlign: 'center' }}>Freq</span>
            <span style={{ width: '24px' }}></span>
          </div>

          {/* Rows */}
          {statRows.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                padding: '4px 6px',
                borderRadius: '6px',
                background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
              }}
            >
              <input
                type="number"
                value={row.x}
                onChange={(e) => handleRowChange(idx, 'x', e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--hi)',
                  padding: '4px',
                  fontSize: '12px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              {statModeType === '2-VAR' && (
                <input
                  type="number"
                  value={row.y}
                  onChange={(e) => handleRowChange(idx, 'y', e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--hi)',
                    padding: '4px',
                    fontSize: '12px',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              )}
              <input
                type="number"
                value={row.freq}
                onChange={(e) => handleRowChange(idx, 'freq', e.target.value)}
                style={{
                  width: '60px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--hi)',
                  padding: '4px',
                  fontSize: '12px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => removeRow(idx)}
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'rgba(242, 139, 130, 0.1)',
                  color: 'var(--err)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Table actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={addRow}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--hi)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 0',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            + Add Row
          </button>
          <button
            onClick={clearTable}
            style={{
              flex: 1,
              background: 'rgba(242, 139, 130, 0.05)',
              color: 'var(--err)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 0',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Clear Table
          </button>
        </div>
      </div>

      {/* Summary Calc button */}
      <button
        onClick={handleCalculateBasic}
        style={{
          background: 'var(--bg-sci)',
          color: 'var(--sci)',
          border: 'none',
          borderRadius: '12px',
          padding: '10px 0',
          fontWeight: 600,
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        Calculate Mean & Std Dev
      </button>

      {/* Normal Distribution tool */}
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
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Normal Probabilities (using computed μ & σ)</span>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Value x:</span>
          <input
            type="number"
            value={normX}
            onChange={(e) => setNormX(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--hi)',
              padding: '6px',
              fontSize: '12px',
              textAlign: 'center',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleNormalPDF}
            style={{
              flex: 1,
              background: 'var(--bg4)',
              color: 'var(--fn)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            PDF (density)
          </button>
          <button
            onClick={handleNormalCDF}
            style={{
              flex: 1,
              background: 'var(--bg4)',
              color: 'var(--fn)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            CDF (cumulative)
          </button>
        </div>
      </div>

    </div>
  );
}

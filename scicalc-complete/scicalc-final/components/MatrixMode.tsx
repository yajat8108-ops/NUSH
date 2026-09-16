'use client';

import React, { useState, useEffect } from 'react';
import { useStore, type MatrixData } from '@/lib/store';
import { getCalcModule } from '@/lib/wasm';
import { formatNumber } from '@/lib/calculator';
import { hapticFeedback } from '@/lib/utils';

interface MatrixModeProps {
  onOutputResult: (val: string, expr: string) => void;
}

export default function MatrixMode({ onOutputResult }: MatrixModeProps) {
  const { matrices, setMatrix } = useStore();
  
  const [selectedMat, setSelectedMat] = useState<string>('MatA');
  const [opLeft, setOpLeft] = useState<string>('MatA');
  const [opRight, setOpRight] = useState<string>('MatB');
  const [scalarVal, setScalarVal] = useState<string>('2');

  const currentMatrix = matrices[selectedMat] || { rows: 3, cols: 3, data: new Array(9).fill(0) };

  const handleDimensionChange = (rows: number, cols: number) => {
    const newData = new Array(rows * cols).fill(0);
    // Copy old data where possible
    for (let r = 0; r < Math.min(rows, currentMatrix.rows); r++) {
      for (let c = 0; c < Math.min(cols, currentMatrix.cols); c++) {
        newData[r * cols + c] = currentMatrix.data[r * currentMatrix.cols + c] || 0;
      }
    }
    setMatrix(selectedMat, { rows, cols, data: newData });
  };

  const handleCellChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newData = [...currentMatrix.data];
    newData[index] = num;
    setMatrix(selectedMat, { ...currentMatrix, data: newData });
  };

  // ── Operations ────────────────────────────────────────────────────────────

  const handleDet = () => {
    const calc = getCalcModule();
    if (currentMatrix.rows !== currentMatrix.cols) {
      onOutputResult('Dimension Error: must be square', `det(${selectedMat})`);
      hapticFeedback('heavy');
      return;
    }
    try {
      const det = calc.matrixDeterminant(currentMatrix.data, currentMatrix.rows);
      const formatted = formatNumber(det);
      onOutputResult(formatted, `det(${selectedMat})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `det(${selectedMat})`);
      hapticFeedback('heavy');
    }
  };

  const handleInverse = () => {
    const calc = getCalcModule();
    if (currentMatrix.rows !== currentMatrix.cols) {
      onOutputResult('Dimension Error: must be square', `${selectedMat}⁻¹`);
      hapticFeedback('heavy');
      return;
    }
    try {
      const { success, data } = calc.matrixInverse(currentMatrix.data, currentMatrix.rows);
      if (!success) {
        onOutputResult('Singular Matrix: det = 0', `${selectedMat}⁻¹`);
        hapticFeedback('heavy');
      } else {
        // Format elements as a readable string
        const formattedRows: string[] = [];
        for (let r = 0; r < currentMatrix.rows; r++) {
          const rowVals = data.slice(r * currentMatrix.cols, (r + 1) * currentMatrix.cols).map(x => formatNumber(x));
          formattedRows.push(`[${rowVals.join(', ')}]`);
        }
        onOutputResult(formattedRows.join('\n'), `${selectedMat}⁻¹`);
        hapticFeedback('medium');
      }
    } catch {
      onOutputResult('Singular Matrix: det = 0', `${selectedMat}⁻¹`);
      hapticFeedback('heavy');
    }
  };

  const handleTranspose = () => {
    try {
      const res: number[] = new Array(currentMatrix.rows * currentMatrix.cols).fill(0);
      for (let r = 0; r < currentMatrix.rows; r++) {
        for (let c = 0; c < currentMatrix.cols; c++) {
          res[c * currentMatrix.rows + r] = currentMatrix.data[r * currentMatrix.cols + c];
        }
      }
      const formattedRows: string[] = [];
      for (let r = 0; r < currentMatrix.cols; r++) {
        const rowVals = res.slice(r * currentMatrix.rows, (r + 1) * currentMatrix.rows).map(x => formatNumber(x));
        formattedRows.push(`[${rowVals.join(', ')}]`);
      }
      onOutputResult(formattedRows.join('\n'), `transpose(${selectedMat})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `transpose(${selectedMat})`);
      hapticFeedback('heavy');
    }
  };

  const handleMultiply = () => {
    const calc = getCalcModule();
    const left = matrices[opLeft];
    const right = matrices[opRight];
    if (!left || !right) return;

    if (left.cols !== right.rows) {
      onOutputResult('Dimension Error: cols A ≠ rows B', `${opLeft} × ${opRight}`);
      hapticFeedback('heavy');
      return;
    }

    try {
      const res = calc.matrixMultiply(left.data, left.rows, left.cols, right.data, right.rows, right.cols);
      const formattedRows: string[] = [];
      for (let r = 0; r < left.rows; r++) {
        const rowVals = res.slice(r * right.cols, (r + 1) * right.cols).map(x => formatNumber(x));
        formattedRows.push(`[${rowVals.join(', ')}]`);
      }
      onOutputResult(formattedRows.join('\n'), `${opLeft} × ${opRight}`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `${opLeft} × ${opRight}`);
      hapticFeedback('heavy');
    }
  };

  const handleAddSub = (op: '+' | '-') => {
    const left = matrices[opLeft];
    const right = matrices[opRight];
    if (!left || !right) return;

    if (left.rows !== right.rows || left.cols !== right.cols) {
      onOutputResult('Dimension Error: dims must match', `${opLeft} ${op} ${opRight}`);
      hapticFeedback('heavy');
      return;
    }

    try {
      const res = left.data.map((val, idx) => op === '+' ? val + right.data[idx] : val - right.data[idx]);
      const formattedRows: string[] = [];
      for (let r = 0; r < left.rows; r++) {
        const rowVals = res.slice(r * left.cols, (r + 1) * left.cols).map(x => formatNumber(x));
        formattedRows.push(`[${rowVals.join(', ')}]`);
      }
      onOutputResult(formattedRows.join('\n'), `${opLeft} ${op} ${opRight}`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `${opLeft} ${op} ${opRight}`);
      hapticFeedback('heavy');
    }
  };

  const handleScalarMul = () => {
    const k = parseFloat(scalarVal);
    if (isNaN(k)) {
      onOutputResult('Syntax Error: invalid scalar', `k × ${selectedMat}`);
      hapticFeedback('heavy');
      return;
    }
    try {
      const res = currentMatrix.data.map(x => x * k);
      const formattedRows: string[] = [];
      for (let r = 0; r < currentMatrix.rows; r++) {
        const rowVals = res.slice(r * currentMatrix.cols, (r + 1) * currentMatrix.cols).map(x => formatNumber(x));
        formattedRows.push(`[${rowVals.join(', ')}]`);
      }
      onOutputResult(formattedRows.join('\n'), `${k} × ${selectedMat}`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', `${k} × ${selectedMat}`);
      hapticFeedback('heavy');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key;
      if (key === '+') { e.preventDefault(); handleAddSub('+'); }
      else if (key === '-') { e.preventDefault(); handleAddSub('-'); }
      else if (key === '*') { e.preventDefault(); handleMultiply(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMat, opLeft, opRight, scalarVal, matrices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['MatA', 'MatB', 'MatC', 'MatD'].map((name) => (
          <button
            key={name}
            onClick={() => setSelectedMat(name)}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: selectedMat === name ? 'var(--bg-sci)' : 'var(--bg2)',
              color: selectedMat === name ? 'var(--sci)' : 'var(--mid)',
              borderBottom: selectedMat === name ? '2px solid var(--sci)' : 'none',
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Resize Matrix */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Dimensions</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '2x2', r: 2, c: 2 },
            { label: '3x3', r: 3, c: 3 },
            { label: '4x4', r: 4, c: 4 },
            { label: '3x1', r: 3, c: 1 },
          ].map((dim) => (
            <button
              key={dim.label}
              onClick={() => handleDimensionChange(dim.r, dim.c)}
              style={{
                fontSize: '10px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: currentMatrix.rows === dim.r && currentMatrix.cols === dim.c ? 'var(--bg3)' : 'transparent',
                color: 'var(--hi)',
                cursor: 'pointer',
              }}
            >
              {dim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Editor with visual brackets */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '4px 0' }}>
        <div
          style={{
            display: 'flex',
            position: 'relative',
            padding: '12px 18px',
            borderLeft: '2px solid var(--accent)',
            borderRight: '2px solid var(--accent)',
            borderRadius: '6px',
            width: '100%',
          }}
        >
          {/* Top/bottom bracket tick marks */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '2px', background: 'var(--accent)' }}></div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '2px', background: 'var(--accent)' }}></div>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '2px', background: 'var(--accent)' }}></div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '2px', background: 'var(--accent)' }}></div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${currentMatrix.cols}, 1fr)`,
              gap: '6px',
              width: '100%',
            }}
          >
            {currentMatrix.data.map((val, idx) => (
              <input
                key={idx}
                type="number"
                value={val || ''}
                placeholder="0"
                onChange={(e) => handleCellChange(idx, e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--hi)',
                  padding: '6px 2px',
                  fontSize: '13px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Single Matrix Operations */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleDet}
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
          det
        </button>
        <button
          onClick={handleInverse}
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
          inv (⁻¹)
        </button>
        <button
          onClick={handleTranspose}
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
          transpose
        </button>
      </div>

      {/* Scalar Multiplication */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Scalar Mul:</span>
        <input
          type="number"
          value={scalarVal}
          onChange={(e) => setScalarVal(e.target.value)}
          style={{
            width: '60px',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--hi)',
            padding: '6px',
            fontSize: '12px',
            textAlign: 'center',
            outline: 'none',
          }}
        />
        <button
          onClick={handleScalarMul}
          style={{
            flex: 1,
            background: 'var(--bg3)',
            color: 'var(--hi)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 0',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Multiply Selected
        </button>
      </div>

      {/* Dual Matrix Operations */}
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
        <span style={{ fontSize: '11px', color: 'var(--mid)', display: 'block' }}>Matrix Arithmetic</span>
        
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
            {['MatA', 'MatB', 'MatC', 'MatD'].map(n => <option key={n} value={n}>{n}</option>)}
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
            {['MatA', 'MatB', 'MatC', 'MatD'].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => handleAddSub('+')}
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
            +
          </button>
          <button
            onClick={() => handleAddSub('-')}
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
            -
          </button>
          <button
            onClick={handleMultiply}
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
            ×
          </button>
        </div>
      </div>

    </div>
  );
}

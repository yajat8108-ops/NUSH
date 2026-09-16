'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getCalcModule } from '@/lib/wasm';
import { formatNumber } from '@/lib/calculator';
import { hapticFeedback } from '@/lib/utils';

interface ComplexModeProps {
  onOutputResult: (val: string, expr: string) => void;
}

export default function ComplexMode({ onOutputResult }: ComplexModeProps) {
  const { complexFormat, setComplexFormat } = useStore();
  
  // z1 state
  const [z1InputType, setZ1InputType] = useState<'rect' | 'polar'>('rect');
  const [z1Val1, setZ1Val1] = useState('3'); // Real or Magn
  const [z1Val2, setZ1Val2] = useState('4'); // Imag or Angle

  // z2 state
  const [z2InputType, setZ2InputType] = useState<'rect' | 'polar'>('rect');
  const [z2Val1, setZ2Val1] = useState('1'); // Real or Magn
  const [z2Val2, setZ2Val2] = useState('-2'); // Imag or Angle

  // Helper to get rectangular coordinates for a given input
  const getRectCoords = (type: 'rect' | 'polar', v1Str: string, v2Str: string): [number, number] => {
    const calc = getCalcModule();
    const v1 = parseFloat(v1Str) || 0;
    const v2 = parseFloat(v2Str) || 0;
    if (type === 'rect') {
      return [v1, v2];
    } else {
      // Polar: v1 = magnitude r, v2 = angle theta
      const isDeg = calc.getAngleMode() === 0;
      const theta = isDeg ? v2 * (Math.PI / 180) : v2;
      return [v1 * Math.cos(theta), v1 * Math.sin(theta)];
    }
  };

  // Helper to format rectangular coordinates according to preferences
  const formatComplex = (r: number, i: number, prefFormat: 'rect' | 'polar'): string => {
    const calc = getCalcModule();
    if (isNaN(r) || isNaN(i)) return 'Math Error';
    if (!isFinite(r) || !isFinite(i)) return 'Overflow';

    if (prefFormat === 'rect') {
      const rStr = formatNumber(r);
      const absI = Math.abs(i);
      const iStr = formatNumber(absI);
      if (Math.abs(i) < 1e-12) return rStr;
      if (Math.abs(r) < 1e-12) return `${i < 0 ? '-' : ''}${iStr}i`;
      return `${rStr} ${i < 0 ? '-' : '+'} ${iStr}i`;
    } else {
      // Polar format: r ∠ θ
      const mag = Math.sqrt(r * r + i * i);
      let angle = Math.atan2(i, r);
      if (calc.getAngleMode() === 0) {
        angle = angle * (180 / Math.PI);
      }
      return `${formatNumber(mag)} ∠ ${formatNumber(angle)}${calc.getAngleMode() === 0 ? '°' : ' rad'}`;
    }
  };

  // ── Arithmetic Operations ──────────────────────────────────────────────────

  const handleArithmetic = (op: '+' | '-' | '*' | '/' | '^') => {
    const calc = getCalcModule();
    try {
      const [r1, i1] = getRectCoords(z1InputType, z1Val1, z1Val2);
      const [r2, i2] = getRectCoords(z2InputType, z2Val1, z2Val2);

      let res: [number, number] = [0, 0];
      let opSym = '';

      if (op === '/' && r2 === 0 && i2 === 0) {
        onOutputResult('Division by zero', 'Complex OP');
        hapticFeedback('heavy');
        return;
      }

      switch (op) {
        case '+':
          res = calc.complexAdd(r1, i1, r2, i2);
          opSym = '+';
          break;
        case '-':
          res = calc.complexSubtract(r1, i1, r2, i2);
          opSym = '-';
          break;
        case '*':
          res = calc.complexMultiply(r1, i1, r2, i2);
          opSym = '×';
          break;
        case '/':
          res = calc.complexDivide(r1, i1, r2, i2);
          opSym = '÷';
          break;
        case '^':
          res = calc.complexPower(r1, i1, r2, i2);
          opSym = '^';
          break;
      }

      const formatted = formatComplex(res[0], res[1], complexFormat);
      
      const z1Str = z1InputType === 'rect' ? `(${z1Val1} + ${z1Val2}i)` : `(${z1Val1} ∠ ${z1Val2})`;
      const z2Str = z2InputType === 'rect' ? `(${z2Val1} + ${z2Val2}i)` : `(${z2Val1} ∠ ${z2Val2})`;

      onOutputResult(formatted, `${z1Str} ${opSym} ${z2Str}`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', 'Complex OP');
      hapticFeedback('heavy');
    }
  };

  // ── Single Functions ───────────────────────────────────────────────────────

  const handleFunction = (fn: 'abs' | 'arg' | 'conj' | 'sqrt' | 'log' | 'exp' | 'sin' | 'cos' | 'tan') => {
    const calc = getCalcModule();
    try {
      const [r, i] = getRectCoords(z1InputType, z1Val1, z1Val2);
      const z1Str = z1InputType === 'rect' ? `(${z1Val1} + ${z1Val2}i)` : `(${z1Val1} ∠ ${z1Val2})`;

      let outputVal = '';
      let exprLabel = '';

      switch (fn) {
        case 'abs':
          outputVal = formatNumber(calc.complexAbs(r, i));
          exprLabel = `|${z1Str}|`;
          break;
        case 'arg': {
          let argVal = calc.complexArg(r, i);
          if (calc.getAngleMode() === 0) {
            argVal = argVal * (180 / Math.PI);
          }
          outputVal = formatNumber(argVal) + (calc.getAngleMode() === 0 ? '°' : ' rad');
          exprLabel = `arg(${z1Str})`;
          break;
        }
        case 'conj': {
          const res = calc.complexConjugate(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `conj(${z1Str})`;
          break;
        }
        case 'sqrt': {
          const res = calc.complexSqrt(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `√(${z1Str})`;
          break;
        }
        case 'log': {
          if (r === 0 && i === 0) {
            onOutputResult('Domain Error', `ln(${z1Str})`);
            return;
          }
          const res = calc.complexLog(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `ln(${z1Str})`;
          break;
        }
        case 'exp': {
          const res = calc.complexExp(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `e^(${z1Str})`;
          break;
        }
        case 'sin': {
          const res = calc.complexSine(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `sin(${z1Str})`;
          break;
        }
        case 'cos': {
          const res = calc.complexCosine(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `cos(${z1Str})`;
          break;
        }
        case 'tan': {
          const res = calc.complexTangent(r, i);
          outputVal = formatComplex(res[0], res[1], complexFormat);
          exprLabel = `tan(${z1Str})`;
          break;
        }
      }

      onOutputResult(outputVal, exprLabel);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Math Error', 'Complex Fn');
      hapticFeedback('heavy');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key;
      if (key === '+') { e.preventDefault(); handleArithmetic('+'); }
      else if (key === '-') { e.preventDefault(); handleArithmetic('-'); }
      else if (key === '*') { e.preventDefault(); handleArithmetic('*'); }
      else if (key === '/') { e.preventDefault(); handleArithmetic('/'); }
      else if (key === '^') { e.preventDefault(); handleArithmetic('^'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [z1InputType, z1Val1, z1Val2, z2InputType, z2Val1, z2Val2, complexFormat]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Result Display Format Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Output Format</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setComplexFormat('rect')}
            style={{
              fontSize: '10px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: complexFormat === 'rect' ? 'var(--bg3)' : 'transparent',
              color: 'var(--hi)',
              cursor: 'pointer',
            }}
          >
            a + bi (Rectangular)
          </button>
          <button
            onClick={() => setComplexFormat('polar')}
            style={{
              fontSize: '10px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: complexFormat === 'polar' ? 'var(--bg3)' : 'transparent',
              color: 'var(--hi)',
              cursor: 'pointer',
            }}
          >
            r ∠ θ (Polar)
          </button>
        </div>
      </div>

      {/* Z1 Entry */}
      <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--sci)' }}>Complex Number z₁</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setZ1InputType('rect')}
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                border: 'none',
                background: z1InputType === 'rect' ? 'var(--bg4)' : 'transparent',
                color: 'var(--hi)',
                cursor: 'pointer',
              }}
            >
              Rect
            </button>
            <button
              onClick={() => setZ1InputType('polar')}
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                border: 'none',
                background: z1InputType === 'polar' ? 'var(--bg4)' : 'transparent',
                color: 'var(--hi)',
                cursor: 'pointer',
              }}
            >
              Polar
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={z1Val1}
              onChange={(e) => setZ1Val1(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--hi)',
                padding: '8px',
                fontSize: '13px',
                textAlign: 'center',
                outline: 'none',
              }}
              placeholder={z1InputType === 'rect' ? 'Real (a)' : 'Magnitude (r)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--mid)' }}>
            {z1InputType === 'rect' ? '+' : '∠'}
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={z1Val2}
              onChange={(e) => setZ1Val2(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--hi)',
                padding: '8px',
                fontSize: '13px',
                textAlign: 'center',
                outline: 'none',
              }}
              placeholder={z1InputType === 'rect' ? 'Imaginary (b)' : 'Angle (θ)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--mid)', fontSize: '13px' }}>
            {z1InputType === 'rect' ? 'i' : ''}
          </div>
        </div>
      </div>

      {/* Z2 Entry */}
      <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--sci)' }}>Complex Number z₂</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setZ2InputType('rect')}
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                border: 'none',
                background: z2InputType === 'rect' ? 'var(--bg4)' : 'transparent',
                color: 'var(--hi)',
                cursor: 'pointer',
              }}
            >
              Rect
            </button>
            <button
              onClick={() => setZ2InputType('polar')}
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                border: 'none',
                background: z2InputType === 'polar' ? 'var(--bg4)' : 'transparent',
                color: 'var(--hi)',
                cursor: 'pointer',
              }}
            >
              Polar
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={z2Val1}
              onChange={(e) => setZ2Val1(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--hi)',
                padding: '8px',
                fontSize: '13px',
                textAlign: 'center',
                outline: 'none',
              }}
              placeholder={z2InputType === 'rect' ? 'Real (a)' : 'Magnitude (r)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--mid)' }}>
            {z2InputType === 'rect' ? '+' : '∠'}
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={z2Val2}
              onChange={(e) => setZ2Val2(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--hi)',
                padding: '8px',
                fontSize: '13px',
                textAlign: 'center',
                outline: 'none',
              }}
              placeholder={z2InputType === 'rect' ? 'Imaginary (b)' : 'Angle (θ)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--mid)', fontSize: '13px' }}>
            {z2InputType === 'rect' ? 'i' : ''}
          </div>
        </div>
      </div>

      {/* Arithmetic Grid */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['+', '-', '*', '/', '^'] as const).map((op) => (
          <button
            key={op}
            onClick={() => handleArithmetic(op)}
            style={{
              flex: 1,
              background: 'var(--bg-op)',
              color: 'var(--op)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 0',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {op === '*' ? '×' : op === '/' ? '÷' : op}
          </button>
        ))}
      </div>

      {/* Complex Functions Grid */}
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
        <span style={{ fontSize: '11px', color: 'var(--mid)' }}>Functions on z₁</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: '|z|', fn: 'abs' as const },
            { label: 'arg', fn: 'arg' as const },
            { label: 'conj', fn: 'conj' as const },
            { label: '√z', fn: 'sqrt' as const },
            { label: 'ln', fn: 'log' as const },
            { label: 'eᶻ', fn: 'exp' as const },
            { label: 'sin', fn: 'sin' as const },
            { label: 'cos', fn: 'cos' as const },
            { label: 'tan', fn: 'tan' as const },
          ].map((item) => (
            <button
              key={item.fn}
              onClick={() => handleFunction(item.fn)}
              style={{
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
              {item.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

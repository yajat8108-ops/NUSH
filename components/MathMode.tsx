'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { evaluateExpression, formatNumber } from '@/lib/calculator';
import { getCalcModule } from '@/lib/wasm';
import { hapticFeedback } from '@/lib/utils';

interface MathModeProps {
  onOutputResult: (val: string, expr: string) => void;
}

export default function MathMode({ onOutputResult }: MathModeProps) {
  const [subMode, setSubMode] = useState<'integral' | 'derivative' | 'solver'>('integral');
  
  // Integration state
  const [intExpr, setIntExpr] = useState('X^2');
  const [intA, setIntA] = useState('0');
  const [intB, setIntB] = useState('1');
  const [intRes, setIntRes] = useState<string>('');

  // Derivative state
  const [derivExpr, setDerivExpr] = useState('sin(X)');
  const [derivX0, setDerivX0] = useState('0');
  const [derivRes, setDerivRes] = useState<string>('');

  // Solver state
  const [solverType, setSolverType] = useState<'quadratic' | 'cubic'>('quadratic');
  const [coeffA, setCoeffA] = useState('1');
  const [coeffB, setCoeffB] = useState('-5');
  const [coeffC, setCoeffC] = useState('6');
  const [coeffD, setCoeffD] = useState('0');
  const [solverRes, setSolverRes] = useState<string[]>([]);

  // ── Perform Integration ───────────────────────────────────────────────────
  const handleIntegrate = useCallback(() => {
    const calc = getCalcModule();
    try {
      const a = parseFloat(intA);
      const b = parseFloat(intB);
      if (isNaN(a) || isNaN(b)) {
        setIntRes('Syntax Error: invalid limits');
        hapticFeedback('heavy');
        return;
      }
      
      // Simpson's rule with N = 1000
      const N = 1000;
      const h = (b - a) / N;
      
      const evalFn = (x: number) => {
        const { result, error } = evaluateExpression(intExpr, calc, { X: x });
        if (error) throw new Error(error);
        return result;
      };

      let sum = evalFn(a) + evalFn(b);
      for (let i = 1; i < N; i += 2) {
        sum += 4 * evalFn(a + i * h);
      }
      for (let i = 2; i < N - 1; i += 2) {
        sum += 2 * evalFn(a + i * h);
      }
      const integral = (h / 3) * sum;
      
      if (isNaN(integral) || !isFinite(integral)) {
        setIntRes('Domain Error');
        hapticFeedback('heavy');
      } else {
        const formatted = formatNumber(integral);
        setIntRes(formatted);
        onOutputResult(formatted, `∫(${intExpr}, ${a}, ${b})`);
        hapticFeedback('medium');
      }
    } catch (err: any) {
      setIntRes(err.message || 'Math Error');
      hapticFeedback('heavy');
    }
  }, [intExpr, intA, intB, onOutputResult]);

  // ── Perform Derivative ────────────────────────────────────────────────────
  const handleDerivative = useCallback(() => {
    const calc = getCalcModule();
    try {
      const x0 = parseFloat(derivX0);
      if (isNaN(x0)) {
        setDerivRes('Syntax Error: invalid x');
        hapticFeedback('heavy');
        return;
      }

      const evalFn = (x: number) => {
        const { result, error } = evaluateExpression(derivExpr, calc, { X: x });
        if (error) throw new Error(error);
        return result;
      };

      // Central difference method
      const h = 1e-6;
      const deriv = (evalFn(x0 + h) - evalFn(x0 - h)) / (2 * h);

      if (isNaN(deriv) || !isFinite(deriv)) {
        setDerivRes('Domain Error');
        hapticFeedback('heavy');
      } else {
        const formatted = formatNumber(deriv);
        setDerivRes(formatted);
        onOutputResult(formatted, `d/dx(${derivExpr}) @ x=${x0}`);
        hapticFeedback('medium');
      }
    } catch (err: any) {
      setDerivRes(err.message || 'Math Error');
      hapticFeedback('heavy');
    }
  }, [derivExpr, derivX0, onOutputResult]);

  // ── Perform Equation Solving ──────────────────────────────────────────────
  const handleSolve = useCallback(() => {
    const calc = getCalcModule();
    try {
      const a = parseFloat(coeffA);
      const b = parseFloat(coeffB);
      const c = parseFloat(coeffC);
      const d = parseFloat(coeffD);

      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        setSolverRes(['Syntax Error: invalid coeffs']);
        hapticFeedback('heavy');
        return;
      }

      if (Math.abs(a) < 1e-12) {
        setSolverRes(['Invalid Solver: a = 0']);
        hapticFeedback('heavy');
        return;
      }

      if (solverType === 'quadratic') {
        const disc = b * b - 4 * a * c;
        if (disc < 0) {
          setSolverRes(['No Real Roots (disc < 0)']);
          hapticFeedback('heavy');
          return;
        }
        const roots = calc.quadratic(a, b, c);
        if (isNaN(roots[0])) {
          setSolverRes(['No Real Roots']);
          hapticFeedback('heavy');
        } else {
          const res = [formatNumber(roots[0]), formatNumber(roots[1])];
          setSolverRes(res);
          onOutputResult(`x1=${res[0]}, x2=${res[1]}`, `${a}x²+(${b})x+(${c})=0`);
          hapticFeedback('medium');
        }
      } else {
        if (isNaN(d)) {
          setSolverRes(['Syntax Error: invalid d']);
          hapticFeedback('heavy');
          return;
        }
        const roots = calc.cubic(a, b, c, d);
        const validRoots = roots.filter(r => !isNaN(r));
        if (validRoots.length === 0) {
          setSolverRes(['No Real Roots']);
          hapticFeedback('heavy');
        } else {
          const res = validRoots.map(r => formatNumber(r));
          setSolverRes(res);
          onOutputResult(res.join(', '), `${a}x³+(${b})x²+(${c})x+(${d})=0`);
          hapticFeedback('medium');
        }
      }
    } catch {
      setSolverRes(['Math Error']);
      hapticFeedback('heavy');
    }
  }, [solverType, coeffA, coeffB, coeffC, coeffD, onOutputResult]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'Enter') {
        e.preventDefault();
        if (subMode === 'integral') handleIntegrate();
        else if (subMode === 'derivative') handleDerivative();
        else if (subMode === 'solver') handleSolve();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    subMode, intExpr, intA, intB, derivExpr, derivX0, solverType, coeffA, coeffB, coeffC, coeffD,
    handleIntegrate, handleDerivative, handleSolve
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Submode Selection */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg2)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid var(--border)',
        }}
      >
        {(['integral', 'derivative', 'solver'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSubMode(mode)}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: subMode === mode ? 'var(--bg4)' : 'transparent',
              color: subMode === mode ? 'var(--accent)' : 'var(--mid)',
              transition: 'var(--t)',
            }}
          >
            {mode === 'integral' ? '∫dx' : mode === 'derivative' ? 'd/dx' : 'Solver'}
          </button>
        ))}
      </div>

      {/* Render Submode Panels */}
      {subMode === 'integral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Integrand f(X)</label>
            <input
              type="text"
              value={intExpr}
              onChange={(e) => setIntExpr(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--hi)',
                padding: '8px 12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Lower Limit (a)</label>
              <input
                type="text"
                value={intA}
                onChange={(e) => setIntA(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--hi)',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Upper Limit (b)</label>
              <input
                type="text"
                value={intB}
                onChange={(e) => setIntB(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--hi)',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
          <button
            onClick={handleIntegrate}
            style={{
              background: 'var(--bg-sci)',
              color: 'var(--sci)',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Calculate Integral
          </button>
          {intRes && (
            <div
              style={{
                background: 'var(--bg2)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--mid)' }}>Result</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '4px' }}>{intRes}</div>
            </div>
          )}
        </div>
      )}

      {subMode === 'derivative' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Function f(X)</label>
            <input
              type="text"
              value={derivExpr}
              onChange={(e) => setDerivExpr(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--hi)',
                padding: '8px 12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Evaluate at X =</label>
            <input
              type="text"
              value={derivX0}
              onChange={(e) => setDerivX0(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--hi)',
                padding: '8px 12px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleDerivative}
            style={{
              background: 'var(--bg-sci)',
              color: 'var(--sci)',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Calculate Derivative
          </button>
          {derivRes && (
            <div
              style={{
                background: 'var(--bg2)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--mid)' }}>Result</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '4px' }}>{derivRes}</div>
            </div>
          )}
        </div>
      )}

      {subMode === 'solver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSolverType('quadratic')}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                background: solverType === 'quadratic' ? 'rgba(168, 199, 250, 0.1)' : 'var(--bg2)',
                color: solverType === 'quadratic' ? 'var(--accent)' : 'var(--mid)',
              }}
            >
              Quadratic (ax²+bx+c)
            </button>
            <button
              onClick={() => setSolverType('cubic')}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                background: solverType === 'cubic' ? 'rgba(168, 199, 250, 0.1)' : 'var(--bg2)',
                color: solverType === 'cubic' ? 'var(--accent)' : 'var(--mid)',
              }}
            >
              Cubic (ax³+bx²+cx+d)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--mid)', textAlign: 'center', display: 'block' }}>a</label>
              <input
                type="text"
                value={coeffA}
                onChange={(e) => setCoeffA(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--hi)',
                  padding: '6px',
                  fontSize: '13px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--mid)', textAlign: 'center', display: 'block' }}>b</label>
              <input
                type="text"
                value={coeffB}
                onChange={(e) => setCoeffB(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--hi)',
                  padding: '6px',
                  fontSize: '13px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--mid)', textAlign: 'center', display: 'block' }}>c</label>
              <input
                type="text"
                value={coeffC}
                onChange={(e) => setCoeffC(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--hi)',
                  padding: '6px',
                  fontSize: '13px',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>
            {solverType === 'cubic' && (
              <div>
                <label style={{ fontSize: '10px', color: 'var(--mid)', textAlign: 'center', display: 'block' }}>d</label>
                <input
                  type="text"
                  value={coeffD}
                  onChange={(e) => setCoeffD(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--hi)',
                    padding: '6px',
                    fontSize: '13px',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSolve}
            style={{
              background: 'var(--bg-sci)',
              color: 'var(--sci)',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '6px',
            }}
          >
            Solve Roots
          </button>

          {solverRes.length > 0 && (
            <div
              style={{
                background: 'var(--bg2)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--mid)', textAlign: 'center', marginBottom: '6px' }}>Real Roots</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {solverRes.map((r, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--mid)' }}>x{idx + 1} =</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

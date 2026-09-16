'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore, type BaseMode } from '@/lib/store';
import { formatNumber } from '@/lib/calculator';
import { hapticFeedback } from '@/lib/utils';

interface BaseNModeProps {
  onOutputResult: (val: string, expr: string) => void;
}

export default function BaseNMode({ onOutputResult }: BaseNModeProps) {
  const { baseMode, setBaseMode } = useStore();
  const [expr, setExpr] = useState('');
  const [resultVal, setResultVal] = useState<number>(0);

  // Map base mode to radix
  const radixMap: Record<BaseMode, number> = {
    HEX: 16,
    DEC: 10,
    OCT: 8,
    BIN: 2,
  };

  const currentRadix = radixMap[baseMode];

  // ── Simultaneous Base Conversions ──────────────────────────────────────────
  const hexDisplay = useMemo(() => resultVal.toString(16).toUpperCase(), [resultVal]);
  const decDisplay = useMemo(() => resultVal.toString(10), [resultVal]);
  const octDisplay = useMemo(() => resultVal.toString(8), [resultVal]);
  const binDisplay = useMemo(() => resultVal.toString(2), [resultVal]);

  const handleDigit = (digit: string) => {
    setExpr(prev => prev + digit);
    hapticFeedback('light');
  };

  const handleOperator = (op: string) => {
    // Add spaces around logical operators
    setExpr(prev => prev + ` ${op} `);
    hapticFeedback('light');
  };

  const handleClear = () => {
    setExpr('');
    setResultVal(0);
    hapticFeedback('light');
  };

  const handleBackspace = () => {
    hapticFeedback('light');
    if (expr.endsWith(' ')) {
      // Remove operator with trailing/leading spaces
      const trimmed = expr.trimEnd();
      const lastSpace = trimmed.lastIndexOf(' ');
      setExpr(lastSpace >= 0 ? trimmed.slice(0, lastSpace + 1) : '');
    } else {
      setExpr(prev => prev.slice(0, -1));
    }
  };

  // ── Parse and evaluate base-n expressions safely ──────────────────────────
  const handleEvaluate = () => {
    if (!expr.trim()) return;

    try {
      // 1. Tokenize: split by spaces but preserve parentheses as individual tokens
      const formattedExpr = expr.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim();
      const rawTokens = formattedExpr.split(/\s+/).filter(Boolean);
      
      // 2. Shunting-yard and evaluation
      const outputQueue: (number | string)[] = [];
      const opStack: string[] = [];
      
      const precedence: Record<string, number> = {
        'NOT': 4,
        'LSH': 3, 'RSH': 3,
        '*': 3, '/': 3,
        '+': 2, '-': 2,
        'AND': 1, 'XOR': 1, 'OR': 1
      };
      
      for (const token of rawTokens) {
        const upper = token.toUpperCase();
        if (['AND', 'OR', 'XOR', 'NOT', 'LSH', 'RSH', '+', '-', '*', '/'].includes(upper)) {
          while (
            opStack.length > 0 &&
            opStack[opStack.length - 1] !== '(' &&
            (precedence[opStack[opStack.length - 1]] || 0) >= precedence[upper]
          ) {
            outputQueue.push(opStack.pop()!);
          }
          opStack.push(upper);
        } else if (upper === '(') {
          opStack.push('(');
        } else if (upper === ')') {
          while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
            outputQueue.push(opStack.pop()!);
          }
          opStack.pop(); // pop '('
        } else {
          // Number parse in current base radix
          const val = parseInt(token, currentRadix);
          if (isNaN(val)) throw new Error('Invalid number');
          outputQueue.push(val);
        }
      }
      
      while (opStack.length > 0) {
        const op = opStack.pop()!;
        if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
        outputQueue.push(op);
      }
      
      // 3. Evaluate RPN stack
      const valStack: number[] = [];
      for (const token of outputQueue) {
        if (typeof token === 'number') {
          valStack.push(token);
        } else {
          if (token === 'NOT') {
            const x = valStack.pop() ?? 0;
            valStack.push(~x);
          } else {
            const b = valStack.pop() ?? 0;
            const a = valStack.pop() ?? 0;
            switch (token) {
              case '+': valStack.push(a + b); break;
              case '-': valStack.push(a - b); break;
              case '*': valStack.push(a * b); break;
              case '/': valStack.push(b === 0 ? 0 : Math.floor(a / b)); break;
              case 'AND': valStack.push(a & b); break;
              case 'OR': valStack.push(a | b); break;
              case 'XOR': valStack.push(a ^ b); break;
              case 'LSH': valStack.push(a << b); break;
              case 'RSH': valStack.push(a >> b); break;
              default: throw new Error('Unknown operator');
            }
          }
        }
      }
      
      const evalResult = (valStack[0] ?? 0) | 0;
      
      // Convert to positive 32-bit unsigned representation
      const unsignedResult = evalResult >>> 0;
      
      setResultVal(unsignedResult);
      const outputStr = unsignedResult.toString(currentRadix).toUpperCase();
      onOutputResult(outputStr, `${expr} (${baseMode})`);
      hapticFeedback('medium');
    } catch {
      onOutputResult('Syntax Error', expr);
      hapticFeedback('heavy');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toUpperCase();
      
      // Numbers and hex chars
      if (/^[0-9A-F]$/.test(key)) {
        if (!isDigitDisabled(key)) {
          e.preventDefault();
          handleDigit(key);
        }
        return;
      }
      
      // Operators
      if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        const opMap: Record<string, string> = { '*': '×', '/': '÷' };
        handleOperator(opMap[e.key] || e.key);
        return;
      }
      
      if (e.key === '&') { e.preventDefault(); handleOperator('AND'); return; }
      if (e.key === '|') { e.preventDefault(); handleOperator('OR'); return; }
      if (e.key === '^') { e.preventDefault(); handleOperator('XOR'); return; }
      if (e.key === '~') { e.preventDefault(); handleOperator('NOT'); return; }
      if (e.key === '<') { e.preventDefault(); handleOperator('LSH'); return; }
      if (e.key === '>') { e.preventDefault(); handleOperator('RSH'); return; }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
        return;
      }
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [baseMode, expr, resultVal]);

  // ── Disabled Digits configuration ──────────────────────────────────────────
  const isDigitDisabled = (digit: string): boolean => {
    const d = digit.toUpperCase();
    if (baseMode === 'BIN') {
      return !['0', '1'].includes(d);
    }
    if (baseMode === 'OCT') {
      return !['0', '1', '2', '3', '4', '5', '6', '7'].includes(d);
    }
    if (baseMode === 'DEC') {
      return !/[\d]/.test(d);
    }
    // HEX permits all 0-9, A-F
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Base Selectors & Simultaneous Previews */}
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
        {[
          { key: 'HEX' as BaseMode, val: hexDisplay },
          { key: 'DEC' as BaseMode, val: decDisplay },
          { key: 'OCT' as BaseMode, val: octDisplay },
          { key: 'BIN' as BaseMode, val: binDisplay },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => setBaseMode(item.key)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: baseMode === item.key ? 'rgba(168, 199, 250, 0.1)' : 'transparent',
              border: baseMode === item.key ? '1px solid var(--accent)' : '1px solid transparent',
              transition: 'var(--t)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: baseMode === item.key ? 'var(--accent)' : 'var(--mid)' }}>
              {item.key}
            </span>
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '13px',
                color: baseMode === item.key ? 'var(--hi)' : 'var(--lo)',
                maxWidth: '220px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'right',
              }}
            >
              {item.val}
            </span>
          </div>
        ))}
      </div>

      {/* Expression line */}
      <div
        style={{
          background: 'var(--bg2)',
          borderRadius: '12px',
          padding: '10px 14px',
          border: '1px solid var(--border)',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '14px',
          color: 'var(--hi)',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {expr || '0'}
      </div>

      {/* Custom Keypad for base-n */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Hex Digits Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {['A', 'B', 'C', 'D', 'E', 'F'].map(char => (
            <button
              key={char}
              onClick={() => handleDigit(char)}
              disabled={isDigitDisabled(char)}
              style={{
                background: 'var(--bg3)',
                color: isDigitDisabled(char) ? 'var(--lo)' : 'var(--sci)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 0',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: isDigitDisabled(char) ? 'default' : 'pointer',
                opacity: isDigitDisabled(char) ? 0.35 : 1,
              }}
            >
              {char}
            </button>
          ))}
        </div>

        {/* Logical operators row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {[
            { label: 'AND', val: 'AND' },
            { label: 'OR', val: 'OR' },
            { label: 'XOR', val: 'XOR' },
            { label: 'NOT', val: 'NOT' },
            { label: '<<', val: 'LSH' },
            { label: '>>', val: 'RSH' },
          ].map(op => (
            <button
              key={op.val}
              onClick={() => handleOperator(op.val)}
              style={{
                background: 'var(--bg4)',
                color: 'var(--fn)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 0',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Standard Digits grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {/* Numbers */}
          {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '⌫', 'AC', '+'].map((val) => {
            const isDigit = /^[0-9]$/.test(val);
            const isDisabled = isDigit && isDigitDisabled(val);

            let bg = 'var(--bg3)';
            let color = 'var(--hi)';

            if (['+', '-', '×', '÷'].includes(val)) {
              bg = 'var(--bg-op)';
              color = 'var(--op)';
            } else if (val === 'AC') {
              bg = 'var(--bg4)';
              color = 'var(--err)';
            } else if (val === '⌫') {
              bg = 'var(--bg4)';
              color = 'var(--mid)';
            }

            return (
              <button
                key={val}
                onClick={() => {
                  if (val === 'AC') handleClear();
                  else if (val === '⌫') handleBackspace();
                  else if (['+', '-', '×', '÷'].includes(val)) handleOperator(val);
                  else handleDigit(val);
                }}
                disabled={isDisabled}
                style={{
                  background: bg,
                  color: isDisabled ? 'var(--lo)' : color,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isDisabled ? 'default' : 'pointer',
                  opacity: isDisabled ? 0.35 : 1,
                }}
              >
                {val}
              </button>
            );
          })}
        </div>

        {/* Equals Button */}
        <button
          onClick={handleEvaluate}
          style={{
            background: 'var(--accent)',
            color: '#07162a',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 0',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '4px',
            boxShadow: '0 0 10px rgba(168, 199, 250, 0.3)',
          }}
        >
          =
        </button>

      </div>

    </div>
  );
}

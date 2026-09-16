'use client';

/**
 * components/Calculator.tsx
 * ============================================================================
 * Root calculator component. Manages all state, keyboard events, and WASM
 * integration. Uses a TABBED interface (Basic / Scientific / History).
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Display from './Display';
import Keypad from './Keypad';
import ScientificKeypad from './ScientificKeypad';
import HistoryPanel from './HistoryPanel';
import MathMode from './MathMode';
import MatrixMode from './MatrixMode';
import VectorMode from './VectorMode';
import StatisticsMode from './StatisticsMode';
import ComplexMode from './ComplexMode';
import BaseNMode from './BaseNMode';
import ConstantsPanel from './ConstantsPanel';
import GraphingMode from './GraphingMode';
import ProgramMode from './ProgramMode';
import SettingsPanel from './SettingsPanel';
import QrModal from './QrModal';
import VariableModal from './VariableModal';
import {
  formatNumber,
  formatNumberCompact,
  evaluateExpression,
  type AngleMode,
  type HistoryEntry,
} from '@/lib/calculator';
import { loadCalcModule, getCalcModule, type CalcModule } from '@/lib/wasm';
import { generateId, keyToButton, hapticFeedback, autoCloseParen, getOpenParenCount } from '@/lib/utils';
import { useStore } from '@/lib/store';

const MODES_LIST = [
  { key: 'basic', title: 'Calculate (Basic)', desc: 'Standard arithmetic & operators', icon: '🧮' },
  { key: 'scientific', title: 'Calculate (Sci)', desc: 'Trig, logs & scientific math', icon: '📐' },
  { key: 'complex', title: 'Complex', desc: 'Real & imaginary numbers', icon: 'i' },
  { key: 'base-n', title: 'Base-N', desc: 'Binary, octal, hex & logic', icon: '01' },
  { key: 'matrix', title: 'Matrix', desc: 'Dimension arrays up to 4x4', icon: '⦗⦘' },
  { key: 'vector', title: 'Vector', desc: '2D & 3D vector calculations', icon: '↗' },
  { key: 'statistics', title: 'Statistics', desc: 'Mean, stddev & normal dist', icon: '📊' },
  { key: 'math', title: 'Math Solver', desc: 'Integrals, derivatives & roots', icon: '∫' },
  { key: 'graphing', title: 'Graphing', desc: 'Plot mathematical functions', icon: '📈' },
  { key: 'program', title: 'Program', desc: 'Write & execute scripts', icon: '💻' },
  { key: 'constants', title: 'Constants', desc: 'Scientific values & converter', icon: 'c' },
  { key: 'history', title: 'History', desc: 'Calculation logs & replay', icon: '⏳' },
  { key: 'settings', title: 'Settings', desc: 'App configuration & theme', icon: '⚙' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Calculator() {
  // ── Zustand Store ──────────────────────────────────────────────────────────
  const { activeTab, setActiveTab, variables, setVariable, ans, setAns, history, addHistoryEntry, removeHistoryEntry, clearHistory, theme, toggleTheme } = useStore();

  // ── State ──────────────────────────────────────────────────────────────────
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [invMode, setInvMode] = useState(false);          // INV toggle
  const [isWasm, setIsWasm] = useState(false);

  // Modal open states
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isVarsOpen, setIsVarsOpen] = useState(false);
  const [isModesOpen, setIsModesOpen] = useState(false);

  // Display state
  const [primaryDisplay, setPrimaryDisplay] = useState('0');
  const [expressionDisplay, setExpressionDisplay] = useState('');
  const [liveResult, setLiveResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculator logic state
  const [currentInput, setCurrentInput] = useState('');
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);

  // Memory
  const memory = variables.M;
  const memoryHasValue = variables.M !== 0;

  // History
  // (Now synced from Zustand store)

  // Refs
  const calcRef = useRef<CalcModule>(getCalcModule());
  const tabsRef = useRef<HTMLDivElement>(null);

  // Variables map for tokenizer/parser
  const evalVars = useMemo(() => ({ ...variables, Ans: ans }), [variables, ans]);

  // Replay Draft & History index
  const [draftExpr, setDraftExpr] = useState({ expression: '', currentInput: '', primaryDisplay: '0' });
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ── WASM Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadCalcModule().then((mod) => {
      calcRef.current = mod;
      setIsWasm(mod.isWasm);
      mod.setAngleMode(0); // Start in degrees
    });
  }, []);

  // ── Tabs Mousewheel Horizontal Scroll ──────────────────────────────────────
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Live Preview ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!expression && !currentInput) {
      setLiveResult('');
      return;
    }
    const fullExpr = expression + currentInput;
    if (!fullExpr.trim() || fullExpr === '−' || fullExpr === '+') {
      setLiveResult('');
      return;
    }
    try {
      const closed = autoCloseParen(fullExpr);
      const { result, error: evalError } = evaluateExpression(closed, calcRef.current, evalVars);
      if (evalError) {
        setLiveResult('');
      } else if (isFinite(result) && !isNaN(result)) {
        const formatted = formatNumber(result);
        // Only show preview if different from current display
        if (formatted !== primaryDisplay) {
          setLiveResult(formatted);
        } else {
          setLiveResult('');
        }
      }
    } catch {
      setLiveResult('');
    }
  }, [expression, currentInput, primaryDisplay, angleMode, evalVars]);

  // ── Input Handlers ─────────────────────────────────────────────────────────

  const handleNumber = useCallback((num: string) => {
    setError(null);
    if (justEvaluated) {
      // Start fresh after evaluation
      setExpression('');
      setExpressionDisplay('');
      setCurrentInput(num === '.' ? '0.' : num);
      setPrimaryDisplay(num === '.' ? '0.' : num);
      setJustEvaluated(false);
      return;
    }
    let newInput = currentInput;
    if (num === '.') {
      if (newInput.includes('.')) return; // Already has decimal
      if (!newInput || newInput === '-') newInput += '0';
      newInput += '.';
    } else {
      if (newInput === '0' && num !== '.') newInput = num;
      else newInput += num;
    }
    // Limit input length
    if (newInput.replace(/[^0-9]/g, '').length > 15) return;
    setCurrentInput(newInput);
    setPrimaryDisplay(newInput);
  }, [currentInput, justEvaluated]);

  const handleOperator = useCallback((op: string) => {
    setError(null);
    const val = currentInput || (justEvaluated && lastResult !== null
      ? formatNumberCompact(lastResult) : '0');

    if (justEvaluated && lastResult !== null) {
      // Continue from last result
      setExpression(formatNumberCompact(lastResult) + ' ' + op + ' ');
      setExpressionDisplay(formatNumberCompact(lastResult) + ' ' + op + ' ');
      setCurrentInput('');
      setJustEvaluated(false);
      return;
    }

    const newExpr = expression + val + ' ' + op + ' ';
    setExpression(newExpr);
    setExpressionDisplay(newExpr);
    setCurrentInput('');
  }, [currentInput, expression, justEvaluated, lastResult]);

  const handleFunction = useCallback((fn: string) => {
    setError(null);
    if (justEvaluated && lastResult !== null) {
      setCurrentInput('');
      setExpression(fn);
      setExpressionDisplay(fn);
      setPrimaryDisplay('0');
      setJustEvaluated(false);
      return;
    }
    // If there's a current number, wrap it
    if (currentInput && fn.endsWith('(')) {
      setExpression(expression + fn + currentInput + ')');
      setExpressionDisplay(expression + fn + currentInput + ')');
      setCurrentInput('');
    } else {
      setExpression(expression + fn);
      setExpressionDisplay(expression + fn);
    }
  }, [currentInput, expression, justEvaluated, lastResult]);

  const handleEquals = useCallback(() => {
    setError(null);
    setHistoryIndex(-1);
    const fullExpr = autoCloseParen(expression + currentInput);
    if (!fullExpr.trim()) return;

    const { result, error: evalError } = evaluateExpression(fullExpr, calcRef.current, evalVars);

    const histExpr = fullExpr + ' =';
    const histResult = isNaN(result) || !isFinite(result)
      ? (evalError ?? 'Error')
      : formatNumber(result);

    // Add to history
    const entry: HistoryEntry = {
      id: generateId(),
      expression: histExpr,
      result: histResult,
      timestamp: Date.now(),
    };
    addHistoryEntry(entry);

    if (evalError) {
      setError(evalError);
      setExpressionDisplay(fullExpr + ' =');
      setPrimaryDisplay('Error');
      setCurrentInput('');
      setLastResult(null);
    } else {
      const formatted = formatNumber(result);
      setExpressionDisplay(fullExpr + ' =');
      setPrimaryDisplay(formatted);
      setCurrentInput('');
      setExpression('');
      setLastResult(result);
      setAns(result);
      setJustEvaluated(true);
    }
    hapticFeedback('medium');
  }, [expression, currentInput, evalVars, setAns]);

  const handleClear = useCallback((type: 'AC' | 'DEL') => {
    setError(null);
    setHistoryIndex(-1);
    if (type === 'AC') {
      setPrimaryDisplay('0');
      setExpressionDisplay('');
      setExpression('');
      setCurrentInput('');
      setLiveResult('');
      setJustEvaluated(false);
      setLastResult(null);
    } else {
      // Backspace
      if (justEvaluated) {
        setJustEvaluated(false);
        setExpression('');
        setCurrentInput('');
        setPrimaryDisplay('0');
        return;
      }
      if (currentInput.length > 0) {
        const newInput = currentInput.slice(0, -1);
        setCurrentInput(newInput);
        setPrimaryDisplay(newInput || '0');
        } else if (expression.length > 0) {
          // If expression Display is longer or different due to special tokens, we just derive it
          // Wait, deriving expressionDisplay requires parsing, but we can just use slice since 
          // we now append exact characters in most cases.
          // To be perfectly safe, we'll slice both.
          
          let newExpr = expression;
          let newExprDisp = expressionDisplay;
          
          if (expression.endsWith('^2') || expression.endsWith('^3')) {
            newExpr = expression.slice(0, -2);
            newExprDisp = expressionDisplay.slice(0, -1);
          } else if (expression.endsWith(' ')) {
            // " + " -> remove 3 chars
            newExpr = expression.slice(0, -3);
            newExprDisp = expressionDisplay.slice(0, -3);
          } else {
            newExpr = expression.slice(0, -1);
            // Sync fallback: if expressionDisplay isn't perfectly mapped, just slice 1
            newExprDisp = expressionDisplay.slice(0, -1);
          }
          
          setExpression(newExpr);
          setExpressionDisplay(newExprDisp);
        }
      }
  }, [currentInput, expression, expressionDisplay, justEvaluated]);

  const handleSpecial = useCallback((action: string) => {
    switch (action) {
      case '±': {
        if (currentInput) {
          const num = parseFloat(currentInput);
          const negated = (-num).toString();
          setCurrentInput(negated);
          setPrimaryDisplay(negated);
        } else if (justEvaluated && lastResult !== null) {
          const negated = -lastResult;
          setPrimaryDisplay(formatNumber(negated));
          setLastResult(negated);
          setCurrentInput(formatNumberCompact(negated));
        }
        break;
      }
      case '(': {
        const newExpr = expression + currentInput + '(';
        setExpression(newExpr);
        setExpressionDisplay(newExpr);
        setCurrentInput('');
        break;
      }
      case ')': {
        if (getOpenParenCount(expression + currentInput) > 0) {
          const newExpr = expression + currentInput + ')';
          setExpression(newExpr);
          setExpressionDisplay(newExpr);
          setCurrentInput('');
        }
        break;
      }
      case 'INV': {
        setInvMode(prev => !prev);
        break;
      }
    }
  }, [currentInput, expression, justEvaluated, lastResult]);

  const handleMemory = useCallback((action: string) => {
    const currentVal = currentInput ? parseFloat(currentInput) :
      (justEvaluated && lastResult !== null ? lastResult : 0);
    const mVal = variables.M;
    switch (action) {
      case 'MC': {
        setVariable('M', 0);
        break;
      }
      case 'MR': {
        if (mVal !== 0) {
          setPrimaryDisplay(formatNumber(mVal));
          setCurrentInput(mVal.toString());
          setJustEvaluated(false);
        }
        break;
      }
      case 'M+': {
        const nextVal = mVal + currentVal;
        setVariable('M', nextVal);
        break;
      }
      case 'M-': {
        const nextVal = mVal - currentVal;
        setVariable('M', nextVal);
        break;
      }
      case 'MS': {
        setVariable('M', currentVal);
        break;
      }
    }
    hapticFeedback('light');
  }, [currentInput, justEvaluated, lastResult, variables.M, setVariable]);

  const handleConstant = useCallback((constant: string) => {
    const val = constant === 'π' ? Math.PI : Math.E;
    const label = constant;
    if (justEvaluated) {
      setExpression('');
      setExpressionDisplay('');
      setJustEvaluated(false);
    }
    setCurrentInput(val.toString());
    setPrimaryDisplay(formatNumber(val));
    // Show the symbol in expression display
    setExpression(expression + label);
    setExpressionDisplay(expression + label);
    setCurrentInput('');
  }, [expression, justEvaluated]);

  // ── Master Button Handler ──────────────────────────────────────────────────
  const handleButton = useCallback((value: string) => {
    hapticFeedback('light');

    if (!['=', 'DEL'].includes(value)) {
      setHistoryIndex(-1);
    }

    // Numbers and decimal
    if (/^[\d.]$/.test(value)) {
      handleNumber(value);
      return;
    }

    // Operators
    if (['÷', '×', '−', '+', '^', '%'].includes(value)) {
      // Pass the display character; if normalization is needed, it happens in parser
      handleOperator(value);
      return;
    }

    // Special actions
    switch (value) {
      case 'AC': handleClear('AC'); return;
      case 'DEL': handleClear('DEL'); return;
      case '=': handleEquals(); return;
      case '±': handleSpecial('±'); return;
      case '(': handleSpecial('('); return;
      case ')': handleSpecial(')'); return;
      case 'INV': handleSpecial('INV'); return;
      case 'π': handleConstant('π'); return;
      case 'e': handleConstant('e'); return;
      case 'Ans': {
        if (justEvaluated) {
          setExpression('');
          setExpressionDisplay('');
          setJustEvaluated(false);
        }
        setExpression(expression + 'Ans');
        setExpressionDisplay(expressionDisplay + 'Ans');
        setCurrentInput('');
        setPrimaryDisplay('Ans');
        return;
      }
    }

    // Memory
    if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(value)) {
      handleMemory(value);
      return;
    }

    // Postfix operators (!, ^2, ^3)
    if (value === '!' || value === '^2' || value === '^3') {
      const val = currentInput || (justEvaluated && lastResult !== null
        ? formatNumberCompact(lastResult) : '');
      if (!val) return;

      const opMap: Record<string, string> = { '!': '!', '^2': '^2', '^3': '^3' };
      const dispMap: Record<string, string> = { '!': '!', '^2': '²', '^3': '³' };

      const opToAppend = opMap[value];
      const dispToAppend = dispMap[value];

      const newExpr = expression + val + opToAppend;
      const newExprDisp = expressionDisplay + val + dispToAppend;

      setExpression(newExpr);
      setExpressionDisplay(newExprDisp);
      setCurrentInput('');
      setJustEvaluated(false);
      return;
    }

    // All other functions that end with '('
    if (value.endsWith('(') || value.startsWith('sin') || value.startsWith('cos') ||
        value.startsWith('tan') || value.startsWith('arc') || value.startsWith('ln') ||
        value.startsWith('log') || value.startsWith('sqrt') || value.startsWith('cbrt') ||
        value.startsWith('exp') || value.startsWith('inv') || value.startsWith('abs') ||
        value.startsWith('sinh') || value.startsWith('cosh') || value.startsWith('asinh') ||
        value.startsWith('acosh') || value.startsWith('atanh')) {
      handleFunction(value);
      return;
    }
  }, [
    handleNumber, handleOperator, handleFunction,
    handleClear, handleEquals, handleSpecial,
    handleMemory, handleConstant,
    currentInput, expression, expressionDisplay, justEvaluated, lastResult,
  ]);

  // ── History Reuse ──────────────────────────────────────────────────────────
  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    const cleanExpr = entry.expression.replace(/\s*=\s*$/, '').trim();
    setExpression('');
    setExpressionDisplay('');
    setCurrentInput(cleanExpr);
    setPrimaryDisplay(cleanExpr);
    setJustEvaluated(false);
    setActiveTab('basic');
  }, [setActiveTab]);

  // ── Submode Results & Variables ────────────────────────────────────────────
  const handleSubModeResult = useCallback((result: string, expr: string) => {
    setPrimaryDisplay(result);
    setExpressionDisplay(expr);
    setHistoryIndex(-1);
    
    const num = parseFloat(result.replace(/,/g, ''));
    if (!isNaN(num) && isFinite(num)) {
      setAns(num);
    }
    
    const entry: HistoryEntry = {
      id: generateId(),
      expression: expr + ' =',
      result: result,
      timestamp: Date.now(),
    };
    addHistoryEntry(entry);
  }, [setAns, addHistoryEntry]);

  const handleRecallVariable = useCallback((val: number) => {
    setError(null);
    setJustEvaluated(false);
    setHistoryIndex(-1);
    const valStr = val.toString();
    setCurrentInput(valStr);
    setPrimaryDisplay(formatNumber(val));
  }, []);

  // ── Replay History Navigation ──────────────────────────────────────────────
  const handleReplayUp = useCallback(() => {
    if (history.length === 0) return;
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      if (historyIndex === -1) {
        setDraftExpr({ expression, currentInput, primaryDisplay });
      }
      setHistoryIndex(nextIndex);
      const entry = history[nextIndex];
      const cleanExpr = entry.expression.replace(/\s*=\s*$/, '').trim();
      setExpression('');
      setExpressionDisplay('');
      setCurrentInput(cleanExpr);
      setPrimaryDisplay(cleanExpr);
      setJustEvaluated(false);
      hapticFeedback('light');
    }
  }, [history, historyIndex, expression, currentInput, primaryDisplay]);

  const handleReplayDown = useCallback(() => {
    if (historyIndex > -1) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      if (nextIndex === -1) {
        setExpression(draftExpr.expression);
        setExpressionDisplay(draftExpr.expression);
        setCurrentInput(draftExpr.currentInput);
        setPrimaryDisplay(draftExpr.primaryDisplay);
      } else {
        const entry = history[nextIndex];
        const cleanExpr = entry.expression.replace(/\s*=\s*$/, '').trim();
        setExpression('');
        setExpressionDisplay('');
        setCurrentInput(cleanExpr);
        setPrimaryDisplay(cleanExpr);
        setJustEvaluated(false);
      }
      hapticFeedback('light');
    }
  }, [history, historyIndex, draftExpr]);

  // ── Angle Mode Toggle ──────────────────────────────────────────────────────
  const toggleAngleMode = useCallback(() => {
    setAngleMode(prev => {
      const next = prev === 'DEG' ? 'RAD' : 'DEG';
      calcRef.current.setAngleMode(next === 'RAD' ? 1 : 0);
      return next;
    });
  }, []);

  // ── Keyboard Support ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleReplayUp();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleReplayDown();
        return;
      }

      // Standard keys are only handled on basic/scientific tabs to avoid conflict with sub-modes
      if (activeTab === 'basic' || activeTab === 'scientific') {
        const btn = keyToButton(e.key, e.shiftKey);
        if (btn) {
          e.preventDefault();
          handleButton(btn);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleButton, handleReplayUp, handleReplayDown, activeTab]);

  // ── Theme Sync ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Clear label: AC vs DEL ────────────────────────────────────────────────
  const clearLabel = currentInput.length > 0 || expression.length > 0 ? 'C' : 'AC';
  const pendingOp = !currentInput && expression ? expression.trim().slice(-1) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="calc-root">
      <div className="calc-container">

        {/* Display - always visible */}
        <Display
          primaryDisplay={primaryDisplay}
          expressionDisplay={expressionDisplay}
          error={error}
          memoryHasValue={memoryHasValue}
          memory={memory}
          angleMode={angleMode}
          isWasm={isWasm}
          isReplay={historyIndex > -1}
          replayTimestamp={historyIndex > -1 ? history[historyIndex]?.timestamp : null}
          liveResult={liveResult}
          onOpenQr={() => setIsQrOpen(true)}
          onOpenVars={() => setIsVarsOpen(true)}
          onReplayUp={handleReplayUp}
          onReplayDown={handleReplayDown}
        />

        {/* Home Navigation Bar */}
        <div
          className="home-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            background: 'var(--bg1)',
            borderBottom: '1px solid var(--border)',
            borderTopLeftRadius: 'var(--r)',
            borderTopRightRadius: 'var(--r)',
            height: '44px',
          }}
        >
          {activeTab !== 'home' ? (
            <button
              onClick={() => {
                setActiveTab('home');
                setIsModesOpen(false);
              }}
              style={{
                background: 'var(--bg3)',
                color: 'var(--accent)',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--t)',
              }}
            >
              🏠 HOME
            </button>
          ) : (
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--mid)', letterSpacing: '0.05em' }}>
              CASIO CLASSWIZ
            </span>
          )}

          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hi)', textTransform: 'uppercase' }}>
            {activeTab === 'home' ? 'Select Mode' : MODES_LIST.find(m => m.key === activeTab)?.title || activeTab}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mid)',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {activeTab !== 'home' && (
              <div style={{ position: 'relative' }}>
                <button
                onClick={() => {
                  setIsModesOpen((prev) => !prev);
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--accent)',
                  border: 'none',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                Modes ▾
              </button>
              
              {/* Dropdown in mini-bar */}
              <AnimatePresence>
                {isModesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      width: '180px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 50,
                      marginTop: '4px',
                    }}
                  >
                    {MODES_LIST.map((item) => (
                      <button
                        key={item.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(item.key as any);
                          setIsModesOpen(false);
                        }}
                        style={{
                          background: activeTab === item.key ? 'rgba(168, 199, 250, 0.1)' : 'transparent',
                          color: activeTab === item.key ? 'var(--accent)' : 'var(--hi)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'var(--t)',
                          width: '100%',
                        }}
                      >
                        {item.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          </div>
        </div>

        {/* ── Tabs Content ── */}
        {(activeTab === 'basic' || activeTab === 'scientific' || activeTab === 'history') && (
          <div className="tabs" ref={tabsRef}>
            <button
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('basic');
                hapticFeedback('light');
              }}
            >
              Basic
            </button>
            <button
              className={`tab ${activeTab === 'scientific' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('scientific');
                hapticFeedback('light');
              }}
            >
              Scientific
            </button>
            <button
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('history');
                hapticFeedback('light');
              }}
            >
              History
            </button>
          </div>
        )}

        {/* Tab Panels */}
        <div className="kpad-area">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                {MODES_LIST.map((m) => (
                  <motion.button
                    key={m.key}
                    onClick={() => setActiveTab(m.key as any)}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                      background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(33, 33, 40, 0.8) 100%)',
                      border: '1px solid var(--border)',
                      borderRadius: '18px',
                      padding: '16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      outline: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 199, 250, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                  >
                    {/* Subtle glow on cards */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, var(--accent) 0%, transparent 80%)',
                      opacity: 0.7
                    }} />

                    <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>{m.icon}</span>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--hi)', letterSpacing: '0.015em' }}>{m.title}</span>
                    <span style={{ fontSize: '10px', color: 'var(--mid)', lineHeight: 1.3 }}>{m.desc}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <Keypad
                  onButton={handleButton}
                  clearLabel={clearLabel}
                  memoryHasValue={memoryHasValue}
                  pendingOp={pendingOp}
                />
              </motion.div>
            )}
            {activeTab === 'scientific' && (
              <motion.div
                key="scientific"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <ScientificKeypad
                  onButton={handleButton}
                  invMode={invMode}
                  angleMode={angleMode}
                  onAngleToggle={toggleAngleMode}
                />
              </motion.div>
            )}
            {activeTab === 'math' && (
              <motion.div
                key="math"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <MathMode onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'matrix' && (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <MatrixMode onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'vector' && (
              <motion.div
                key="vector"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <VectorMode onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'statistics' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <StatisticsMode onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'complex' && (
              <motion.div
                key="complex"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <ComplexMode onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'base-n' && (
              <motion.div
                key="base-n"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <BaseNMode onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'constants' && (
              <motion.div
                key="constants"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <ConstantsPanel onOutputResult={handleSubModeResult} />
              </motion.div>
            )}
            {activeTab === 'graphing' && (
              <motion.div
                key="graphing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                style={{ height: '100%' }}
              >
                <GraphingMode calc={calcRef.current} angleMode={angleMode} />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <HistoryPanel
                  history={history}
                  onSelect={handleHistorySelect}
                  onClear={clearHistory}
                  onRemove={removeHistoryEntry}
                />
              </motion.div>
            )}
            {activeTab === 'program' && (
              <motion.div
                key="program"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                style={{ height: '100%' }}
              >
                <ProgramMode />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <SettingsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <QrModal
        value={`${expressionDisplay} ${primaryDisplay}`}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />
      <VariableModal
        currentValue={parseFloat(primaryDisplay.replace(/,/g, '')) || 0}
        isOpen={isVarsOpen}
        onClose={() => setIsVarsOpen(false)}
        onRecall={handleRecallVariable}
      />
    </div>
  );
}

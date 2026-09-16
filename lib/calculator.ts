/**
 * lib/calculator.ts
 * ============================================================================
 * High-level calculator logic: expression parsing, evaluation, and formatting.
 * Uses the WASM/JS CalcModule for all math operations.
 * ============================================================================
 */

import type { CalcModule } from './wasm';

// ── Types ────────────────────────────────────────────────────────────────────

export type AngleMode = 'DEG' | 'RAD';

export interface CalculatorState {
  expression: string;         // What's shown in the secondary (formula) display
  display: string;            // What's shown in the primary (result) display
  pendingOp: string | null;   // Pending binary operator
  memory: number;             // M slot 0
  angleMode: AngleMode;
  hasResult: boolean;         // Just pressed = 
  lastOperand: number | null; // For repeated = presses
  lastOperator: string | null;
  error: string | null;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type ButtonType =
  | 'number'
  | 'operator'
  | 'equals'
  | 'function'
  | 'constant'
  | 'memory'
  | 'clear'
  | 'special';

export interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  shiftLabel?: string;   // Long-press / INV function label
  shiftValue?: string;
  wide?: boolean;
}

// ── Error Messages ───────────────────────────────────────────────────────────

export function getErrorMessage(value: number, expr?: string): string | null {
  if (!isFinite(value) && !isNaN(value)) {
    // Check for divide by zero
    if (expr?.includes('÷ 0') || expr?.includes('/0')) {
      return "Math Error";
    }
    return 'Math Error';
  }
  if (isNaN(value)) {
    if (expr?.toLowerCase().includes('√')) return 'Domain Error';
    if (expr?.toLowerCase().includes('log')) return 'Domain Error';
    if (expr?.toLowerCase().includes('sin') || 
        expr?.toLowerCase().includes('cos') || 
        expr?.toLowerCase().includes('tan')) return 'Domain Error';
    return 'Syntax Error';
  }
  return null;
}

// ── Number Formatting ────────────────────────────────────────────────────────

const MAX_DISPLAY_DIGITS = 12;

/**
 * Format a number for display.
 * - Uses exponential notation for very large/small numbers.
 * - Strips trailing zeros.
 * - Limits to MAX_DISPLAY_DIGITS significant figures.
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return 'Error';
  if (!isFinite(value)) return value > 0 ? '∞' : '-∞';

  const abs = Math.abs(value);

  // Very large or very small — use scientific notation
  if ((abs !== 0 && abs < 1e-9) || abs >= 1e12) {
    return value.toExponential(6).replace(/\.?0+e/, 'e').replace('e+', 'e');
  }

  // Try to get a clean representation
  const str = parseFloat(value.toPrecision(MAX_DISPLAY_DIGITS)).toString();
  
  // Add thousands separator to integer part
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return parts.join('.');
}

/**
 * Format a number for the expression/history display (no separators).
 */
export function formatNumberCompact(value: number): string {
  if (isNaN(value)) return 'Error';
  if (!isFinite(value)) return value > 0 ? '∞' : '-∞';
  return parseFloat(value.toPrecision(10)).toString();
}

/**
 * Convert a decimal number to a fraction representation (e.g. 0.75 -> 3/4).
 * Returns a fraction string or null if it cannot be cleanly represented.
 */
export function decimalToFraction(val: number, tolerance = 1.0e-9): string | null {
  if (isNaN(val) || !isFinite(val)) return null;
  const absVal = Math.abs(val);
  if (absVal < tolerance) return null;
  if (Math.abs(absVal - Math.round(absVal)) < tolerance) return null; // Already integer
  
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = absVal;
  do {
    const a = Math.floor(b);
    const aux = h1; h1 = a * h1 + h2; h2 = aux;
    const aux2 = k1; k1 = a * k1 + k2; k2 = aux2;
    b = 1 / (b - a);
  } while (Math.abs(absVal - h1 / k1) > absVal * tolerance);

  // Exclude messy fractions
  if (k1 > 2000 || k1 === 1) return null;
  
  const sign = val < 0 ? '-' : '';
  return `${sign}${h1}/${k1}`;
}

// ── Expression Tokenizer & Parser ────────────────────────────────────────────

type TokenType = 'number' | 'operator' | 'function' | 'lparen' | 'rparen' | 'constant';

interface Token {
  type: TokenType;
  value: string;
  numVal?: number;
}

/**
 * Tokenize an expression string.
 * Handles: numbers, +, -, ×, ÷, %, ^, (, ), functions, constants.
 */
function insertImplicitMultiplication(tokens: Token[]): Token[] {
  const result: Token[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const current = tokens[idx];
    result.push(current);
    if (idx < tokens.length - 1) {
      const next = tokens[idx + 1];
      const isLeftValid =
        current.type === 'number' ||
        current.type === 'constant' ||
        current.type === 'rparen' ||
        (current.type === 'operator' && current.value === '!');
      
      const isRightValid =
        next.type === 'lparen' ||
        next.type === 'function' ||
        next.type === 'constant' ||
        next.type === 'number';

      if (isLeftValid && isRightValid) {
        result.push({ type: 'operator', value: '*' });
      }
    }
  }
  return result;
}

/**
 * Tokenize an expression string.
 * Handles: numbers, +, -, ×, ÷, %, ^, (, ), functions, constants.
 */
function tokenize(expr: string, variables?: Record<string, number>): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  // Normalize expression
  const s = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'π')
    .replace(/₁₀/g, '10')
    .replace(/₂/g, '2')
    .replace(/\s+/g, '');

  while (i < s.length) {
    const ch = s[i];

    // Numbers (including decimals and scientific notation)
    if (/[\d.]/.test(ch) || (ch === '-' && tokens.length === 0) ||
        (ch === '-' && tokens[tokens.length - 1]?.type === 'operator') ||
        (ch === '-' && tokens[tokens.length - 1]?.type === 'lparen')) {
      let num = '';
      if (ch === '-') { num = '-'; i++; }
      while (i < s.length && /[\d.eE]/.test(s[i])) {
        if (s[i] === 'e' || s[i] === 'E') {
          const next = s[i + 1] || '';
          const nextNext = s[i + 2] || '';
          const isValidExponent = 
            /\d/.test(next) || 
            ((next === '+' || next === '-') && /\d/.test(nextNext));
          
          if (isValidExponent) {
            if (next === '+' || next === '-') {
              num += s[i] + next;
              i += 2;
            } else {
              num += s[i++];
            }
          } else {
            break;
          }
        } else {
          num += s[i++];
        }
      }
      tokens.push({ type: 'number', value: num, numVal: parseFloat(num) });
      continue;
    }

    // Match variable Ans
    if (s.toLowerCase().startsWith('ans', i)) {
      tokens.push({ type: 'constant', value: 'Ans', numVal: variables?.['Ans'] ?? 0 });
      i += 3;
      continue;
    }

    // Match variables A-F, X, Y, M
    if ('ABCDEFXYM'.includes(ch) && (i + 1 === s.length || !/[a-zA-Z0-9]/.test(s[i + 1]))) {
      const varName = ch;
      tokens.push({ type: 'constant', value: varName, numVal: variables?.[varName] ?? 0 });
      i++;
      continue;
    }

    // Constants
    if (ch === 'π') {
      tokens.push({ type: 'constant', value: 'π', numVal: Math.PI });
      i++;
      continue;
    }
    if (ch.toLowerCase() === 'e' && (i + 1 === s.length || !/[\d]/.test(s[i + 1])) && !s.toLowerCase().startsWith('exp', i)) {
      tokens.push({ type: 'constant', value: 'e', numVal: Math.E });
      i++;
      continue;
    }

    // Functions (multi-char identifiers)
    if (/[a-zA-Z]/.test(ch)) {
      const fns = [
        'arcsin','arccos','arctan','sinh','cosh','tanh','asinh','acosh','atanh',
        'sin','cos','tan','log10','log2','log','ln','sqrt','cbrt','abs','floor','ceil','round',
        'exp10','exp','inv','factorial','besselj0','besselj1','erf','erfc','gamma',
      ];
      let matched = false;
      for (const fn of fns) {
        const normalized = fn.replace('₁₀', '10');
        if (s.slice(i).toLowerCase().startsWith(normalized.toLowerCase())) {
          tokens.push({ type: 'function', value: fn });
          i += normalized.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Skip unknown
        i++;
      }
      continue;
    }

    // Operators
    if ('+-*/%^'.includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }
    if (ch === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (ch === '!') { tokens.push({ type: 'operator', value: '!' }); i++; continue; }

    // Skip unknown characters
    i++;
  }

  return insertImplicitMultiplication(tokens);
}

// Operator precedence
const PREC: Record<string, number> = {
  '+': 1, '-': 1,
  '*': 2, '/': 2, '%': 2,
  '^': 3,
  '!': 4,
};

/**
 * Evaluate a tokenized expression using the Shunting-yard algorithm + RPN evaluation.
 * Returns the numeric result.
 */
function evaluateTokens(tokens: Token[], calc: CalcModule): number {
  const outputQueue: Array<Token> = [];
  const opStack: Array<Token> = [];

  const applyOp = (op: string, b: number, a: number): number => {
    switch (op) {
      case '+': return calc.add(a, b);
      case '-': return calc.subtract(a, b);
      case '*': return calc.multiply(a, b);
      case '/':
        if (b === 0) throw new Error("Can't divide by zero");
        return calc.divide(a, b);
      case '%':
        if (b === 0) throw new Error("Can't divide by zero");
        return calc.modulo(a, b);
      case '^': return calc.power(a, b);
      default:  return NaN;
    }
  };

  const applyFn = (fn: string, x: number): number => {
    switch (fn.toLowerCase()) {
      case 'sin':     return calc.sine(x);
      case 'cos':     return calc.cosine(x);
      case 'tan':     return calc.tangent(x);
      case 'arcsin':
        if (x < -1 || x > 1) throw new Error("Domain error: arcsin range is [-1, 1]");
        return calc.arcSine(x);
      case 'arccos':
        if (x < -1 || x > 1) throw new Error("Domain error: arccos range is [-1, 1]");
        return calc.arcCosine(x);
      case 'arctan':  return calc.arcTangent(x);
      case 'sinh':    return calc.sinhCalc(x);
      case 'cosh':    return calc.coshCalc(x);
      case 'tanh':    return calc.tanhCalc(x);
      case 'asinh':   return calc.asinhCalc(x);
      case 'acosh':
        if (x < 1) throw new Error("Domain error: acosh range is [1, ∞)");
        return calc.acoshCalc(x);
      case 'atanh':
        if (x <= -1 || x >= 1) throw new Error("Domain error: atanh range is (-1, 1)");
        return calc.atanhCalc(x);
      case 'log':
      case 'log10':
      case 'log₁₀':
        if (x <= 0) throw new Error("Domain error: log of non-positive");
        return calc.log10Calc(x);
      case 'log2':
        if (x <= 0) throw new Error("Domain error: log of non-positive");
        return Math.log2(x);
      case 'exp10':   return Math.pow(10, x);
      case 'inv':
        if (x === 0) throw new Error("Can't divide by zero");
        return 1 / x;
      case 'ln':
        if (x <= 0) throw new Error("Domain error: log of non-positive");
        return calc.naturalLog(x);
      case 'sqrt':
        if (x < 0) throw new Error("Domain error: square root of negative");
        return calc.squareRoot(x);
      case 'cbrt':    return calc.cubeRoot(x);
      case 'abs':     return calc.absCalc(x);
      case 'floor':   return calc.floorCalc(x);
      case 'ceil':    return calc.ceilCalc(x);
      case 'round':   return calc.roundCalc(x);
      case 'exp':     return calc.expE(x);
      case 'factorial':
        if (x < 0) throw new Error("Domain error: factorial of negative");
        return calc.factorial(Math.round(x));
      case 'besselj0': return calc.besselJ0(x);
      case 'besselj1': return calc.besselJ1(x);
      case 'erf':      return calc.erfCalc(x);
      case 'erfc':     return calc.erfcCalc(x);
      case 'gamma':
        if (x <= 0 && Number.isInteger(x)) throw new Error("Domain error: gamma pole at non-positive integer");
        return calc.gammaCalc(x);
      default:        return NaN;
    }
  };

  // Shunting-yard
  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'constant') {
      outputQueue.push(token);
    } else if (token.type === 'function') {
      opStack.push(token);
    } else if (token.type === 'operator') {
      if (token.value === '!') {
        // Postfix unary — push directly to output
        outputQueue.push(token);
        continue;
      }
      while (
        opStack.length > 0 &&
        (
          (opStack[opStack.length - 1].type === 'function' && token.value !== '^') ||
          (opStack[opStack.length - 1].type === 'operator' &&
           ((PREC[opStack[opStack.length - 1].value] || 0) >= (PREC[token.value] || 0) &&
            token.value !== '^'))
        )
      ) {
        outputQueue.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token.type === 'lparen') {
      opStack.push(token);
    } else if (token.type === 'rparen') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'lparen') {
        outputQueue.push(opStack.pop()!);
      }
      opStack.pop(); // remove lparen
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'function') {
        outputQueue.push(opStack.pop()!);
      }
    }
  }
  while (opStack.length > 0) {
    outputQueue.push(opStack.pop()!);
  }

  // RPN evaluation
  const valStack: number[] = [];
  for (const token of outputQueue) {
    if (token.type === 'number' || token.type === 'constant') {
      valStack.push(token.numVal!);
    } else if (token.type === 'function') {
      const x = valStack.pop() ?? 0;
      valStack.push(applyFn(token.value, x));
    } else if (token.type === 'operator') {
      if (token.value === '!') {
        const x = valStack.pop() ?? 0;
        valStack.push(calc.factorial(Math.round(x)));
      } else {
        const b = valStack.pop() ?? 0;
        const a = valStack.pop() ?? 0;
        valStack.push(applyOp(token.value, b, a));
      }
    }
  }

  return valStack[0] ?? NaN;
}

/**
 * Evaluate an expression string using the given CalcModule.
 * Returns { result, error }.
 */
export function evaluateExpression(
  expr: string,
  calc: CalcModule,
  variables?: Record<string, number>,
): { result: number; error: string | null } {
  if (!expr.trim()) return { result: 0, error: null };

  try {
    const tokens = tokenize(expr, variables);
    if (tokens.length === 0) return { result: 0, error: null };

    const result = evaluateTokens(tokens, calc);

    if (isNaN(result)) {
      return { result, error: getErrorMessage(result, expr) ?? 'Math Error' };
    }
    if (!isFinite(result)) {
      return { result, error: getErrorMessage(result, expr) ?? 'Math Error' };
    }

    return { result, error: null };
  } catch (err: any) {
    return { result: NaN, error: err.message || 'Syntax Error' };
  }
}

// ── Button Layouts ───────────────────────────────────────────────────────────

export const BASIC_BUTTONS: CalcButton[][] = [
  [
    { label: 'AC',  value: 'AC',  type: 'clear' },
    { label: '±',   value: '±',   type: 'special' },
    { label: '%',   value: '%',   type: 'operator' },
    { label: '÷',   value: '÷',   type: 'operator' },
  ],
  [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '×', type: 'operator' },
  ],
  [
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '−', value: '−', type: 'operator' },
  ],
  [
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
  ],
  [
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: 'Ans', value: 'Ans', type: 'constant' },
    { label: '=', value: '=', type: 'equals' },
  ],
];

export const SCIENTIFIC_BUTTONS: CalcButton[][] = [
  [
    { label: 'sin', value: 'sin(', type: 'function', shiftLabel: '⁻¹', shiftValue: 'arcsin(' },
    { label: 'cos', value: 'cos(', type: 'function', shiftLabel: '⁻¹', shiftValue: 'arccos(' },
    { label: 'tan', value: 'tan(', type: 'function', shiftLabel: '⁻¹', shiftValue: 'arctan(' },
    { label: 'sinh', value: 'sinh(', type: 'function', shiftLabel: '⁻¹', shiftValue: 'asinh(' },
    { label: 'cosh', value: 'cosh(', type: 'function', shiftLabel: '⁻¹', shiftValue: 'acosh(' },
  ],
  [
    { label: 'x²', value: '^2', type: 'function', shiftLabel: '√', shiftValue: 'sqrt(' },
    { label: 'x³', value: '^3', type: 'function', shiftLabel: '∛', shiftValue: 'cbrt(' },
    { label: 'xʸ', value: '^', type: 'operator' },
    { label: '√x', value: 'sqrt(', type: 'function', shiftLabel: 'x²', shiftValue: '^2' },
    { label: 'tanh', value: 'tanh(', type: 'function', shiftLabel: '⁻¹', shiftValue: 'atanh(' },
  ],
  [
    { label: 'log', value: 'log(', type: 'function', shiftLabel: '10ˣ', shiftValue: 'exp10(' },
    { label: 'ln', value: 'ln(', type: 'function', shiftLabel: 'eˣ', shiftValue: 'exp(' },
    { label: 'log₂', value: 'log2(', type: 'function', shiftLabel: '2ˣ', shiftValue: '2^' },
    { label: 'eˣ', value: 'exp(', type: 'function', shiftLabel: 'ln', shiftValue: 'ln(' },
    { label: '10ˣ', value: 'exp10(', type: 'function', shiftLabel: 'log', shiftValue: 'log(' },
  ],
  [
    { label: 'n!', value: '!', type: 'function' },
    { label: '1/x', value: 'inv(', type: 'function' },
    { label: '|x|', value: 'abs(', type: 'function' },
    { label: 'π', value: 'π', type: 'constant' },
    { label: 'e', value: 'e', type: 'constant' },
  ],
];

export const MEMORY_BUTTONS: CalcButton[] = [
  { label: 'MC',  value: 'MC',  type: 'memory' },
  { label: 'MR',  value: 'MR',  type: 'memory' },
  { label: 'MS',  value: 'MS',  type: 'memory' },
  { label: 'M+',  value: 'M+',  type: 'memory', shiftLabel: 'M-', shiftValue: 'M-' },
  { label: '⌫',   value: 'DEL', type: 'function' },
];

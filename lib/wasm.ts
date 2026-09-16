/**
 * lib/wasm.ts
 * ============================================================================
 * WebAssembly module loader for SciCalc.
 * Exposes a typed TypeScript API that calls WASM compiled C++ when available,
 * and falls back to pure Javascript if not compiled or loaded.
 * ============================================================================
 */

export interface CalcModule {
  // Basic arithmetic
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
  modulo(a: number, b: number): number;

  // Powers & roots
  power(base: number, exp: number): number;
  squareRoot(x: number): number;
  cubeRoot(x: number): number;
  nthRoot(x: number, n: number): number;
  square(x: number): number;
  reciprocal(x: number): number;

  // Logarithms
  log10Calc(x: number): number;
  naturalLog(x: number): number;
  logBase(x: number, b: number): number;
  exp10(x: number): number;
  expE(x: number): number;

  // Trig & Inverse Trig
  sine(angle: number): number;
  cosine(angle: number): number;
  tangent(angle: number): number;
  arcSine(x: number): number;
  arcCosine(x: number): number;
  arcTangent(x: number): number;
  arcTangent2(y: number, x: number): number;

  // Hyperbolic
  sinhCalc(x: number): number;
  coshCalc(x: number): number;
  tanhCalc(x: number): number;
  asinhCalc(x: number): number;
  acoshCalc(x: number): number;
  atanhCalc(x: number): number;

  // Combinatorics & Advanced
  factorial(n: number): number;
  gammaCalc(x: number): number;
  permutations(n: number, r: number): number;
  combinations(n: number, r: number): number;
  besselJ0(x: number): number;
  besselJ1(x: number): number;
  erfCalc(x: number): number;
  erfcCalc(x: number): number;
  betaCalc(x: number, y: number): number;

  // Constants
  piConstant(): number;
  eConstant(): number;

  // Solvers
  quadratic(a: number, b: number, c: number): [number, number];
  cubic(a: number, b: number, c: number, d: number): [number, number, number];

  // Complex Numbers
  complexAdd(r1: number, i1: number, r2: number, i2: number): [number, number];
  complexSubtract(r1: number, i1: number, r2: number, i2: number): [number, number];
  complexMultiply(r1: number, i1: number, r2: number, i2: number): [number, number];
  complexDivide(r1: number, i1: number, r2: number, i2: number): [number, number];
  complexPower(r1: number, i1: number, r2: number, i2: number): [number, number];
  complexAbs(r: number, i: number): number;
  complexArg(r: number, i: number): number;
  complexConjugate(r: number, i: number): [number, number];
  complexSine(r: number, i: number): [number, number];
  complexCosine(r: number, i: number): [number, number];
  complexTangent(r: number, i: number): [number, number];
  complexLog(r: number, i: number): [number, number];
  complexExp(r: number, i: number): [number, number];
  complexSqrt(r: number, i: number): [number, number];

  // Matrices
  matrixDeterminant(m: number[], size: number): number;
  matrixInverse(m: number[], size: number): { success: boolean; data: number[] };
  matrixMultiply(a: number[], rA: number, cA: number, b: number[], rB: number, cB: number): number[];

  // Vectors
  vectorDot(v1: number[], v2: number[], dim: number): number;
  vectorCross(v1: number[], v2: number[]): number[];
  vectorMagnitude(v: number[], dim: number): number;

  // Statistics
  statMean(data: number[], n: number): number;
  statStdDev(data: number[], n: number, sample: boolean): number;
  normalCDF(x: number, mean: number, stddev: number): number;
  normalPDF(x: number, mean: number, stddev: number): number;

  // Rounding & Utility
  floorCalc(x: number): number;
  ceilCalc(x: number): number;
  roundCalc(x: number): number;
  absCalc(x: number): number;
  isFiniteCalc(x: number): boolean;
  isNaNCalc(x: number): boolean;

  // State
  setAngleMode(mode: 0 | 1): void;
  getAngleMode(): 0 | 1;
  memStore(slot: number, value: number): void;
  memRecall(slot: number): number;
  memAdd(slot: number, value: number): void;
  memSubtract(slot: number, value: number): void;
  memClear(slot: number): void;
  memClearAll(): void;

  isWasm: boolean;
}

// ── Standalone JS Fallback Implementation ────────────────────────────────────

const PI = Math.PI;
const E  = Math.E;
const DEG2RAD = PI / 180;
const RAD2DEG = 180 / PI;
let _angleMode: 0 | 1 = 0;
const _memSlots = [0, 0, 0, 0, 0];

function toRad(a: number) { return _angleMode === 0 ? a * DEG2RAD : a; }
function fromRad(r: number) { return _angleMode === 0 ? r * RAD2DEG : r; }

function jsFactorial(n: number): number {
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export const jsFallback: CalcModule = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b === 0 ? (a >= 0 ? Infinity : -Infinity) : a / b,
  modulo: (a, b) => b === 0 ? NaN : a % b,

  power: (base, exp) => Math.pow(base, exp),
  squareRoot: (x) => x < 0 ? NaN : Math.sqrt(x),
  cubeRoot: (x) => Math.cbrt(x),
  nthRoot: (x, n) => {
    if (n === 0) return NaN;
    if (x < 0 && !Number.isInteger(n)) return NaN;
    if (x < 0) {
      const absResult = Math.pow(Math.abs(x), 1 / n);
      return (Math.round(n) % 2 !== 0) ? -absResult : NaN;
    }
    return Math.pow(x, 1 / n);
  },
  square: (x) => x * x,
  reciprocal: (x) => x === 0 ? Infinity : 1 / x,

  log10Calc: (x) => x <= 0 ? NaN : Math.log10(x),
  naturalLog: (x) => x <= 0 ? NaN : Math.log(x),
  logBase: (x, b) => (x <= 0 || b <= 0 || b === 1) ? NaN : Math.log(x) / Math.log(b),
  exp10: (x) => Math.pow(10, x),
  expE: (x) => Math.exp(x),

  sine: (a) => { const r = Math.sin(toRad(a)); return Math.abs(r) < 1e-12 ? 0 : r; },
  cosine: (a) => { const r = Math.cos(toRad(a)); return Math.abs(r) < 1e-12 ? 0 : r; },
  tangent: (a) => {
    const rad = toRad(a);
    const c = Math.cos(rad);
    if (Math.abs(c) < 1e-12) return Math.sin(rad) > 0 ? Infinity : -Infinity;
    const r = Math.tan(rad);
    return Math.abs(r) < 1e-12 ? 0 : r;
  },

  arcSine: (x) => (x < -1 || x > 1) ? NaN : fromRad(Math.asin(x)),
  arcCosine: (x) => (x < -1 || x > 1) ? NaN : fromRad(Math.acos(x)),
  arcTangent: (x) => fromRad(Math.atan(x)),
  arcTangent2: (y, x) => fromRad(Math.atan2(y, x)),

  sinhCalc: (x) => Math.sinh(x),
  coshCalc: (x) => Math.cosh(x),
  tanhCalc: (x) => Math.tanh(x),
  asinhCalc: (x) => Math.asinh(x),
  acoshCalc: (x) => x < 1 ? NaN : Math.acosh(x),
  atanhCalc: (x) => (x <= -1 || x >= 1) ? NaN : Math.atanh(x),

  factorial: (n) => jsFactorial(n),
  gammaCalc: (x) => {
    if (x < 0.5) return PI / (Math.sin(PI * x) * jsFallback.gammaCalc(1 - x));
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
               771.32342877765313, -176.61502916214059, 12.507343278686905,
               -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    let z = x - 1;
    let sum = c[0];
    for (let i = 1; i < g + 2; i++) sum += c[i] / (z + i);
    const t = z + g + 0.5;
    return Math.sqrt(2 * PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * sum;
  },
  permutations: (n, r) => {
    if (n < 0 || r < 0 || r > n) return NaN;
    let res = 1;
    for (let i = n; i > n - r; i--) res *= i;
    return res;
  },
  combinations: (n, r) => {
    if (n < 0 || r < 0 || r > n) return NaN;
    return jsFactorial(n) / (jsFactorial(r) * jsFactorial(n - r));
  },

  besselJ0: (x) => {
    x = Math.abs(x);
    if (x < 8.0) {
      const y = x * x;
      const ans1 = 57568490574.0 + y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * (-184.9052456)))));
      const ans2 = 57568490574.0 + y * (57986807.41 + y * (262148.3775 + y * (697.2813757 + y * 1.0)));
      return ans1 / ans2;
    } else {
      const z = 8.0 / x;
      const y = z * z;
      const xx = x - 0.785398164;
      const ans1 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)));
      const ans2 = -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)));
      return Math.sqrt(0.636619772 / x) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
    }
  },
  besselJ1: (x) => {
    const ax = Math.abs(x);
    if (ax < 8.0) {
      const y = x * x;
      const ans1 = ax * (38319112005.0 + y * (-5697570315.0 + y * (240105527.0 + y * (-3747201.378 + y * (22896.22274 + y * (-48.0474636))))));
      const ans2 = 76638224010.0 + y * (76739944.5 + y * (327607.3 + y * (821.84 + y * 1.0)));
      const result = ans1 / ans2;
      return (x < 0.0) ? -result : result;
    } else {
      const z = 8.0 / ax;
      const y = z * z;
      const xx = ax - 2.356194491;
      const ans1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * (-0.240337019e-6))));
      const ans2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
      const result = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
      return (x < 0.0) ? -result : result;
    }
  },
  erfCalc: (x) => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const sign = x < 0 ? -1 : 1;
    const t = 1.0 / (1.0 + p * Math.abs(x));
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  },
  erfcCalc: (x) => 1.0 - jsFallback.erfCalc(x),
  betaCalc: (x, y) => jsFallback.gammaCalc(x) * jsFallback.gammaCalc(y) / jsFallback.gammaCalc(x + y),

  piConstant: () => PI,
  eConstant: () => E,

  quadratic: (a, b, c) => {
    if (Math.abs(a) < 1e-12) return [NaN, NaN];
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [NaN, NaN];
    const sq = Math.sqrt(disc);
    return [(-b + sq) / (2 * a), (-b - sq) / (2 * a)];
  },
  cubic: (a, b, c, d) => {
    if (Math.abs(a) < 1e-12) {
      const q = jsFallback.quadratic(b, c, d);
      return [q[0], q[1], NaN];
    }
    const A = b / a;
    const B = c / a;
    const C = d / a;
    const p = B - A * A / 3.0;
    const q = C - A * B / 3.0 + 2.0 * A * A * A / 27.0;
    const D = q * q / 4.0 + p * p * p / 27.0;

    if (D > 1e-12) {
      const u = Math.cbrt(-q / 2.0 + Math.sqrt(D));
      const v = Math.cbrt(-q / 2.0 - Math.sqrt(D));
      return [u + v - A / 3.0, NaN, NaN];
    } else if (Math.abs(D) <= 1e-12) {
      const u = Math.cbrt(-q / 2.0);
      return [2.0 * u - A / 3.0, -u - A / 3.0, -u - A / 3.0];
    } else {
      const r = Math.sqrt(-p * p * p / 27.0);
      const phi = Math.acos(-q / (2.0 * r));
      const factor = 2.0 * Math.sqrt(-p / 3.0);
      return [
        factor * Math.cos(phi / 3.0) - A / 3.0,
        factor * Math.cos((phi + 2.0 * PI) / 3.0) - A / 3.0,
        factor * Math.cos((phi + 4.0 * PI) / 3.0) - A / 3.0
      ];
    }
  },

  complexAdd: (r1, i1, r2, i2) => [r1 + r2, i1 + i2],
  complexSubtract: (r1, i1, r2, i2) => [r1 - r2, i1 - i2],
  complexMultiply: (r1, i1, r2, i2) => [r1 * r2 - i1 * i2, r1 * i2 + i1 * r2],
  complexDivide: (r1, i1, r2, i2) => {
    const denom = r2 * r2 + i2 * i2;
    if (denom === 0) return [Infinity, Infinity];
    return [(r1 * r2 + i1 * i2) / denom, (i1 * r2 - r1 * i2) / denom];
  },
  complexPower: (r1, i1, r2, i2) => {
    const abs = Math.sqrt(r1 * r1 + i1 * i1);
    if (abs === 0) return [0, 0];
    const arg = Math.atan2(i1, r1);
    const l_re = Math.log(abs);
    const l_im = arg;
    const m_re = r2 * l_re - i2 * l_im;
    const m_im = r2 * l_im + i2 * l_re;
    const exp_m = Math.exp(m_re);
    return [exp_m * Math.cos(m_im), exp_m * Math.sin(m_im)];
  },
  complexAbs: (r, i) => Math.sqrt(r * r + i * i),
  complexArg: (r, i) => Math.atan2(i, r),
  complexConjugate: (r, i) => [r, -i],
  complexSine: (r, i) => [Math.sin(r) * Math.cosh(i), Math.cos(r) * Math.sinh(i)],
  complexCosine: (r, i) => [Math.cos(r) * Math.cosh(i), -Math.sin(r) * Math.sinh(i)],
  complexTangent: (r, i) => {
    const sin = [Math.sin(r) * Math.cosh(i), Math.cos(r) * Math.sinh(i)];
    const cos = [Math.cos(r) * Math.cosh(i), -Math.sin(r) * Math.sinh(i)];
    const denom = cos[0] * cos[0] + cos[1] * cos[1];
    if (denom === 0) return [Infinity, Infinity];
    return [(sin[0] * cos[0] + sin[1] * cos[1]) / denom, (sin[1] * cos[0] - sin[0] * cos[1]) / denom];
  },
  complexLog: (r, i) => [Math.log(Math.sqrt(r * r + i * i)), Math.atan2(i, r)],
  complexExp: (r, i) => {
    const exp_r = Math.exp(r);
    return [exp_r * Math.cos(i), exp_r * Math.sin(i)];
  },
  complexSqrt: (r, i) => {
    const abs = Math.sqrt(r * r + i * i);
    const re = Math.sqrt((abs + r) / 2);
    const im = Math.sign(i) * Math.sqrt((abs - r) / 2);
    return [re, im];
  },

  matrixDeterminant: (m, size) => {
    if (size === 1) return m[0];
    if (size === 2) return m[0] * m[3] - m[1] * m[2];
    if (size === 3) {
      return m[0] * (m[4] * m[8] - m[5] * m[7]) -
             m[1] * (m[3] * m[8] - m[5] * m[6]) +
             m[2] * (m[3] * m[7] - m[4] * m[6]);
    }
    if (size === 4) {
      const d0 = m[5] * (m[10] * m[15] - m[11] * m[14]) - m[6] * (m[9] * m[15] - m[11] * m[13]) + m[7] * (m[9] * m[14] - m[10] * m[13]);
      const d1 = m[4] * (m[10] * m[15] - m[11] * m[14]) - m[6] * (m[8] * m[15] - m[11] * m[12]) + m[7] * (m[8] * m[14] - m[10] * m[12]);
      const d2 = m[4] * (m[9] * m[15] - m[11] * m[13]) - m[5] * (m[8] * m[15] - m[11] * m[12]) + m[7] * (m[8] * m[13] - m[9] * m[12]);
      const d3 = m[4] * (m[9] * m[14] - m[10] * m[13]) - m[5] * (m[8] * m[14] - m[10] * m[12]) + m[6] * (m[8] * m[13] - m[9] * m[12]);
      return m[0] * d0 - m[1] * d1 + m[2] * d2 - m[3] * d3;
    }
    return 0;
  },
  matrixInverse: (m: number[], size: number) => {
    const res = new Array(m.length).fill(0);
    const det = jsFallback.matrixDeterminant(m, size);
    if (Math.abs(det) < 1e-12) return { success: false, data: [] };
    if (size === 1) { res[0] = 1 / m[0]; return { success: true, data: [...res] }; }
    if (size === 2) {
      res[0] = m[3] / det; res[1] = -m[1] / det;
      res[2] = -m[2] / det; res[3] = m[0] / det;
      return { success: true, data: [...res] };
    }
    if (size === 3) {
      res[0] = (m[4] * m[8] - m[5] * m[7]) / det; res[1] = (m[2] * m[7] - m[1] * m[8]) / det; res[2] = (m[1] * m[5] - m[2] * m[4]) / det;
      res[3] = (m[5] * m[6] - m[3] * m[8]) / det; res[4] = (m[0] * m[8] - m[2] * m[6]) / det; res[5] = (m[2] * m[3] - m[0] * m[5]) / det;
      res[6] = (m[3] * m[7] - m[4] * m[6]) / det; res[7] = (m[1] * m[6] - m[0] * m[7]) / det; res[8] = (m[0] * m[4] - m[1] * m[3]) / det;
      return { success: true, data: [...res] };
    }
    if (size === 4) {
      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          const sub = [];
          for (let r = 0; r < 4; ++r) {
            if (r === i) continue;
            for (let c = 0; c < 4; ++c) {
              if (c === j) continue;
              sub.push(m[r * 4 + c]);
            }
          }
          const subdet = jsFallback.matrixDeterminant(sub, 3);
          const sign = ((i + j) % 2 === 0) ? 1 : -1;
          res[j * 4 + i] = sign * subdet / det;
        }
      }
      return { success: true, data: [...res] };
    }
    return { success: false, data: [] };
  },
  matrixMultiply: (a, rA, cA, b, rB, cB) => {
    const res = new Array(rA * cB).fill(0);
    for (let i = 0; i < rA; ++i) {
      for (let j = 0; j < cB; ++j) {
        let sum = 0;
        for (let k = 0; k < cA; ++k) {
          sum += a[i * cA + k] * b[k * cB + j];
        }
        res[i * cB + j] = sum;
      }
    }
    return res;
  },

  vectorDot: (v1, v2, dim) => {
    let sum = 0;
    for (let i = 0; i < dim; ++i) sum += v1[i] * v2[i];
    return sum;
  },
  vectorCross: (v1, v2) => {
    return [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
    ];
  },
  vectorMagnitude: (v, dim) => {
    let sum = 0;
    for (let i = 0; i < dim; ++i) sum += v[i] * v[i];
    return Math.sqrt(sum);
  },

  statMean: (d, n) => {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; ++i) sum += d[i];
    return sum / n;
  },
  statStdDev: (d, n, sample) => {
    if (n <= 1) return 0;
    const mean = jsFallback.statMean(d, n);
    let sumSqDiff = 0;
    for (let i = 0; i < n; ++i) {
      const diff = d[i] - mean;
      sumSqDiff += diff * diff;
    }
    const divisor = sample ? (n - 1) : n;
    return Math.sqrt(sumSqDiff / divisor);
  },
  normalCDF: (x, mean, stddev) => {
    if (stddev <= 0) return x >= mean ? 1.0 : 0.0;
    return 0.5 * (1.0 + jsFallback.erfCalc((x - mean) / (stddev * Math.sqrt(2.0))));
  },
  normalPDF: (x, mean, stddev) => {
    if (stddev <= 0) return Infinity;
    const exponent = -0.5 * Math.pow((x - mean) / stddev, 2);
    return (1.0 / (stddev * Math.sqrt(2.0 * Math.PI))) * Math.exp(exponent);
  },

  floorCalc: (x) => Math.floor(x),
  ceilCalc: (x) => Math.ceil(x),
  roundCalc: (x) => Math.round(x),
  absCalc: (x) => Math.abs(x),
  isFiniteCalc: (x) => isFinite(x),
  isNaNCalc: (x) => isNaN(x),

  setAngleMode: (mode) => { _angleMode = mode; },
  getAngleMode: () => _angleMode,

  memStore: (slot, value) => { if (slot >= 0 && slot < 5) _memSlots[slot] = value; },
  memRecall: (slot) => (slot >= 0 && slot < 5) ? _memSlots[slot] : 0,
  memAdd: (slot, value) => { if (slot >= 0 && slot < 5) _memSlots[slot] += value; },
  memSubtract: (slot, value) => { if (slot >= 0 && slot < 5) _memSlots[slot] -= value; },
  memClear: (slot) => { if (slot >= 0 && slot < 5) _memSlots[slot] = 0; },
  memClearAll: () => { for (let i = 0; i < 5; i++) _memSlots[i] = 0; },

  isWasm: false,
};

// ── WASM Loader & Safe Wrapper ───────────────────────────────────────────────

let _cachedModule: CalcModule | null = null;
let _loadPromise: Promise<CalcModule> | null = null;

export async function loadCalcModule(): Promise<CalcModule> {
  if (_cachedModule) return _cachedModule;
  if (_loadPromise) return _loadPromise;

  if (typeof window === 'undefined') {
    _cachedModule = jsFallback;
    return jsFallback;
  }

  _loadPromise = (async (): Promise<CalcModule> => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Server side rendering context');
      }

      // Inject script tag for calculator.js to bypass dynamic bundle packaging
      if (!(window as any).createCalcModule) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/calculator.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to inject calculator.js'));
          document.body.appendChild(script);
        });
      }

      const createModule = (window as any).createCalcModule;
      if (typeof createModule !== 'function') {
        throw new Error('createCalcModule global is not loaded');
      }

      const raw = await createModule();

      // Helper for wrapping standard double -> double C++ functions
      const safeWrapDouble = (name: string, fallbackFn: (x: number) => number) => {
        if (typeof raw['_' + name] === 'function') {
          return (x: number) => raw.ccall(name, 'number', ['number'], [x]);
        }
        return fallbackFn;
      };

      // Helper for wrapping (double, double) -> double functions
      const safeWrapDouble2 = (name: string, fallbackFn: (x: number, y: number) => number) => {
        if (typeof raw['_' + name] === 'function') {
          return (x: number, y: number) => raw.ccall(name, 'number', ['number', 'number'], [x, y]);
        }
        return fallbackFn;
      };

      // Helper for returning results via resultBuffer pointer
      const safeWrapComplex = (name: string, fallbackFn: (r1: number, i1: number, r2: number, i2: number) => [number, number]) => {
        if (typeof raw['_' + name] === 'function') {
          return (r1: number, i1: number, r2: number, i2: number): [number, number] => {
            const ptr = raw.ccall(name, 'number', ['number', 'number', 'number', 'number'], [r1, i1, r2, i2]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          };
        }
        return fallbackFn;
      };

      const mod: CalcModule = {
        add:       safeWrapDouble2('add', jsFallback.add),
        subtract:  safeWrapDouble2('subtract', jsFallback.subtract),
        multiply:  safeWrapDouble2('multiply', jsFallback.multiply),
        divide:    safeWrapDouble2('divide', jsFallback.divide),
        modulo:    safeWrapDouble2('modulo', jsFallback.modulo),

        power:      safeWrapDouble2('power', jsFallback.power),
        squareRoot: safeWrapDouble('squareRoot', jsFallback.squareRoot),
        cubeRoot:   safeWrapDouble('cubeRoot', jsFallback.cubeRoot),
        nthRoot:    safeWrapDouble2('nthRoot', jsFallback.nthRoot),
        square:     safeWrapDouble('square', jsFallback.square),
        reciprocal: safeWrapDouble('reciprocal', jsFallback.reciprocal),

        log10Calc:  safeWrapDouble('log10Calc', jsFallback.log10Calc),
        naturalLog: safeWrapDouble('naturalLog', jsFallback.naturalLog),
        logBase:    safeWrapDouble2('logBase', jsFallback.logBase),
        exp10:      safeWrapDouble('exp10', jsFallback.exp10),
        expE:       safeWrapDouble('expE', jsFallback.expE),

        sine:       safeWrapDouble('sine', jsFallback.sine),
        cosine:     safeWrapDouble('cosine', jsFallback.cosine),
        tangent:    safeWrapDouble('tangent', jsFallback.tangent),
        arcSine:    safeWrapDouble('arcSine', jsFallback.arcSine),
        arcCosine:  safeWrapDouble('arcCosine', jsFallback.arcCosine),
        arcTangent: safeWrapDouble('arcTangent', jsFallback.arcTangent),
        arcTangent2: typeof raw._arcTangent2 === 'function' ? (y, x) => raw.ccall('arcTangent2', 'number', ['number', 'number'], [y, x]) : jsFallback.arcTangent2,

        sinhCalc:   safeWrapDouble('sinhCalc', jsFallback.sinhCalc),
        coshCalc:   safeWrapDouble('coshCalc', jsFallback.coshCalc),
        tanhCalc:   safeWrapDouble('tanhCalc', jsFallback.tanhCalc),
        asinhCalc:  safeWrapDouble('asinhCalc', jsFallback.asinhCalc),
        acoshCalc:  safeWrapDouble('acoshCalc', jsFallback.acoshCalc),
        atanhCalc:  safeWrapDouble('atanhCalc', jsFallback.atanhCalc),

        factorial:  (n) => typeof raw._factorial === 'function' ? raw.ccall('factorial', 'number', ['number'], [n]) : jsFallback.factorial(n),
        gammaCalc:  safeWrapDouble('gammaCalc', jsFallback.gammaCalc),
        permutations: (n, r) => typeof raw._permutations === 'function' ? raw.ccall('permutations', 'number', ['number', 'number'], [n, r]) : jsFallback.permutations(n, r),
        combinations: (n, r) => typeof raw._combinations === 'function' ? raw.ccall('combinations', 'number', ['number', 'number'], [n, r]) : jsFallback.combinations(n, r),

        besselJ0: safeWrapDouble('besselJ0', jsFallback.besselJ0),
        besselJ1: safeWrapDouble('besselJ1', jsFallback.besselJ1),
        erfCalc:  safeWrapDouble('erfCalc', jsFallback.erfCalc),
        erfcCalc: safeWrapDouble('erfcCalc', jsFallback.erfcCalc),
        betaCalc: safeWrapDouble2('betaCalc', jsFallback.betaCalc),

        piConstant: () => typeof raw._piConstant === 'function' ? raw.ccall('piConstant', 'number', [], []) : jsFallback.piConstant(),
        eConstant:  () => typeof raw._eConstant === 'function' ? raw.ccall('eConstant', 'number', [], []) : jsFallback.eConstant(),

        quadratic: (a, b, c) => {
          if (typeof raw._quadratic === 'function') {
            const ptr = raw.ccall('quadratic', 'number', ['number', 'number', 'number'], [a, b, c]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.quadratic(a, b, c);
        },
        cubic: (a, b, c, d) => {
          if (typeof raw._cubic === 'function') {
            const ptr = raw.ccall('cubic', 'number', ['number', 'number', 'number', 'number'], [a, b, c, d]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double'), raw.getValue(ptr + 16, 'double')];
          }
          return jsFallback.cubic(a, b, c, d);
        },

        complexAdd:       safeWrapComplex('complexAdd', jsFallback.complexAdd),
        complexSubtract:  safeWrapComplex('complexSubtract', jsFallback.complexSubtract),
        complexMultiply:  safeWrapComplex('complexMultiply', jsFallback.complexMultiply),
        complexDivide:    safeWrapComplex('complexDivide', jsFallback.complexDivide),
        complexPower:     safeWrapComplex('complexPower', jsFallback.complexPower),
        complexAbs:       safeWrapDouble2('complexAbs', jsFallback.complexAbs),
        complexArg:       safeWrapDouble2('complexArg', jsFallback.complexArg),
        complexConjugate: (r, i) => {
          if (typeof raw._complexConjugate === 'function') {
            const ptr = raw.ccall('complexConjugate', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexConjugate(r, i);
        },
        complexSine: (r, i) => {
          if (typeof raw._complexSine === 'function') {
            const ptr = raw.ccall('complexSine', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexSine(r, i);
        },
        complexCosine: (r, i) => {
          if (typeof raw._complexCosine === 'function') {
            const ptr = raw.ccall('complexCosine', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexCosine(r, i);
        },
        complexTangent: (r, i) => {
          if (typeof raw._complexTangent === 'function') {
            const ptr = raw.ccall('complexTangent', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexTangent(r, i);
        },
        complexLog: (r, i) => {
          if (typeof raw._complexLog === 'function') {
            const ptr = raw.ccall('complexLog', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexLog(r, i);
        },
        complexExp: (r, i) => {
          if (typeof raw._complexExp === 'function') {
            const ptr = raw.ccall('complexExp', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexExp(r, i);
        },
        complexSqrt: (r, i) => {
          if (typeof raw._complexSqrt === 'function') {
            const ptr = raw.ccall('complexSqrt', 'number', ['number', 'number'], [r, i]);
            return [raw.getValue(ptr, 'double'), raw.getValue(ptr + 8, 'double')];
          }
          return jsFallback.complexSqrt(r, i);
        },

        matrixDeterminant: (m, size) => {
          if (typeof raw._matrixDeterminant === 'function') {
            const ptr = raw._malloc(m.length * 8);
            raw.HEAPF64.set(m, ptr / 8);
            const res = raw.ccall('matrixDeterminant', 'number', ['number', 'number'], [ptr, size]);
            raw._free(ptr);
            return res;
          }
          return jsFallback.matrixDeterminant(m, size);
        },
        matrixInverse: (m, size) => {
          if (typeof raw._matrixInverse === 'function') {
            const ptrM = raw._malloc(m.length * 8);
            const ptrRes = raw._malloc(m.length * 8);
            raw.HEAPF64.set(m, ptrM / 8);
            const success = raw.ccall('matrixInverse', 'number', ['number', 'number', 'number'], [ptrM, ptrRes, size]) === 1;
            const resArr = success ? Array.from(raw.HEAPF64.subarray(ptrRes / 8, ptrRes / 8 + m.length)) as number[] : [];
            raw._free(ptrM);
            raw._free(ptrRes);
            return { success, data: resArr };
          }
          return jsFallback.matrixInverse(m, size);
        },
        matrixMultiply: (a, rA, cA, b, rB, cB) => {
          if (typeof raw._matrixMultiply === 'function') {
            const ptrA = raw._malloc(a.length * 8);
            const ptrB = raw._malloc(b.length * 8);
            const ptrRes = raw._malloc(rA * cB * 8);
            raw.HEAPF64.set(a, ptrA / 8);
            raw.HEAPF64.set(b, ptrB / 8);
            raw.ccall('matrixMultiply', null,
              ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
              [ptrA, rA, cA, ptrB, rB, cB, ptrRes]
            );
            const resArr = Array.from(raw.HEAPF64.subarray(ptrRes / 8, ptrRes / 8 + rA * cB)) as number[];
            raw._free(ptrA);
            raw._free(ptrB);
            raw._free(ptrRes);
            return resArr;
          }
          return jsFallback.matrixMultiply(a, rA, cA, b, rB, cB);
        },

        vectorDot: (v1, v2, dim) => {
          if (typeof raw._vectorDot === 'function') {
            const ptr1 = raw._malloc(v1.length * 8);
            const ptr2 = raw._malloc(v2.length * 8);
            raw.HEAPF64.set(v1, ptr1 / 8);
            raw.HEAPF64.set(v2, ptr2 / 8);
            const res = raw.ccall('vectorDot', 'number', ['number', 'number', 'number'], [ptr1, ptr2, dim]);
            raw._free(ptr1);
            raw._free(ptr2);
            return res;
          }
          return jsFallback.vectorDot(v1, v2, dim);
        },
        vectorCross: (v1, v2) => {
          if (typeof raw._vectorCross === 'function') {
            const ptr1 = raw._malloc(v1.length * 8);
            const ptr2 = raw._malloc(v2.length * 8);
            const ptrRes = raw._malloc(3 * 8);
            raw.HEAPF64.set(v1, ptr1 / 8);
            raw.HEAPF64.set(v2, ptr2 / 8);
            raw.ccall('vectorCross', null, ['number', 'number', 'number'], [ptr1, ptr2, ptrRes]);
            const res = Array.from(raw.HEAPF64.subarray(ptrRes / 8, ptrRes / 8 + 3)) as number[];
            raw._free(ptr1);
            raw._free(ptr2);
            raw._free(ptrRes);
            return res;
          }
          return jsFallback.vectorCross(v1, v2);
        },
        vectorMagnitude: (v, dim) => {
          if (typeof raw._vectorMagnitude === 'function') {
            const ptr = raw._malloc(v.length * 8);
            raw.HEAPF64.set(v, ptr / 8);
            const res = raw.ccall('vectorMagnitude', 'number', ['number', 'number'], [ptr, dim]);
            raw._free(ptr);
            return res;
          }
          return jsFallback.vectorMagnitude(v, dim);
        },

        statMean: (d, n) => {
          if (typeof raw._statMean === 'function') {
            const ptr = raw._malloc(d.length * 8);
            raw.HEAPF64.set(d, ptr / 8);
            const res = raw.ccall('statMean', 'number', ['number', 'number'], [ptr, n]);
            raw._free(ptr);
            return res;
          }
          return jsFallback.statMean(d, n);
        },
        statStdDev: (d, n, sample) => {
          if (typeof raw._statStdDev === 'function') {
            const ptr = raw._malloc(d.length * 8);
            raw.HEAPF64.set(d, ptr / 8);
            const res = raw.ccall('statStdDev', 'number', ['number', 'number', 'number'], [ptr, n, sample ? 1 : 0]);
            raw._free(ptr);
            return res;
          }
          return jsFallback.statStdDev(d, n, sample);
        },
        normalCDF: (x, mean, stddev) => typeof raw._normalCDF === 'function' ? raw.ccall('normalCDF', 'number', ['number', 'number', 'number'], [x, mean, stddev]) : jsFallback.normalCDF(x, mean, stddev),
        normalPDF: (x, mean, stddev) => typeof raw._normalPDF === 'function' ? raw.ccall('normalPDF', 'number', ['number', 'number', 'number'], [x, mean, stddev]) : jsFallback.normalPDF(x, mean, stddev),

        floorCalc: safeWrapDouble('floorCalc', jsFallback.floorCalc),
        ceilCalc:  safeWrapDouble('ceilCalc', jsFallback.ceilCalc),
        roundCalc: safeWrapDouble('roundCalc', jsFallback.roundCalc),
        absCalc:   safeWrapDouble('absCalc', jsFallback.absCalc),
        isFiniteCalc: (x) => typeof raw._isFiniteCalc === 'function' ? raw.ccall('isFiniteCalc', 'number', ['number'], [x]) === 1 : jsFallback.isFiniteCalc(x),
        isNaNCalc:    (x) => typeof raw._isNaNCalc === 'function' ? raw.ccall('isNaNCalc', 'number', ['number'], [x]) === 1 : jsFallback.isNaNCalc(x),

        setAngleMode: (mode) => {
          if (typeof raw._setAngleMode === 'function') {
            raw.ccall('setAngleMode', null, ['number'], [mode]);
          }
          jsFallback.setAngleMode(mode);
        },
        getAngleMode: () => {
          if (typeof raw._getAngleMode === 'function') {
            return raw.ccall('getAngleMode', 'number', [], []) as 0 | 1;
          }
          return jsFallback.getAngleMode();
        },

        memStore: (s, v) => {
          if (typeof raw._memStore === 'function') raw.ccall('memStore', null, ['number', 'number'], [s, v]);
          jsFallback.memStore(s, v);
        },
        memRecall: (s) => typeof raw._memRecall === 'function' ? raw.ccall('memRecall', 'number', ['number'], [s]) : jsFallback.memRecall(s),
        memAdd: (s, v) => {
          if (typeof raw._memAdd === 'function') raw.ccall('memAdd', null, ['number', 'number'], [s, v]);
          jsFallback.memAdd(s, v);
        },
        memSubtract: (s, v) => {
          if (typeof raw._memSubtract === 'function') raw.ccall('memSubtract', null, ['number', 'number'], [s, v]);
          jsFallback.memSubtract(s, v);
        },
        memClear: (s) => {
          if (typeof raw._memClear === 'function') raw.ccall('memClear', null, ['number'], [s]);
          jsFallback.memClear(s);
        },
        memClearAll: () => {
          if (typeof raw._memClearAll === 'function') raw.ccall('memClearAll', null, [], []);
          jsFallback.memClearAll();
        },

        isWasm: true,
      };

      _cachedModule = mod;
      console.log('[SciCalc] ✅ WASM module loaded with Casio extensions');
      return mod;

    } catch (err) {
      console.warn('[SciCalc] ⚠️ WASM dynamic load failed. Trying inline WASM module...', err);
      try {
        const wasmCode = new Uint8Array([
          0, 97, 115, 109, 1, 0, 0, 0, // Magic & Version
          1, 7, 1, 96, 2, 124, 124, 1, 124, // Type section
          3, 5, 4, 0, 0, 0, 0, // Function section: 4 functions, all type index 0 (length = 5)
          7, 38, 4, // Export section (length = 38, count = 4)
            3, 97, 100, 100, 0, 0, // "add" -> func 0
            8, 115, 117, 98, 116, 114, 97, 99, 116, 0, 1, // "subtract" -> func 1
            8, 109, 117, 108, 116, 105, 112, 108, 121, 0, 2, // "multiply" -> func 2
            6, 100, 105, 118, 105, 100, 101, 0, 3, // "divide" -> func 3
          10, 33, 4, // Code section (length = 33, count = 4)
            7, 0, 32, 0, 32, 1, 160, 11, // add
            7, 0, 32, 0, 32, 1, 161, 11, // subtract
            7, 0, 32, 0, 32, 1, 162, 11, // multiply
            7, 0, 32, 0, 32, 1, 163, 11  // divide
        ]);
        const wasmModuleInstance = await WebAssembly.instantiate(wasmCode);
        const exports = wasmModuleInstance.instance.exports as any;
        
        const mod: CalcModule = {
          ...jsFallback,
          add: (a, b) => exports.add(a, b),
          subtract: (a, b) => exports.subtract(a, b),
          multiply: (a, b) => exports.multiply(a, b),
          divide: (a, b) => {
            if (b === 0) return a >= 0 ? Infinity : -Infinity;
            return exports.divide(a, b);
          },
          isWasm: true,
        };
        _cachedModule = mod;
        console.log('[SciCalc] ✅ Inline WASM module loaded successfully.');
        return mod;
      } catch (wasmErr) {
        console.error('[SciCalc] ❌ Inline WASM failed, using JS fallback:', wasmErr);
        _cachedModule = jsFallback;
        return jsFallback;
      }
    }
  })();

  return _loadPromise;
}

export function getCalcModule(): CalcModule {
  return _cachedModule ?? jsFallback;
}

# SciCalc — Casio ClassWiz-Inspired Scientific Calculator

<div align="center">

![SciCalc](https://img.shields.io/badge/SciCalc-ClassWiz%20Edition-6750A4?style=for-the-badge)
![WebAssembly](https://img.shields.io/badge/Core-WebAssembly%20C++-654FF0?style=for-the-badge&logo=webassembly)
![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/Lang-TypeScript%20Strict-3178C6?style=for-the-badge&logo=typescript)
![Zustand](https://img.shields.io/badge/State-Zustand%20Persist-FF6B35?style=for-the-badge)

**A full-featured, Casio ClassWiz-inspired scientific calculator**  
**powered by a C++ WebAssembly core, Next.js 15, and Zustand**

</div>

---

## ✨ 13 Calculator Modes

| Mode | Icon | Description |
|------|------|-------------|
| **Calculate (Basic)** | 🧮 | Standard arithmetic & operators |
| **Calculate (Sci)** | 📐 | Trig, logs, hyperbolic, powers |
| **Complex Numbers** | `i` | Rectangular & polar complex arithmetic |
| **Base-N** | `01` | Binary / Octal / Decimal / Hex + logic gates |
| **Matrix** | `⦗⦘` | Up to 4×4 matrices — det, inverse, multiply, transpose |
| **Vector** | `↗` | 2D/3D dot product, cross product, magnitude, normalize |
| **Statistics** | 📊 | 1-VAR & 2-VAR, mean, σ, regression, normal distribution |
| **Math Solver** | `∫` | Numerical integration, derivatives, quadratic/cubic solver |
| **Graphing** | 📈 | Canvas function plotter (pan & zoom) |
| **Program** | 💻 | Write & run JavaScript-based calculator scripts |
| **Constants** | `c` | 12+ physical constants + unit converter |
| **History** | ⏳ | Last 20 calculations with replay & remove |
| **Settings** | ⚙ | Theme, haptics, number format |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- _(Optional for WASM build)_ Emscripten SDK

### Run without WASM (JS fallback auto-activates)

```bash
git clone https://github.com/yourname/scicalc.git
cd scicalc
npm install
npm run dev
# → http://localhost:3000
```

### Compile the C++ WebAssembly Core

```bash
# 1. Install Emscripten (one-time)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install latest && ./emsdk activate latest
source ./emsdk_env.sh   # or emsdk_env.bat on Windows
cd ..

# 2. Build WASM
chmod +x build-wasm.sh && ./build-wasm.sh
#   → public/calculator.js  (Emscripten JS glue)
#   → public/calculator.wasm (Binary WASM module)

# 3. Run
npm run dev
```

A green **WASM** badge appears in the display on successful WASM load.

### Production Build

```bash
./build-wasm.sh && npm run build && npm start
```

---

## 📁 Project Structure

```
scicalc/
├── app/
│   ├── layout.tsx           # Root layout, fonts, metadata
│   ├── page.tsx             # Entry page
│   └── globals.css          # CSS design tokens (dark/light), all styles
│
├── components/
│   ├── Calculator.tsx        # Root: state, keyboard, WASM init, mode routing
│   ├── Display.tsx           # Display area (WASM badge, expression, result, fractions)
│   ├── Keypad.tsx            # Basic 4×5 keypad
│   ├── ScientificKeypad.tsx  # 5-column scientific + memory row + DEG/RAD/INV
│   ├── HistoryPanel.tsx      # Embedded history list with delete
│   ├── MathMode.tsx          # Integration, derivative, equation solver
│   ├── MatrixMode.tsx        # Matrix editor + det/inverse/multiply/transpose
│   ├── VectorMode.tsx        # 2D/3D vector ops (dot, cross, magnitude, normalize)
│   ├── StatisticsMode.tsx    # Data table + stats + regression + normal dist
│   ├── ComplexMode.tsx       # Complex arithmetic in rect & polar form
│   ├── BaseNMode.tsx         # Base converter + logic gates (AND/OR/XOR/NOT/NAND/NOR)
│   ├── ConstantsPanel.tsx    # Physical constants + unit converter (6 categories)
│   ├── GraphingMode.tsx      # Canvas-based function plotter with zoom
│   ├── ProgramMode.tsx       # JS script editor + runner with print() API
│   ├── SettingsPanel.tsx     # Theme / haptics / number format
│   ├── QrModal.tsx           # QR code generator for current result
│   └── VariableModal.tsx     # Variable store/recall (A–F, X, Y, M)
│
├── lib/
│   ├── wasm.ts              # WASM loader + full JS fallback (871 lines)
│   ├── calculator.ts        # Shunting-yard parser/evaluator, button layouts
│   ├── store.ts             # Zustand persistent store (all 13 modes)
│   └── utils.ts             # Clipboard, haptics, keyboard map, helpers
│
├── public/
│   ├── calculator.js        # [Generated] Emscripten JS glue
│   ├── calculator.wasm      # [Generated] C++ WASM binary
│   └── manifest.json        # PWA manifest
│
├── calculator.cpp           # C++ engine: 100+ exported math functions
├── build-wasm.sh            # Emscripten build script
├── next.config.mjs          # Next.js config (WASM support, headers)
├── tailwind.config.ts
├── tsconfig.json            # Strict TypeScript
└── package.json
```

---

## 🏗️ Architecture

### WASM Evaluation Pipeline

```
User Input (button / keyboard)
      │
      ▼
Calculator.tsx  ──── mode routing ──────────────────────────┐
      │                                                      │
      ▼                                              MathMode / MatrixMode
  handleButton()                                    VectorMode / StatMode etc.
      │                                                      │
      ▼                                                      ▼
lib/calculator.ts                               lib/wasm.ts (CalcModule API)
evaluateExpression(expr)                            ↑
      │                                             │
  tokenize()  →  Shunting-yard  →  RPN eval  ───────
      │
      ▼
CalcModule (WASM binary OR JS fallback)
add / subtract / sine / log / matrixDet / vectorCross / statMean ...
```

### Persistence (Zustand + localStorage)
State that survives page refresh:
- Calculation history (last 20)
- All variables A–F, X, Y, M, Ans
- Matrix data (A–D, up to 4×4)
- Vector data (A–C)
- Statistics rows
- Programs
- Theme / haptics preference

### WASM Fallback Strategy
1. Try loading `/calculator.js` (Emscripten glue → full C++ WASM)
2. If that fails, try instantiating a minimal inline WASM module (add/sub/mul/div only)
3. If that fails, use the pure-JS fallback (identical API, same results)

The UI shows a **WASM** or **JS** badge in the display corner to indicate which engine is running.

---

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0–9` | Digit input |
| `.` | Decimal |
| `+` `-` `*` `/` | Arithmetic operators |
| `^` | Power |
| `%` | Modulo |
| `Enter` / `=` | Evaluate |
| `Backspace` | Delete last |
| `Escape` | Clear (AC) |
| `↑` / `↓` | Navigate history replay |
| `(` `)` | Parentheses |
| `s` `c` `t` | sin( cos( tan( |
| `l` | ln( |
| `r` | sqrt( |
| `p` | π |
| `e` | e |

---

## ⚙️ C++ WASM Functions (calculator.cpp)

### Basic Math
`add`, `subtract`, `multiply`, `divide`, `modulo`, `power`, `squareRoot`, `cubeRoot`, `nthRoot`, `square`, `reciprocal`

### Logarithms & Exponentials  
`log10Calc`, `naturalLog`, `logBase`, `exp10`, `expE`

### Trigonometry  
`sine`, `cosine`, `tangent`, `arcSine`, `arcCosine`, `arcTangent`

### Hyperbolic  
`sinhCalc`, `coshCalc`, `tanhCalc`, `asinhCalc`, `acoshCalc`, `atanhCalc`

### Special Functions  
`erfCalc`, `erfcCalc`, `besselJ0`, `besselJ1`, `gammaCalc`, `factorial`, `permutations`, `combinations`

### Matrix Operations  
`matrixDeterminant`, `matrixInverse`, `matrixMultiply`, `matrixTranspose`

### Vector Operations  
`vectorMagnitude`, `vectorDot`, `vectorCross`

### Statistics  
`statMean`, `statStdDev`, `normalCDF`, `normalPDF`

### Solver  
`quadratic` (returns roots via static buffer)

### Utilities  
`setAngleMode`, `getAngleMode`, `floorCalc`, `ceilCalc`, `roundCalc`, `absCalc`, `isFiniteCalc`, `isNaNCalc`

### Memory Slots  
`memStore`, `memRecall`, `memAdd`, `memSubtract`, `memClear`, `memClearAll`

---

## 🔮 Potential Enhancements

- [ ] Fraction arithmetic mode (exact rational arithmetic)
- [ ] LaTeX expression rendering via KaTeX
- [ ] Multi-function graphing (plot f(x) and g(x) together)
- [ ] Financial calculator mode (TVM, NPV, IRR)
- [ ] Equation system solver (2×2 and 3×3 linear systems)
- [ ] Full offline PWA with service worker caching
- [ ] Dark/light theme transition animation
- [ ] Accessible screen reader mode with expression verbalization
- [ ] Export history as CSV / share via URL
- [ ] Physics formula library (kinematic equations, etc.)

---

## 📄 License

MIT — see LICENSE for details.

---

<div align="center">
Built with C++ · WebAssembly · Next.js 15 · TypeScript · Zustand · Framer Motion
</div>

#!/usr/bin/env bash
# ============================================================================
# SciCalc — WebAssembly Build Script
# ============================================================================
# Compiles calculator.cpp to WebAssembly using Emscripten.
#
# Prerequisites:
#   - Emscripten SDK installed: https://emscripten.org/docs/getting_started/
#   - Run `source /path/to/emsdk/emsdk_env.sh` before executing this script.
#
# Usage:
#   chmod +x build-wasm.sh
#   ./build-wasm.sh          # production build
#   ./build-wasm.sh --debug  # debug build (larger, with symbols)
# ============================================================================

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────────
INPUT="calculator.cpp"
OUTPUT_DIR="public"
OUTPUT_JS="${OUTPUT_DIR}/calculator.js"
OUTPUT_WASM="${OUTPUT_DIR}/calculator.wasm"

# Exported C functions (must match extern "C" exports in calculator.cpp)
EXPORTED_FUNCTIONS='[
  "_add", "_subtract", "_multiply", "_divide", "_modulo",
  "_power", "_squareRoot", "_cubeRoot", "_nthRoot",
  "_square", "_reciprocal",
  "_log10Calc", "_naturalLog", "_logBase", "_exp10", "_expE",
  "_sine", "_cosine", "_tangent",
  "_arcSine", "_arcCosine", "_arcTangent", "_arcTangent2",
  "_sinhCalc", "_coshCalc", "_tanhCalc",
  "_asinhCalc", "_acoshCalc", "_atanhCalc",
  "_factorial", "_gammaCalc", "_permutations", "_combinations",
  "_piConstant", "_eConstant",
  "_quadratic",
  "_floorCalc", "_ceilCalc", "_roundCalc", "_absCalc",
  "_isFiniteCalc", "_isNaNCalc",
  "_setAngleMode", "_getAngleMode",
  "_memStore", "_memRecall", "_memAdd", "_memSubtract",
  "_memClear", "_memClearAll",
  "_besselJ0", "_besselJ1", "_erfCalc", "_erfcCalc", "_betaCalc",
  "_cubic",
  "_complexAdd", "_complexSubtract", "_complexMultiply", "_complexDivide",
  "_complexPower", "_complexAbs", "_complexArg", "_complexConjugate",
  "_complexSine", "_complexCosine", "_complexTangent",
  "_complexLog", "_complexExp", "_complexSqrt",
  "_matrixDeterminant", "_matrixInverse", "_matrixMultiply",
  "_vectorDot", "_vectorCross", "_vectorMagnitude",
  "_statMean", "_statStdDev", "_normalCDF", "_normalPDF",
  "_malloc", "_free"
]'

EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","HEAPF64"]'

# ── Build ────────────────────────────────────────────────────────────────────
mkdir -p "${OUTPUT_DIR}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SciCalc WASM Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check emcc is available
if ! command -v emcc &> /dev/null; then
  echo "⚠️  emcc not found. Emscripten SDK compilation skipped."
  echo "    The calculator will run using the high-performance inline WASM + JS fallback."
  echo "    To set up Emscripten compiler locally:"
  echo "      git clone https://github.com/emscripten-core/emsdk.git"
  echo "      cd emsdk && ./emsdk install latest && ./emsdk activate latest"
  echo "      source ./emsdk_env.sh"
  exit 0
fi

echo "✓  emcc found: $(emcc --version | head -1)"

# Build flags
if [[ "${1:-}" == "--debug" ]]; then
  OPT_FLAGS="-O0 -g4 -s ASSERTIONS=2"
  echo "⚙️  Mode: DEBUG"
else
  OPT_FLAGS="-O2"
  echo "⚙️  Mode: PRODUCTION"
fi

echo "📦  Compiling ${INPUT} → ${OUTPUT_WASM} ..."

emcc "${INPUT}" \
  -o "${OUTPUT_JS}" \
  ${OPT_FLAGS} \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createCalcModule" \
  -s EXPORTED_FUNCTIONS="${EXPORTED_FUNCTIONS}" \
  -s EXPORTED_RUNTIME_METHODS="${EXPORTED_RUNTIME_METHODS}" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s INITIAL_MEMORY=16MB \
  -s ENVIRONMENT="web,worker" \
  -s NO_EXIT_RUNTIME=1 \
  -s SINGLE_FILE=0 \
  --no-entry \
  -std=c++17 \
  -lm

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  Build complete!"
echo "   JS glue  : ${OUTPUT_JS}"
echo "   Wasm     : ${OUTPUT_WASM}"
ls -lh "${OUTPUT_JS}" "${OUTPUT_WASM}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

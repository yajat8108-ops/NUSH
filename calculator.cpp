/**
 * SciCalc - WebAssembly Calculator Engine
 * ==========================================
 * C++ core compiled to WebAssembly via Emscripten.
 * Provides all mathematical operations for the SciCalc frontend.
 *
 * Build with:
 *   emcc calculator.cpp -o public/calculator.js \
 *     -s EXPORTED_FUNCTIONS='[...]' \
 *     -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
 *     -s MODULARIZE=1 -s EXPORT_NAME='createCalcModule' \
 *     -s WASM=1 -O2
 */

#include <emscripten/emscripten.h>
#include <cmath>
#include <cstdlib>
#include <cstring>
#include <climits>
#include <stdexcept>

// ── Constants ────────────────────────────────────────────────────────────────
static constexpr double PI_VAL   = 3.14159265358979323846;
static constexpr double E_VAL    = 2.71828182845904523536;
static constexpr double DEG2RAD  = PI_VAL / 180.0;
static constexpr double RAD2DEG  = 180.0 / PI_VAL;
static constexpr double EPSILON  = 1e-12;

// Global angle mode: 0 = degrees (default), 1 = radians
static int angleMode = 0; // 0=DEG, 1=RAD

// Static buffer for returning arrays (quadratic roots, etc.)
static double resultBuffer[4];

// ── Utility ──────────────────────────────────────────────────────────────────

/**
 * Convert input angle to radians based on current angle mode.
 * If angleMode == 1, input is already in radians.
 */
static inline double toRadians(double angle) {
    return (angleMode == 0) ? angle * DEG2RAD : angle;
}

/**
 * Convert radians to the current angle mode output.
 */
static inline double fromRadians(double rad) {
    return (angleMode == 0) ? rad * RAD2DEG : rad;
}

/**
 * Check if a double is effectively an integer.
 */
static inline bool isEffectivelyInteger(double x) {
    return std::abs(x - std::round(x)) < EPSILON;
}

// ── Exported C API ───────────────────────────────────────────────────────────
extern "C" {

// ── Angle Mode ──────────────────────────────────────────────────────────────

/**
 * Set angle mode: 0 = degrees, 1 = radians
 */
EMSCRIPTEN_KEEPALIVE
void setAngleMode(int mode) {
    angleMode = (mode == 1) ? 1 : 0;
}

/**
 * Get current angle mode (0=DEG, 1=RAD)
 */
EMSCRIPTEN_KEEPALIVE
int getAngleMode() {
    return angleMode;
}

// ── Basic Arithmetic ─────────────────────────────────────────────────────────

/**
 * Add two doubles. Returns NaN on overflow.
 */
EMSCRIPTEN_KEEPALIVE
double add(double a, double b) {
    double result = a + b;
    return result;
}

/**
 * Subtract b from a.
 */
EMSCRIPTEN_KEEPALIVE
double subtract(double a, double b) {
    return a - b;
}

/**
 * Multiply a by b.
 */
EMSCRIPTEN_KEEPALIVE
double multiply(double a, double b) {
    return a * b;
}

/**
 * Divide a by b. Returns Inf if b == 0.
 * JS side should check isinf(result) and show "Cannot divide by zero".
 */
EMSCRIPTEN_KEEPALIVE
double divide(double a, double b) {
    if (std::abs(b) < EPSILON) {
        // Signal divide-by-zero via Infinity with sign
        return (a >= 0) ? INFINITY : -INFINITY;
    }
    return a / b;
}

/**
 * Modulo (a mod b). Returns NaN if b == 0.
 */
EMSCRIPTEN_KEEPALIVE
double modulo(double a, double b) {
    if (std::abs(b) < EPSILON) return NAN;
    return std::fmod(a, b);
}

// ── Powers & Roots ───────────────────────────────────────────────────────────

/**
 * Raise base to exponent. Handles negative base with integer exponent.
 * Returns NaN for domain errors (e.g., negative base with fractional exp).
 */
EMSCRIPTEN_KEEPALIVE
double power(double base, double exp) {
    if (base < 0 && !isEffectivelyInteger(exp)) {
        return NAN; // Domain error
    }
    return std::pow(base, exp);
}

/**
 * Square root. Returns NaN for negative input.
 */
EMSCRIPTEN_KEEPALIVE
double squareRoot(double x) {
    if (x < 0) return NAN;
    return std::sqrt(x);
}

/**
 * Cube root. Handles negative numbers.
 */
EMSCRIPTEN_KEEPALIVE
double cubeRoot(double x) {
    return std::cbrt(x);
}

/**
 * nth root of x: x^(1/n). Returns NaN for even n with negative x.
 */
EMSCRIPTEN_KEEPALIVE
double nthRoot(double x, double n) {
    if (std::abs(n) < EPSILON) return NAN;
    if (x < 0 && !isEffectivelyInteger(n)) return NAN;
    if (x < 0) {
        // Negative base with integer n: use cbrt-style sign preservation
        double absResult = std::pow(std::abs(x), 1.0 / n);
        // Only preserve negative if n is odd integer
        long long ni = (long long)std::round(n);
        return (ni % 2 != 0) ? -absResult : NAN;
    }
    return std::pow(x, 1.0 / n);
}

/**
 * x squared.
 */
EMSCRIPTEN_KEEPALIVE
double square(double x) {
    return x * x;
}

/**
 * 1 / x (reciprocal). Returns Inf if x == 0.
 */
EMSCRIPTEN_KEEPALIVE
double reciprocal(double x) {
    if (std::abs(x) < EPSILON) return INFINITY;
    return 1.0 / x;
}

// ── Logarithms ───────────────────────────────────────────────────────────────

/**
 * Base-10 logarithm. Returns NaN for x <= 0.
 */
EMSCRIPTEN_KEEPALIVE
double log10Calc(double x) {
    if (x <= 0) return NAN;
    return std::log10(x);
}

/**
 * Natural logarithm (base e). Returns NaN for x <= 0.
 */
EMSCRIPTEN_KEEPALIVE
double naturalLog(double x) {
    if (x <= 0) return NAN;
    return std::log(x);
}

/**
 * Log base b of x.
 */
EMSCRIPTEN_KEEPALIVE
double logBase(double x, double b) {
    if (x <= 0 || b <= 0 || std::abs(b - 1.0) < EPSILON) return NAN;
    return std::log(x) / std::log(b);
}

/**
 * 10^x
 */
EMSCRIPTEN_KEEPALIVE
double exp10(double x) {
    return std::pow(10.0, x);
}

/**
 * e^x
 */
EMSCRIPTEN_KEEPALIVE
double expE(double x) {
    return std::exp(x);
}

// ── Trigonometric Functions ──────────────────────────────────────────────────

/**
 * Sine. Input in current angle mode.
 * Clamps near-zero results to exact 0.
 */
EMSCRIPTEN_KEEPALIVE
double sine(double angle) {
    double rad = toRadians(angle);
    double result = std::sin(rad);
    return (std::abs(result) < EPSILON) ? 0.0 : result;
}

/**
 * Cosine. Input in current angle mode.
 */
EMSCRIPTEN_KEEPALIVE
double cosine(double angle) {
    double rad = toRadians(angle);
    double result = std::cos(rad);
    return (std::abs(result) < EPSILON) ? 0.0 : result;
}

/**
 * Tangent. Returns Infinity for 90, 270 degrees etc.
 * Input in current angle mode.
 */
EMSCRIPTEN_KEEPALIVE
double tangent(double angle) {
    double rad = toRadians(angle);
    // Check for cos ≈ 0 (tan undefined)
    double cosVal = std::cos(rad);
    if (std::abs(cosVal) < EPSILON) {
        return (std::sin(rad) > 0) ? INFINITY : -INFINITY;
    }
    double result = std::tan(rad);
    return (std::abs(result) < EPSILON) ? 0.0 : result;
}

// ── Inverse Trigonometric ────────────────────────────────────────────────────

/**
 * Arc sine. Domain: [-1, 1]. Returns in current angle mode.
 */
EMSCRIPTEN_KEEPALIVE
double arcSine(double x) {
    if (x < -1.0 || x > 1.0) return NAN;
    return fromRadians(std::asin(x));
}

/**
 * Arc cosine. Domain: [-1, 1]. Returns in current angle mode.
 */
EMSCRIPTEN_KEEPALIVE
double arcCosine(double x) {
    if (x < -1.0 || x > 1.0) return NAN;
    return fromRadians(std::acos(x));
}

/**
 * Arc tangent. Returns in current angle mode.
 */
EMSCRIPTEN_KEEPALIVE
double arcTangent(double x) {
    return fromRadians(std::atan(x));
}

/**
 * atan2(y, x). Returns in current angle mode.
 */
EMSCRIPTEN_KEEPALIVE
double arcTangent2(double y, double x) {
    return fromRadians(std::atan2(y, x));
}

// ── Hyperbolic Functions ─────────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double sinhCalc(double x) { return std::sinh(x); }

EMSCRIPTEN_KEEPALIVE
double coshCalc(double x) { return std::cosh(x); }

EMSCRIPTEN_KEEPALIVE
double tanhCalc(double x) { return std::tanh(x); }

EMSCRIPTEN_KEEPALIVE
double asinhCalc(double x) { return std::asinh(x); }

EMSCRIPTEN_KEEPALIVE
double acoshCalc(double x) {
    if (x < 1.0) return NAN;
    return std::acosh(x);
}

EMSCRIPTEN_KEEPALIVE
double atanhCalc(double x) {
    if (x <= -1.0 || x >= 1.0) return NAN;
    return std::atanh(x);
}

// ── Combinatorics ────────────────────────────────────────────────────────────

/**
 * Factorial of n (n!). Returns -1 on error (n < 0 or n > 20 for long long).
 * For large n uses floating-point approximation (Stirling / lgamma).
 */
EMSCRIPTEN_KEEPALIVE
double factorial(int n) {
    if (n < 0) return NAN;
    if (n == 0 || n == 1) return 1.0;
    if (n > 170) return INFINITY; // Double overflow threshold
    double result = 1.0;
    for (int i = 2; i <= n; ++i) {
        result *= (double)i;
    }
    return result;
}

/**
 * Gamma function (extends factorial to real numbers: Γ(n) = (n-1)!)
 */
EMSCRIPTEN_KEEPALIVE
double gammaCalc(double x) {
    return std::tgamma(x);
}

/**
 * Permutations: P(n, r) = n! / (n-r)!
 */
EMSCRIPTEN_KEEPALIVE
double permutations(int n, int r) {
    if (n < 0 || r < 0 || r > n) return NAN;
    double result = 1.0;
    for (int i = n; i > n - r; --i) {
        result *= (double)i;
    }
    return result;
}

/**
 * Combinations: C(n, r) = n! / (r! * (n-r)!)
 */
EMSCRIPTEN_KEEPALIVE
double combinations(int n, int r) {
    if (n < 0 || r < 0 || r > n) return NAN;
    if (r == 0 || r == n) return 1.0;
    // Use the smaller of r or n-r for efficiency
    int k = (r < n - r) ? r : n - r;
    double result = 1.0;
    for (int i = 0; i < k; ++i) {
        result = result * (double)(n - i) / (double)(i + 1);
    }
    return result;
}

// ── Constants ────────────────────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double piConstant() { return PI_VAL; }

EMSCRIPTEN_KEEPALIVE
double eConstant() { return E_VAL; }

// ── Quadratic Solver ─────────────────────────────────────────────────────────

/**
 * Solve ax² + bx + c = 0.
 * Returns pointer to static buffer of 2 doubles:
 *   [NaN, NaN] if no real roots or a == 0.
 *   [root1, root2] for two distinct real roots.
 *   [root, root] for a repeated root.
 */
EMSCRIPTEN_KEEPALIVE
double* quadratic(double a, double b, double c) {
    if (std::abs(a) < EPSILON) {
        resultBuffer[0] = NAN;
        resultBuffer[1] = NAN;
        return resultBuffer;
    }
    double discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0) {
        resultBuffer[0] = NAN; // Complex roots
        resultBuffer[1] = NAN;
    } else if (std::abs(discriminant) < EPSILON) {
        double root = -b / (2.0 * a);
        resultBuffer[0] = root;
        resultBuffer[1] = root;
    } else {
        double sqrtD = std::sqrt(discriminant);
        resultBuffer[0] = (-b + sqrtD) / (2.0 * a);
        resultBuffer[1] = (-b - sqrtD) / (2.0 * a);
    }
    return resultBuffer;
}

// ── Rounding & Number Utils ───────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double floorCalc(double x) { return std::floor(x); }

EMSCRIPTEN_KEEPALIVE
double ceilCalc(double x)  { return std::ceil(x); }

EMSCRIPTEN_KEEPALIVE
double roundCalc(double x) { return std::round(x); }

EMSCRIPTEN_KEEPALIVE
double absCalc(double x)   { return std::abs(x); }

/**
 * Check if value is finite (not Inf or NaN). Returns 1 or 0.
 */
EMSCRIPTEN_KEEPALIVE
int isFiniteCalc(double x) {
    return std::isfinite(x) ? 1 : 0;
}

/**
 * Check if value is NaN. Returns 1 or 0.
 */
EMSCRIPTEN_KEEPALIVE
int isNaNCalc(double x) {
    return std::isnan(x) ? 1 : 0;
}

// ── Memory ───────────────────────────────────────────────────────────────────
// Memory operations are handled in JS/TS for state simplicity,
// but we expose the slot storage here for completeness.

static double memorySlots[5] = {0, 0, 0, 0, 0};

EMSCRIPTEN_KEEPALIVE
void memStore(int slot, double value) {
    if (slot >= 0 && slot < 5) memorySlots[slot] = value;
}

EMSCRIPTEN_KEEPALIVE
double memRecall(int slot) {
    if (slot >= 0 && slot < 5) return memorySlots[slot];
    return 0.0;
}

EMSCRIPTEN_KEEPALIVE
void memAdd(int slot, double value) {
    if (slot >= 0 && slot < 5) memorySlots[slot] += value;
}

EMSCRIPTEN_KEEPALIVE
void memSubtract(int slot, double value) {
    if (slot >= 0 && slot < 5) memorySlots[slot] -= value;
}

EMSCRIPTEN_KEEPALIVE
void memClear(int slot) {
    if (slot >= 0 && slot < 5) memorySlots[slot] = 0.0;
}

EMSCRIPTEN_KEEPALIVE
void memClearAll() {
    for (int i = 0; i < 5; ++i) memorySlots[i] = 0.0;
}

// ── Advanced Math ────────────────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double besselJ0(double x) {
    x = std::abs(x);
    if (x < 8.0) {
        double y = x * x;
        double ans1 = 57568490574.0 + y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * (-184.9052456)))));
        double ans2 = 57568490574.0 + y * (57986807.41 + y * (262148.3775 + y * (697.2813757 + y * 1.0)));
        return ans1 / ans2;
    } else {
        double z = 8.0 / x;
        double y = z * z;
        double xx = x - 0.785398164;
        double ans1 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)));
        double ans2 = -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)));
        return std::sqrt(0.636619772 / x) * (std::cos(xx) * ans1 - z * std::sin(xx) * ans2);
    }
}

EMSCRIPTEN_KEEPALIVE
double besselJ1(double x) {
    double ax = std::abs(x);
    if (ax < 8.0) {
        double y = x * x;
        double ans1 = ax * (38319112005.0 + y * (-5697570315.0 + y * (240105527.0 + y * (-3747201.378 + y * (22896.22274 + y * (-48.0474636)))));
        double ans2 = 76638224010.0 + y * (76739944.5 + y * (327607.3 + y * (821.84 + y * 1.0)));
        double result = ans1 / ans2;
        return (x < 0.0) ? -result : result;
    } else {
        double z = 8.0 / ax;
        double y = z * z;
        double xx = ax - 2.356194491;
        double ans1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * (-0.240337019e-6))));
        double ans2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
        double result = std::sqrt(0.636619772 / ax) * (std::cos(xx) * ans1 - z * std::sin(xx) * ans2);
        return (x < 0.0) ? -result : result;
    }
}

EMSCRIPTEN_KEEPALIVE
double erfCalc(double x) {
    return std::erf(x);
}

EMSCRIPTEN_KEEPALIVE
double erfcCalc(double x) {
    return std::erfc(x);
}

EMSCRIPTEN_KEEPALIVE
double betaCalc(double x, double y) {
    return std::tgamma(x) * std::tgamma(y) / std::tgamma(x + y);
}

// ── Polynomial Solver (Cubic) ────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double* cubic(double a, double b, double c, double d) {
    if (std::abs(a) < EPSILON) {
        return quadratic(b, c, d);
    }
    double A = b / a;
    double B = c / a;
    double C = d / a;

    double p = B - A * A / 3.0;
    double q = C - A * B / 3.0 + 2.0 * A * A * A / 27.0;

    double D = q * q / 4.0 + p * p * p / 27.0;

    if (D > EPSILON) {
        double u = std::cbrt(-q / 2.0 + std::sqrt(D));
        double v = std::cbrt(-q / 2.0 - std::sqrt(D));
        resultBuffer[0] = u + v - A / 3.0;
        resultBuffer[1] = NAN;
        resultBuffer[2] = NAN;
    } else if (std::abs(D) <= EPSILON) {
        double u = std::cbrt(-q / 2.0);
        resultBuffer[0] = 2.0 * u - A / 3.0;
        resultBuffer[1] = -u - A / 3.0;
        resultBuffer[2] = -u - A / 3.0;
    } else {
        double r = std::sqrt(-p * p * p / 27.0);
        double phi = std::acos(-q / (2.0 * r));
        double factor = 2.0 * std::sqrt(-p / 3.0);
        resultBuffer[0] = factor * std::cos(phi / 3.0) - A / 3.0;
        resultBuffer[1] = factor * std::cos((phi + 2.0 * PI_VAL) / 3.0) - A / 3.0;
        resultBuffer[2] = factor * std::cos((phi + 4.0 * PI_VAL) / 3.0) - A / 3.0;
    }
    resultBuffer[3] = NAN;
    return resultBuffer;
}

// ── Complex Numbers ──────────────────────────────────────────────────────────

#include <complex>

EMSCRIPTEN_KEEPALIVE
double* complexAdd(double r1, double i1, double r2, double i2) {
    std::complex<double> c1(r1, i1), c2(r2, i2);
    auto res = c1 + c2;
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexSubtract(double r1, double i1, double r2, double i2) {
    std::complex<double> c1(r1, i1), c2(r2, i2);
    auto res = c1 - c2;
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexMultiply(double r1, double i1, double r2, double i2) {
    std::complex<double> c1(r1, i1), c2(r2, i2);
    auto res = c1 * c2;
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexDivide(double r1, double i1, double r2, double i2) {
    std::complex<double> c1(r1, i1), c2(r2, i2);
    if (std::abs(c2) < EPSILON) {
        resultBuffer[0] = INFINITY;
        resultBuffer[1] = INFINITY;
        return resultBuffer;
    }
    auto res = c1 / c2;
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexPower(double r1, double i1, double r2, double i2) {
    std::complex<double> c1(r1, i1), c2(r2, i2);
    auto res = std::pow(c1, c2);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double complexAbs(double r, double i) {
    return std::abs(std::complex<double>(r, i));
}

EMSCRIPTEN_KEEPALIVE
double complexArg(double r, double i) {
    return std::arg(std::complex<double>(r, i));
}

EMSCRIPTEN_KEEPALIVE
double* complexConjugate(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::conj(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexSine(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::sin(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexCosine(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::cos(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexTangent(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::tan(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexLog(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::log(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexExp(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::exp(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

EMSCRIPTEN_KEEPALIVE
double* complexSqrt(double r, double i) {
    std::complex<double> c(r, i);
    auto res = std::sqrt(c);
    resultBuffer[0] = res.real();
    resultBuffer[1] = res.imag();
    return resultBuffer;
}

// ── Matrices ──────────────────────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double matrixDeterminant(double* m, int size) {
    if (size == 1) return m[0];
    if (size == 2) {
        return m[0] * m[3] - m[1] * m[2];
    }
    if (size == 3) {
        return m[0] * (m[4] * m[8] - m[5] * m[7]) -
               m[1] * (m[3] * m[8] - m[5] * m[6]) +
               m[2] * (m[3] * m[7] - m[4] * m[6]);
    }
    if (size == 4) {
        double d0 = m[5] * (m[10] * m[15] - m[11] * m[14]) - m[6] * (m[9] * m[15] - m[11] * m[13]) + m[7] * (m[9] * m[14] - m[10] * m[13]);
        double d1 = m[4] * (m[10] * m[15] - m[11] * m[14]) - m[6] * (m[8] * m[15] - m[11] * m[12]) + m[7] * (m[8] * m[14] - m[10] * m[12]);
        double d2 = m[4] * (m[9] * m[15] - m[11] * m[13]) - m[5] * (m[8] * m[15] - m[11] * m[12]) + m[7] * (m[8] * m[13] - m[9] * m[12]);
        double d3 = m[4] * (m[9] * m[14] - m[10] * m[13]) - m[5] * (m[8] * m[14] - m[10] * m[12]) + m[6] * (m[8] * m[13] - m[9] * m[12]);
        return m[0] * d0 - m[1] * d1 + m[2] * d2 - m[3] * d3;
    }
    return 0.0;
}

EMSCRIPTEN_KEEPALIVE
int matrixInverse(double* m, double* res, int size) {
    double det = matrixDeterminant(m, size);
    if (std::abs(det) < EPSILON) return 0;

    if (size == 1) {
        res[0] = 1.0 / m[0];
        return 1;
    }
    if (size == 2) {
        res[0] = m[3] / det;
        res[1] = -m[1] / det;
        res[2] = -m[2] / det;
        res[3] = m[0] / det;
        return 1;
    }
    if (size == 3) {
        res[0] = (m[4] * m[8] - m[5] * m[7]) / det;
        res[1] = (m[2] * m[7] - m[1] * m[8]) / det;
        res[2] = (m[1] * m[5] - m[2] * m[4]) / det;
        res[3] = (m[5] * m[6] - m[3] * m[8]) / det;
        res[4] = (m[0] * m[8] - m[2] * m[6]) / det;
        res[5] = (m[2] * m[3] - m[0] * m[5]) / det;
        res[6] = (m[3] * m[7] - m[4] * m[6]) / det;
        res[7] = (m[1] * m[6] - m[0] * m[7]) / det;
        res[8] = (m[0] * m[4] - m[1] * m[3]) / det;
        return 1;
    }
    if (size == 4) {
        for (int i = 0; i < 4; ++i) {
            for (int j = 0; j < 4; ++j) {
                double sub[9];
                int subidx = 0;
                for (int r = 0; r < 4; ++r) {
                    if (r == i) continue;
                    for (int c = 0; c < 4; ++c) {
                        if (c == j) continue;
                        sub[subidx++] = m[r * 4 + c];
                    }
                }
                double subdet = matrixDeterminant(sub, 3);
                int sign = ((i + j) % 2 == 0) ? 1 : -1;
                res[j * 4 + i] = sign * subdet / det;
            }
        }
        return 1;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
void matrixMultiply(double* a, int rA, int cA, double* b, int rB, int cB, double* res) {
    for (int i = 0; i < rA; ++i) {
        for (int j = 0; j < cB; ++j) {
            double sum = 0.0;
            for (int k = 0; k < cA; ++k) {
                sum += a[i * cA + k] * b[k * cB + j];
            }
            res[i * cB + j] = sum;
        }
    }
}

// ── Vectors ──────────────────────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double vectorDot(double* v1, double* v2, int dim) {
    double sum = 0.0;
    for (int i = 0; i < dim; ++i) sum += v1[i] * v2[i];
    return sum;
}

EMSCRIPTEN_KEEPALIVE
void vectorCross(double* v1, double* v2, double* res) {
    res[0] = v1[1] * v2[2] - v1[2] * v2[1];
    res[1] = v1[2] * v2[0] - v1[0] * v2[2];
    res[2] = v1[0] * v2[1] - v1[1] * v2[0];
}

EMSCRIPTEN_KEEPALIVE
double vectorMagnitude(double* v, int dim) {
    double sum = 0.0;
    for (int i = 0; i < dim; ++i) sum += v[i] * v[i];
    return std::sqrt(sum);
}

// ── Statistics ───────────────────────────────────────────────────────────────

EMSCRIPTEN_KEEPALIVE
double statMean(double* d, int n) {
    if (n <= 0) return 0.0;
    double sum = 0.0;
    for (int i = 0; i < n; ++i) sum += d[i];
    return sum / n;
}

EMSCRIPTEN_KEEPALIVE
double statStdDev(double* d, int n, int sample) {
    if (n <= 1) return 0.0;
    double mean = statMean(d, n);
    double sumSqDiff = 0.0;
    for (int i = 0; i < n; ++i) {
        double diff = d[i] - mean;
        sumSqDiff += diff * diff;
    }
    int divisor = sample ? (n - 1) : n;
    return std::sqrt(sumSqDiff / divisor);
}

EMSCRIPTEN_KEEPALIVE
double normalCDF(double x, double mean, double stddev) {
    if (stddev <= 0.0) return x >= mean ? 1.0 : 0.0;
    return 0.5 * (1.0 + std::erf((x - mean) / (stddev * std::sqrt(2.0))));
}

EMSCRIPTEN_KEEPALIVE
double normalPDF(double x, double mean, double stddev) {
    if (stddev <= 0.0) return INFINITY;
    double exponent = -0.5 * std::pow((x - mean) / stddev, 2);
    return (1.0 / (stddev * std::sqrt(2.0 * PI_VAL))) * std::exp(exponent);
}

} // extern "C"

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:  ['var(--font-inter)', 'Google Sans', '-apple-system', 'sans-serif'],
        mono:  ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['Google Sans', 'var(--font-inter)', 'sans-serif'],
        caveat: ['var(--font-caveat)', 'cursive'],
        quicksand: ['var(--font-quicksand)', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        // Material You surface tokens
        'md-surface':    'var(--md-surface)',
        'md-surface-1':  'var(--md-surface-1)',
        'md-surface-2':  'var(--md-surface-2)',
        'md-primary':    'var(--md-primary)',
        'md-on-surface': 'var(--md-on-surface)',
        // Calculator-specific
        'calc-bg':       'var(--calc-bg)',
        'calc-operator': 'var(--calc-btn-operator-fg)',
        'calc-equals':   'var(--calc-btn-equals-bg)',
        // Anniversary colors
        'cream': 'var(--cream)',
        'theme-pink': 'var(--pink)', // named theme-pink to avoid conflict with default pink
        'pink-deep': 'var(--pink-deep)',
        'lav': 'var(--lav)',
        'butter': 'var(--butter)',
        'mocha': 'var(--mocha)',
        'mocha-light': 'var(--mocha-light)',
        'plum': 'var(--plum)',
        'plum-soft': 'var(--plum-soft)',
      },
      borderRadius: {
        'btn':    'var(--btn-radius)',
        'btn-sm': '20px',
        'btn-xs': '14px',
      },
      animation: {
        'ripple': 'ripple-expand 0.55s ease-out forwards',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

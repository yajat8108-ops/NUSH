import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry } from './calculator';

export type ActiveTab =
  | 'home'
  | 'basic'
  | 'scientific'
  | 'math'
  | 'matrix'
  | 'vector'
  | 'statistics'
  | 'complex'
  | 'base-n'
  | 'constants'
  | 'history'
  | 'graphing'
  | 'program'
  | 'anniversary'
  | 'settings';

export type FormatMode = 'decimal' | 'fraction' | 'eng';
export type BaseMode = 'BIN' | 'OCT' | 'DEC' | 'HEX';
export type ComplexFormat = 'rect' | 'polar';

export interface MatrixData {
  rows: number;
  cols: number;
  data: number[];
}

export interface VectorData {
  dim: number;
  data: number[];
}

export interface ProgramScript {
  id: string;
  name: string;
  code: string;
}

export interface StatRow {
  x: number;
  y: number;
  freq: number;
}

interface CalculatorStore {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;

  variables: Record<string, number>;
  setVariable: (name: string, value: number) => void;
  clearVariables: () => void;

  ans: number;
  setAns: (value: number) => void;

  formatMode: FormatMode;
  setFormatMode: (mode: FormatMode) => void;

  complexFormat: ComplexFormat;
  setComplexFormat: (format: ComplexFormat) => void;

  // Matrix state
  matrices: Record<string, MatrixData>;
  setMatrix: (name: string, data: MatrixData) => void;

  // Vector state
  vectors: Record<string, VectorData>;
  setVector: (name: string, data: VectorData) => void;

  // Statistics state
  statRows: StatRow[];
  setStatRows: (rows: StatRow[]) => void;
  statModeType: '1-VAR' | '2-VAR';
  setStatModeType: (type: '1-VAR' | '2-VAR') => void;

  // BaseN state
  baseMode: BaseMode;
  setBaseMode: (mode: BaseMode) => void;

  // History state
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;

  // Program state
  programs: ProgramScript[];
  saveProgram: (program: ProgramScript) => void;
  deleteProgram: (id: string) => void;
}

export const useStore = create<CalculatorStore>()(
  persist(
    (set) => ({
      activeTab: 'basic',
      setActiveTab: (tab) => set({ activeTab: tab }),

      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),

      variables: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 },
      setVariable: (name, value) =>
        set((state) => ({
          variables: { ...state.variables, [name]: value },
        })),
      clearVariables: () =>
        set({
          variables: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 },
        }),

      ans: 0,
      setAns: (value) => set({ ans: value }),

      formatMode: 'decimal',
      setFormatMode: (mode) => set({ formatMode: mode }),

      complexFormat: 'rect',
      setComplexFormat: (format) => set({ complexFormat: format }),

      matrices: {
        MatA: { rows: 3, cols: 3, data: new Array(9).fill(0) },
        MatB: { rows: 3, cols: 3, data: new Array(9).fill(0) },
        MatC: { rows: 3, cols: 3, data: new Array(9).fill(0) },
        MatD: { rows: 3, cols: 3, data: new Array(9).fill(0) },
      },
      setMatrix: (name, data) =>
        set((state) => ({
          matrices: { ...state.matrices, [name]: data },
        })),

      vectors: {
        VctA: { dim: 3, data: [0, 0, 0] },
        VctB: { dim: 3, data: [0, 0, 0] },
        VctC: { dim: 3, data: [0, 0, 0] },
      },
      setVector: (name, data) =>
        set((state) => ({
          vectors: { ...state.vectors, [name]: data },
        })),

      statRows: [],
      setStatRows: (rows) => set({ statRows: rows }),
      statModeType: '1-VAR',
      setStatModeType: (type) => set({ statModeType: type }),

      baseMode: 'DEC',
      setBaseMode: (mode) => set({ baseMode: mode }),

      history: [],
      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 20),
        })),
      removeHistoryEntry: (id) =>
        set((state) => ({
          history: state.history.filter((e) => e.id !== id),
        })),
      clearHistory: () => set({ history: [] }),

      programs: [
        {
          id: '1',
          name: 'Collatz Conjecture',
          code: 'let n = get("X") || 10;\nlet steps = 0;\n\nwhile (n > 1) {\n  print("n = " + n);\n  if (n % 2 === 0) {\n    n = n / 2;\n  } else {\n    n = 3 * n + 1;\n  }\n  steps++;\n}\nprint("n = 1");\nprint("Total steps: " + steps);'
        }
      ],
      saveProgram: (program) => set((state) => {
        const existingIndex = state.programs.findIndex(p => p.id === program.id);
        if (existingIndex >= 0) {
          const newPrograms = [...state.programs];
          newPrograms[existingIndex] = program;
          return { programs: newPrograms };
        }
        return { programs: [...state.programs, program] };
      }),
      deleteProgram: (id) => set((state) => ({
        programs: state.programs.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'scicalc-storage',
      partialize: (state) => ({
        theme: state.theme,
        hapticsEnabled: state.hapticsEnabled,
        variables: state.variables,
        ans: state.ans,
        history: state.history,
        programs: state.programs,
      }),
    }
  )
);

import React from 'react';
import type { CalcButton } from '@/lib/calculator';

interface AnniversaryModeProps {
  onNumber: (num: string) => void;
  onOperator: (op: string) => void;
  onFunction: (fn: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
}

const ANNIVERSARY_BUTTONS: CalcButton[][] = [
  [
    { label: 'AC',  value: 'AC',  type: 'clear' },
    { label: 'DEL', value: 'DEL', type: 'function' },
    { label: 'daysTogether()', value: 'daysTogether(', type: 'function' },
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
    { label: 'nushSmileIntensity()', value: 'nushSmileIntensity(', type: 'function' },
    { label: 'hugCount()', value: 'hugCount(', type: 'function' },
    { label: 'daysUntilNextAnniversary()', value: 'daysUntilNextAnniversary(', type: 'function' },
    { label: '=', value: '=', type: 'equals' },
  ],
  [
    { label: '0', value: '0', type: 'number' },
    { label: 'iLoveYou()', value: 'iLoveYou(', type: 'function' },
    { label: 'firstDate()', value: 'firstDate(', type: 'function' },
  ],
];

export default function AnniversaryMode({
  onNumber,
  onOperator,
  onFunction,
  onEquals,
  onClear,
  onBackspace
}: AnniversaryModeProps) {
  
  const handlePress = (btn: CalcButton) => {
    switch (btn.type) {
      case 'number':
      case 'constant':
        onNumber(btn.value);
        break;
      case 'operator':
        onOperator(btn.value);
        break;
      case 'function':
        if (btn.value === 'DEL') onBackspace();
        else onFunction(btn.value);
        break;
      case 'equals':
        onEquals();
        break;
      case 'clear':
        onClear();
        break;
    }
  };

  return (
    <div className="grid gap-2 p-2 bg-[var(--keypad-bg)]" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
      {ANNIVERSARY_BUTTONS.map((row, i) => (
        <div key={i} className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {row.map((btn, j) => {
            const isNushFunc = btn.label.includes('()');
            return (
              <button
                key={j}
                onClick={() => handlePress(btn)}
                className={`
                  flex items-center justify-center rounded-xl text-lg font-nunito font-semibold shadow-sm transition-transform active:scale-95 select-none
                  ${isNushFunc ? 'bg-[var(--pink)] text-[var(--plum)] border-b-4 border-[var(--pink-deep)] text-[10px] md:text-xs overflow-hidden px-1' : ''}
                  ${btn.type === 'operator' ? 'bg-[var(--accent)] text-white' : ''}
                  ${btn.type === 'equals' ? 'bg-[var(--accent-hover)] text-white' : ''}
                  ${btn.type === 'clear' || btn.value === 'DEL' ? 'bg-red-400 text-white' : ''}
                  ${btn.type === 'number' ? 'bg-[var(--key-bg)] text-[var(--key-fg)] hover:bg-[var(--key-hover)]' : ''}
                `}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

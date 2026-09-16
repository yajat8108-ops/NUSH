'use client';

import React, { useState, useMemo } from 'react';
import { formatNumber } from '@/lib/calculator';

interface ConstantsPanelProps {
  onOutputResult: (val: string, expr: string) => void;
}

interface ConstantItem {
  name: string;
  symbol: string;
  value: number;
  unit: string;
  desc: string;
}

const PHYSICAL_CONSTANTS: ConstantItem[] = [
  { name: 'Speed of Light', symbol: 'c', value: 299792458, unit: 'm/s', desc: 'Exact speed of electromagnetic radiation in vacuum' },
  { name: 'Planck Constant', symbol: 'h', value: 6.62607015e-34, unit: 'J s', desc: 'Quantum of electromagnetic action' },
  { name: 'Gravitational Constant', symbol: 'G', value: 6.6743e-11, unit: 'm³/kg/s²', desc: 'Strength of gravitational force' },
  { name: 'Elementary Charge', symbol: 'e', value: 1.602176634e-19, unit: 'C', desc: 'Electric charge carried by a single proton' },
  { name: 'Avogadro Constant', symbol: 'N_A', value: 6.02214076e23, unit: 'mol⁻¹', desc: 'Number of particles per mole' },
  { name: 'Boltzmann Constant', symbol: 'k_B', value: 1.380649e-23, unit: 'J/K', desc: 'Relates temperature to energy' },
  { name: 'Molar Gas Constant', symbol: 'R', value: 8.314462618, unit: 'J/(mol K)', desc: 'Constant in the ideal gas law' },
  { name: 'Electron Mass', symbol: 'm_e', value: 9.1093837015e-31, unit: 'kg', desc: 'Rest mass of an electron' },
  { name: 'Proton Mass', symbol: 'm_p', value: 1.67262192369e-27, unit: 'kg', desc: 'Rest mass of a proton' },
  { name: 'Fine Structure Constant', symbol: 'α', value: 7.2973525693e-3, unit: '', desc: 'Strength of electromagnetic interaction' },
  { name: 'Rydberg Constant', symbol: 'R_∞', value: 10973731.56816, unit: 'm⁻¹', desc: 'Limiting value of highest wavenumber spectral line' },
  { name: 'Stefan-Boltzmann Constant', symbol: 'σ', value: 5.670374419e-8, unit: 'W/(m² K⁴)', desc: 'Total energy radiated per unit surface area of blackbody' },
];

const UNIT_CONVERSIONS = {
  Length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    inch: 0.0254,
    feet: 0.3048,
    yard: 0.9144,
    mile: 1609.344,
  },
  Mass: {
    kg: 1,
    g: 0.001,
    mg: 1e-6,
    lb: 0.45359237,
    oz: 0.028349523,
    ton: 907.18474, // Short US ton
  },
  Area: {
    sqM: 1,
    sqKM: 1e6,
    sqCM: 0.0001,
    sqFT: 0.09290304,
    acre: 4046.85642,
    hectare: 10000,
  },
  Speed: {
    m_s: 1,
    km_h: 0.27777778,
    mph: 0.44704,
    knot: 0.514444,
  },
  Volume: {
    L: 1,
    mL: 0.001,
    cubicM: 1000,
    gal: 3.78541178, // US Liquid Gallon
    qt: 0.946352946,
    cup: 0.236588236,
  },
};

type ConvCategory = keyof typeof UNIT_CONVERSIONS | 'Temperature';

export default function ConstantsPanel({ onOutputResult }: ConstantsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'constants' | 'converter'>('constants');
  
  // Constants search
  const [search, setSearch] = useState('');

  // Converter state
  const [category, setCategory] = useState<ConvCategory>('Length');
  const [convVal, setConvVal] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('inch');
  const [convResult, setConvResult] = useState<string>('');

  const filteredConstants = useMemo(() => {
    return PHYSICAL_CONSTANTS.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelectConstant = (c: ConstantItem) => {
    onOutputResult(c.value.toString(), c.symbol);
  };

  // ── Perform Temperature Conversion ─────────────────────────────────────────
  const convertTemperature = (val: number, from: string, to: string): number => {
    let kelvin = 0;
    if (from === 'C') kelvin = val + 273.15;
    else if (from === 'F') kelvin = (val - 32) * 5/9 + 273.15;
    else kelvin = val; // Already Kelvin

    if (to === 'C') return kelvin - 273.15;
    if (to === 'F') return (kelvin - 273.15) * 9/5 + 32;
    return kelvin;
  };

  const handleConvert = () => {
    const val = parseFloat(convVal);
    if (isNaN(val)) {
      setConvResult('Invalid value');
      return;
    }

    if (category === 'Temperature') {
      const res = convertTemperature(val, fromUnit, toUnit);
      const formatted = formatNumber(res);
      setConvResult(formatted);
      onOutputResult(formatted, `${val}°${fromUnit} to °${toUnit}`);
      return;
    }

    // Standard multipliers
    const multipliers = UNIT_CONVERSIONS[category as keyof typeof UNIT_CONVERSIONS];
    const fromFactor = (multipliers as any)[fromUnit];
    const toFactor = (multipliers as any)[toUnit];

    if (!fromFactor || !toFactor) return;

    // Convert to base unit then to target unit
    const baseVal = val * fromFactor;
    const finalVal = baseVal / toFactor;
    const formatted = formatNumber(finalVal);

    setConvResult(formatted);
    onOutputResult(formatted, `${val} ${fromUnit} to ${toUnit}`);
  };

  // Dynamically set units list when category changes
  const unitsList = useMemo(() => {
    if (category === 'Temperature') {
      return ['C', 'F', 'K'];
    }
    return Object.keys(UNIT_CONVERSIONS[category as keyof typeof UNIT_CONVERSIONS]);
  }, [category]);

  // Sync unit dropdown selections when units list changes
  React.useEffect(() => {
    if (unitsList.length > 0) {
      setFromUnit(unitsList[0]);
      setToUnit(unitsList[1] || unitsList[0]);
    }
  }, [unitsList]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Sub tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg2)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => setActiveSubTab('constants')}
          style={{
            flex: 1,
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: activeSubTab === 'constants' ? 'var(--bg4)' : 'transparent',
            color: activeSubTab === 'constants' ? 'var(--accent)' : 'var(--mid)',
            transition: 'var(--t)',
          }}
        >
          Constants
        </button>
        <button
          onClick={() => setActiveSubTab('converter')}
          style={{
            flex: 1,
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: activeSubTab === 'converter' ? 'var(--bg4)' : 'transparent',
            color: activeSubTab === 'converter' ? 'var(--accent)' : 'var(--mid)',
            transition: 'var(--t)',
          }}
        >
          Unit Converter
        </button>
      </div>

      {/* Renders */}
      {activeSubTab === 'constants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search constants..."
            style={{
              width: '100%',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--hi)',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
            }}
          />

          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {filteredConstants.map((c) => (
              <div
                key={c.symbol}
                onClick={() => handleSelectConstant(c)}
                style={{
                  background: 'var(--bg2)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background var(--t)',
                }}
                className="constant-row"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hi)' }}>{c.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--mid)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.desc}>
                    {c.desc}
                  </span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'monospace' }}>
                    {c.symbol}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--mid)', fontFamily: 'monospace' }}>
                    {c.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'converter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Category Select */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ConvCategory)}
              style={{
                width: '100%',
                background: 'var(--bg2)',
                color: 'var(--hi)',
                border: '1px solid var(--border)',
                padding: '8px',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '13px',
              }}
            >
              {['Length', 'Mass', 'Temperature', 'Area', 'Speed', 'Volume'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Value input */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>Value to Convert</label>
            <input
              type="number"
              value={convVal}
              onChange={(e) => setConvVal(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--hi)',
                padding: '8px 12px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Unit Selectors */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>From Unit</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  color: 'var(--hi)',
                  border: '1px solid var(--border)',
                  padding: '8px',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '13px',
                }}
              >
                {unitsList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            
            <span style={{ color: 'var(--mid)', fontSize: '12px', marginTop: '16px' }}>to</span>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'var(--mid)', display: 'block', marginBottom: '4px' }}>To Unit</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg2)',
                  color: 'var(--hi)',
                  border: '1px solid var(--border)',
                  padding: '8px',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '13px',
                }}
              >
                {unitsList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleConvert}
            style={{
              background: 'var(--bg-sci)',
              color: 'var(--sci)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Convert Value & Paste to Calc
          </button>

          {convResult && (
            <div
              style={{
                background: 'var(--bg2)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--mid)' }}>Result</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '4px' }}>{convResult}</div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

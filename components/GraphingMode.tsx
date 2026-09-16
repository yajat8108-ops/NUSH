'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalcModule } from '@/lib/wasm';
import { evaluateExpression } from '@/lib/calculator';

interface GraphingModeProps {
  calc: CalcModule | null;
  angleMode: string;
}

export default function GraphingMode({ calc, angleMode }: GraphingModeProps) {
  const [expr, setExpr] = useState('sin(X)');
  const [zoom, setZoom] = useState(10); // Window is [-zoom, zoom]
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !calc) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density).
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Normalize coordinate system to use CSS pixels.
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Get CSS variables for colors
    const computedStyle = getComputedStyle(document.documentElement);
    const midColor = computedStyle.getPropertyValue('--mid').trim() || '#9090a2';
    const loColor = computedStyle.getPropertyValue('--lo').trim() || '#6e6e80';
    const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#a8c7fa';

    const xMin = -zoom;
    const xMax = zoom;
    const yMin = -zoom;
    const yMax = zoom;

    const mapX = (x: number) => ((x - xMin) / (xMax - xMin)) * w;
    const mapY = (y: number) => h - ((y - yMin) / (yMax - yMin)) * h;

    // Draw Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = loColor;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      const px = mapX(x);
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
    }
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      const py = mapY(y);
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
    }
    ctx.stroke();

    // Draw Axes
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = midColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const zx = mapX(0);
      ctx.moveTo(zx, 0);
      ctx.lineTo(zx, h);
    }
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const zy = mapY(0);
      ctx.moveTo(0, zy);
      ctx.lineTo(w, zy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw Function
    if (expr.trim()) {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      
      // Temporarily switch to Radians for plotting graphs
      calc.setAngleMode(1);
      
      let first = true;
      let prevY = 0;
      
      // Step size (1 pixel)
      for (let px = 0; px <= w; px += 1) {
        const x = xMin + (px / w) * (xMax - xMin);
        const { result, error } = evaluateExpression(expr, calc, { X: x });
        
        if (!error && isFinite(result)) {
          const py = mapY(result);
          
          // Asymptote detection (if jump is too large between adjacent pixels)
          if (!first && Math.abs(mapY(prevY) - py) > h / 2) {
             ctx.stroke();
             ctx.beginPath();
             ctx.moveTo(px, py);
          } else if (first) {
             ctx.moveTo(px, py);
             first = false;
          } else {
             ctx.lineTo(px, py);
          }
          prevY = result;
        } else {
          first = true;
        }
      }
      ctx.stroke();
      
      // Restore previous angle mode
      calc.setAngleMode(angleMode === 'RAD' ? 1 : 0);
    }
  }, [expr, zoom, calc, angleMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      <div className="math-input-group" style={{ 
        background: 'var(--bg3)', 
        padding: '12px', 
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--fn)', fontWeight: 'bold' }}>f(X) =</span>
          <input
            className="math-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="e.g. sin(X)"
            spellCheck={false}
            autoComplete="off"
            style={{ flex: 1 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--lo)' }}>Window: [-{zoom}, {zoom}]</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              className="calc-btn btn-special" 
              style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '6px' }}
              onClick={() => setZoom(z => Math.max(1, z - 2))}
            >
              Zoom In
            </button>
            <button 
              className="calc-btn btn-special" 
              style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '6px' }}
              onClick={() => setZoom(z => Math.min(100, z + 2))}
            >
              Zoom Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        background: 'var(--bg2)', 
        borderRadius: '12px', 
        overflow: 'hidden',
        border: '1px solid var(--border)',
        minHeight: '280px'
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}

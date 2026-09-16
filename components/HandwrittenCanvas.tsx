'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import WaxSeal from './WaxSeal';

const PEN_COLORS = [
  { name: 'Rose Pink', color: '#FF5C8E' },
  { name: 'Burgundy Wax', color: '#be123c' },
  { name: 'Royal Lavender', color: '#B9AEF5' },
  { name: 'Golden Sun', color: '#FFDD8C' },
  { name: 'Parchment Ink', color: '#2A1A12' },
  { name: 'Soft Cream', color: '#FFFFFF' },
];

export default function HandwrittenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#FF5C8E');
  const [penSize, setPenSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [stampedSeal, setStampedSeal] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Undo / Redo history
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);

  const saveHistorySnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 20) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  const initParchment = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Parchment background
    ctx.fillStyle = '#FFF9F2';
    ctx.fillRect(0, 0, width, height);

    // Delicate ruling lines
    ctx.strokeStyle = 'rgba(234, 210, 184, 0.45)';
    ctx.lineWidth = 1;
    for (let y = 50; y < height - 20; y += 32) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
    }

    // Vintage margin line
    ctx.strokeStyle = 'rgba(255, 92, 142, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(65, 20);
    ctx.lineTo(65, height - 20);
    ctx.stroke();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI sizing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 700;
    const h = rect.height || 420;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    initParchment(ctx, w, h);
    saveHistorySnapshot();
  }, [mounted]);

  if (!mounted) return null;

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? penSize * 3 : penSize;
    ctx.strokeStyle = isEraser ? '#FFF9F2' : penColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistorySnapshot();
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const snapshot = historyRef.current[historyIndexRef.current];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx && snapshot) {
        ctx.putImageData(snapshot, 0, 0);
        SoundEngine.pop();
      }
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const snapshot = historyRef.current[historyIndexRef.current];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx && snapshot) {
        ctx.putImageData(snapshot, 0, 0);
        SoundEngine.pop();
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    initParchment(ctx, rect.width, rect.height);
    setStampedSeal(null);
    saveHistorySnapshot();
    SoundEngine.whoosh();
  };

  const handleStampWax = () => {
    SoundEngine.confettiPop();
    setStampedSeal('💌');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#be123c', '#FF5C8E', '#FFDD8C'],
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    SoundEngine.chime();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });

    const link = document.createElement('a');
    link.download = `love-note-for-nush-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const loadTemplate = (type: 'heart' | 'love' | 'blank') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    initParchment(ctx, rect.width, rect.height);

    if (type === 'heart') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 92, 142, 0.35)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2.5;
      const cx = rect.width / 2;
      const cy = rect.height / 2 - 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 30);
      ctx.bezierCurveTo(cx - 90, cy - 60, cx - 110, cy + 40, cx, cy + 110);
      ctx.bezierCurveTo(cx + 110, cy + 40, cx + 90, cy - 60, cx, cy + 30);
      ctx.stroke();
      ctx.restore();
    } else if (type === 'love') {
      ctx.save();
      ctx.font = 'bold 36px Caveat, cursive';
      ctx.fillStyle = 'rgba(185, 174, 245, 0.35)';
      ctx.textAlign = 'center';
      ctx.fillText('Trace: "I love you with all my heart"', rect.width / 2, rect.height / 2);
      ctx.restore();
    }

    saveHistorySnapshot();
    SoundEngine.chime();
  };

  return (
    <section id="handwritten-notes" className="anniversary-section py-20 px-4 select-none">
      <SectionHead
        eyebrow="digital pen & parchment · passing notes in class"
        title="Handwritten Letter Canvas"
        subtitle="draw or write your own note with finger or mouse, stamp with wax, and keep it forever ❤️"
      />

      <div className="max-w-4xl mx-auto mt-6">
        {/* TOOLBAR CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-xl mb-6">
          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 mr-1 hidden sm:inline">Color:</span>
            {PEN_COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => {
                  setPenColor(c.color);
                  setIsEraser(false);
                  SoundEngine.click();
                }}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  penColor === c.color && !isEraser
                    ? 'scale-125 border-white shadow-lg'
                    : 'border-white/20 hover:scale-110'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}

            {/* Eraser Toggle */}
            <button
              onClick={() => {
                setIsEraser(!isEraser);
                SoundEngine.click();
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono border cursor-pointer transition-all ml-1 ${
                isEraser
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10'
              }`}
            >
              🧹 Eraser
            </button>
          </div>

          {/* Pen Size Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Size:</span>
            <input
              type="range"
              min="2"
              max="16"
              value={penSize}
              onChange={(e) => setPenSize(Number(e.target.value))}
              className="w-24 accent-[var(--pink)] cursor-pointer"
            />
            <span className="text-xs font-mono text-white w-4">{penSize}px</span>
          </div>

          {/* Templates */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">Guide:</span>
            <button
              onClick={() => loadTemplate('blank')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-300 border border-white/10 cursor-pointer"
            >
              Blank
            </button>
            <button
              onClick={() => loadTemplate('heart')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-300 border border-white/10 cursor-pointer"
            >
              ❤️ Heart
            </button>
            <button
              onClick={() => loadTemplate('love')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-300 border border-white/10 cursor-pointer"
            >
              ✍️ Trace
            </button>
          </div>

          {/* Undo / Redo / Clear Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
              title="Undo"
            >
              ↩
            </button>
            <button
              onClick={handleRedo}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
              title="Redo"
            >
              ↪
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 rounded-full bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* CANVAS DRAWING PAD CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#EAD2B8] bg-[#FFF9F2]">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-[420px] md:h-[480px] cursor-crosshair touch-none"
          />

          {/* STAMPED 3D WAX SEAL OVERLAY ON BOTTOM RIGHT */}
          {stampedSeal && (
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="absolute bottom-6 right-6 pointer-events-none"
            >
              <WaxSeal size="lg" emoji={stampedSeal} isUnlocked={true} />
            </motion.div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleStampWax}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-700 to-rose-900 text-rose-100 font-mono text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-rose-400/40"
            >
              <span>💌</span> Stamp 3D Wax Seal
            </button>
            <span className="text-xs font-mono text-gray-400">
              {hasDrawn ? '✨ Ready to save!' : 'Draw or scribble anything with finger or stylus'}
            </span>
          </div>

          <button
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-mono font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📸</span> Download as Love Note PNG
          </button>
        </div>
      </div>
    </section>
  );
}

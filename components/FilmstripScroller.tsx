'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import SectionHead from './SectionHead';

interface Frame {
  id: string;
  src: string;
  caption: string;
}

import { CloudPhoto } from './PhotoAlbum';

// Hardcoded local frames (always present)
const STATIC_FRAMES: Frame[] = [
  { id: 'F01', src: '/photos/photo-new-1.jpg', caption: 'our newest memory ❤️' },
  { id: 'F02', src: '/photos/photo-1.jpg', caption: 'the teddy bear delivery 🧸' },
  { id: 'F03', src: '/photos/photo-new-2.jpg', caption: 'still smiling 🩷' },
  { id: 'F04', src: '/photos/photo-2.jpg', caption: 'campus bench regulars' },
  { id: 'F05', src: '/photos/photo-new-3.jpg', caption: 'month two vibes 💕' },
  { id: 'F06', src: '/photos/photo-3.jpg', caption: 'rooftop, golden hour' },
  { id: 'F07', src: '/photos/photo-4.jpg', caption: 'sunshine in a frame' },
  { id: 'F08', src: '/photos/photo-5.jpg', caption: 'candid magic' },
  { id: 'F09', src: '/photos/photo-6.jpg', caption: 'the way you look at me' },
  { id: 'F10', src: '/photos/photo-new-4.jpg', caption: 'forever my favorite view 🥹' },
  { id: 'F11', src: '/photos/photo-9.jpg', caption: 'late night polaroids' },
  { id: 'F12', src: '/photos/photo-10.jpg', caption: 'forehead kisses, on repeat' },
  { id: 'F13', src: '/photos/photo-11.jpg', caption: 'still laughing' },
  { id: 'F14', src: '/photos/photo-12.jpg', caption: 'favorite view' },
  { id: 'F15', src: '/photos/photo-13.jpg', caption: 'our tight hugs' },
  { id: 'F16', src: '/photos/photo-14.jpg', caption: 'month two, same us ❤️' },
];

export default function FilmstripScroller() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cloudFrames, setCloudFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Merge static + cloud frames
  const frames = [...STATIC_FRAMES, ...cloudFrames];

  // Momentum / inertia state
  const velocityRef = useRef(0);
  const lastTouchXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const momentumRAFRef = useRef<number>(0);

  // 3D perspective tilt based on scroll velocity
  const scrollVelocity = useMotionValue(0);
  const tiltY = useSpring(useTransform(scrollVelocity, [-1500, 0, 1500], [-3, 0, 3]), {
    stiffness: 200,
    damping: 30,
  });

  // Auto-play projector animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Fetch cloud-uploaded photos and append to filmstrip
  useEffect(() => {
    const fetchCloudPhotos = async () => {
      try {
        const res = await fetch('/api/sync?key=photos', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCloudFrames(data.map((p: CloudPhoto, idx: number) => ({
              id: `CF${String(idx + 1).padStart(2, '0')}`,
              src: p.url,
              caption: p.caption || '💕',
            })));
          }
        }
      } catch (e) {
        console.error('Failed to fetch cloud photos for filmstrip:', e);
      }
    };
    fetchCloudPhotos();
  }, []);

  // Handle native scroll & wheel lock
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = scrollLeft / maxScroll;
      setProgressPercent(Math.min(100, Math.max(0, progress * 100)));
      const index = Math.min(frames.length - 1, Math.max(0, Math.round(progress * (frames.length - 1))));
      setActiveIndex(index);
    }
  };

  // Convert vertical mouse wheel into horizontal film roll with velocity tracking
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 8;
      const isAtStart = scrollLeft <= 8;

      if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
        e.preventDefault();
        const delta = e.deltaY * 1.6;
        scrollContainerRef.current.scrollBy({ left: delta, behavior: 'auto' });
        scrollVelocity.set(delta * 5);
        // Decay velocity
        setTimeout(() => scrollVelocity.set(0), 150);
      }
    }
  };

  // ── Touch-based momentum drag ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    cancelAnimationFrame(momentumRAFRef.current);
    velocityRef.current = 0;
    lastTouchXRef.current = e.touches[0].clientX;
    lastTimeRef.current = Date.now();
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    const touchX = e.touches[0].clientX;
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    const dx = lastTouchXRef.current - touchX;

    if (dt > 0) {
      velocityRef.current = dx / dt * 16; // px per frame
      scrollVelocity.set(velocityRef.current * 50);
    }

    scrollContainerRef.current.scrollLeft += dx;
    lastTouchXRef.current = touchX;
    lastTimeRef.current = now;
  }, [scrollVelocity]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    // Apply momentum with friction
    const friction = 0.95;
    const minVelocity = 0.5;

    const animate = () => {
      if (!scrollContainerRef.current) return;
      if (Math.abs(velocityRef.current) < minVelocity) {
        scrollVelocity.set(0);
        return;
      }
      scrollContainerRef.current.scrollLeft += velocityRef.current;
      velocityRef.current *= friction;
      scrollVelocity.set(velocityRef.current * 50);
      momentumRAFRef.current = requestAnimationFrame(animate);
    };
    momentumRAFRef.current = requestAnimationFrame(animate);
  }, [scrollVelocity]);

  // ── Mouse drag for desktop ──
  const mouseDownRef = useRef(false);
  const mouseStartXRef = useRef(0);
  const scrollStartRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    mouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    scrollStartRef.current = scrollContainerRef.current.scrollLeft;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    cancelAnimationFrame(momentumRAFRef.current);
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseDownRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const dx = mouseStartXRef.current - e.clientX;
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (e.clientX - mouseStartXRef.current) / dt * -16;
      scrollVelocity.set(velocityRef.current * 50);
    }
    scrollContainerRef.current.scrollLeft = scrollStartRef.current + dx;
    lastTimeRef.current = now;
    mouseStartXRef.current = e.clientX;
    scrollStartRef.current = scrollContainerRef.current.scrollLeft;
  }, [scrollVelocity]);

  const handleMouseUp = useCallback(() => {
    if (!mouseDownRef.current) return;
    mouseDownRef.current = false;
    setIsDragging(false);

    const friction = 0.94;
    const minVelocity = 0.5;

    const animate = () => {
      if (!scrollContainerRef.current) return;
      if (Math.abs(velocityRef.current) < minVelocity) {
        scrollVelocity.set(0);
        return;
      }
      scrollContainerRef.current.scrollLeft += velocityRef.current;
      velocityRef.current *= friction;
      scrollVelocity.set(velocityRef.current * 50);
      momentumRAFRef.current = requestAnimationFrame(animate);
    };
    momentumRAFRef.current = requestAnimationFrame(animate);
  }, [scrollVelocity]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseDownRef.current) handleMouseUp();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      cancelAnimationFrame(momentumRAFRef.current);
    };
  }, [handleMouseUp]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const jumpToFrame = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = (index / (frames.length - 1)) * maxScroll;
    scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full py-16 px-3 md:px-8 bg-[var(--cream)] overflow-hidden">
      {/* Section Header */}
      <div className="text-center px-4 mb-4">
        <SectionHead
          eyebrow="reel one · 35mm vintage filmstrip"
          title="Days Since Day One"
          subtitle="drag, scroll, swipe, or hit auto-play to glide through all 16 memories 🎞️❤️"
        />
      </div>

      {/* Control Bar & HUD */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 mb-4">
        {/* Left: Frame Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--plum)] bg-[var(--butter)] px-3.5 py-1.5 rounded-full font-bold shadow-sm border border-amber-200">
          <span>FRAME {frames[activeIndex]?.id || 'F01'} / F16</span>
          <span className="opacity-40">|</span>
          <span className="text-[var(--pink-deep)]">● REC</span>
          {isDragging && (
            <span className="text-emerald-600 animate-pulse ml-1">⟷ DRAG</span>
          )}
        </div>

        {/* Center: Interactive Scrubber Slider */}
        <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-md mx-2">
          <input
            type="range"
            min="0"
            max={frames.length - 1}
            value={activeIndex}
            onChange={(e) => jumpToFrame(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[var(--pink-deep)]"
          />
          <span className="font-mono text-xs text-gray-500 font-bold w-12 text-right">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Right: Controls (Play / Pause & Nav Arrows) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              isPlaying
                ? 'bg-amber-400 text-black shadow-md scale-105'
                : 'bg-white text-[var(--plum)] border border-[var(--pink)]/40 hover:bg-[var(--pink)] hover:text-white'
            }`}
          >
            {isPlaying ? '⏸ Pause Reel' : '▶ Auto Play'}
          </button>
          
          <button
            onClick={() => scrollByAmount('left')}
            className="w-8 h-8 rounded-full bg-white border border-[var(--pink)]/40 text-[var(--plum)] flex items-center justify-center font-bold text-base hover:bg-[var(--pink)] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            aria-label="Previous frame"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByAmount('right')}
            className="w-8 h-8 rounded-full bg-white border border-[var(--pink)]/40 text-[var(--plum)] flex items-center justify-center font-bold text-base hover:bg-[var(--pink)] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            aria-label="Next frame"
          >
            ›
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('photo-album');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              window.dispatchEvent(new CustomEvent('open-photo-upload'));
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-mono text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Upload a photo to our cloud album"
          >
            <span>📷</span>
            <span>Add Frame +</span>
          </button>
        </div>
      </div>

      {/* 35mm Continuous Filmstrip Track Container with 3D Perspective */}
      <motion.div
        className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-[#0f0f12] border-2 border-zinc-800"
        style={{
          perspective: 1200,
          rotateY: tiltY,
        }}
        onWheel={handleWheel}
      >
        {/* Film Grain Overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />

        {/* Top Sprockets Line */}
        <div className="w-full bg-[#18181b] h-7 flex items-center justify-around px-2 border-b border-[#27272a] shadow-inner overflow-hidden select-none relative">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={`sprocket-top-${i}`} className="w-2.5 h-4 bg-white/15 rounded-[2px] mx-1 flex-shrink-0 shadow-inner border border-white/5" />
          ))}
          {/* Film edge notch markers */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/10" />
        </div>

        {/* Scrollable Frame Track */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex gap-5 overflow-x-auto py-6 px-6 scrollbar-thin scrollbar-thumb-[var(--pink)] scrollbar-track-zinc-900 snap-x snap-mandatory select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: isDragging ? 'auto' : 'smooth',
          }}
        >
          {frames.map((frame, idx) => (
            <motion.div
              key={frame.id}
              whileHover={{ scale: 1.03, y: -4 }}
              className="relative flex-shrink-0 snap-center group"
              onClick={() => { if (!isDragging) setSelectedFrame(frame); }}
            >
              {/* Individual 35mm Film Frame Cell */}
              <div className="bg-[#18181b] p-3.5 rounded-xl shadow-xl flex flex-col justify-between h-[360px] w-[230px] sm:h-[400px] sm:w-[270px] border border-[#27272a] group-hover:border-[var(--pink)] transition-all">
                
                {/* Vintage Image Box */}
                <div className="relative w-full h-[260px] sm:h-[295px] overflow-hidden rounded-lg bg-black flex items-center justify-center">
                  <img
                    src={frame.src}
                    alt={frame.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading={idx < 4 ? "eager" : "lazy"}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white/90">
                    {frame.id}
                  </div>
                  {/* Vintage vignette corner */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
                  }} />
                </div>

                {/* Caption & HUD */}
                <div className="mt-2.5 flex flex-col">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono tracking-widest">
                    <span>SP ▷ PLAY</span>
                    <span className="text-[var(--pink)] font-bold">CLICK TO EXPAND</span>
                  </div>
                  <p className="font-caveat text-lg sm:text-xl text-[var(--pink-deep)] group-hover:text-[var(--pink)] transition-colors truncate font-bold mt-0.5">
                    {frame.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Sprockets Line */}
        <div className="w-full bg-[#18181b] h-7 flex items-center justify-around px-2 border-t border-[#27272a] shadow-inner overflow-hidden select-none relative">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={`sprocket-btm-${i}`} className="w-2.5 h-4 bg-white/15 rounded-[2px] mx-1 flex-shrink-0 shadow-inner border border-white/5" />
          ))}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/10" />
        </div>
      </motion.div>

      {/* Drag hint */}
      <div className="max-w-7xl mx-auto mt-3 flex justify-center">
        <span className="text-[10px] font-mono text-gray-400 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
          💡 Click & drag to scrub · Scroll wheel rolls the filmstrip · Swipe on mobile with momentum
        </span>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 md:p-10 backdrop-blur-md"
            onClick={() => setSelectedFrame(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative max-w-3xl w-full bg-white rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xl cursor-pointer"
                onClick={() => setSelectedFrame(null)}
              >
                &times;
              </button>
              
              <div className="w-full max-h-[65vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
                <img
                  src={selectedFrame.src}
                  alt={selectedFrame.caption}
                  className="w-full h-auto max-h-[65vh] object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="font-caveat text-2xl md:text-3xl text-[var(--plum)] font-bold">
                  {selectedFrame.caption}
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1 uppercase tracking-wider">
                  FRAME {selectedFrame.id} · YAJAT &amp; NUSH
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

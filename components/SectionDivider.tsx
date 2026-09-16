'use client';

import React from 'react';

type DividerVariant = 'wave' | 'cloud' | 'stars' | 'heartbeat' | 'aurora';

interface SectionDividerProps {
  variant?: DividerVariant;
  flip?: boolean;
  className?: string;
}

export default function SectionDivider({ variant = 'wave', flip = false, className = '' }: SectionDividerProps) {
  const flipClass = flip ? 'rotate-180' : '';

  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${flipClass} ${className}`}
      aria-hidden="true"
    >
      {variant === 'wave' && <WaveSVG />}
      {variant === 'cloud' && <CloudSVG />}
      {variant === 'stars' && <StarsSVG />}
      {variant === 'heartbeat' && <HeartbeatSVG />}
      {variant === 'aurora' && <AuroraSVG />}
    </div>
  );
}

/* ─────────────── WAVE ─────────────── */
function WaveSVG() {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--pink)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="var(--lavender)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--butter)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z"
        fill="url(#wave-grad)"
      >
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z;
            M0,60 C240,20 480,80 720,40 C960,0 1200,100 1440,50 L1440,120 L0,120 Z;
            M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z
          "
        />
      </path>
      <path
        d="M0,60 C360,10 720,100 1080,30 C1260,5 1380,50 1440,40 L1440,120 L0,120 Z"
        fill="var(--pink)"
        opacity="0.15"
      >
        <animate
          attributeName="d"
          dur="6s"
          repeatCount="indefinite"
          values="
            M0,60 C360,10 720,100 1080,30 C1260,5 1380,50 1440,40 L1440,120 L0,120 Z;
            M0,30 C360,90 720,20 1080,80 C1260,100 1380,40 1440,70 L1440,120 L0,120 Z;
            M0,60 C360,10 720,100 1080,30 C1260,5 1380,50 1440,40 L1440,120 L0,120 Z
          "
        />
      </path>
    </svg>
  );
}

/* ─────────────── CLOUD ─────────────── */
function CloudSVG() {
  return (
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-14 md:h-20">
      <defs>
        <linearGradient id="cloud-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--lavender)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--pink)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Puffy cloud humps */}
      <path
        d="M0,100 L0,70 Q120,20 240,65 Q320,30 440,55 Q520,10 640,50 Q740,25 840,60 Q920,15 1040,55 Q1120,30 1200,60 Q1300,20 1440,65 L1440,100 Z"
        fill="url(#cloud-grad)"
      />
      <path
        d="M0,100 L0,80 Q180,40 360,75 Q500,35 680,65 Q800,30 960,70 Q1100,40 1260,72 Q1360,50 1440,78 L1440,100 Z"
        fill="var(--butter)"
        opacity="0.12"
      />
    </svg>
  );
}

/* ─────────────── STARS ─────────────── */
function StarsSVG() {
  // Generate deterministic star positions
  const stars = Array.from({ length: 30 }, (_, i) => ({
    cx: ((i * 47 + 13) % 1440),
    cy: ((i * 31 + 7) % 50) + 10,
    r: (i % 3 === 0) ? 2.5 : 1.5,
    delay: (i * 0.3) % 3,
  }));

  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16">
      <defs>
        <linearGradient id="star-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="var(--plum)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="1440" height="80" fill="url(#star-bg)" />
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill={i % 2 === 0 ? 'var(--pink)' : 'var(--butter)'}
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.8;0.2"
            dur={`${2 + s.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      {/* Connecting constellation lines */}
      <path
        d="M100,30 L250,20 L400,45 M600,15 L750,40 L900,25 M1100,35 L1250,18 L1380,42"
        stroke="var(--lavender)"
        strokeWidth="0.5"
        opacity="0.2"
        fill="none"
        strokeDasharray="4 6"
      />
    </svg>
  );
}

/* ─────────────── HEARTBEAT ─────────────── */
function HeartbeatSVG() {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16">
      <defs>
        <linearGradient id="hb-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--pink)" stopOpacity="0.5" />
          <stop offset="50%" stopColor="var(--pink-deep)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--pink)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* ECG heartbeat line */}
      <path
        d="M0,50 L200,50 L240,50 L260,20 L280,70 L300,30 L320,55 L340,50 L540,50 L580,50 L600,15 L620,75 L640,25 L660,55 L680,50 L880,50 L920,50 L940,20 L960,70 L980,30 L1000,55 L1020,50 L1220,50 L1260,50 L1280,20 L1300,70 L1320,30 L1340,55 L1360,50 L1440,50"
        stroke="url(#hb-grad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="2000"
          to="0"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      {/* Soft fill below the line */}
      <path
        d="M0,50 L200,50 L240,50 L260,20 L280,70 L300,30 L320,55 L340,50 L540,50 L580,50 L600,15 L620,75 L640,25 L660,55 L680,50 L880,50 L920,50 L940,20 L960,70 L980,30 L1000,55 L1020,50 L1220,50 L1260,50 L1280,20 L1300,70 L1320,30 L1340,55 L1360,50 L1440,50 L1440,80 L0,80 Z"
        fill="var(--pink)"
        opacity="0.06"
      />
    </svg>
  );
}

/* ─────────────── AURORA ─────────────── */
function AuroraSVG() {
  return (
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-14 md:h-20">
      <defs>
        <linearGradient id="aurora-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="33%" stopColor="#ec4899" stopOpacity="0.25" />
          <stop offset="66%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="aurora-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M0,80 Q180,20 360,60 Q540,10 720,50 Q900,5 1080,45 Q1260,15 1440,70 L1440,100 L0,100 Z"
        fill="url(#aurora-1)"
      >
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="
            M0,80 Q180,20 360,60 Q540,10 720,50 Q900,5 1080,45 Q1260,15 1440,70 L1440,100 L0,100 Z;
            M0,60 Q180,40 360,30 Q540,50 720,20 Q900,60 1080,30 Q1260,50 1440,40 L1440,100 L0,100 Z;
            M0,80 Q180,20 360,60 Q540,10 720,50 Q900,5 1080,45 Q1260,15 1440,70 L1440,100 L0,100 Z
          "
        />
      </path>
      <path
        d="M0,90 Q240,40 480,70 Q720,30 960,65 Q1200,25 1440,55 L1440,100 L0,100 Z"
        fill="url(#aurora-2)"
      >
        <animate
          attributeName="d"
          dur="7s"
          repeatCount="indefinite"
          values="
            M0,90 Q240,40 480,70 Q720,30 960,65 Q1200,25 1440,55 L1440,100 L0,100 Z;
            M0,70 Q240,60 480,40 Q720,70 960,35 Q1200,55 1440,45 L1440,100 L0,100 Z;
            M0,90 Q240,40 480,70 Q720,30 960,65 Q1200,25 1440,55 L1440,100 L0,100 Z
          "
        />
      </path>
    </svg>
  );
}

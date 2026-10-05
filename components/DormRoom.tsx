// @ts-nocheck
'use client';

import React, { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Stars, Html, Float, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/lib/universeStore';
import ThreeErrorBoundary from '@/components/ThreeErrorBoundary';


// ─── Teddy quotes ───────────────────────────────────────────────────────────
const TEDDY_QUOTES = [
  "Nush named me Yajat. I protect her every night 🧸",
  "She hugs me when she misses you. I get it — you're huggable 💕",
  "I've heard all her 2 AM thoughts. You're in every one 🌙",
  "She talks to me like I'm you. I try my best 🤍",
  "Guard duty: active. Nush is safe. Yajat approved ✦",
];

// ─── Fairy light bulb ────────────────────────────────────────────────────────
function FairyBulb({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshStandardMaterial color="#fff8d0" emissive="#ffe066" emissiveIntensity={0.8} />
    </mesh>
  );
}

function FairyLights() {
  const bulbs = useMemo(() => {
    const pts: [number, number, number][] = [];
    // String along back wall top
    for (let i = 0; i < 18; i++) {
      const x = -2.2 + i * 0.26;
      const y = 1.55 + Math.sin(i * 0.7) * 0.06;
      pts.push([x, y, -2.3]);
    }
    // String along left wall
    for (let i = 0; i < 12; i++) {
      const z = -2.3 + i * 0.22;
      const y = 1.55 + Math.sin(i * 0.8) * 0.05;
      pts.push([-2.2, y, z]);
    }
    return pts;
  }, []);

  return (
    <group>
      {/* Wire */}
      {bulbs.map((pos, i) => (
        <FairyBulb key={i} position={pos} />
      ))}
      {/* Point lights for glow */}
      <pointLight position={[0, 1.6, -2.3]} color="#ffe580" intensity={0.4} distance={3} />
      <pointLight position={[-2.2, 1.6, -1]} color="#ffe580" intensity={0.3} distance={2} />
    </group>
  );
}

// ─── Maggi Bowl (procedural) ─────────────────────────────────────────────────
function MaggiBowl({ position }: { position: [number, number, number] }) {
  const steamRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (steamRef.current) {
      steamRef.current.position.y = position[1] + 0.18 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      steamRef.current.rotation.y += 0.01;
      const mat = steamRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
    }
  });
  return (
    <group position={position}>
      {/* Bowl body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.07, 24]} />
        <meshStandardMaterial color="#e8c870" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Noodles inside */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.03, 24]} />
        <meshStandardMaterial color="#f4c842" roughness={0.9} />
      </mesh>
      {/* Chopsticks */}
      <mesh position={[0.04, 0.06, 0]} rotation={[0, 0.3, -0.3]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
        <meshStandardMaterial color="#6b3a1f" />
      </mesh>
      <mesh position={[-0.04, 0.06, 0.02]} rotation={[0, -0.3, -0.3]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
        <meshStandardMaterial color="#6b3a1f" />
      </mesh>
      {/* Steam wisps */}
      <mesh ref={steamRef} position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="white" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ─── Mug ─────────────────────────────────────────────────────────────────────
function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#9b59b6" roughness={0.6} />
      </mesh>
      <mesh position={[0.06, 0, 0]}>
        <torusGeometry args={[0.03, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#9b59b6" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ─── Room Walls/Floor ────────────────────────────────────────────────────────
function RoomShell() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#1a0f2e" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow position={[0, 1.5, -2.5]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#150d24" roughness={1} />
      </mesh>
      {/* Left wall */}
      <mesh receiveShadow rotation={[0, Math.PI / 2, 0]} position={[-2.5, 1.5, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#130b22" roughness={1} />
      </mesh>
      {/* Skirting board accent */}
      <mesh position={[0, 0.04, -2.48]}>
        <boxGeometry args={[5, 0.08, 0.02]} />
        <meshStandardMaterial color="#2d1a4e" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── GLB Model loader ────────────────────────────────────────────────────────
function GLBModel({
  url, position, rotation, scale, onClick, name,
}: {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: () => void;
  name?: string;
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={clone}
      position={position}
      rotation={rotation ?? [0, 0, 0]}
      scale={scale ?? 1}
      onClick={onClick}
      onPointerOver={() => { if (onClick) setHovered(true); document.body.style.cursor = onClick ? 'pointer' : 'auto'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    />
  );
}

// ─── Teddy (interactive) ──────────────────────────────────────────────────────
function TeddyModel({ onTap }: { onTap: () => void }) {
  const { scene } = useGLTF('/models/teddy.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
      ref.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
    }
  });

  return (
    <group
      ref={ref}
      position={[0.4, -0.3, -0.6]}
      scale={hovered ? 0.42 : 0.38}
      onClick={onTap}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <primitive object={clone} />
      {hovered && (
        <Html center distanceFactor={4} position={[0, 1.2, 0]}>
          <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full font-mono whitespace-nowrap border border-pink-500/40">
            tap me 🧸
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
function DormScene({ onTeddyTap }: { onTeddyTap: () => void }) {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;

  return (
    <>
      <PerspectiveCamera makeDefault position={[3.5, 2.8, 3.5]} fov={45} />
      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 6}
        minDistance={3}
        maxDistance={7}
        autoRotate={false}
      />

      {/* Ambient light */}
      <ambientLight intensity={isNight ? 0.15 : 0.3} color="#2d1b4e" />

      {/* Window sunlight / moonlight */}
      <directionalLight
        position={[-2, 3, -2]}
        intensity={isNight ? 0.2 : 0.8}
        color={isNight ? '#8888ff' : '#ffe0a0'}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Pink accent from bed side */}
      <pointLight position={[0.5, 0.8, 0]} color="#ff5c8e" intensity={0.3} distance={2.5} />

      {/* Purple fill */}
      <pointLight position={[-1, 1.5, -1]} color="#7c3aed" intensity={0.4} distance={4} />

      {/* Stars visible through window at night */}
      {isNight && <Stars radius={8} depth={3} count={300} factor={0.4} saturation={0.5} fade />}

      {/* Room */}
      <RoomShell />
      <FairyLights />

      {/* ── GLB Models ── */}
      {/* Bed — back left */}
      <Suspense fallback={null}>
        <GLBModel url="/models/bed.glb" position={[-0.8, 0, -1.6]} rotation={[0, 0, 0]} scale={0.8} />
      </Suspense>

      {/* Teddy — on bed */}
      <Suspense fallback={null}>
        <TeddyModel onTap={onTeddyTap} />
      </Suspense>

      {/* Desk — right side */}
      <Suspense fallback={null}>
        <GLBModel url="/models/desk.glb" position={[1.4, 0, -1.2]} rotation={[0, -Math.PI / 2, 0]} scale={0.7} />
      </Suspense>

      {/* Guitar — left wall */}
      <Suspense fallback={null}>
        <GLBModel url="/models/guitar.glb" position={[-2.0, 0, -0.5]} rotation={[0, Math.PI / 4, 0]} scale={0.55} />
      </Suspense>

      {/* Corkboard — back wall */}
      <Suspense fallback={null}>
        <GLBModel url="/models/corkboard.glb" position={[0.8, 1.1, -2.42]} rotation={[0, 0, 0]} scale={0.5} />
      </Suspense>

      {/* Window — back wall left */}
      <Suspense fallback={null}>
        <GLBModel url="/models/window.glb" position={[-1.2, 0.8, -2.42]} rotation={[0, 0, 0]} scale={0.6} />
      </Suspense>

      {/* Maggi bowl on desk */}
      <MaggiBowl position={[1.3, 0.46, -1.0]} />

      {/* Mug */}
      <Mug position={[1.55, 0.46, -1.35]} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={1.2} blendFunction={BlendFunction.ADD} />
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
        <ChromaticAberration offset={[0.0005, 0.0005] as any} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function DormRoom() {
  const [teddyQuote, setTeddyQuote] = useState<string | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const handleTeddyTap = () => {
    setTeddyQuote(TEDDY_QUOTES[quoteIdx % TEDDY_QUOTES.length]);
    setQuoteIdx((i) => i + 1);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60, 40, 60]);
    }
  };

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;
  const timeLabel = isNight ? '🌙 Night mode' : '☀️ Day mode';

  return (
    <section id="dorm-room" className="relative w-full font-nunito select-none">
      {/* Section header */}
      <div className="text-center py-10 px-4">
        <p className="text-[11px] font-mono text-pink-400/60 uppercase tracking-widest mb-2">our shared space</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Cozy Universe Room 🏠</h2>
        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
          This is our little world. Tap Teddy Yajat. Orbit around. It's {timeLabel}.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full mx-auto max-w-4xl" style={{ height: 'min(75vh, 600px)' }}>
        <ThreeErrorBoundary>
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0a1a 0%, #1a0a30 100%)' }}
          >
            <DormScene onTeddyTap={handleTeddyTap} />
          </Canvas>
        </ThreeErrorBoundary>


        {/* UI overlays */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
          {/* Controls hint */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2">
            <p className="text-[10px] font-mono text-white/50">🖱️ drag to orbit · scroll to zoom · tap teddy 🧸</p>
          </div>
          {/* Time indicator */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2">
            <p className="text-[10px] font-mono text-pink-300/70">{timeLabel}</p>
          </div>
        </div>
      </div>

      {/* Teddy quote popup */}
      <AnimatePresence>
        {teddyQuote && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              className="bg-[#1a0a2e]/95 border border-pink-500/30 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full shadow-2xl pointer-events-auto"
              onClick={() => setTeddyQuote(null)}
            >
              <div className="text-center">
                <div className="text-5xl mb-3">🧸</div>
                <p className="text-white font-nunito text-lg leading-relaxed">{teddyQuote}</p>
                <p className="text-white/30 text-[11px] font-mono mt-4">— Teddy Yajat · tap to close</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Preload all models
useGLTF.preload('/models/teddy.glb');
useGLTF.preload('/models/bed.glb');
useGLTF.preload('/models/guitar.glb');
useGLTF.preload('/models/desk.glb');
useGLTF.preload('/models/corkboard.glb');
useGLTF.preload('/models/window.glb');

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';

// ─── Teddy quotes ────────────────────────────────────────────────────────────
const TEDDY_QUOTES = [
  "Nush named me Yajat. I protect her every night 🧸",
  "She hugs me when she misses you. I get it — you're huggable 💕",
  "I've heard all her 2 AM thoughts. You're in every one 🌙",
  "She talks to me like I'm you. I try my best 🤍",
  "Guard duty: active. Nush is safe. Yajat approved ✦",
  "Sometimes she whispers your name before sleeping 💫",
];

// ─── Procedural teddy — always used (no GLB dependency) ──────────────────────
// ─── Procedural Teddy Bear — Adorable Sitting Plush ──────────────────────────
function buildProceduralTeddy(): THREE.Group {
  const group = new THREE.Group();

  // Cozy honey-brown plush fur materials
  const furMat   = new THREE.MeshStandardMaterial({ color: 0xa86e3b, roughness: 0.9, metalness: 0.0, emissive: 0x42260e, emissiveIntensity: 0.1 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0xdfb482, roughness: 0.92, metalness: 0.0 });
  const noseMat  = new THREE.MeshStandardMaterial({ color: 0x22110c, roughness: 0.5 });
  const eyeMat   = new THREE.MeshStandardMaterial({ color: 0x0f0705, roughness: 0.15, emissive: 0x2b0f0a, emissiveIntensity: 0.4 });
  const shineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0 });
  const bowMat   = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.35, emissive: 0x880e28, emissiveIntensity: 0.2 });
  const heartMat = new THREE.MeshStandardMaterial({ color: 0xff2462, emissive: 0xff0d48, emissiveIntensity: 0.85, roughness: 0.3 });

  // 1. Plump Body (sitting)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), furMat);
  body.scale.set(1.08, 1.15, 0.98);
  body.position.set(0, 0.18, 0);
  body.castShadow = true;
  group.add(body);

  // Soft belly patch
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 14), snoutMat);
  belly.scale.set(1.0, 1.1, 0.4);
  belly.position.set(0, 0.17, 0.21);
  group.add(belly);

  // 2. Cute Rounded Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.185, 18, 18), furMat);
  head.position.set(0, 0.44, 0.02);
  head.castShadow = true;
  group.add(head);

  // Snout (cute rounded muzzle)
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), snoutMat);
  snout.scale.set(1.1, 0.75, 0.7);
  snout.position.set(0, 0.41, 0.17);
  group.add(snout);

  // Nose (little button)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), noseMat);
  nose.scale.set(1.2, 0.8, 0.7);
  nose.position.set(0, 0.438, 0.245);
  group.add(nose);

  // Eyes with glistening catchlights
  [-0.062, 0.062].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), eyeMat);
    eye.position.set(x, 0.475, 0.165);
    group.add(eye);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), shineMat);
    shine.position.set(x + 0.008, 0.485, 0.184);
    group.add(shine);
  });

  // Big cute rounded ears with inner pads
  [-0.145, 0.145].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), furMat);
    ear.position.set(x, 0.58, 0.02);
    ear.castShadow = true;
    group.add(ear);
    const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), snoutMat);
    innerEar.scale.set(0.9, 0.9, 0.35);
    innerEar.position.set(x, 0.58, 0.07);
    group.add(innerEar);
  });

  // 3. Cute Red Satin Bowtie at the neck
  const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), bowMat);
  bowL.rotation.z = Math.PI / 2;
  bowL.position.set(-0.035, 0.33, 0.20);
  group.add(bowL);
  const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), bowMat);
  bowR.rotation.z = -Math.PI / 2;
  bowR.position.set(0.035, 0.33, 0.20);
  group.add(bowR);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), bowMat);
  knot.position.set(0, 0.33, 0.215);
  group.add(knot);

  // 4. Little glowing love heart held at chest ❤️
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), heartMat);
  heart.position.set(0, 0.23, 0.23);
  group.add(heart);

  // 5. Sitting Arms (curved gently around the belly/heart)
  [-0.22, 0.22].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.12, 8, 8), furMat);
    arm.rotation.x = -0.65;
    arm.rotation.z = x < 0 ? 0.45 : -0.45;
    arm.rotation.y = x < 0 ? 0.35 : -0.35;
    arm.position.set(x, 0.22, 0.11);
    arm.castShadow = true;
    group.add(arm);
  });

  // 6. Sitting Legs (laid flat forward across the bed comforter!)
  [-0.12, 0.12].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.14, 8, 8), furMat);
    leg.rotation.x = -Math.PI / 2.15;
    leg.rotation.z = x < 0 ? 0.15 : -0.15;
    leg.position.set(x, 0.05, 0.18);
    leg.castShadow = true;
    group.add(leg);

    // Cute foot paw pads
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), snoutMat);
    pad.rotation.x = -Math.PI / 2.15;
    pad.rotation.z = x < 0 ? 0.15 : -0.15;
    pad.position.set(x, 0.06, 0.27);
    group.add(pad);
  });

  return group;
}

// ─── Fairy lights ─────────────────────────────────────────────────────────────
function buildFairyLights(scene: THREE.Scene) {
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff3b0, emissive: 0xffe066, emissiveIntensity: 3.0, roughness: 0.1,
  });
  const wirePts: THREE.Vector3[] = [];
  const count = 20;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = -2.4 + t * 4.8;
    const y = 2.25 + Math.sin(t * Math.PI) * -0.06 + Math.sin(i * 1.4) * 0.035;
    const z = -2.85;
    wirePts.push(new THREE.Vector3(x, y, z));
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), bulbMat);
    b.position.set(x, y, z);
    scene.add(b);
    if (i % 4 === 0) {
      const glow = new THREE.PointLight(0xffdd88, 0.7, 1.4);
      glow.position.set(x, y, z + 0.15);
      scene.add(glow);
    }
  }
  const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePts);
  scene.add(new THREE.Line(wireGeo, new THREE.LineBasicMaterial({ color: 0x3a2d1a })));
}

// ─── Real photo frames on back wall ──────────────────────────────────────────
const PHOTO_DATA = [
  { url: '/photos/photo-new-1.jpg', caption: 'Our favorite evening walk together 🌆💖' },
  { url: '/photos/photo-new-2.jpg', caption: 'Your radiant smile that lights up my whole universe ✨' },
  { url: '/photos/photo-new-3.jpg', caption: 'Quiet study dates at Central Library 📚🥰' },
  { url: '/photos/photo-2.jpg',     caption: 'That unforgettable spark on Day 1 💫' },
  { url: '/photos/photo-6.jpg',     caption: 'Three months of pure magic with my Queen 👑' },
];

function buildPhotoFrames(scene: THREE.Scene): THREE.Mesh[] {
  const txLoader = new THREE.TextureLoader();
  const clickablePhotoMeshes: THREE.Mesh[] = [];

  const framePositions: Array<[number, number, number]> = [
    [-1.35, 1.80, -3.17],
    [-0.68, 2.10, -3.17],
    [ 0.00, 1.80, -3.17],
    [ 0.68, 2.10, -3.17],
    [ 1.35, 1.80, -3.17],
  ];

  framePositions.forEach(([px, py, pz], i) => {
    const item = PHOTO_DATA[i % PHOTO_DATA.length];
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2b1509,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Outer wooden frame (larger & clearly visible from across room)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.40, 0.03), frameMat);
    frame.position.set(px, py, pz);
    frame.castShadow = true;
    scene.add(frame);

    // Inner photo canvas with true, vivid colors (MeshBasicMaterial prevents light wash-out glare)
    const photoMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: true,
    });
    const photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.34), photoMat);
    photoMesh.position.set(px, py, pz + 0.016);
    photoMesh.userData = { isPhoto: true, item };
    scene.add(photoMesh);
    clickablePhotoMeshes.push(photoMesh);

    // Load actual couple photograph texture
    txLoader.load(item.url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      photoMat.map = tex;
      photoMat.needsUpdate = true;
    });
  });

  return clickablePhotoMeshes;
}

// ─── Heart particles ──────────────────────────────────────────────────────────
interface Particle { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number; }

function spawnHeart(scene: THREE.Scene, origin: THREE.Vector3): Particle {
  const cols = [0xff6b9d, 0xfbbf24, 0xc084fc, 0xff4d6d];
  const col = cols[Math.floor(Math.random() * cols.length)];
  const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.7, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.022 + Math.random() * 0.018, 6, 6), mat);
  mesh.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 0.8));
  scene.add(mesh);
  return { mesh, vel: new THREE.Vector3((Math.random() - 0.5) * 0.25, 0.22 + Math.random() * 0.28, 0), life: 0, maxLife: 2.5 + Math.random() * 2 };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DormRoom() {
  const mountRef   = useRef<HTMLDivElement>(null);
  const [quote,    setQuote]   = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [quoteIdx, setIdx]     = useState(0);
  const [loading,  setLoading] = useState(true);

  const tapTeddy = (particles: Particle[], scene: THREE.Scene, origin: THREE.Vector3) => {
    setQuote(TEDDY_QUOTES[quoteIdx % TEDDY_QUOTES.length]);
    setIdx(i => i + 1);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([60, 40, 60]); } catch (_) {}
    }
    for (let i = 0; i < 10; i++) particles.push(spawnHeart(scene, origin));
  };

  const hour    = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;
  const timeLbl = isNight ? '🌙 Night mode' : '☀️ Day mode';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let animId: number;
    const W = container.clientWidth  || 700;
    const H = container.clientHeight || 520;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0817, 0.038);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 60);
    // Front-facing, eye-level: slightly left-of-centre, looking at bed + back wall
    camera.position.set(-0.3, 1.55, 4.8);

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x0c0817);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── Controls ────────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;
    controls.target.set(-0.3, 0.9, -1.2); // aim at centre of bed/teddy
    controls.maxPolarAngle   = Math.PI / 2.1;   // can't go below floor
    controls.minPolarAngle   = Math.PI / 4;     // can't look straight down from top
    controls.minDistance     = 2.5;
    controls.maxDistance     = 6.5;
    controls.autoRotate      = false;

    // ── Lights ──────────────────────────────────────────────────────────────
    // Global ambient
    scene.add(new THREE.AmbientLight(0x4a3566, 2.2));

    // Main directional (moon / cool window light)
    const moonDir = new THREE.DirectionalLight(0x9ab4ff, 2.0);
    moonDir.position.set(-2, 6, 2);
    moonDir.castShadow = true;
    moonDir.shadow.mapSize.set(2048, 2048);
    moonDir.shadow.camera.left  = -6; moonDir.shadow.camera.right = 6;
    moonDir.shadow.camera.top   =  6; moonDir.shadow.camera.bottom = -6;
    moonDir.shadow.bias = -0.001;
    scene.add(moonDir);

    // Warm pink bedside
    const pinkGlow = new THREE.PointLight(0xff4d8a, 4.2, 4.5);
    pinkGlow.position.set(0.6, 1.2, -0.6);
    scene.add(pinkGlow);

    // Purple fill
    const purpleFill = new THREE.PointLight(0x9b5de5, 1.6, 7);
    purpleFill.position.set(-3, 2.8, 0.5);
    scene.add(purpleFill);

    // Desk warm
    const deskWarm = new THREE.PointLight(0xffcd7a, 2.5, 3);
    deskWarm.position.set(1.8, 1.3, -1.8);
    scene.add(deskWarm);

    // ★ Teddy spotlight — always lit
    const tSpot = new THREE.SpotLight(0xffcce0, 4.5, 4.5, Math.PI / 6, 0.45, 1.0);
    tSpot.position.set(-0.35, 2.6, 0.2);
    tSpot.target.position.set(-0.35, 0.48, -1.25);
    scene.add(tSpot);
    scene.add(tSpot.target);

    // ── Room Shell ──────────────────────────────────────────────────────────
    // Floor
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x18102a, roughness: 0.92 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Rug under bed area
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x3b1d5e, roughness: 0.95 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-0.4, 0.003, -1.2);
    scene.add(rug);

    // Back wall (z = -3.2)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x120a1f, roughness: 1.0, side: THREE.FrontSide });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
    backWall.position.set(0, 2.5, -3.2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall (x = -3.2)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-3.2, 2.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right wall (x = 3.2)
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(3.2, 2.5, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x0d0918, roughness: 1, side: THREE.BackSide }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3.5;
    scene.add(ceil);

    // Skirting stripe on back wall
    const skirting = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x281640, roughness: 0.9 }));
    skirting.position.set(0, 1.38, -3.19);
    scene.add(skirting);

    // ── Fairy lights on back wall top ───────────────────────────────────────
    buildFairyLights(scene);

    // ── Photo frames (real couple photos) ───────────────────────────────────
    const photoMeshes = buildPhotoFrames(scene);

    // ── Shelf with plants — left wall ────────────────────────────────────────
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x3a2a14, roughness: 0.8 }));
    shelf.position.set(-3.1, 1.55, -0.4);
    shelf.rotation.y = Math.PI / 2;
    shelf.castShadow = true;
    scene.add(shelf);

    [0, 0.25, -0.25].forEach((dz, idx) => {
      const potH = 0.08 + idx * 0.015;
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.028, potH, 8),
        new THREE.MeshStandardMaterial({ color: idx === 1 ? 0xc1440e : 0x7a5c3c, roughness: 0.85 }));
      pot.position.set(-3.06, 1.595 + potH / 2, -0.4 + dz);
      scene.add(pot);
      const plant = new THREE.Mesh(new THREE.SphereGeometry(0.048 + idx * 0.01, 8, 8),
        new THREE.MeshStandardMaterial({ color: idx === 1 ? 0x1a6b1a : 0x2d8a2d, roughness: 0.9 }));
      plant.position.set(-3.06, 1.595 + potH + 0.042, -0.4 + dz);
      scene.add(plant);
    });

    // ── Nightstand ───────────────────────────────────────────────────────────
    const ns = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x1e1028, roughness: 0.85 }));
    ns.position.set(0.85, 0.225, -0.75);
    ns.castShadow = true;
    scene.add(ns);

    // Maggi bowl on nightstand
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.09, 16),
      new THREE.MeshStandardMaterial({ color: 0xf0c040, roughness: 0.3, metalness: 0.15 }));
    bowl.position.set(0.85, 0.472, -0.75);
    bowl.castShadow = true;
    scene.add(bowl);
    const noodle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0xf5b041, roughness: 0.9 })
    );
    noodle.position.set(0.85, 0.522, -0.75);
    scene.add(noodle);

    // Lamp on nightstand
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.22, 8),
      new THREE.MeshStandardMaterial({ color: 0xb8964e, roughness: 0.35, metalness: 0.6 }));
    lampPost.position.set(0.55, 0.56, -0.78);
    scene.add(lampPost);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.15, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf8d07a, roughness: 0.6, side: THREE.DoubleSide }));
    shade.position.set(0.55, 0.67, -0.78);
    scene.add(shade);

    // ── Load GLB models (bed, desk, guitar — NOT teddy) ─────────────────────
    const loader = new GLTFLoader();
    const models = [
      { url: '/models/bed.glb',    pos: [-0.5,  0,  -1.6] as [number,number,number], scale: 0.85, rot: [0, 0, 0]              as [number,number,number] },
      { url: '/models/desk.glb',   pos: [ 2.0,  0,  -2.2] as [number,number,number], scale: 0.68, rot: [0, -Math.PI/2, 0]    as [number,number,number] },
      { url: '/models/guitar.glb', pos: [-2.8,  0,  -0.5] as [number,number,number], scale: 0.58, rot: [0, Math.PI/5, 0]     as [number,number,number] },
      // corkboard on back wall, visible from front
      { url: '/models/corkboard.glb', pos: [1.5, 1.4, -3.15] as [number,number,number], scale: 0.58, rot: [0, 0, 0]          as [number,number,number] },
      // window on LEFT WALL (rotated to face right)
      { url: '/models/window.glb', pos: [-3.15, 1.2, -1.0] as [number,number,number], scale: 0.65, rot: [0, Math.PI/2, 0]   as [number,number,number] },
    ];

    models.forEach(m => {
      loader.load(m.url, (gltf) => {
        const obj = gltf.scene;
        obj.position.set(...m.pos);
        obj.scale.setScalar(m.scale);
        obj.rotation.set(...m.rot);
        obj.traverse(c => {
          if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; }
        });
        scene.add(obj);
      }, undefined, () => { /* silently skip */ });
    });

    // ── Procedural Teddy Bear (always visible, no GLB) ───────────────────────
    const teddy = buildProceduralTeddy();
    // Sit snugly on the bed comforter in front of the pillows
    teddy.position.set(-0.35, 0.42, -1.25);
    teddy.scale.setScalar(0.48);
    teddy.rotation.x = -0.08; // slight comfortable lean back against pillows
    teddy.rotation.y = 0.2;   // turned slightly towards camera
    scene.add(teddy);
    setLoading(false);

    // ── Heart particles ───────────────────────────────────────────────────────
    const particles: Particle[] = [];
    const teddyHead = new THREE.Vector3(-0.35, 0.76, -1.25); // right above sitting teddy's head
    let pTimer = 0;

    // ── Raycaster for clicking teddy ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Invisible hit-sphere covering the sitting teddy for easy tapping
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitSphere.position.set(-0.35, 0.60, -1.25);
    scene.add(hitSphere);

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouse.x = ((cx - rect.left) / rect.width)  *  2 - 1;
      mouse.y = ((cy - rect.top)  / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // 1. Teddy tap
      const hits = raycaster.intersectObjects([hitSphere, ...teddy.children], true);
      if (hits.length > 0) {
        tapTeddy(particles, scene, teddyHead);
        return;
      }

      // 2. Photo frame tap (enlarge picture)
      const photoHits = raycaster.intersectObjects(photoMeshes, false);
      if (photoHits.length > 0) {
        const item = photoHits[0].object.userData?.item;
        if (item) {
          SoundEngine.pop();
          setSelectedPhoto(item);
        }
      }
    };
    renderer.domElement.addEventListener('click', onPointerDown);
    renderer.domElement.addEventListener('touchend', onPointerDown, { passive: true });

    // ── Animation ─────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const baseY = teddy.position.y;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Teddy gentle idle
      teddy.rotation.y = 0.2 + Math.sin(t * 0.55) * 0.06;
      teddy.position.y = baseY + Math.sin(t * 1.25) * 0.005;

      // Pulse pink glow
      pinkGlow.intensity = 3.8 + Math.sin(t * 1.7) * 0.55;

      // Fairy flicker
      scene.children.forEach(c => {
        if (c instanceof THREE.PointLight && c.color.r > 0.9 && c.color.g > 0.85) {
          c.intensity = 0.5 + Math.sin(t * 3.5 + c.position.x * 7) * 0.2;
        }
      });

      // Heart particles
      pTimer += 0.016;
      if (pTimer > 4 && particles.length < 10) {
        particles.push(spawnHeart(scene, teddyHead));
        pTimer = 0;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 0.016;
        const ratio = p.life / p.maxLife;
        p.mesh.position.addScaledVector(p.vel, 0.016);
        p.mesh.position.y += 0.007;
        p.mesh.scale.setScalar(1 - ratio * 0.5);
        (p.mesh.material as THREE.MeshStandardMaterial).opacity = 1 - ratio;
        p.mesh.rotation.z += 0.035;
        if (p.life >= p.maxLife) { scene.remove(p.mesh); particles.splice(i, 1); }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onPointerDown);
      renderer.domElement.removeEventListener('touchend', onPointerDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [isNight]);

  return (
    <section id="dorm-room" className="relative w-full font-nunito select-none py-14 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[11px] font-mono text-pink-400 uppercase tracking-widest mb-2 font-bold">✦ our cozy universe ✦</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white font-mono flex items-center justify-center gap-2">
          <span>Nush's Dorm Room</span><span>🏠</span>
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          Our private 3D sanctuary. Tap Teddy Yajat 🧸 for love notes. Drag to explore.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[520px] sm:h-[620px] rounded-3xl overflow-hidden border border-pink-500/20 shadow-[0_0_80px_rgba(236,72,153,0.18),0_0_120px_rgba(155,93,229,0.1)] bg-[#0c0817]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-zinc-300 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span>Interactive 3D Sanctuary</span>
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-pink-300 pointer-events-none">
          {timeLbl}
        </div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0817]/95 z-10">
              <div className="text-5xl mb-3 animate-bounce">🧸</div>
              <p className="text-pink-300 font-mono text-sm">Setting up our cozy room...</p>
              <div className="mt-4 flex gap-1.5">
                {[0,1,2].map(i=>(
                  <span key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{animationDelay:`${i*0.2}s`}} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-mono text-white/70 whitespace-nowrap">
            🖱️ drag to orbit · scroll to zoom · tap 🧸 Teddy or 🖼️ Wall Photos
          </div>
        </div>
      </div>

      {/* Photo Frame Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-[#181028] border-2 border-pink-500/50 rounded-3xl p-5 max-w-sm w-full shadow-[0_0_60px_rgba(236,72,153,0.4)] text-center cursor-pointer select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg bg-black/40">
                <img
                  src={selectedPhoto.url}
                  alt="Couple Memory"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white font-nunito text-sm font-bold leading-relaxed">
                &ldquo;{selectedPhoto.caption}&rdquo;
              </p>
              <p className="text-pink-300/70 text-[11px] font-mono mt-3">
                ✦ Tap anywhere to return to room ✦
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote popup */}
      <AnimatePresence>
        {quote && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={()=>setQuote(null)}>
            <motion.div initial={{scale:0.8,y:30}} animate={{scale:1,y:0}} exit={{scale:0.8,y:30}}
              transition={{type:'spring',stiffness:380,damping:24}}
              className="bg-[#180e2a] border-2 border-pink-500/60 rounded-3xl p-7 max-w-sm w-full shadow-[0_0_60px_rgba(236,72,153,0.5)] text-center cursor-pointer"
              onClick={e=>e.stopPropagation()}>
              <div className="text-5xl mb-4 animate-bounce">🧸</div>
              <p className="text-white font-nunito text-base leading-relaxed font-bold">&ldquo;{quote}&rdquo;</p>
              <p className="text-pink-300/70 text-[11px] font-mono mt-4">— Teddy Yajat · tap anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

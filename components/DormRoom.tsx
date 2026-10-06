'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Teddy quotes ────────────────────────────────────────────────────────────
const TEDDY_QUOTES = [
  "Nush named me Yajat. I protect her every night 🧸",
  "She hugs me when she misses you. I get it — you're huggable 💕",
  "I've heard all her 2 AM thoughts. You're in every one 🌙",
  "She talks to me like I'm you. I try my best 🤍",
  "Guard duty: active. Nush is safe. Yajat approved ✦",
  "Sometimes she whispers your name before sleeping 💫",
];

// ─── Build a procedural teddy bear from geometry ────────────────────────────
function buildProceduralTeddy(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xc8956c,
    roughness: 0.85,
    metalness: 0.0,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x8b5e3c,
    roughness: 0.9,
  });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x3a1f0f, roughness: 0.7 });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x1a0a0a,
    roughness: 0.3,
    emissive: 0x220000,
    emissiveIntensity: 0.3,
  });

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), mat);
  body.scale.y = 1.15;
  body.position.y = 0.15;
  body.castShadow = true;
  group.add(body);

  // Belly patch
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), darkMat);
  belly.scale.z = 0.4;
  belly.position.set(0, 0.15, 0.165);
  group.add(belly);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 14), mat);
  head.position.set(0, 0.37, 0);
  head.castShadow = true;
  group.add(head);

  // Snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), darkMat);
  snout.scale.set(1, 0.7, 0.65);
  snout.position.set(0, 0.35, 0.115);
  group.add(snout);

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), noseMat);
  nose.position.set(0, 0.375, 0.175);
  group.add(nose);

  // Eyes
  [-0.045, 0.045].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
    eye.position.set(x, 0.405, 0.12);
    group.add(eye);
    // Shine
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 }));
    shine.position.set(x + 0.008, 0.41, 0.133);
    group.add(shine);
  });

  // Ears
  [-0.1, 0.1].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), mat);
    ear.position.set(x, 0.475, 0.01);
    ear.castShadow = true;
    group.add(ear);
    const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), darkMat);
    innerEar.scale.z = 0.4;
    innerEar.position.set(x, 0.477, 0.05);
    group.add(innerEar);
  });

  // Arms
  [-0.19, 0.19].forEach((x, i) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.1, 6, 8), mat);
    arm.rotation.z = x < 0 ? 0.5 : -0.5;
    arm.position.set(x, 0.18, 0.04);
    arm.castShadow = true;
    group.add(arm);
  });

  // Legs
  [-0.09, 0.09].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.07, 6, 8), mat);
    leg.position.set(x, 0.01, 0.06);
    leg.castShadow = true;
    group.add(leg);
  });

  // Small pink heart on chest
  const heartMat = new THREE.MeshStandardMaterial({
    color: 0xff6b9d,
    emissive: 0xff2070,
    emissiveIntensity: 0.5,
    roughness: 0.4,
  });
  const heartSphere = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), heartMat);
  heartSphere.position.set(0, 0.28, 0.175);
  group.add(heartSphere);

  return group;
}

// ─── Build a fairy-light string ──────────────────────────────────────────────
function buildFairyLights(scene: THREE.Scene) {
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff3b0,
    emissive: 0xffe066,
    emissiveIntensity: 2.5,
    roughness: 0.2,
  });
  const bulbGeo = new THREE.SphereGeometry(0.025, 8, 8);

  const wireMat = new THREE.LineBasicMaterial({ color: 0x3a2d1a });
  const wirePoints: THREE.Vector3[] = [];

  const count = 22;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = -2.6 + t * 5.2;
    const y = 2.18 + Math.sin(t * Math.PI) * -0.08 + Math.sin(i * 1.3) * 0.04;
    const z = -2.7;
    wirePoints.push(new THREE.Vector3(x, y, z));

    const b = new THREE.Mesh(bulbGeo, bulbMat);
    b.position.set(x, y, z);
    scene.add(b);

    if (i % 3 === 0) {
      const glow = new THREE.PointLight(0xffdd88, 0.6, 1.2);
      glow.position.set(x, y, z + 0.1);
      scene.add(glow);
    }
  }

  // Wire
  const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePoints);
  scene.add(new THREE.Line(wireGeo, wireMat));
}

// ─── Build photo frames on wall ──────────────────────────────────────────────
function buildPhotoFrames(scene: THREE.Scene) {
  const frameData = [
    { pos: [-0.5, 1.55, -2.72] as [number,number,number], color: 0xff6b9d },
    { pos: [0.1, 1.85, -2.72] as [number,number,number], color: 0xc084fc },
    { pos: [0.65, 1.55, -2.72] as [number,number,number], color: 0xfbbf24 },
  ];

  frameData.forEach(({ pos, color }) => {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x3a2a1a,
      roughness: 0.7,
    });
    const photoMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      emissive: color,
      emissiveIntensity: 0.08,
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.02), frameMat);
    frame.position.set(...pos);
    scene.add(frame);

    const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), photoMat);
    photo.position.set(pos[0], pos[1], pos[2] + 0.011);
    scene.add(photo);

    // Tiny heart on photo
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff2060,
      emissive: 0xff1040,
      emissiveIntensity: 0.8,
    });
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), heartMat);
    heart.position.set(pos[0], pos[1], pos[2] + 0.022);
    scene.add(heart);
  });
}

// ─── Floating hearts particle system ────────────────────────────────────────
interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

function createHeartParticle(scene: THREE.Scene, origin: THREE.Vector3): Particle {
  const colors = [0xff6b9d, 0xfbbf24, 0xc084fc, 0xff4d6d, 0xffd6e7];
  const col = colors[Math.floor(Math.random() * colors.length)];
  const mat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.9,
  });
  const geo = new THREE.SphereGeometry(0.025 + Math.random() * 0.02, 6, 6);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(origin).add(
    new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.0)
  );
  scene.add(mesh);
  const maxLife = 2.5 + Math.random() * 2;
  return {
    mesh,
    vel: new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.2 + Math.random() * 0.3, (Math.random() - 0.5) * 0.2),
    life: 0,
    maxLife,
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DormRoom() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [teddyQuote, setTeddyQuote] = useState<string | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modelStatus, setModelStatus] = useState('Loading our room...');
  const teddyObjRef = useRef<THREE.Group | null>(null);

  const handleTeddyTap = () => {
    setTeddyQuote(TEDDY_QUOTES[quoteIdx % TEDDY_QUOTES.length]);
    setQuoteIdx((i) => i + 1);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([60, 40, 60]); } catch (e) {}
    }
  };

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;
  const timeLabel = isNight ? '🌙 Night mode' : '☀️ Day mode';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    const W = container.clientWidth || 700;
    const H = container.clientHeight || 500;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0817, 0.045);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 60);
    camera.position.set(2.8, 2.4, 3.6);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x0c0817);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── Controls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.8, -0.5);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = Math.PI / 8;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // ── Lights ──
    // Ambient
    const ambient = new THREE.AmbientLight(0x3d2b5a, 1.2);
    scene.add(ambient);

    // Moon light from window
    const moonLight = new THREE.DirectionalLight(0x8ba7ff, 1.8);
    moonLight.position.set(-3, 5, -1);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(2048, 2048);
    moonLight.shadow.camera.near = 0.1;
    moonLight.shadow.camera.far = 20;
    moonLight.shadow.camera.left = -5;
    moonLight.shadow.camera.right = 5;
    moonLight.shadow.camera.top = 5;
    moonLight.shadow.camera.bottom = -5;
    moonLight.shadow.bias = -0.001;
    scene.add(moonLight);

    // Warm bedside pink glow
    const pinkGlow = new THREE.PointLight(0xff5c8e, 3.5, 3.8);
    pinkGlow.position.set(0.5, 1.1, -0.5);
    scene.add(pinkGlow);

    // Soft purple fill
    const purpleFill = new THREE.PointLight(0x9b5de5, 1.8, 6);
    purpleFill.position.set(-2, 2.5, 0);
    scene.add(purpleFill);

    // Warm desk lamp
    const deskLamp = new THREE.PointLight(0xffd580, 2.2, 2.5);
    deskLamp.position.set(1.6, 1.15, -1.4);
    scene.add(deskLamp);

    // ── Room Shell ──
    // Floor
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1025, roughness: 0.9 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Rug under bed
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x4a2060, roughness: 0.95 });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.8), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-0.4, 0.002, -0.2);
    scene.add(rug);

    // Back wall
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x130b22, roughness: 1.0 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), wallMat);
    backWall.position.set(0, 2.0, -3.0);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-3.0, 2.0, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Ceiling tint
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0d091a, roughness: 1.0, side: THREE.BackSide });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3.2;
    scene.add(ceil);

    // ── Wall accent stripe ──
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x2d1a4a,
      roughness: 0.9,
    });
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.4), stripeMat);
    stripe.position.set(0, 1.5, -2.99);
    scene.add(stripe);

    // ── Fairy lights ──
    buildFairyLights(scene);

    // ── Photo frames on wall ──
    buildPhotoFrames(scene);

    // ── Shelf with string lights ──
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3a2a14, roughness: 0.8 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.18), shelfMat);
    shelf.position.set(-1.5, 1.4, -2.88);
    shelf.castShadow = true;
    scene.add(shelf);

    // Tiny plants on shelf
    [0, 0.22].forEach((dx) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.07, 8), 
        new THREE.MeshStandardMaterial({ color: 0xc1440e, roughness: 0.8 }));
      pot.position.set(-1.62 + dx, 1.465, -2.85);
      scene.add(pot);
      const plant = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x2d7a2d, roughness: 0.9 }));
      plant.position.set(-1.62 + dx, 1.545, -2.85);
      scene.add(plant);
    });

    // ── 2 AM Maggi bowl on nightstand ──
    const nsStand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x1e1020, roughness: 0.85 }));
    nsStand.position.set(0.85, 0.21, -0.7);
    nsStand.castShadow = true;
    scene.add(nsStand);

    const bowlGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.09, 16);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xf0c040, roughness: 0.35, metalness: 0.1 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.set(0.85, 0.465, -0.7);
    bowl.castShadow = true;
    scene.add(bowl);
    const noodleMat = new THREE.MeshStandardMaterial({ color: 0xf5b041, roughness: 0.9 });
    const noodle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 16), noodleMat);
    noodle.position.set(0.85, 0.515, -0.7);
    scene.add(noodle);
    // Chopsticks
    const chopMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c });
    [-1, 1].forEach((s) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.22, 6), chopMat);
      c.position.set(0.85 + s * 0.025, 0.55, -0.7);
      c.rotation.z = -0.3 * s;
      scene.add(c);
    });

    // Lamp on nightstand
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0xc8a86b, roughness: 0.4, metalness: 0.5 }));
    lampBase.position.set(0.55, 0.50, -0.75);
    scene.add(lampBase);
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf9d58b, roughness: 0.7, side: THREE.DoubleSide }));
    lampShade.position.set(0.55, 0.63, -0.75);
    scene.add(lampShade);

    // ── GLB Model Loader ──
    const loader = new GLTFLoader();
    let loadedCount = 0;
    const models = [
      { url: '/models/bed.glb',       pos: [-0.5, 0, -1.5] as [number,number,number], scale: 0.85, rot: [0, 0, 0] as [number,number,number] },
      { url: '/models/desk.glb',      pos: [1.7, 0, -2.1] as [number,number,number],  scale: 0.65, rot: [0, -Math.PI / 2, 0] as [number,number,number] },
      { url: '/models/guitar.glb',    pos: [-2.6, 0, -0.4] as [number,number,number], scale: 0.6,  rot: [0, Math.PI / 6, 0] as [number,number,number] },
      { url: '/models/corkboard.glb', pos: [1.0, 1.3, -2.94] as [number,number,number], scale: 0.55, rot: [0, 0, 0] as [number,number,number] },
      { url: '/models/window.glb',    pos: [-1.6, 1.1, -2.94] as [number,number,number], scale: 0.65, rot: [0, 0, 0] as [number,number,number] },
    ];

    models.forEach((m) => {
      loader.load(m.url, (gltf) => {
        const obj = gltf.scene;
        obj.position.set(...m.pos);
        obj.scale.setScalar(m.scale);
        obj.rotation.set(...m.rot);
        obj.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        scene.add(obj);
        loadedCount++;
        setModelStatus(`Loaded ${loadedCount}/${models.length + 1} models...`);
      }, undefined, (err) => {
        console.warn('Model skip:', m.url);
        loadedCount++;
      });
    });

    // ── Teddy Bear — GLB with procedural fallback ──
    let teddyObj: THREE.Group | null = null;

    const placeTeddy = (group: THREE.Group) => {
      teddyObj = group;
      teddyObjRef.current = group;
      // Place on bed — slightly to right of center on bed surface
      teddyObj.position.set(0.28, 0.52, -1.15);
      teddyObj.scale.setScalar(0.32);
      teddyObj.rotation.y = -0.4;
      teddyObj.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) c.castShadow = true;
      });
      scene.add(teddyObj);
      setIsLoading(false);
      setModelStatus('');
    };

    loader.load(
      '/models/teddy.glb',
      (gltf) => {
        console.log('✓ teddy.glb loaded');
        placeTeddy(gltf.scene);
      },
      (progress) => {
        if (progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          setModelStatus(`Loading Teddy Yajat... ${pct}%`);
        }
      },
      (err) => {
        console.warn('teddy.glb failed, using procedural teddy:', err);
        const procTeddy = buildProceduralTeddy();
        placeTeddy(procTeddy);
      }
    );

    // ── Heart-particle system ──
    const particles: Particle[] = [];
    let particleTimer = 0;
    const particleOrigin = new THREE.Vector3(0.28, 0.85, -1.15);

    // ── Raycaster for Teddy click ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (teddyObj) {
        const hits = raycaster.intersectObjects(teddyObj.children.length > 0 ? teddyObj.children : [teddyObj], true);
        if (hits.length > 0) {
          handleTeddyTap();
          // Burst hearts
          for (let i = 0; i < 8; i++) {
            particles.push(createHeartParticle(scene, particleOrigin));
          }
        }
      }
    };
    renderer.domElement.addEventListener('click', onPointerDown);
    renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: true });

    // ── Animation Loop ──
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta ? 0.016 : 0.016;

      // Teddy idle bob + breathe
      if (teddyObj) {
        teddyObj.rotation.y = -0.4 + Math.sin(elapsed * 0.6) * 0.12;
        teddyObj.position.y = 0.52 + Math.sin(elapsed * 1.3) * 0.01;
      }

      // Fairy light shimmer
      scene.children.forEach((c) => {
        if (c instanceof THREE.PointLight && c.color.r > 0.9 && c.color.g > 0.85) {
          c.intensity = 0.45 + Math.sin(elapsed * 3 + c.position.x) * 0.15;
        }
      });

      // Pink bedside glow pulse
      pinkGlow.intensity = 3.2 + Math.sin(elapsed * 1.8) * 0.5;

      // Particle update
      particleTimer += 0.016;
      if (particleTimer > 3.5) {
        particleTimer = 0;
        if (particles.length < 12) {
          particles.push(createHeartParticle(scene, particleOrigin));
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 0.016;
        const t = p.life / p.maxLife;
        p.mesh.position.addScaledVector(p.vel, 0.016);
        p.mesh.position.y += 0.008;
        p.mesh.scale.setScalar(1 - t * 0.5);
        (p.mesh.material as THREE.MeshStandardMaterial).opacity = 1 - t;
        p.mesh.rotation.z += 0.04;
        if (p.life >= p.maxLife) {
          scene.remove(p.mesh);
          particles.splice(i, 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onPointerDown);
      renderer.domElement.removeEventListener('touchstart', onPointerDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [isNight]);

  return (
    <section id="dorm-room" className="relative w-full font-nunito select-none py-14 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[11px] font-mono text-pink-400 uppercase tracking-widest mb-2 font-bold">
          ✦ our cozy universe ✦
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white font-mono flex items-center justify-center gap-2">
          <span>Nush's Dorm Room</span>
          <span>🏠</span>
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          Our private 3D sanctuary. Tap Teddy Yajat 🧸 for love notes. Drag to explore.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[500px] sm:h-[600px] rounded-3xl overflow-hidden border border-pink-500/20 shadow-[0_0_80px_rgba(236,72,153,0.2),0_0_120px_rgba(155,93,229,0.1)] bg-[#0c0817]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top-left badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-zinc-300 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span>Interactive 3D Sanctuary</span>
        </div>

        {/* Time badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-pink-300 pointer-events-none">
          {timeLabel}
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0817]/90 backdrop-blur-sm z-10"
            >
              <div className="text-4xl mb-3 animate-bounce">🧸</div>
              <p className="text-pink-300 font-mono text-sm">{modelStatus || 'Setting up our room...'}</p>
              <div className="mt-4 flex gap-1.5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-mono text-white/60 whitespace-nowrap">
            🖱️ drag to orbit · scroll to zoom · tap 🧸 for love notes
          </div>
        </div>
      </div>

      {/* Teddy Quote Popup */}
      <AnimatePresence>
        {teddyQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setTeddyQuote(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-[#180e2a] border-2 border-pink-500/60 backdrop-blur-2xl rounded-3xl p-7 max-w-sm w-full shadow-[0_0_60px_rgba(236,72,153,0.5),0_0_120px_rgba(155,93,229,0.3)] text-center cursor-pointer select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4 animate-bounce">🧸</div>
              <p className="text-white font-nunito text-base leading-relaxed font-bold">
                &ldquo;{teddyQuote}&rdquo;
              </p>
              <p className="text-pink-300/70 text-[11px] font-mono mt-4">
                — Teddy Yajat · tap anywhere to close
              </p>
              <div className="flex justify-center gap-1.5 mt-3">
                {['💕','🌙','✨'].map((e, i) => (
                  <span key={i} className="text-base opacity-60">{e}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { useUniverseStore } from '@/lib/universeStore';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface CampusWaypoint {
  id: number;
  name: string;
  subtitle: string;
  desc: string;
  guardMsg?: string;
  lat: number;
  lng: number;
  cx: number;
  cy: number;
  icon: string;
  tag: string;
}

// 7 Real Waypoints showcasing our exact road route & passing Dr. Morphin's twice
const VIT_WAYPOINTS: CampusWaypoint[] = [
  {
    id: 1,
    name: 'Open Audi (Start at 8:00 PM)',
    subtitle: 'Where the daily mission begins',
    desc: 'Our sacred, pavitra spot. Right at 8:00 PM, the guards kick us out. Normal people would take the direct 30-second walk to GB-2... but we immediately start walking down the road in the total opposite direction! 😭❤️',
    guardMsg: 'Chalo beta 8 baj gaye, bahar niklo! 👮‍♂️😂',
    lat: 23.0768,
    lng: 76.8520,
    cx: 76,
    cy: 18,
    icon: '🎭',
    tag: 'Sacred Spot',
  },
  {
    id: 2,
    name: "Dr. Morphin's Road (Pass #1 — Heading Down)",
    subtitle: 'Passing the cafe the first time',
    desc: 'Walking down the main campus road towards the academic complex. We pass Dr. Morphin’s the 1st time, holding hands and stretching every second as the streetlights turn on ☕🚶‍♂️🚶‍♀️',
    lat: 23.0758,
    lng: 76.8505,
    cx: 52,
    cy: 38,
    icon: '☕',
    tag: 'Pass 1 of 2',
  },
  {
    id: 3,
    name: 'Academic Block 1 (AB-1)',
    subtitle: 'Opposite end of campus',
    desc: 'We walk all the way to the far end of the academic plaza just to stay together... until the security guards here start whistling and chasing us too 💀😂',
    guardMsg: 'Yahan bhi nahi ruk sakte! Chalo chalo! 👮‍♂️💀',
    lat: 23.0742,
    lng: 76.8480,
    cx: 18,
    cy: 28,
    icon: '🏛️',
    tag: 'Academic Core',
  },
  {
    id: 4,
    name: 'The Sacred AB-2 Walkway',
    subtitle: 'August 22 — Our First Actual Kiss 💋',
    desc: 'Right past AB-2 on the quiet paved pathway. The whole campus disappeared, our hearts collided, and our first actual kiss happened right here. Permanently engraved in my soul forever 🥹💋✨',
    lat: 23.0750,
    lng: 76.8488,
    cx: 32,
    cy: 34,
    icon: '💋',
    tag: 'Milestone Kiss',
  },
  {
    id: 5,
    name: "Dr. Morphin's Cafe (Pass #2 — Looping Back!)",
    subtitle: 'Passing the cafe a SECOND time ☕',
    desc: 'Yes, we pass Dr. Morphin’s for the SECOND time! Looping back up the road, walking deliberately slow with our fingers tightly intertwined, pretending we don’t know where we’re going ☕❤️',
    lat: 23.0758,
    lng: 76.8505,
    cx: 52,
    cy: 42,
    icon: '☕',
    tag: 'Pass 2 of 2',
  },
  {
    id: 6,
    name: 'Girls Block 1 (The Long Northern Loop)',
    subtitle: 'Walking past her block for extra time',
    desc: 'She literally walks right past the turn to her hostel and takes the long, scenic northern road loop around GB-1 just so we can steal 5 more minutes together 🥹🤝💕',
    guardMsg: 'Arre tum dono phir ghoom rahe ho?! 👮‍♂️👀😂',
    lat: 23.0775,
    lng: 76.8510,
    cx: 60,
    cy: 76,
    icon: '🏢',
    tag: 'Extra Loop',
  },
  {
    id: 7,
    name: 'Girls Block 2 Gate (The Reluctant Goodbye)',
    subtitle: 'Where time should legally slow down',
    desc: 'After circling the entire campus road network twice, we finally arrive at GB-2. You turn back and wave, and every single night I wish time would just freeze 😭❤️',
    lat: 23.0782,
    lng: 76.8525,
    cx: 82,
    cy: 26,
    icon: '🌸',
    tag: 'Reluctant Parting',
  },
];

// Exact road-snapped polyline coordinates following VIT Bhopal campus paved roads
const ROAD_SNAPPED_PATH: [number, number][] = [
  [23.0768, 76.8520], // 1. Open Audi Start
  [23.0765, 76.8515], // Road junction
  [23.0760, 76.8508], // Central walkway
  [23.0758, 76.8505], // 2. Dr Morphin's (Pass 1)
  [23.0752, 76.8496], // Road bend
  [23.0747, 76.8488], // Academic boulevard
  [23.0742, 76.8480], // 3. AB-1 Plaza
  [23.0745, 76.8484], // Connect road
  [23.0750, 76.8488], // 4. Sacred AB-2 Walkway
  [23.0754, 76.8496], // Returning road
  [23.0758, 76.8505], // 5. Dr Morphin's (Pass 2)
  [23.0762, 76.8511], // Looping road
  [23.0766, 76.8516], // Passing near Open Audi again
  [23.0770, 76.8514], // Road bend to GB-1
  [23.0775, 76.8510], // 6. Girls Block 1 Loop
  [23.0779, 76.8518], // Road connecting to GB-2
  [23.0782, 76.8525], // 7. Girls Block 2 Gate
];

export default function CampusRouteMap() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const [mapMode, setMapMode] = useState<'real' | 'illustrated'>('real');
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const avatarMarkerRef = useRef<any>(null);

  const { addExplorationPoint, unlockAchievement } = useUniverseStore();

  // Dynamically load Leaflet CSS & JS on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || mapMode !== 'real' || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.0760, 76.8505],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Voyager Clean Romantic Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      leafletMapRef.current = map;

      // Draw Exact Road-Snapped Polyline Route
      const routePolyline = L.polyline(ROAD_SNAPPED_PATH, {
        color: '#FF5C8E',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map);
      polylineRef.current = routePolyline;

      // Ignored Direct 30-Second Walk (Ghost Red Line)
      L.polyline([[VIT_WAYPOINTS[0].lat, VIT_WAYPOINTS[0].lng], [VIT_WAYPOINTS[6].lat, VIT_WAYPOINTS[6].lng]], {
        color: '#ef4444',
        weight: 2,
        opacity: 0.4,
        dashArray: '4, 6',
      }).addTo(map);

      // Add Custom Emoji Waypoint Markers
      markersRef.current = VIT_WAYPOINTS.map((wp, idx) => {
        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: white;
            border: 2px solid #FF5C8E;
            border-radius: 50%;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(255, 92, 142, 0.4);
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${wp.icon}
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-wp-marker',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          SoundEngine.pop();
          setCurrentStep(idx);
          setIsJourneyActive(true);
        });

        return marker;
      });

      // Walking Avatar Marker
      const avatarIconHtml = `
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF5C8E, #B9AEF5);
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 0 20px rgba(255, 92, 142, 0.8);
          animation: pulse 1.5s infinite;
        ">
          👫
        </div>
      `;
      const avatarIcon = L.divIcon({
        html: avatarIconHtml,
        className: 'custom-avatar-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      avatarMarkerRef.current = L.marker([VIT_WAYPOINTS[0].lat, VIT_WAYPOINTS[0].lng], {
        icon: avatarIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [leafletLoaded, mapMode]);

  // Sync Map Camera & Avatar to Current Step
  useEffect(() => {
    if (leafletMapRef.current && VIT_WAYPOINTS[currentStep]) {
      const wp = VIT_WAYPOINTS[currentStep];
      leafletMapRef.current.flyTo([wp.lat, wp.lng], 17, {
        animate: true,
        duration: 1.2,
      });

      if (avatarMarkerRef.current) {
        avatarMarkerRef.current.setLatLng([wp.lat, wp.lng]);
      }
    }
  }, [currentStep]);

  const startJourney = () => {
    setCurrentStep(0);
    setIsJourneyActive(true);
    setShowGuard(false);
    SoundEngine.pop();
  };

  // Step-by-step automatic timer progression during tour
  useEffect(() => {
    if (!isJourneyActive) return;

    let timer: NodeJS.Timeout;

    if (currentStep < VIT_WAYPOINTS.length) {
      const currentWp = VIT_WAYPOINTS[currentStep];
      if (currentWp.guardMsg) {
        setShowGuard(true);
        timer = setTimeout(() => {
          setShowGuard(false);
          setCurrentStep((prev) => prev + 1);
        }, 3600);
      } else {
        setShowGuard(false);
        timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 3400);
      }
    } else if (currentStep >= VIT_WAYPOINTS.length) {
      addExplorationPoint('campus_escape_trail', 'Completed 8 PM Campus Escape Trail');
      unlockAchievement('ab2_kiss');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FF5C8E', '#FF9EC9', '#FFDD8C', '#B9AEF5'],
      });
    }

    return () => clearTimeout(timer);
  }, [currentStep, isJourneyActive, addExplorationPoint, unlockAchievement]);

  const activeWaypoint = currentStep < VIT_WAYPOINTS.length ? VIT_WAYPOINTS[currentStep] : VIT_WAYPOINTS[VIT_WAYPOINTS.length - 1];

  return (
    <section className="py-20 bg-[var(--cream)] relative overflow-hidden font-nunito select-none">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <SectionHead
          eyebrow="our daily 8 pm adventure"
          title="The Great VIT Bhopal Road Escape Route 🗺️🚶‍♂️🚶‍♀️"
          subtitle="Open Audi is right next to GB-2... but we follow every road across campus and pass Dr. Morphin's twice just to steal extra time together 😭❤️"
        />

        {/* Fact Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 mb-8 p-4 bg-[var(--butter)] text-[var(--plum)] rounded-3xl border-2 border-[var(--mocha)]/20 text-center shadow-md max-w-3xl mx-auto"
        >
          <span className="font-bold text-xs md:text-sm font-mono block">
            💡 The Road Mission: Open Audi is literally a 30-second walk from Girls Block 2. Instead, we strictly follow the campus roads down to AB-1, past AB-2, loop past Dr. Morphin&apos;s TWICE, and take the long northern loop around GB-1 because neither of us wants to say goodbye yet! 🥹❤️
          </span>
        </motion.div>

        {/* Mode Switcher & Tour Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-full border border-[var(--pink)]/30 shadow-sm font-mono text-xs">
            <button
              onClick={() => {
                SoundEngine.click();
                setMapMode('real');
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                mapMode === 'real'
                  ? 'bg-[var(--pink-deep)] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              🛰️ Real Road Map (OSM)
            </button>
            <button
              onClick={() => {
                SoundEngine.click();
                setMapMode('illustrated');
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                mapMode === 'illustrated'
                  ? 'bg-[var(--pink-deep)] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              🎨 Illustrated Blueprint Map
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startJourney}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-mono font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{isJourneyActive && currentStep >= VIT_WAYPOINTS.length ? '✨ Re-live 8 PM Mission' : '▶ Start 8 PM Campus Road Mission'}</span>
            </button>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="relative w-full h-[450px] md:h-[500px] rounded-3xl shadow-2xl border-4 border-[var(--pink-deep)]/40 overflow-hidden bg-[#FFFDF9]">
          {/* REAL LEAFLET OPENSTREETMAP VIEW */}
          {mapMode === 'real' && (
            <div className="w-full h-full relative">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Real Map Overlays */}
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200 text-xs font-mono text-zinc-700 shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span>VIT Bhopal University Roads &middot; Passing Dr. Morphin&apos;s 2x</span>
              </div>

              <div className="absolute bottom-4 left-4 z-20 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[10px] font-mono text-white shadow-md">
                <span className="text-[var(--butter)] font-bold">Pink Road Path:</span> 2 km road route (Passes Dr. Morphin&apos;s 2x) &middot; <span className="text-red-400 font-bold">Red Line:</span> Ignored 30s direct path
              </div>
            </div>
          )}

          {/* ILLUSTRATED VECTOR SVG MAP VIEW */}
          {mapMode === 'illustrated' && (
            <div className="w-full h-full relative bg-gradient-to-br from-[#FFFDF9] to-[#FFF4ED] p-4">
              <div className="absolute top-4 left-4 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-mono opacity-80 select-none">
                📍 VIT Bhopal Campus Road Network Blueprint
              </div>

              {/* Vector SVG Animated Route Path */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Ignored Direct 30s Walk */}
                <line
                  x1={VIT_WAYPOINTS[0].cx}
                  y1={VIT_WAYPOINTS[0].cy}
                  x2={VIT_WAYPOINTS[6].cx}
                  y2={VIT_WAYPOINTS[6].cy}
                  stroke="#ef4444"
                  strokeWidth="0.8"
                  strokeDasharray="1.5 1.5"
                  opacity="0.35"
                />
                <text x="76" y="24" fontSize="2.5" fill="#ef4444" opacity="0.6" fontStyle="italic">
                  (Direct 30s walk ignored 😂)
                </text>

                {/* The Full Campus Road Loop (Showing Dr. Morphin's 2x pass) */}
                <path
                  d={`M ${VIT_WAYPOINTS[0].cx} ${VIT_WAYPOINTS[0].cy} 
                      L ${VIT_WAYPOINTS[1].cx} ${VIT_WAYPOINTS[1].cy} 
                      L ${VIT_WAYPOINTS[2].cx} ${VIT_WAYPOINTS[2].cy} 
                      L ${VIT_WAYPOINTS[3].cx} ${VIT_WAYPOINTS[3].cy} 
                      L ${VIT_WAYPOINTS[4].cx} ${VIT_WAYPOINTS[4].cy} 
                      L ${VIT_WAYPOINTS[5].cx} ${VIT_WAYPOINTS[5].cy} 
                      L ${VIT_WAYPOINTS[6].cx} ${VIT_WAYPOINTS[6].cy}`}
                  fill="none"
                  stroke="var(--pink-deep)"
                  strokeWidth="1.5"
                  strokeDasharray="2.5 2.5"
                  className="opacity-50"
                />
              </svg>

              {/* Illustrated Waypoint Pins */}
              {VIT_WAYPOINTS.map((wp, index) => {
                const isReached = currentStep >= index;
                const isCurrent = currentStep === index;

                return (
                  <div
                    key={wp.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
                    style={{ left: `${wp.cx}%`, top: `${wp.cy}%` }}
                    onClick={() => {
                      SoundEngine.pop();
                      setCurrentStep(index);
                      setIsJourneyActive(true);
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.3 : isReached ? 1.1 : 0.9,
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 ${
                        isCurrent
                          ? 'bg-[var(--pink-deep)] border-white text-white ring-4 ring-pink-300'
                          : isReached
                          ? 'bg-[var(--butter)] border-[var(--pink-deep)]'
                          : 'bg-white/80 border-gray-300 opacity-60'
                      }`}
                    >
                      {wp.icon}
                    </motion.div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 mt-1 rounded-full bg-white/90 border border-black/10 shadow-xs whitespace-nowrap">
                      {wp.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Guard Dialogue Alert Toast */}
          <AnimatePresence>
            {showGuard && activeWaypoint.guardMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1c1428] border-2 border-yellow-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs max-w-sm"
              >
                <span className="text-2xl animate-bounce">🚨👮‍♂️</span>
                <div>
                  <span className="text-yellow-400 font-bold block">8:00 PM GUARD INTERCEPT:</span>
                  <span>&ldquo;{activeWaypoint.guardMsg}&rdquo;</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step-by-Step Waypoint Detail Panel */}
        <div className="mt-8 bg-[var(--white)]/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 border-[var(--pink-deep)]/40 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{activeWaypoint.icon}</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--pink-deep)] font-bold">
                  Stop #{activeWaypoint.id} of 7 &middot; {activeWaypoint.tag}
                </span>
                <h3 className="font-bold text-xl text-[var(--plum)] font-mono">{activeWaypoint.name}</h3>
                <p className="text-xs text-[var(--plum-soft)]">{activeWaypoint.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => {
                  SoundEngine.click();
                  setCurrentStep(Math.max(0, currentStep - 1));
                }}
                disabled={currentStep === 0}
                className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                &larr; Prev Stop
              </button>
              <button
                onClick={() => {
                  SoundEngine.click();
                  setCurrentStep(Math.min(VIT_WAYPOINTS.length - 1, currentStep + 1));
                }}
                disabled={currentStep === VIT_WAYPOINTS.length - 1}
                className="px-3.5 py-1.5 rounded-full border border-[var(--pink-deep)] bg-[var(--pink-deep)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold"
              >
                Next Stop &rarr;
              </button>
            </div>
          </div>

          <p className="font-caveat text-2xl md:text-3xl text-[var(--plum)] leading-relaxed">
            &ldquo;{activeWaypoint.desc}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

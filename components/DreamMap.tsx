'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

export interface MapDestination {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  type: 'home' | 'sacred' | 'dream';
  emoji: string;
  note: string;
  addedBy: string;
}

const DEFAULT_DESTINATIONS: MapDestination[] = [
  {
    id: 'yajat-home-indore',
    name: "Yajat's Home (Indore)",
    location: 'Near SAGE University, Bypass Road, Indore, MP',
    lat: 22.6289,
    lng: 75.9525,
    type: 'home',
    emoji: '🏡🐻',
    note: 'Near SAGE University, Indore 🏡 Where Yajat lives, dreams about his Nushi, and spends sleepless nights coding whole universes just to make her smile 💻❤️',
    addedBy: 'Yajat',
  },
  {
    id: 'nush-home-shajapur',
    name: "Nush's Home (Shajapur)",
    location: 'Shajapur, Madhya Pradesh, India',
    lat: 23.4277,
    lng: 76.2778,
    type: 'home',
    emoji: '👑🌸',
    note: 'The sacred hometown of the prettiest girl in the universe 🌸 Where my princess lives, missing her boy and looking at the exact same moon 🌙🥹',
    addedBy: 'Nush',
  },
  {
    id: 'vit-bhopal',
    name: 'VIT Bhopal (Our Pavithra Grounds)',
    location: 'Bhopal-Indore Highway, Kothri Kalan, Sehore, MP',
    lat: 23.0784,
    lng: 76.8523,
    type: 'sacred',
    emoji: '🏛️❤️',
    note: 'Our pavitra Open Audi, 8 PM guard chases, AB-1 walks, and reluctant goodbyes at Girls Block 2 🥹❤️ Where our love story blossomed every day.',
    addedBy: 'Us',
  },
  {
    id: 'iit-madras',
    name: 'IIT Madras Hackathon',
    location: 'Chennai, Tamil Nadu, India',
    lat: 12.9915,
    lng: 80.2337,
    type: 'sacred',
    emoji: '💻✨',
    note: 'The summer hackathon where we stayed up late online, opened up our deepest wounds, and made the legendary fake dating pact 👑',
    addedBy: 'Yajat',
  },
  {
    id: 'switzerland',
    name: 'Swiss Alps Mountain Chalet',
    location: 'Valais, Swiss Alps, Switzerland',
    lat: 46.56,
    lng: 8.56,
    type: 'dream',
    emoji: '🏔️❄️',
    note: 'A cozy wooden cabin in the snow, hot chocolate by the fireplace, and holding you tight while the snow falls outside ❄️❤️',
    addedBy: 'Yajat',
  },
  {
    id: 'kyoto-japan',
    name: 'Kyoto & Tokyo, Japan',
    location: 'Kyoto, Kansai Region, Japan',
    lat: 35.0116,
    lng: 135.7681,
    type: 'dream',
    emoji: '🌸🍜',
    note: 'Walking together under blooming pink cherry blossoms, visiting Studio Ghibli, and midnight authentic ramen dates 🍜✨',
    addedBy: 'Nush',
  },
  {
    id: 'santorini',
    name: 'Santorini Sunset Cliffs',
    location: 'Oia, Santorini, Greece',
    lat: 36.3932,
    lng: 25.4615,
    type: 'dream',
    emoji: '🌅🇬🇷',
    note: 'White cliffs, cobalt blue domes, watching the Mediterranean sunset with your hand in mine while kissing your forehead 🇬🇷💕',
    addedBy: 'Yajat',
  },
  {
    id: 'norway-aurora',
    name: 'Tromsø Northern Lights Stargazing',
    location: 'Tromsø, Northern Norway',
    lat: 69.6492,
    lng: 18.9553,
    type: 'dream',
    emoji: '🌌✨',
    note: 'OUR #1 PERFECT DATE: Stargazing under the glowing emerald Northern Lights wrapped tightly together in a warm blanket 🌌✨',
    addedBy: 'Nush & Yajat',
  },
];

const TILE_PROVIDERS = [
  {
    id: 'voyager',
    name: '🗺️ Detailed Labels (Carto)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'osm',
    name: '🌍 OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'dark',
    name: '🌙 Midnight Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
];

export default function DreamMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const pathLinesRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);

  const [destinations, setDestinations] = useState<MapDestination[]>(DEFAULT_DESTINATIONS);
  const [activeDest, setActiveDest] = useState<MapDestination | null>(DEFAULT_DESTINATIONS[0]);
  const [activeTileId, setActiveTileId] = useState<string>('voyager');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Custom pin form
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newLocationText, setNewLocationText] = useState('');
  const [newEmoji, setNewEmoji] = useState('✈️');
  const [newType, setNewType] = useState<MapDestination['type']>('dream');
  const [newNote, setNewNote] = useState('');

  const { unlockAchievement } = useUniverseStore();

  // 1. Mount & load saved pins
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('yajat_nush_osm_destinations_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDestinations(parsed);
          setActiveDest(parsed[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2. Load Leaflet CSS and JS locally from /vendor/leaflet
  useEffect(() => {
    if (!mounted) return;

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = '/vendor/leaflet/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = '/vendor/leaflet/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, [mounted]);

  // 3. Initialize or update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      // Create map centered on the MP Triangle (Indore / Shajapur / VIT Bhopal)
      const map = L.map(mapContainerRef.current, {
        center: [23.1, 76.5],
        zoom: 8,
        zoomControl: false,        // We'll add custom zoom buttons instead
        scrollWheelZoom: true,     // Enable trackpad scroll / mouse wheel zoom
        touchZoom: true,           // Enable pinch-to-zoom on touch devices
        doubleClickZoom: true,     // Enable double-click zoom
        boxZoom: true,             // Enable shift+drag box zoom
        wheelPxPerZoomLevel: 120,  // Smoother zoom increments for trackpads
      });

      // Tile layer
      const selectedTile = TILE_PROVIDERS.find((t) => t.id === activeTileId) || TILE_PROVIDERS[0];
      const layer = L.tileLayer(selectedTile.url, {
        maxZoom: 19,
        attribution: selectedTile.attribution,
        subdomains: 'abcd',
      }).addTo(map);
      tileLayerRef.current = layer;

      // Click handler on map to add custom pin
      map.on('click', (e: any) => {
        SoundEngine.pop();
        setClickedLatLng({ lat: Number(e.latlng.lat.toFixed(4)), lng: Number(e.latlng.lng.toFixed(4)) });
        setIsAddingCustom(true);
      });

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing markers & paths
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    pathLinesRef.current.forEach((p) => p.remove());
    pathLinesRef.current = [];

    // Add Love Connection Paths (Indore <-> Shajapur <-> VIT Bhopal)
    const yajatHome = destinations.find((d) => d.id === 'yajat-home-indore');
    const nushHome = destinations.find((d) => d.id === 'nush-home-shajapur');
    const vitCampus = destinations.find((d) => d.id === 'vit-bhopal');

    if (yajatHome && nushHome && vitCampus) {
      const triangleCoords = [
        [yajatHome.lat, yajatHome.lng],
        [nushHome.lat, nushHome.lng],
        [vitCampus.lat, vitCampus.lng],
        [yajatHome.lat, yajatHome.lng],
      ];

      const lovePolyline = L.polyline(triangleCoords, {
        color: '#FF5C8E',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      pathLinesRef.current.push(lovePolyline);
    }

    // Add Markers for each destination
    destinations.forEach((dest) => {
      const isSelected = activeDest?.id === dest.id;

      const markerHtml = `
        <div class="relative cursor-pointer group select-none">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-2xl border-2 transition-transform ${
            dest.type === 'home'
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-white scale-110 shadow-[0_0_20px_#f43f5e]'
              : dest.type === 'sacred'
              ? 'bg-amber-500 border-amber-200 shadow-[0_0_15px_#f59e0b]'
              : 'bg-purple-900 border-purple-300 shadow-[0_0_15px_#9333ea]'
          }">
            <span>${dest.emoji}</span>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-md pointer-events-none">
            ${dest.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-love-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([dest.lat, dest.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        SoundEngine.click();
        setActiveDest(dest);
        map.panTo([dest.lat, dest.lng], { animate: true, duration: 1 });
      });

      markersRef.current.push(marker);
    });
  }, [leafletLoaded, destinations, activeDest]);

  // Switch Tile Layer (Voyager, Standard OSM, Dark)
  const handleSwitchTile = (tileId: string) => {
    setActiveTileId(tileId);
    if (!leafletMapRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    const prov = TILE_PROVIDERS.find((t) => t.id === tileId) || TILE_PROVIDERS[0];
    tileLayerRef.current.setUrl(prov.url);
    tileLayerRef.current.options.attribution = prov.attribution;
    SoundEngine.click();
  };

  // Quick Zoom buttons
  const zoomTo = (lat: number, lng: number, zoomLevel: number) => {
    if (!leafletMapRef.current) return;
    SoundEngine.pop();
    leafletMapRef.current.flyTo([lat, lng], zoomLevel, {
      duration: 1.6,
      easeLinearity: 0.25,
    });
  };

  const saveDestinations = (updated: MapDestination[]) => {
    setDestinations(updated);
    try {
      localStorage.setItem('yajat_nush_osm_destinations_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustomDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim() || !clickedLatLng) return;

    SoundEngine.chime();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
    });

    const newDest: MapDestination = {
      id: `dest-${Date.now()}`,
      name: newPlaceName.trim(),
      location: newLocationText.trim() || `Coordinates: ${clickedLatLng.lat}, ${clickedLatLng.lng}`,
      lat: clickedLatLng.lat,
      lng: clickedLatLng.lng,
      type: newType,
      emoji: newEmoji,
      note: newNote.trim() || 'A place we will travel to hand in hand ❤️',
      addedBy: 'Us',
    };

    const updated = [...destinations, newDest];
    saveDestinations(updated);
    setActiveDest(newDest);
    setIsAddingCustom(false);

    if (updated.length >= 8) {
      unlockAchievement('world_traveler');
    }

    // Reset
    setNewPlaceName('');
    setNewLocationText('');
    setNewNote('');
    setClickedLatLng(null);
  };

  if (!mounted) return null;

  return (
    <section id="dream-map" className="anniversary-section py-20 px-4 select-none">
      <SectionHead
        eyebrow="geocoded with openstreetmap · our real-world coordinates"
        title="The Dream Destinations & Roots Map"
        subtitle="marked with real roads, towns, and coordinates — from our homes in MP to our dream world bucket list ✈️🌍"
      />

      <div className="max-w-5xl mx-auto mt-6">
        {/* QUICK NAVIGATION JUMP TRAY */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-xl mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => zoomTo(23.15, 76.45, 9)}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-rose-600 text-white font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🇮🇳</span> Our MP Triangle
            </button>

            <button
              onClick={() => zoomTo(22.6289, 75.9525, 14)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>🏡</span> Yajat&apos;s Home (Indore)
            </button>

            <button
              onClick={() => zoomTo(23.4277, 76.2778, 14)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>👑</span> Nush&apos;s Home (Shajapur)
            </button>

            <button
              onClick={() => zoomTo(23.0784, 76.8523, 14)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>🏛️</span> VIT Bhopal
            </button>

            <button
              onClick={() => zoomTo(30, 20, 3)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 font-mono text-xs cursor-pointer flex items-center gap-1"
            >
              <span>🌍</span> World View
            </button>
          </div>

          {/* Tile Layer Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {TILE_PROVIDERS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSwitchTile(t.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer ${
                  activeTileId === t.id
                    ? 'bg-white/20 text-white font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* INTERACTIVE OSM MAP CONTAINER */}
        <div className="relative w-full h-[450px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--pink)] bg-[#0d1117]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Custom Zoom Controls (+/-/Reset) */}
          <div className="absolute top-4 right-4 z-[500] flex flex-col gap-1.5">
            <button
              onClick={() => { leafletMapRef.current?.zoomIn(); SoundEngine.click(); }}
              className="w-9 h-9 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-lg font-bold flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => { leafletMapRef.current?.zoomOut(); SoundEngine.click(); }}
              className="w-9 h-9 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-lg font-bold flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={() => { leafletMapRef.current?.setView([23.1, 76.5], 8, { animate: true }); SoundEngine.pop(); }}
              className="w-9 h-9 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="Reset View"
            >
              ⟳
            </button>
          </div>

          {/* Trackpad / Scroll Helper Badge */}
          <div className="absolute bottom-4 left-4 z-[400] pointer-events-none bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[10px] font-mono text-gray-300 shadow-lg flex items-center gap-1.5">
            <span>💡</span>
            <span>Pinch trackpad · scroll · or use +/− to zoom</span>
          </div>

          {/* Prompt banner pinned to top left */}
          <div className="absolute top-4 left-4 z-[400] pointer-events-none bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-[11px] font-mono text-gray-200 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Click anywhere on OpenStreetMap to drop our next destination 📍</span>
          </div>
        </div>

        {/* ACTIVE PIN DETAIL HERO CARD */}
        {activeDest && (
          <motion.div
            key={activeDest.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-white/15 via-white/5 to-white/15 backdrop-blur-md border border-[var(--pink)]/50 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/20 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                {activeDest.emoji}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      activeDest.type === 'home'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                        : activeDest.type === 'sacred'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {activeDest.type === 'home'
                      ? '🏡 Hometown Root'
                      : activeDest.type === 'sacred'
                      ? '👑 Sacred Relationship Ground'
                      : '✈️ Dream Trip Destination'}
                  </span>
                  <span className="text-xs font-mono text-gray-300">{activeDest.location}</span>
                </div>

                <h3 className="text-2xl font-bold text-white font-serif">{activeDest.name}</h3>
                <p className="text-sm font-caveat text-xl text-[var(--butter)] mt-1 max-w-xl leading-snug">
                  &ldquo;{activeDest.note}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <span className="text-[11px] font-mono text-gray-400">
                Pinned with love by: <strong className="text-[var(--pink)]">{activeDest.addedBy}</strong>
              </span>
              <button
                onClick={() => {
                  SoundEngine.chime();
                  confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
                  zoomTo(activeDest.lat, activeDest.lng, 14);
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-mono text-xs font-bold shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                ZOOM INTO THIS LOCATION 🔍
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* CREATE CUSTOM PIN MODAL */}
      <AnimatePresence>
        {isAddingCustom && clickedLatLng && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setIsAddingCustom(false)}
          >
            <motion.form
              onSubmit={handleCreateCustomDestination}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-[#181326] border-2 border-[var(--pink)] rounded-3xl p-6 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-lg text-[var(--butter)] font-mono flex items-center gap-2">
                  <span>📍</span> Drop Pin on OpenStreetMap
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs cursor-pointer font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="text-[11px] font-mono text-gray-400 bg-white/5 p-2.5 rounded-xl border border-white/10">
                Coordinates: <span className="text-[var(--butter)] font-bold">{clickedLatLng.lat}&deg;N, {clickedLatLng.lng}&deg;E</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Place / City Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Beach Sunset"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Location Details / Region:</label>
                <input
                  type="text"
                  placeholder="e.g. South Goa, India"
                  value={newLocationText}
                  onChange={(e) => setNewLocationText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Category &amp; Pin Icon:</label>
                <div className="flex gap-2">
                  {['✈️', '🏡', '👑', '🏖️', '🏔️', '🌸', '🌅', '🌌', '🍜'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border cursor-pointer transition-transform ${
                        newEmoji === em
                          ? 'bg-white/20 border-[var(--butter)] scale-110'
                          : 'bg-white/5 border-white/10 hover:scale-105'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Our Travel Dream / Note:</label>
                <textarea
                  rows={3}
                  placeholder="What will we do here together? ❤️"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--pink)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black font-bold font-mono text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                📍 PIN THIS DESTINATION
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

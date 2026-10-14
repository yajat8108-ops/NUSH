'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SoundEngine } from './audio';

export interface PresenceState {
  myRole: 'nush' | 'yajat';
  setMyRole: (role: 'nush' | 'yajat') => void;
  myStatus: string;
  setMyStatus: (status: string) => void;

  partnerOnline: boolean;
  partnerStatus: string;
  partnerLastSeen: number | null;

  isHoldingHeartbeat: boolean;
  setIsHoldingHeartbeat: (holding: boolean) => void;
  partnerHeartbeatActive: boolean;
  lastHeartbeatReceivedAt: number | null;

  syncPresence: () => Promise<void>;
  sendHeartbeatPing: () => Promise<void>;
}

export const PRESET_STATUSES = [
  'In Library staring at DSA 📚',
  'Curled in blanket missing you 🥺',
  'Craving 2 AM cheese Maggi 🍜',
  'Listening to Radio Nushi 📻',
  'Late night call standby 🌙',
  'Need an emergency forehead kiss 🫦',
  'Hugging Teddy Yajat 🧸',
];

function detectInitialRole(): 'nush' | 'yajat' {
  if (typeof window !== 'undefined') {
    try {
      const q = new URLSearchParams(window.location.search).get('role');
      if (q === 'yajat' || q === 'nush') return q;
      const bRole = (window as any).AndroidBridge?.getRole?.();
      if (bRole === 'yajat' || bRole === 'nush') return bRole;
    } catch (_) {}
  }
  return 'nush';
}

export const usePresenceStore = create<PresenceState>()(
  persist(
    (set, get) => ({
      myRole: detectInitialRole(),
      setMyRole: (role) => set({ myRole: role }),
      myStatus: 'Curled in blanket missing you 🥺',
      setMyStatus: (status) => {
        set({ myStatus: status });
        get().syncPresence();
      },

      partnerOnline: false,
      partnerStatus: 'Coding something romantic for Nush 💻❤️',
      partnerLastSeen: null,

      isHoldingHeartbeat: false,
      setIsHoldingHeartbeat: (holding) => {
        set({ isHoldingHeartbeat: holding });
        if (holding) {
          get().sendHeartbeatPing();
        }
      },
      partnerHeartbeatActive: false,
      lastHeartbeatReceivedAt: null,

      syncPresence: async () => {
        try {
          // Keep role in sync with AndroidBridge or URL if available
          if (typeof window !== 'undefined') {
            const current = get().myRole;
            const detected = detectInitialRole();
            if (detected && detected !== current && (new URLSearchParams(window.location.search).has('role') || (window as any).AndroidBridge?.getRole)) {
              set({ myRole: detected });
            }
          }
          const { myRole, myStatus, isHoldingHeartbeat } = get();
          const res = await fetch('/api/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: myRole,
              status: myStatus,
              heartbeat: isHoldingHeartbeat,
              timestamp: Date.now(),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const partnerRole = myRole === 'nush' ? 'yajat' : 'nush';
            const partnerData = data[partnerRole];

            if (partnerData) {
              const now = Date.now();
              const isRecent = now - partnerData.timestamp < 35000; // active within 35 seconds
              const wasHeartbeatActive = get().partnerHeartbeatActive;
              const isNowHeartbeat = isRecent && Boolean(partnerData.heartbeat);

              set({
                partnerOnline: isRecent,
                partnerStatus: partnerData.status || (partnerRole === 'yajat' ? 'Thinking of Nush ✨' : 'Queen Mode 👑'),
                partnerLastSeen: partnerData.timestamp,
                partnerHeartbeatActive: isNowHeartbeat,
                lastHeartbeatReceivedAt: isNowHeartbeat ? now : get().lastHeartbeatReceivedAt,
              });

              if (isNowHeartbeat && !wasHeartbeatActive) {
                SoundEngine.heartbeat();
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try {
                    navigator.vibrate([100, 120, 100, 200]);
                  } catch (e) {}
                }
              }
            }
          }
        } catch (e) {
          // Silent catch for offline or non-blocking presence
        }
      },

      sendHeartbeatPing: async () => {
        try {
          if (typeof window !== 'undefined') {
            const current = get().myRole;
            const detected = detectInitialRole();
            if (detected && detected !== current && (new URLSearchParams(window.location.search).has('role') || (window as any).AndroidBridge?.getRole)) {
              set({ myRole: detected });
            }
          }
          const { myRole, myStatus } = get();
          SoundEngine.heartbeat();
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([80, 100, 80, 250]);
            } catch (e) {}
          }
          await fetch('/api/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: myRole,
              status: myStatus,
              heartbeat: true,
              timestamp: Date.now(),
            }),
          });
        } catch (e) {}
      },
    }),
    {
      name: 'yajat_nush_presence_v1',
      partialize: (s) => ({
        myRole: s.myRole,
        myStatus: s.myStatus,
      }),
    }
  )
);

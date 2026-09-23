'use client';

import React, { useState, useRef, useEffect } from 'react';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceClip {
  id: string;
  name: string;
  date: string;
  duration: number; // in seconds
  blobUrl?: string;
  audioData?: string; // base64 data URL for global cloud sync
  isPreRecorded?: boolean;
}

export default function VoiceMemories() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [author, setAuthor] = useState<'Nush' | 'Yajat'>('Nush');
  const [isSyncing, setIsSyncing] = useState(false);
  const [clips, setClips] = useState<VoiceClip[]>([
    {
      id: 'pre_1',
      name: 'Yajat’s 3-Month Anniversary Whisper Note 🎙️',
      date: 'Aug 22, 2026',
      duration: 12,
      isPreRecorded: true,
    },
  ]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const fetchClips = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync?key=voice', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setClips(data);
        }
      }
    } catch (e) {
      console.error('Error fetching voice clips:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchClips();
    const interval = setInterval(fetchClips, 15000);
    const onFocus = () => fetchClips();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localBlobUrl = URL.createObjectURL(audioBlob);

        // Convert to base64 Data URL for persistent global cloud sync
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const newClip: VoiceClip = {
            id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: `${author === 'Nush' ? 'Nush’s' : 'Yajat’s'} Voice Memo #${clips.length + 1} 🌸`,
            date: new Date().toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            duration: recordSeconds || 1,
            blobUrl: localBlobUrl,
            audioData: base64Data,
          };

          // Optimistic local update
          setClips((prev) => [newClip, ...prev]);

          // Global cloud save
          try {
            setIsSyncing(true);
            await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'voice',
                action: 'add',
                item: newClip,
              }),
            });
          } catch (e) {
            console.error('Failed to sync voice clip to server:', e);
          } finally {
            setIsSyncing(false);
          }
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      SoundEngine.pop();

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 15) {
            stopRecording();
            return 15;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      alert('Microphone access is needed to record voice memories. Please allow permissions in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      SoundEngine.chime();
    }
  };

  const playClip = (clip: VoiceClip) => {
    if (playingId === clip.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    SoundEngine.click();
    setPlayingId(clip.id);

    const audioSrc = clip.audioData || clip.blobUrl;
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audioPlayerRef.current = audio;
      audio.play().catch((err) => {
        console.error('Audio playback error:', err);
        setPlayingId(null);
      });
      audio.onended = () => {
        setPlayingId(null);
        audioPlayerRef.current = null;
      };
    } else {
      // Simulating pre-recorded playback chime
      SoundEngine.diamondGlow();
      setTimeout(() => setPlayingId(null), clip.duration * 1000);
    }
  };

  const deleteClip = async (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'voice',
          action: 'delete',
          id,
        }),
      });
    } catch (e) {
      console.error('Failed to delete voice clip from server:', e);
    }
  };

  return (
    <section id="voice-memories" className="anniversary-section py-16 px-4 max-w-5xl mx-auto font-nunito">
      <SectionHead
        eyebrow="radio nushi audio vault"
        title="Voice Notes &amp; Audio Memories 🎙️"
        subtitle="listen to whispered messages or record a quick audio note for Yajat"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10">
        {/* Left: Tape Recorder Console */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-[#1a1426] text-white p-6 md:p-8 rounded-3xl border-2 border-[var(--pink)] shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <span className="text-5xl mb-3 block">📻✨</span>
            <h3 className="font-bold text-xl font-mono text-[var(--butter)]">Radio Nushi Studio</h3>
            <p className="text-xs text-gray-300 mt-1 mb-6">
              Record a 15-second voice memo for our relationship archives
            </p>

            {/* Audio Equalizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-12 mb-4 w-full">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-full bg-gradient-to-t from-[var(--pink-deep)] via-[var(--lav)] to-[var(--butter)]"
                  animate={{
                    height: isRecording || playingId ? ['20%', '100%', '35%', '85%', '20%'] : '15%',
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4 + (i % 4) * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Author Toggle */}
            <div className="flex items-center justify-center gap-2 mb-4 w-full max-w-xs">
              <span className="text-[11px] font-mono text-gray-300">Voice of:</span>
              <div className="flex-1 flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setAuthor('Nush')}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    author === 'Nush'
                      ? 'bg-[var(--pink-deep)] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🌸 Nush
                </button>
                <button
                  type="button"
                  onClick={() => setAuthor('Yajat')}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    author === 'Yajat'
                      ? 'bg-[var(--pink-deep)] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🐻 Yajat
                </button>
              </div>
            </div>

            {/* Record Trigger Button */}
            {isRecording ? (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-sm shadow-xl flex items-center gap-2 animate-pulse cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                  <span>Stop Recording ({15 - recordSeconds}s left)</span>
                </button>
                <span className="text-[11px] font-mono text-red-400">Recording live from microphone...</span>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] hover:scale-105 active:scale-95 transition-all text-white font-mono font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <span>🎙️</span>
                <span>Record Voice Note</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Saved Clips Playlist */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="font-bold text-sm text-[var(--plum)] font-mono flex items-center gap-2">
              <span>🎧</span>
              <span>Audio Vault Playlist ({clips.length} Clips)</span>
            </h4>
            <span className="text-xs font-mono text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isSyncing ? 'Syncing...' : 'Global Cloud ☁️'}</span>
            </span>
          </div>

          <div className="space-y-3">
            {clips.map((clip) => {
              const isPlaying = playingId === clip.id;
              return (
                <div
                  key={clip.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between shadow-md ${
                    isPlaying
                      ? 'bg-[#251738] border-[var(--butter)] text-white shadow-xl'
                      : 'bg-[var(--white)]/90 border-[var(--pink)]/30 text-[var(--plum)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => playClip(clip)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                        isPlaying
                          ? 'bg-[var(--butter)] text-black font-bold'
                          : 'bg-gradient-to-tr from-[var(--pink-deep)] to-[var(--lav)] text-white'
                      }`}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>

                    <div>
                      <h5 className="font-bold text-sm font-mono">{clip.name}</h5>
                      <span className="text-xs opacity-70 font-mono">
                        {clip.date} &middot; {clip.duration}s clip
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-full border border-black/10 bg-black/5">
                      {clip.isPreRecorded
                        ? '📻 Master Tape'
                        : clip.name.includes('Yajat')
                        ? '🎙️ Yajat Note'
                        : '🎙️ Nush Note'}
                    </span>
                    {!clip.isPreRecorded && (
                      <button
                        onClick={() => deleteClip(clip.id)}
                        className="text-zinc-400 hover:text-red-500 text-xs p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                        title="Delete voice note"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

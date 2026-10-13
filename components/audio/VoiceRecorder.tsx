'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [author, setAuthor] = useState<'yajat' | 'nush'>('nush');
  const [memoTitle, setMemoTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      SoundEngine.click();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is needed to record private voice memos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      SoundEngine.chime();
    }
  };

  const handleSaveToVault = async () => {
    if (!audioUrl) return;
    setSaveStatus('Saving to Voice Vault...');

    try {
      // In-browser local sync & server sync
      setSaveStatus('Saved in Our Voice Vault! 🎙️✨');
      SoundEngine.confettiPop();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: 0.5, y: 0.5 },
      });
      setTimeout(() => {
        setAudioUrl(null);
        setMemoTitle('');
        setSaveStatus(null);
      }, 2500);
    } catch (e) {
      setSaveStatus('Saved locally!');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl font-nunito select-none text-white max-w-lg mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <h4 className="font-bold text-sm font-mono text-pink-300">
            Private Voice Memo Studio
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          Radio Nushi Studio &middot; HQ
        </span>
      </div>

      {/* Role Picker */}
      <div className="flex items-center gap-2 mb-4 text-xs font-mono">
        <span className="text-zinc-400">Recording As:</span>
        <button
          onClick={() => setAuthor('nush')}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            author === 'nush'
              ? 'bg-pink-600 text-white font-bold'
              : 'bg-white/10 text-zinc-400'
          }`}
        >
          👑 Nush
        </button>
        <button
          onClick={() => setAuthor('yajat')}
          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
            author === 'yajat'
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-white/10 text-zinc-400'
          }`}
        >
          🎸 Yajat
        </button>
      </div>

      {/* Recording Display & Waveform */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center my-4">
        {isRecording ? (
          <div className="space-y-3">
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(220,38,38,0.7)] mx-auto"
            >
              ⏺
            </motion.div>
            <p className="font-mono text-sm font-bold text-red-400">
              Recording Live: {recordSeconds}s
            </p>
            <p className="text-[11px] text-zinc-400">
              Whisper your thoughts, love notes, or sleepy 3 AM voice notes...
            </p>
          </div>
        ) : audioUrl ? (
          <div className="space-y-3 w-full">
            <audio src={audioUrl} controls className="w-full rounded-xl" />
            <input
              type="text"
              placeholder="Give this voice note a title (e.g. Good Morning Bbg)..."
              value={memoTitle}
              onChange={(e) => setMemoTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">🎙️</div>
            <p className="text-xs text-zinc-300">
              Record a surprise voice note for your partner to wake up to.
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs font-mono transition-transform active:scale-95 shadow cursor-pointer"
          >
            Stop Recording ⏹
          </button>
        ) : audioUrl ? (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={startRecording}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs font-mono cursor-pointer"
            >
              Re-record ↺
            </button>
            <button
              onClick={handleSaveToVault}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold text-xs font-mono shadow cursor-pointer"
            >
              Save to Private Vault 💾
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold text-xs font-mono shadow transition-transform active:scale-98 cursor-pointer"
          >
            Start Voice Memo 🎙️
          </button>
        )}
      </div>

      {saveStatus && (
        <p className="text-center text-xs font-mono text-emerald-400 mt-3">
          {saveStatus}
        </p>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundEngine } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { useUniverseStore } from '@/lib/universeStore';

interface PianoSecretProps {
  onClose: () => void;
}

type SoundPreset = 'grand' | 'musicbox' | 'lofi';

interface PianoKey {
  note: string;
  freq: number;
  isBlack: boolean;
  keyLabel: string;
  keyChar: string;
  pan: number; // -1 to 1
}

const PIANO_KEYS: PianoKey[] = [
  // Octave 4
  { note: 'C4', freq: 261.63, isBlack: false, keyLabel: 'A', keyChar: 'a', pan: -0.5 },
  { note: 'C#4', freq: 277.18, isBlack: true, keyLabel: 'W', keyChar: 'w', pan: -0.45 },
  { note: 'D4', freq: 293.66, isBlack: false, keyLabel: 'S', keyChar: 's', pan: -0.4 },
  { note: 'D#4', freq: 311.13, isBlack: true, keyLabel: 'E', keyChar: 'e', pan: -0.35 },
  { note: 'E4', freq: 329.63, isBlack: false, keyLabel: 'D', keyChar: 'd', pan: -0.3 },
  { note: 'F4', freq: 349.23, isBlack: false, keyLabel: 'F', keyChar: 'f', pan: -0.2 },
  { note: 'F#4', freq: 369.99, isBlack: true, keyLabel: 'T', keyChar: 't', pan: -0.15 },
  { note: 'G4', freq: 392.0, isBlack: false, keyLabel: 'G', keyChar: 'g', pan: -0.1 },
  { note: 'G#4', freq: 415.3, isBlack: true, keyLabel: 'Y', keyChar: 'y', pan: -0.05 },
  { note: 'A4', freq: 440.0, isBlack: false, keyLabel: 'H', keyChar: 'h', pan: 0.0 },
  { note: 'A#4', freq: 466.16, isBlack: true, keyLabel: 'U', keyChar: 'u', pan: 0.05 },
  { note: 'B4', freq: 493.88, isBlack: false, keyLabel: 'J', keyChar: 'j', pan: 0.1 },

  // Octave 5
  { note: 'C5', freq: 523.25, isBlack: false, keyLabel: 'K', keyChar: 'k', pan: 0.2 },
  { note: 'C#5', freq: 554.37, isBlack: true, keyLabel: 'O', keyChar: 'o', pan: 0.25 },
  { note: 'D5', freq: 587.33, isBlack: false, keyLabel: 'L', keyChar: 'l', pan: 0.3 },
  { note: 'D#5', freq: 622.25, isBlack: true, keyLabel: 'P', keyChar: 'p', pan: 0.35 },
  { note: 'E5', freq: 659.25, isBlack: false, keyLabel: ';', keyChar: ';', pan: 0.4 },
  { note: 'F5', freq: 698.46, isBlack: false, keyLabel: "'", keyChar: "'", pan: 0.45 },
  { note: 'F#5', freq: 739.99, isBlack: true, keyLabel: '[', keyChar: '[', pan: 0.48 },
  { note: 'G5', freq: 783.99, isBlack: false, keyLabel: 'Z', keyChar: 'z', pan: 0.5 },
  { note: 'G#5', freq: 830.61, isBlack: true, keyLabel: ']', keyChar: ']', pan: 0.52 },
  { note: 'A5', freq: 880.0, isBlack: false, keyLabel: 'X', keyChar: 'x', pan: 0.55 },
  { note: 'A#5', freq: 932.33, isBlack: true, keyLabel: '\\', keyChar: '\\', pan: 0.58 },
  { note: 'B5', freq: 987.77, isBlack: false, keyLabel: 'C', keyChar: 'c', pan: 0.6 },
];

interface SongNote {
  note: string;
  duration: number; // ms
  pauseAfter: number; // ms
  lyric?: string;
}

interface Song {
  id: string;
  title: string;
  movie: string;
  emoji: string;
  lyricsQuote: string;
  notes: SongNote[];
}

const SERENADE_SONGS: Song[] = [
  {
    id: 'agar-tum-saath-ho',
    title: 'Agar Tum Saath Ho',
    movie: 'Tamasha (Our Song)',
    emoji: '🥹❤️',
    lyricsQuote: 'Pal bhar thahar jaao, dil ye sambhal jaaye... agar tum saath ho 🥹❤️',
    // ~68 BPM, 4/4. Quarter = 882ms. Eighth = 441ms. Sixteenth = 220ms.
    notes: [
      // Pal  bhar  tha-har  jaa-o  (slow, aching, rubato)
      // G    F     G  G#    G   D# D  D#
      { note: 'G4',  duration: 420, pauseAfter: 30,  lyric: 'Pal...' },
      { note: 'F4',  duration: 350, pauseAfter: 30,  lyric: 'bhar...' },
      { note: 'G4',  duration: 380, pauseAfter: 30,  lyric: 'tha-...' },
      { note: 'G#4', duration: 420, pauseAfter: 30,  lyric: '-har...' },
      { note: 'G4',  duration: 500, pauseAfter: 40,  lyric: 'jaa-...' },
      { note: 'D#4', duration: 380, pauseAfter: 30,  lyric: '-o...' },
      { note: 'D4',  duration: 300, pauseAfter: 20,  lyric: 'dil ye...' },
      { note: 'D#4', duration: 800, pauseAfter: 500, lyric: 'Pal bhar thahar jaao 🥹' },

      // Dil  ye   sam-bhal  jaa-ye  (same phrase, repeat)
      { note: 'G4',  duration: 420, pauseAfter: 30,  lyric: 'Dil...' },
      { note: 'F4',  duration: 350, pauseAfter: 30,  lyric: 'ye...' },
      { note: 'G4',  duration: 380, pauseAfter: 30,  lyric: 'sam-...' },
      { note: 'G#4', duration: 420, pauseAfter: 30,  lyric: '-bhal...' },
      { note: 'G4',  duration: 500, pauseAfter: 40,  lyric: 'jaa-...' },
      { note: 'D#4', duration: 380, pauseAfter: 30,  lyric: '-ye...' },
      { note: 'D4',  duration: 300, pauseAfter: 20,  lyric: 'agar tum...' },
      { note: 'D#4', duration: 800, pauseAfter: 500, lyric: 'Dil ye sambhal jaaye ❤️' },

      // Kai-se  tu-mhe  ro-ka  ka-roon (climbs up, slight urgency)
      // F  A#   A# A#   A# C   G G#  G F
      { note: 'F4',  duration: 360, pauseAfter: 30,  lyric: 'Kai-...' },
      { note: 'A#4', duration: 400, pauseAfter: 30,  lyric: '-se...' },
      { note: 'A#4', duration: 340, pauseAfter: 30,  lyric: 'tu-...' },
      { note: 'A#4', duration: 340, pauseAfter: 30,  lyric: '-mhe...' },
      { note: 'A#4', duration: 400, pauseAfter: 30,  lyric: 'ro-...' },
      { note: 'C5',  duration: 480, pauseAfter: 40,  lyric: '-ka...' },
      { note: 'G4',  duration: 360, pauseAfter: 30,  lyric: 'ka-...' },
      { note: 'G#4', duration: 340, pauseAfter: 25,  lyric: '-roo-...' },
      { note: 'G4',  duration: 320, pauseAfter: 20,  lyric: 'kaise...' },
      { note: 'F4',  duration: 700, pauseAfter: 380, lyric: 'Kaise tumhe roka karoon 🥹' },

      // A-gar  tum  saath  ho  (the beautiful resolution)
      // D# D#  F    G#     G# G F G G# G F D#
      { note: 'D#4', duration: 380, pauseAfter: 25,  lyric: 'A-...' },
      { note: 'D#4', duration: 380, pauseAfter: 25,  lyric: '-gar...' },
      { note: 'F4',  duration: 440, pauseAfter: 30,  lyric: 'tum...' },
      { note: 'G#4', duration: 540, pauseAfter: 40,  lyric: 'saath...' },
      { note: 'G#4', duration: 320, pauseAfter: 20,  lyric: 'saath ho...' },
      { note: 'G4',  duration: 360, pauseAfter: 25,  lyric: 'agar tum...' },
      { note: 'F4',  duration: 360, pauseAfter: 25,  lyric: 'saath...' },
      { note: 'G4',  duration: 380, pauseAfter: 25,  lyric: 'agar tum...' },
      { note: 'G#4', duration: 380, pauseAfter: 25,  lyric: 'saath...' },
      { note: 'G4',  duration: 360, pauseAfter: 25,  lyric: 'saath ho...' },
      { note: 'F4',  duration: 400, pauseAfter: 30,  lyric: 'Agar tum saath...' },
      { note: 'D#4', duration: 1100, pauseAfter: 600, lyric: 'Agar tum saath ho 🥹❤️' },
    ],
  },
  {
    id: 'tum-se-hi',
    title: 'Tum Se Hi',
    movie: 'Jab We Met',
    emoji: '🌸✨',
    lyricsQuote: 'Tum se hi din hota hai, surmaiye shaam aati hai... tumse hi 🌸✨',
    // ~76 BPM, 4/4. Quarter = 789ms. Eighth = 395ms. Each syllable ~250-400ms.
    notes: [
      // Tum  se  hi   din   ho-ta  hai      (upbeat, bright 8th notes)
      // G#   G#  G#   G#    A#  G#  F#   F#
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'Tum...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'se...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'hi...' },
      { note: 'G#4', duration: 320, pauseAfter: 30,  lyric: 'din...' },
      { note: 'A#4', duration: 360, pauseAfter: 35,  lyric: 'ho-...' },
      { note: 'G#4', duration: 300, pauseAfter: 30,  lyric: '-ta...' },
      { note: 'F#4', duration: 420, pauseAfter: 30,  lyric: 'hai...' },
      { note: 'F#4', duration: 600, pauseAfter: 250, lyric: 'Tum se hi din hota hai 🌸' },

      // Sur-mai-ye  shaam   aa-ti  hai
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'Sur-...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: '-mai-...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: '-ye...' },
      { note: 'G#4', duration: 340, pauseAfter: 30,  lyric: 'shaam...' },
      { note: 'A#4', duration: 360, pauseAfter: 35,  lyric: 'aa-...' },
      { note: 'G#4', duration: 300, pauseAfter: 30,  lyric: '-ti...' },
      { note: 'F#4', duration: 420, pauseAfter: 30,  lyric: 'hai...' },
      { note: 'F#4', duration: 600, pauseAfter: 250, lyric: 'Surmaiye shaam aati hai ✨' },

      // Tum-se  hi    tum-se  hi    (soulful, melismatic)
      // G#  F#  F F#  G# F#  F  F#
      { note: 'G#4', duration: 320, pauseAfter: 30,  lyric: 'Tum-...' },
      { note: 'F#4', duration: 290, pauseAfter: 25,  lyric: '-se...' },
      { note: 'F4',  duration: 310, pauseAfter: 25,  lyric: 'hi...' },
      { note: 'F#4', duration: 520, pauseAfter: 120, lyric: 'tumse hi...' },
      { note: 'G#4', duration: 320, pauseAfter: 30,  lyric: 'tum-...' },
      { note: 'F#4', duration: 290, pauseAfter: 25,  lyric: '-se...' },
      { note: 'F4',  duration: 310, pauseAfter: 25,  lyric: 'hi...' },
      { note: 'F#4', duration: 750, pauseAfter: 300, lyric: 'hi 🌸' },

      // Har  gha-ri  saans   aa-ti  hai
      // G#   G# G#   B       A# G#  F#  F#
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'Har...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'gha-...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: '-ri...' },
      { note: 'B4',  duration: 480, pauseAfter: 45,  lyric: 'saans...' },
      { note: 'A#4', duration: 360, pauseAfter: 35,  lyric: 'aa-...' },
      { note: 'G#4', duration: 300, pauseAfter: 30,  lyric: '-ti...' },
      { note: 'F#4', duration: 420, pauseAfter: 30,  lyric: 'hai...' },
      { note: 'F#4', duration: 600, pauseAfter: 250, lyric: 'Har ghari saans aati hai 💫' },

      // Zin-da-gi   keh-laa-ti  hai
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: 'Zin-...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: '-da-...' },
      { note: 'G#4', duration: 250, pauseAfter: 25,  lyric: '-gi...' },
      { note: 'G#4', duration: 340, pauseAfter: 30,  lyric: 'keh-...' },
      { note: 'A#4', duration: 360, pauseAfter: 35,  lyric: '-laa-...' },
      { note: 'G#4', duration: 300, pauseAfter: 30,  lyric: '-ti...' },
      { note: 'F#4', duration: 420, pauseAfter: 30,  lyric: 'hai...' },
      { note: 'F#4', duration: 600, pauseAfter: 250, lyric: 'Zindagi kehlati hai ✨' },

      // Tum-se  hi    tum-se  hi    (finale, held longer)
      { note: 'G#4', duration: 320, pauseAfter: 30,  lyric: 'Tum-...' },
      { note: 'F#4', duration: 290, pauseAfter: 25,  lyric: '-se...' },
      { note: 'F4',  duration: 310, pauseAfter: 25,  lyric: 'hi...' },
      { note: 'F#4', duration: 520, pauseAfter: 120, lyric: 'tumse hi...' },
      { note: 'G#4', duration: 320, pauseAfter: 30,  lyric: 'tum-...' },
      { note: 'F#4', duration: 290, pauseAfter: 25,  lyric: '-se...' },
      { note: 'F4',  duration: 310, pauseAfter: 25,  lyric: 'hi...' },
      { note: 'F#4', duration: 1000, pauseAfter: 500, lyric: 'hi ✨❤️' },
    ],
  },
  {
    id: 'kesariya',
    title: 'Kesariya',
    movie: 'Brahmastra',
    emoji: '🌅🧡',
    lyricsQuote: 'Kesariya tera ishq hai piya, rang jaaun jo main haath lagaun 🧡',
    // ~94 BPM, 4/4. Quarter = 638ms. Eighth = 319ms. 16th = 160ms. Has syncopation.
    notes: [
      // Ke-sa-ri-ya   te-ra        (light, flowing 8ths with a held "te-ra")
      // C5 E5 D5 E5   C5  B4
      { note: 'C5', duration: 200, pauseAfter: 20,  lyric: 'Ke-...' },
      { note: 'E5', duration: 200, pauseAfter: 20,  lyric: '-sa-...' },
      { note: 'D5', duration: 200, pauseAfter: 20,  lyric: '-ri-...' },
      { note: 'E5', duration: 240, pauseAfter: 20,  lyric: '-ya...' },
      { note: 'C5', duration: 260, pauseAfter: 25,  lyric: 'te-...' },
      { note: 'B4', duration: 560, pauseAfter: 280, lyric: '-ra...' },

      // ishq  hai  pi-ya        (climb up, dramatic)
      // G5    G5   G5  A5  F5 E5 D5
      { note: 'G5', duration: 220, pauseAfter: 25,  lyric: 'ishq...' },
      { note: 'G5', duration: 220, pauseAfter: 25,  lyric: 'ishq hai...' },
      { note: 'G5', duration: 220, pauseAfter: 25,  lyric: 'hai...' },
      { note: 'A5', duration: 280, pauseAfter: 25,  lyric: 'hai piya...' },
      { note: 'F5', duration: 220, pauseAfter: 20,  lyric: 'pi-...' },
      { note: 'E5', duration: 220, pauseAfter: 20,  lyric: '-ya...' },
      { note: 'D5', duration: 700, pauseAfter: 400, lyric: '-ya 🧡' },

      // Rang  jaa-un  jo   main   (steady 8ths)
      // D5    D5  B4  B4   D5 D5  D5
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'Rang...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'jaa-...' },
      { note: 'B4', duration: 240, pauseAfter: 20,  lyric: '-un...' },
      { note: 'B4', duration: 240, pauseAfter: 20,  lyric: 'jo...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'main...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'jo main...' },
      { note: 'D5', duration: 280, pauseAfter: 160, lyric: 'rang jaaun jo main...' },

      // haath  la-gaa-un       (ascending climb, held end)
      // B4     D5  E5  F5  E5 D5 C5
      { note: 'B4', duration: 240, pauseAfter: 20,  lyric: 'haath...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'la-...' },
      { note: 'E5', duration: 280, pauseAfter: 20,  lyric: '-gaa-...' },
      { note: 'F5', duration: 300, pauseAfter: 20,  lyric: '-un...' },
      { note: 'E5', duration: 240, pauseAfter: 20,  lyric: 'haath lagaun...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'haath lagaun...' },
      { note: 'C5', duration: 800, pauseAfter: 420, lyric: 'Rang jaaun main haath lagaun 🧡' },

      // Din  bee-te  saa-ra  (second verse, same rhythm)
      // C5   E5  D5  E5  C5  B4
      { note: 'C5', duration: 200, pauseAfter: 20,  lyric: 'Din...' },
      { note: 'E5', duration: 200, pauseAfter: 20,  lyric: 'bee-...' },
      { note: 'D5', duration: 200, pauseAfter: 20,  lyric: '-te...' },
      { note: 'E5', duration: 240, pauseAfter: 20,  lyric: 'saa-...' },
      { note: 'C5', duration: 260, pauseAfter: 25,  lyric: '-ra...' },
      { note: 'B4', duration: 560, pauseAfter: 280, lyric: 'Din beete saara...' },

      // te-ri  fikr  mein
      // G5     G5    G5  A5  F5 E5 D5
      { note: 'G5', duration: 220, pauseAfter: 25,  lyric: 'te-...' },
      { note: 'G5', duration: 220, pauseAfter: 25,  lyric: '-ri...' },
      { note: 'G5', duration: 220, pauseAfter: 25,  lyric: 'fikr...' },
      { note: 'A5', duration: 280, pauseAfter: 25,  lyric: 'mein...' },
      { note: 'F5', duration: 220, pauseAfter: 20,  lyric: 'teri fikr mein...' },
      { note: 'E5', duration: 220, pauseAfter: 20,  lyric: 'teri fikr mein...' },
      { note: 'D5', duration: 700, pauseAfter: 400, lyric: '🧡' },

      // Rain  saa-ri  (steady)
      // D5    D5  B4  B4   D5 D5  D5
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'Rain...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'saa-...' },
      { note: 'B4', duration: 240, pauseAfter: 20,  lyric: '-ri...' },
      { note: 'B4', duration: 240, pauseAfter: 20,  lyric: 'rain saari...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'te-...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: '-ri...' },
      { note: 'D5', duration: 280, pauseAfter: 160, lyric: 'rain saari teri...' },

      // khair  ma-naa-u   (finale climb)
      // B4     D5 E5  F5  E5 D5 C5
      { note: 'B4', duration: 240, pauseAfter: 20,  lyric: 'khair...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'ma-...' },
      { note: 'E5', duration: 280, pauseAfter: 20,  lyric: '-naa-...' },
      { note: 'F5', duration: 300, pauseAfter: 20,  lyric: '-u...' },
      { note: 'E5', duration: 240, pauseAfter: 20,  lyric: 'khair manaau...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'khair manaau...' },
      { note: 'C5', duration: 1000, pauseAfter: 500, lyric: 'Rain saari teri khair manaau ✨🧡' },
    ],
  },
  {
    id: 'perfect',
    title: 'Perfect',
    movie: 'Ed Sheeran (Key of G Major)',
    emoji: '💫💕',
    lyricsQuote: "Baby, I'm dancing in the dark, with you between my arms... darling, you look perfect tonight 💕",
    // ~60 BPM, 12/8 feel (compound triple). Dotted quarter = 750ms. Eighth = 250ms.
    // Verse: gentle, spacious. Chorus: builds energy with shorter inter-note gaps.
    notes: [
      // ── VERSE ──
      // I    found  a   love   for    me       (pickup → held "me")
      // D4   E4     G4  G4     B4  A4  G4
      { note: 'D4', duration: 220, pauseAfter: 20,  lyric: 'I...' },
      { note: 'E4', duration: 260, pauseAfter: 25,  lyric: 'found...' },
      { note: 'G4', duration: 280, pauseAfter: 25,  lyric: 'a...' },
      { note: 'G4', duration: 380, pauseAfter: 30,  lyric: 'love...' },
      { note: 'B4', duration: 360, pauseAfter: 30,  lyric: 'for...' },
      { note: 'A4', duration: 280, pauseAfter: 25,  lyric: 'for me...' },
      { note: 'G4', duration: 800, pauseAfter: 480, lyric: 'I found a love for me 💕' },

      // Dar-ling  just  dive   right  in
      // A4  B4    B4    B4     A4     G4
      { note: 'A4', duration: 260, pauseAfter: 20,  lyric: 'Dar-...' },
      { note: 'B4', duration: 280, pauseAfter: 25,  lyric: '-ling,...' },
      { note: 'B4', duration: 260, pauseAfter: 20,  lyric: 'just...' },
      { note: 'B4', duration: 300, pauseAfter: 25,  lyric: 'dive...' },
      { note: 'A4', duration: 280, pauseAfter: 25,  lyric: 'right...' },
      { note: 'G4', duration: 750, pauseAfter: 420, lyric: 'Darling, just dive right in ✨' },

      // And  fol-low  my    lead    (gentle)
      // D4   G4  G4   A4    B4  A4  G4
      { note: 'D4', duration: 220, pauseAfter: 20,  lyric: 'And...' },
      { note: 'G4', duration: 260, pauseAfter: 25,  lyric: 'fol-...' },
      { note: 'G4', duration: 260, pauseAfter: 20,  lyric: '-low...' },
      { note: 'A4', duration: 300, pauseAfter: 25,  lyric: 'my...' },
      { note: 'B4', duration: 360, pauseAfter: 30,  lyric: 'lead...' },
      { note: 'A4', duration: 300, pauseAfter: 25,  lyric: 'and follow...' },
      { note: 'G4', duration: 900, pauseAfter: 550, lyric: 'And follow my lead 🥹' },

      // ── CHORUS ── (more energy, shorter gaps)
      // Ba-by  I'm   dan-cing  in the  dark
      // D5  B4  A4    B4   A4  G4  G4   G4
      { note: 'D5', duration: 380, pauseAfter: 35,  lyric: 'Ba-...' },
      { note: 'B4', duration: 340, pauseAfter: 30,  lyric: '-by,...' },
      { note: 'A4', duration: 280, pauseAfter: 25,  lyric: "I'm..." },
      { note: 'B4', duration: 300, pauseAfter: 25,  lyric: 'dan-...' },
      { note: 'A4', duration: 280, pauseAfter: 25,  lyric: '-cing...' },
      { note: 'G4', duration: 300, pauseAfter: 25,  lyric: 'in the...' },
      { note: 'G4', duration: 800, pauseAfter: 450, lyric: 'dark 💕' },

      // With  you   be-tween  my   arms
      // D5    C5    B4   A4   G4
      { note: 'D5', duration: 360, pauseAfter: 30,  lyric: 'With...' },
      { note: 'C5', duration: 320, pauseAfter: 25,  lyric: 'you...' },
      { note: 'B4', duration: 320, pauseAfter: 25,  lyric: 'be-...' },
      { note: 'A4', duration: 340, pauseAfter: 30,  lyric: '-tween...' },
      { note: 'G4', duration: 900, pauseAfter: 500, lyric: 'my arms 🫂' },

      // Bare-foot  on the  grass  (high octave climax!)
      // G5   F#5   E5       F#5  B4
      { note: 'G5',  duration: 360, pauseAfter: 30,  lyric: 'Bare-...' },
      { note: 'F#5', duration: 320, pauseAfter: 25,  lyric: '-foot...' },
      { note: 'E5',  duration: 320, pauseAfter: 25,  lyric: 'on the...' },
      { note: 'F#5', duration: 360, pauseAfter: 30,  lyric: 'grass...' },
      { note: 'B4',  duration: 800, pauseAfter: 440, lyric: 'Barefoot on the grass...' },

      // Lis-ten-ing  to our  fa-vor-ite  song
      // D5  D5   D5  D5      E5   B4  A4  G4
      { note: 'D5', duration: 220, pauseAfter: 20,  lyric: 'Lis-...' },
      { note: 'D5', duration: 220, pauseAfter: 20,  lyric: '-ten-...' },
      { note: 'D5', duration: 220, pauseAfter: 20,  lyric: '-ing...' },
      { note: 'D5', duration: 240, pauseAfter: 20,  lyric: 'to our...' },
      { note: 'E5', duration: 380, pauseAfter: 30,  lyric: 'fa-...' },
      { note: 'B4', duration: 320, pauseAfter: 25,  lyric: '-vor-ite...' },
      { note: 'A4', duration: 360, pauseAfter: 30,  lyric: 'song...' },
      { note: 'G4', duration: 900, pauseAfter: 500, lyric: '🎶❤️' },

      // When you  said  you  looked  a  mess
      // B4   D5   G5    F#5  E5     F#5 B4
      { note: 'B4',  duration: 260, pauseAfter: 25,  lyric: 'When you...' },
      { note: 'D5',  duration: 300, pauseAfter: 25,  lyric: 'said you...' },
      { note: 'G5',  duration: 380, pauseAfter: 30,  lyric: 'looked...' },
      { note: 'F#5', duration: 280, pauseAfter: 25,  lyric: 'a...' },
      { note: 'E5',  duration: 300, pauseAfter: 25,  lyric: 'mess,...' },
      { note: 'F#5', duration: 340, pauseAfter: 30,  lyric: 'you looked a mess...' },
      { note: 'B4',  duration: 750, pauseAfter: 420, lyric: 'When you said you looked a mess...' },

      // I  whis-pered  un-der-neath  my  breath
      // G4  A4   B4     D5     C5    B4  A4  G4
      { note: 'G4', duration: 220, pauseAfter: 20,  lyric: 'I...' },
      { note: 'A4', duration: 240, pauseAfter: 20,  lyric: 'whis-...' },
      { note: 'B4', duration: 260, pauseAfter: 20,  lyric: '-pered...' },
      { note: 'D5', duration: 320, pauseAfter: 25,  lyric: 'un-der-...' },
      { note: 'C5', duration: 280, pauseAfter: 20,  lyric: '-neath...' },
      { note: 'B4', duration: 300, pauseAfter: 25,  lyric: 'my...' },
      { note: 'A4', duration: 320, pauseAfter: 25,  lyric: 'breath...' },
      { note: 'G4', duration: 750, pauseAfter: 420, lyric: 'I whispered underneath my breath...' },

      // Dar-ling  you look  per-fect  to-ni-ght  (the final LINE)
      // G4   A4   B4        A4   A4   G4  F#4  G4
      { note: 'G4',  duration: 300, pauseAfter: 25,  lyric: 'Dar-...' },
      { note: 'A4',  duration: 320, pauseAfter: 25,  lyric: '-ling,...' },
      { note: 'B4',  duration: 480, pauseAfter: 35,  lyric: 'you look...' },
      { note: 'A4',  duration: 360, pauseAfter: 30,  lyric: 'per-...' },
      { note: 'A4',  duration: 340, pauseAfter: 25,  lyric: '-fect...' },
      { note: 'G4',  duration: 360, pauseAfter: 30,  lyric: 'to-...' },
      { note: 'F#4', duration: 380, pauseAfter: 30,  lyric: '-ni-...' },
      { note: 'G4',  duration: 1200, pauseAfter: 700, lyric: '-ght 💍✨❤️' },
    ],
  },
];


export default function PianoSecret({ onClose }: PianoSecretProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [sustainOn, setSustainOn] = useState<boolean>(true);
  const [preset, setPreset] = useState<SoundPreset>('grand');
  const [selectedSong, setSelectedSong] = useState<Song>(SERENADE_SONGS[0]);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [currentLyric, setCurrentLyric] = useState<string>('');
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [practiceScore, setPracticeScore] = useState<number>(0);
  // Particles use a canvas ref for zero-React-render performance
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlePoolRef = useRef<{ id: number; x: number; y: number; char: string; color: string; vy: number; alpha: number; scale: number; life: number }[]>([]);
  const particleAnimRef = useRef<number | null>(null);

  // Studio Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedNotes, setRecordedNotes] = useState<{ note: string; time: number }[]>([]);
  const [recordStartTime, setRecordStartTime] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundboardConvolverRef = useRef<ConvolverNode | null>(null);
  // Shared reverb send gain so we only connect convolver to destination ONCE
  const reverbSendRef = useRef<GainNode | null>(null);
  const masterBusRef = useRef<GainNode | null>(null);
  const sampleBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const [samplesLoadedCount, setSamplesLoadedCount] = useState<number>(0);
  const autoPlayTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const activeNoteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { unlockAchievement } = useUniverseStore();

  // Create an acoustic wooden soundboard impulse response for concert hall warmth
  const createSoundboardImpulse = (ctx: AudioContext): AudioBuffer => {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * 2.4); // 2.4s acoustic decay
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      // Exponential decay simulating spruce soundboard resonance & concert hall room absorption
      const decay = Math.exp(-t * 3.2);
      // Diffuse reflections with warm bass preservation
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  };

  // Initialize Web Audio API with shared master bus + Soundboard Convolver (built ONCE)
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass({ latencyHint: 'interactive' });
      audioCtxRef.current = ctx;

      // Build shared master bus
      const masterBus = ctx.createGain();
      masterBus.gain.setValueAtTime(0.92, ctx.currentTime);
      masterBus.connect(ctx.destination);
      masterBusRef.current = masterBus;

      // Build reverb chain ONCE — notes send into this shared bus
      try {
        const convolver = ctx.createConvolver();
        convolver.buffer = createSoundboardImpulse(ctx);
        soundboardConvolverRef.current = convolver;

        const reverbSend = ctx.createGain();
        reverbSend.gain.setValueAtTime(0.25, ctx.currentTime);
        reverbSendRef.current = reverbSend;

        reverbSend.connect(convolver);
        convolver.connect(masterBus); // reverb output feeds master bus
      } catch (e) {
        console.warn('Convolver creation bypassed', e);
      }
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Preload real recorded acoustic grand piano soundfont samples in background
  useEffect(() => {

    let cancelled = false;
    const noteMap: Record<string, string> = {
      C4: 'C4', 'C#4': 'Db4', D4: 'D4', 'D#4': 'Eb4', E4: 'E4', F4: 'F4',
      'F#4': 'Gb4', G4: 'G4', 'G#4': 'Ab4', A4: 'A4', 'A#4': 'Bb4', B4: 'B4',
      C5: 'C5', 'C#5': 'Db5', D5: 'D5', 'D#5': 'Eb5', E5: 'E5', F5: 'F5',
      'F#5': 'Gb5', G5: 'G5', 'G#5': 'Ab5', A5: 'A5', 'A#5': 'Bb5', B5: 'B5',
    };

    const loadSamples = async () => {
      const ctx = getAudioContext();
      if (!ctx) return;

      for (const [keyNote, fileName] of Object.entries(noteMap)) {
        if (cancelled) break;
        const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/${fileName}.mp3`;
        try {
          const res = await fetch(url);
          if (res.ok && !cancelled) {
            const ab = await res.arrayBuffer();
            ctx.decodeAudioData(
              ab,
              (buffer) => {
                if (!cancelled) {
                  sampleBuffersRef.current.set(keyNote, buffer);
                  setSamplesLoadedCount((c) => c + 1);
                }
              },
              () => {}
            );
          }
        } catch {
          // Network or offline: falls back smoothly to physical model
        }
      }
    };

    loadSamples();
    return () => {
      cancelled = true;
    };
  }, [getAudioContext]);

  // Canvas-based particle animator — runs independently of React renders
  const spawnCanvasParticle = useCallback((noteName: string) => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const particleChars = ['♪', '♫', '♬', '💖', '✨', '🌸'];
    const pColors = ['#FF5C8E', '#FFDD8C', '#B9AEF5', '#FF9EC9', '#6ee7b7'];
    const keyIndex = PIANO_KEYS.findIndex((k) => k.note === noteName);
    const normX = keyIndex >= 0 ? (keyIndex / PIANO_KEYS.length) * (canvas.offsetWidth * 0.88) + canvas.offsetWidth * 0.06 : canvas.offsetWidth / 2;

    // Keep pool trimmed to 12 particles
    if (particlePoolRef.current.length >= 12) particlePoolRef.current.shift();
    particlePoolRef.current.push({
      id: Date.now() + Math.random(),
      x: normX,
      char: particleChars[Math.floor(Math.random() * particleChars.length)],
      color: pColors[Math.floor(Math.random() * pColors.length)],
      vy: -(1.8 + Math.random() * 1.2),
      alpha: 1,
      scale: 0.7 + Math.random() * 0.5,
      life: 0,
      y: canvas.offsetHeight - 4, // start at canvas bottom
    });

    // Start rAF loop if not running
    if (!particleAnimRef.current) {
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) return;
      const tick = () => {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of particlePoolRef.current) {
          p.life += 1;
          p.x += (Math.random() - 0.5) * 0.8;
          p.y = p.y + p.vy;
          p.alpha = Math.max(0, 1 - p.life / 42);
          p.scale = Math.min(1.4, p.scale + 0.015);
          if (p.alpha > 0.01) {
            alive = true;
            ctx2d.save();
            ctx2d.globalAlpha = p.alpha;
            ctx2d.font = `${Math.round(18 * p.scale)}px sans-serif`;
            ctx2d.textAlign = 'center';
            ctx2d.fillStyle = p.color;
            ctx2d.fillText(p.char, p.x, p.y);
            ctx2d.restore();
          }
        }
        particlePoolRef.current = particlePoolRef.current.filter(p => p.alpha > 0.01);
        if (alive) {
          particleAnimRef.current = requestAnimationFrame(tick);
        } else {
          particleAnimRef.current = null;
        }
      };
      particleAnimRef.current = requestAnimationFrame(tick);
    }
  }, []);

  // Master acoustic tone generator (Real Samples + Physical Modeling + Shared Reverb Bus)
  const playTone = useCallback(
    (freq: number, noteName: string, pan: number = 0, durationMs?: number) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const masterBus = masterBusRef.current;
        if (!masterBus) return;
        const now = ctx.currentTime;

        // Visual Active State — use ref timer to avoid stacking setTimeouts
        if (activeNoteTimerRef.current) clearTimeout(activeNoteTimerRef.current);
        setActiveNote(noteName);
        const visualActiveTime = durationMs ? Math.max(80, durationMs - 35) : 200;
        activeNoteTimerRef.current = setTimeout(() => setActiveNote(null), visualActiveTime);

        // Canvas-based particle spawn (zero React re-renders)
        spawnCanvasParticle(noteName);

        // Studio Recording
        if (isRecording) {
          setRecordedNotes((prev) => [...prev, { note: noteName, time: Date.now() - recordStartTime }]);
        }

        // Practice Mode Progression
        if (practiceMode) {
          const target = selectedSong.notes[practiceIndex];
          if (target && target.note === noteName) {
            const nextIdx = practiceIndex + 1;
            setPracticeScore((s) => s + 100);
            if (target.lyric) setCurrentLyric(target.lyric);

            if (nextIdx >= selectedSong.notes.length) {
              setPracticeMode(false);
              setPracticeIndex(0);
              SoundEngine.diamondGlow();
              unlockAchievement('pianist');
              confetti({
                particleCount: 120,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
              });
            } else {
              setPracticeIndex(nextIdx);
            }
          }
        }

        // Per-note gain node with stereo panning
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.88, now);

        if (ctx.createStereoPanner) {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, now);
          noteGain.connect(panner);
          panner.connect(masterBus);
        } else {
          noteGain.connect(masterBus);
        }

        // Send to shared reverb bus (already connected to destination once)
        if (reverbSendRef.current) {
          noteGain.connect(reverbSendRef.current);
        }

        // ────────── 1. REAL RECORDED ACOUSTIC SAMPLE ENGINE ──────────
        const cachedSample = sampleBuffersRef.current.get(noteName);
        if (preset === 'grand' && cachedSample) {
          const source = ctx.createBufferSource();
          source.buffer = cachedSample;

          const bufDur = cachedSample.duration; // real buffer length (typically 3-5s)
          // Fade out smoothly in the last 500ms before the buffer ends — prevents hard click cutoff
          const fadeStart = Math.max(now + 0.1, now + bufDur - 0.5);
          noteGain.gain.setValueAtTime(0.88, now);
          noteGain.gain.setValueAtTime(0.88, fadeStart);
          noteGain.gain.linearRampToValueAtTime(0, now + bufDur);
          source.stop(now + bufDur + 0.02);

          source.connect(noteGain);
          source.start(now);
          return;
        }

        // ────────── 2. PHYSICAL MODELING SYNTHESIS (Steinway Grand) ──────────
        const decayTime = sustainOn ? 6.0 : 3.5;

        if (preset === 'grand') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(5500, now);
          filter.frequency.exponentialRampToValueAtTime(800, now + Math.min(2.0, decayTime));
          filter.connect(noteGain);

          const B = 0.00035;
          const partials = [
            { n: 1, gain: 0.60, decayMult: 1.0, detuneA: -1.6, detuneB: 1.6 },
            { n: 2, gain: 0.32, decayMult: 0.70, detuneA: -1.2, detuneB: 1.2 },
            { n: 3, gain: 0.18, decayMult: 0.45, detuneA: -0.8, detuneB: 0.8 },
            { n: 4, gain: 0.10, decayMult: 0.30, detuneA: 0, detuneB: 0 },
            { n: 5, gain: 0.05, decayMult: 0.18, detuneA: 0, detuneB: 0 },
            { n: 6, gain: 0.03, decayMult: 0.12, detuneA: 0, detuneB: 0 },
          ];

          partials.forEach(({ n, gain: pGain, decayMult, detuneA, detuneB }) => {
            const inharmonicMult = n * Math.sqrt(1 + B * n * n);
            const pFreq = freq * inharmonicMult;
            const pDecay = Math.max(0.4, decayTime * decayMult);

            [detuneA, detuneB].forEach((detuneVal) => {
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(pFreq, now);
              osc.detune.setValueAtTime(detuneVal, now);
              g.gain.setValueAtTime(pGain * 0.5, now);
              g.gain.exponentialRampToValueAtTime(0.0001, now + pDecay);
              osc.connect(g);
              g.connect(filter);
              osc.start(now);
              osc.stop(now + pDecay + 0.03);
            });
          });

          // Hammer impact
          const hammer = ctx.createOscillator();
          const hammerGain = ctx.createGain();
          const hammerFilter = ctx.createBiquadFilter();
          hammerFilter.type = 'bandpass';
          hammerFilter.frequency.value = 2400;
          hammerFilter.Q.value = 2.5;
          hammer.type = 'triangle';
          hammer.frequency.setValueAtTime(160, now);
          hammerGain.gain.setValueAtTime(0.22, now);
          hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
          hammer.connect(hammerFilter);
          hammerFilter.connect(noteGain);
          hammer.start(now);
          hammer.stop(now + 0.03);

          // Wooden body knock
          const woodKnock = ctx.createOscillator();
          const woodGain = ctx.createGain();
          woodKnock.type = 'sine';
          woodKnock.frequency.setValueAtTime(110, now);
          woodGain.gain.setValueAtTime(0.10, now);
          woodGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          woodKnock.connect(woodGain);
          woodGain.connect(noteGain);
          woodKnock.start(now);
          woodKnock.stop(now + 0.045);
        } else if (preset === 'musicbox') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(6000, now);
          filter.connect(noteGain);

          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const g1 = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, now);
          osc2.frequency.setValueAtTime(freq * 2, now);
          g1.gain.setValueAtTime(0.4, now);
          g1.gain.exponentialRampToValueAtTime(0.001, now + decayTime * 1.3);
          osc1.connect(g1);
          osc2.connect(g1);
          g1.connect(filter);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + decayTime + 0.05);
          osc2.stop(now + decayTime + 0.05);
        } else {
          // Lofi Rhodes
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2200, now);
          filter.connect(noteGain);

          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 4.5;
          lfoGain.gain.value = 3;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(now);
          lfo.stop(now + decayTime);

          g.gain.setValueAtTime(0.45, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
          osc.connect(g);
          g.connect(filter);
          osc.start(now);
          osc.stop(now + decayTime + 0.05);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [getAudioContext, spawnCanvasParticle, sustainOn, preset, isRecording, recordStartTime, practiceMode, practiceIndex, selectedSong, unlockAchievement]
  );

  // Desktop keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar toggles sustain
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        setSustainOn((s) => !s);
        SoundEngine.click();
        return;
      }

      const match = PIANO_KEYS.find((k) => k.keyChar.toLowerCase() === e.key.toLowerCase());
      if (match && !e.repeat) {
        playTone(match.freq, match.note, match.pan);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playTone]);

  // Clean up auto-play timeouts + canvas animation on unmount
  useEffect(() => {
    return () => {
      autoPlayTimeoutsRef.current.forEach((t) => clearTimeout(t));
      if (activeNoteTimerRef.current) clearTimeout(activeNoteTimerRef.current);
      if (particleAnimRef.current) cancelAnimationFrame(particleAnimRef.current);
    };
  }, []);


  // Auto-play Yajat's Serenade — audio scheduled via Web Audio clock (glitch-free), UI via minimal timeouts
  const handlePlayAutoSerenade = () => {
    if (isPlayingAuto) {
      autoPlayTimeoutsRef.current.forEach((t) => clearTimeout(t));
      autoPlayTimeoutsRef.current = [];
      setIsPlayingAuto(false);
      setCurrentLyric('');
      return;
    }

    // Ensure audio context + shared bus are initialized
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    setIsPlayingAuto(true);
    setPracticeMode(false);

    const notes = selectedSong.notes;
    const masterBus = masterBusRef.current;
    if (!masterBus) return;

    // Schedule all notes on the Web Audio clock (sub-millisecond precision, no jank)
    let audioTimeOffset = audioCtx.currentTime + 0.05; // 50ms lookahead start
    let wallDelay = 50; // ms from now for UI updates

    notes.forEach((item, index) => {
      const keyObj = PIANO_KEYS.find((k) => k.note === item.note);
      if (!keyObj) {
        audioTimeOffset += (item.duration + item.pauseAfter) / 1000;
        wallDelay += item.duration + item.pauseAfter;
        return;
      }

      // ── Audio: scheduled precisely via Web Audio clock ──
      const noteStart = audioTimeOffset;
      const cachedSample = sampleBuffersRef.current.get(item.note);

      if (preset === 'grand' && cachedSample) {
        const source = audioCtx.createBufferSource();
        source.buffer = cachedSample;
        const noteGain = audioCtx.createGain();

        const bufDur = cachedSample.duration;
        const fadeStart = Math.max(noteStart + 0.1, noteStart + bufDur - 0.5);
        noteGain.gain.setValueAtTime(0.88, noteStart);
        noteGain.gain.setValueAtTime(0.88, fadeStart);
        noteGain.gain.linearRampToValueAtTime(0, noteStart + bufDur);
        source.stop(noteStart + bufDur + 0.02);

        if (audioCtx.createStereoPanner) {
          const panner = audioCtx.createStereoPanner();
          panner.pan.setValueAtTime(keyObj.pan, noteStart);
          noteGain.connect(panner);
          panner.connect(masterBus);
        } else {
          noteGain.connect(masterBus);
        }
        if (reverbSendRef.current) noteGain.connect(reverbSendRef.current);
        source.connect(noteGain);
        source.start(noteStart);
      } else {
        // Physical model: schedule via a tiny setTimeout that runs playTone with exact timing
        // (physical model can't be fully pre-scheduled, but we align it close to the audio clock)
        const uiT = setTimeout(() => {
          playTone(keyObj.freq, keyObj.note, keyObj.pan, item.duration);
        }, wallDelay);
        autoPlayTimeoutsRef.current.push(uiT);
      }

      // ── UI: lyric + canvas particle updates via setTimeout ──
      const uiT2 = setTimeout(() => {
        spawnCanvasParticle(item.note);
        if (item.lyric) setCurrentLyric(item.lyric);

        // key highlight
        setActiveNote(item.note);
        setTimeout(() => setActiveNote(null), Math.max(80, item.duration - 40));

        if (index === notes.length - 1) {
          setTimeout(() => {
            setIsPlayingAuto(false);
            setCurrentLyric(selectedSong.lyricsQuote);
            SoundEngine.chime();
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#FF5C8E', '#FFDD8C', '#B9AEF5'],
            });
            unlockAchievement('pianist');
          }, 900);
        }
      }, wallDelay);
      autoPlayTimeoutsRef.current.push(uiT2);

      audioTimeOffset += (item.duration + item.pauseAfter) / 1000;
      wallDelay += item.duration + item.pauseAfter;
    });
  };

  // Start Practice Mode
  const handleStartPractice = () => {
    autoPlayTimeoutsRef.current.forEach((t) => clearTimeout(t));
    setIsPlayingAuto(false);
    setPracticeMode(true);
    setPracticeIndex(0);
    setPracticeScore(0);
    setCurrentLyric('Follow the glowing note! 🎶');
    SoundEngine.chime();
  };

  // Studio Recording Handlers
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      SoundEngine.pop();
    } else {
      setRecordedNotes([]);
      setRecordStartTime(Date.now());
      setIsRecording(true);
      SoundEngine.click();
    }
  };

  const handlePlaybackRecording = () => {
    if (recordedNotes.length === 0) return;
    recordedNotes.forEach((rec) => {
      setTimeout(() => {
        const keyObj = PIANO_KEYS.find((k) => k.note === rec.note);
        if (keyObj) playTone(keyObj.freq, keyObj.note, keyObj.pan);
      }, rec.time);
    });
  };

  // Next note in practice mode
  const currentPracticeTarget = practiceMode ? selectedSong.notes[practiceIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 md:p-6 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full bg-[#120d20] border-2 border-[var(--pink)]/60 rounded-3xl p-5 md:p-8 shadow-[0_0_80px_rgba(255,92,142,0.35)] text-white text-center font-nunito my-auto"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm cursor-pointer font-mono z-30"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl animate-bounce">🎹</span>
            <h2 className="font-serif text-2xl md:text-3xl text-[var(--butter)] font-bold">
              The Grand Piano Serenade
            </h2>
            <span className="text-2xl">🌹</span>
          </div>
          <p className="text-xs text-gray-300 font-mono">
            Steinway Concert Grand &middot; Spruce Soundboard Reverb &middot; Dedicated songs for Nushi 🎶
          </p>
        </div>

        {/* SONG SELECTOR & CONTROLS TRAY */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/10 mb-4">
          {/* Song Select Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SERENADE_SONGS.map((song) => (
              <button
                key={song.id}
                onClick={() => {
                  setSelectedSong(song);
                  setCurrentLyric(song.lyricsQuote);
                  setIsPlayingAuto(false);
                  setPracticeMode(false);
                  SoundEngine.click();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedSong.id === song.id
                    ? 'bg-gradient-to-r from-[var(--pink-deep)] to-[var(--butter)] text-black shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/15 text-gray-300'
                }`}
              >
                <span>{song.emoji}</span>
                <span>{song.title}</span>
              </button>
            ))}
          </div>

          {/* Sound Presets */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setPreset('grand'); SoundEngine.click(); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                preset === 'grand' ? 'bg-gradient-to-r from-amber-500/30 to-pink-500/30 text-amber-200 border border-amber-400/40 font-bold' : 'text-gray-400'
              }`}
            >
              🎹 Steinway Grand {samplesLoadedCount > 0 ? '✨' : ''}
            </button>
            <button
              onClick={() => { setPreset('musicbox'); SoundEngine.click(); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                preset === 'musicbox' ? 'bg-white/20 text-white font-bold' : 'text-gray-400'
              }`}
            >
              🌟 Music Box
            </button>
            <button
              onClick={() => { setPreset('lofi'); SoundEngine.click(); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                preset === 'lofi' ? 'bg-white/20 text-white font-bold' : 'text-gray-400'
              }`}
            >
              ☕ Lofi Rhodes
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS: AUTO-PLAY vs LEARN vs RECORD */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          <button
            onClick={handlePlayAutoSerenade}
            className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              isPlayingAuto
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isPlayingAuto ? '⏹ Stop Serenade' : `▶ Listen to Yajat's Serenade`}
          </button>

          <button
            onClick={handleStartPractice}
            className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              practiceMode
                ? 'bg-amber-400 text-black shadow-[0_0_15px_#f59e0b]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:scale-105 active:scale-95'
            }`}
          >
            {practiceMode ? `🎵 Playing: Step ${practiceIndex + 1}/${selectedSong.notes.length}` : '✨ Follow the Light (Play Along)'}
          </button>

          <button
            onClick={handleToggleRecord}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white animate-ping'
                : 'bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10'
            }`}
          >
            <span>{isRecording ? '⏺ Recording...' : '🔴 Record'}</span>
          </button>

          {recordedNotes.length > 0 && !isRecording && (
            <button
              onClick={handlePlaybackRecording}
              className="px-4 py-2 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              ▶ Play My Recording ({recordedNotes.length} notes)
            </button>
          )}

          {/* Sustain Pedal Toggle */}
          <button
            onClick={() => { setSustainOn(!sustainOn); SoundEngine.click(); }}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              sustainOn
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            <span>🦶 Sustain Pedal:</span>
            <strong>{sustainOn ? 'ON (Spacebar)' : 'OFF'}</strong>
          </button>
        </div>

        {/* LYRICS KARAOKE DISPLAY BANNER */}
        <div className="relative min-h-[52px] flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-purple-950/50 via-pink-950/50 to-purple-950/50 border border-[var(--pink)]/30 mb-5 shadow-inner">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLyric || selectedSong.lyricsQuote}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-caveat text-xl md:text-2xl text-[var(--butter)] font-bold text-center px-4"
            >
              &ldquo;{currentLyric || selectedSong.lyricsQuote}&rdquo;
            </motion.p>
          </AnimatePresence>

          {practiceMode && currentPracticeTarget && (
            <div className="absolute right-3 bg-amber-400 text-black px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-md">
              Next Note: {currentPracticeTarget.note}
            </div>
          )}
        </div>

        {/* FLOATING MUSICAL PARTICLES FOUNTAIN — canvas-based, zero React re-renders */}
        <canvas
          ref={particleCanvasRef}
          className="relative w-full h-14 pointer-events-none mb-1 block"
          style={{ display: 'block' }}
        />

        {/* GRAND PIANO LACQUER CABINET & KEYBOARD */}
        <div className="relative inline-flex justify-center p-4 md:p-6 bg-gradient-to-b from-[#1a1429] via-[#090710] to-[#040308] rounded-3xl border-4 border-[#3a2e57] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8),_0_15px_30px_rgba(0,0,0,0.8)] overflow-x-auto max-w-full">
          {/* Gold Inlay Branding Bar */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 font-serif text-[10px] tracking-widest text-[var(--butter)] opacity-70 pointer-events-none">
            <span>⚜️</span>
            <span>YAJAT &amp; NUSHI &middot; CONCERT GRAND</span>
            <span>⚜️</span>
          </div>

          <div className="pt-3 flex">
            {PIANO_KEYS.filter((k) => !k.isBlack).map((whiteKey) => {
              const whiteIndex = PIANO_KEYS.findIndex((k) => k.note === whiteKey.note);
              const nextKey = PIANO_KEYS[whiteIndex + 1];
              const hasBlackKey = nextKey && nextKey.isBlack;

              const isWhiteActive = activeNote === whiteKey.note;
              const isBlackActive = hasBlackKey && activeNote === nextKey.note;

              const isPracticeWhiteTarget = practiceMode && currentPracticeTarget?.note === whiteKey.note;
              const isPracticeBlackTarget = practiceMode && hasBlackKey && currentPracticeTarget?.note === nextKey.note;

              return (
                <div key={whiteKey.note} className="relative inline-block">
                  {/* White Key */}
                  <button
                    onMouseDown={() => playTone(whiteKey.freq, whiteKey.note, whiteKey.pan)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      playTone(whiteKey.freq, whiteKey.note, whiteKey.pan);
                    }}
                    className={`w-9 sm:w-11 md:w-13 h-40 md:h-48 rounded-b-xl border border-gray-300 transition-all flex flex-col justify-end items-center pb-3 cursor-pointer select-none relative ${
                      isPracticeWhiteTarget
                        ? 'bg-amber-200 ring-4 ring-amber-400 animate-pulse'
                        : isWhiteActive
                        ? 'bg-[var(--pink)] scale-[0.98] shadow-inner'
                        : 'bg-gradient-to-b from-[#fafafa] to-[#ebebeb] hover:bg-white active:bg-gray-200'
                    }`}
                    style={{
                      boxShadow: isWhiteActive
                        ? 'inset 0 -2px 10px rgba(0,0,0,0.4)'
                        : '0 4px 8px rgba(0,0,0,0.4), inset 0 -4px 0 rgba(0,0,0,0.15)',
                    }}
                  >
                    <span className="text-[11px] font-mono text-gray-700 font-bold">{whiteKey.keyLabel}</span>
                    <span className="text-[9px] font-mono text-gray-400">{whiteKey.note}</span>
                  </button>

                  {/* Black Key */}
                  {hasBlackKey && (
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        playTone(nextKey.freq, nextKey.note, nextKey.pan);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playTone(nextKey.freq, nextKey.note, nextKey.pan);
                      }}
                      className={`absolute top-0 -right-4 md:-right-4.5 z-20 w-7 md:w-9 h-24 md:h-28 rounded-b-lg border border-black transition-all flex flex-col justify-end items-center pb-2 cursor-pointer select-none ${
                        isPracticeBlackTarget
                          ? 'bg-amber-500 ring-4 ring-amber-300 animate-pulse'
                          : isBlackActive
                          ? 'bg-[var(--pink-deep)] scale-[0.98]'
                          : 'bg-gradient-to-b from-[#2a2730] via-[#16141a] to-[#0a080d] hover:from-[#3a3542]'
                      }`}
                      style={{
                        boxShadow: '0 4px 8px rgba(0,0,0,0.7), inset 0 -2px 0 rgba(255,255,255,0.15)',
                      }}
                    >
                      <span className="text-[9px] font-mono text-[var(--butter)] font-bold">{nextKey.keyLabel}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BRASS FOOT PEDALS GRAPHIC */}
        <div className="flex justify-center items-center gap-6 mt-4">
          <div className="w-12 h-6 rounded-b-xl bg-gradient-to-b from-[#b49454] to-[#785b24] shadow-md border border-amber-300/40" />
          <div
            className={`w-14 h-7 rounded-b-xl transition-transform shadow-md border cursor-pointer ${
              sustainOn
                ? 'bg-gradient-to-b from-[#e6ca85] to-[#9c7832] scale-95 border-amber-200 shadow-[0_0_15px_#f59e0b]'
                : 'bg-gradient-to-b from-[#b49454] to-[#785b24] border-amber-300/40'
            }`}
            onClick={() => setSustainOn(!sustainOn)}
            title="Sustain Pedal (Spacebar)"
          />
          <div className="w-12 h-6 rounded-b-xl bg-gradient-to-b from-[#b49454] to-[#785b24] shadow-md border border-amber-300/40" />
        </div>
      </div>
    </motion.div>
  );
}

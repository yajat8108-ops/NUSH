'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SectionHead from './SectionHead';
import Image from 'next/image';
import { SoundEngine } from '@/lib/audio';

const polaroids = [
  {
    id: 1,
    src: '/photos/photo-1.jpg',
    caption: 'the teddy bear delivery',
    initialRotation: -5,
    top: '5%',
    left: '5%',
    secret: false,
  },
  {
    id: 2,
    src: '/photos/photo-2.jpg',
    caption: 'campus bench regulars',
    initialRotation: 3,
    top: '8%',
    left: '35%',
    secret: false,
  },
  {
    id: 3,
    src: '/photos/photo-new-1.jpg',
    caption: 'our newest memory ❤️',
    initialRotation: -2,
    top: '12%',
    left: '65%',
    secret: false,
  },
  {
    id: 4,
    src: '/photos/photo-5.jpg',
    caption: 'candid magic',
    initialRotation: 6,
    top: '35%',
    left: '10%',
    secret: true,
    secretText: "psst... type 'nush' on your keyboard for a surprise 🩷",
  },
  {
    id: 5,
    src: '/photos/photo-9.jpg',
    caption: 'late night polaroids',
    initialRotation: -7,
    top: '40%',
    left: '42%',
    secret: false,
  },
  {
    id: 6,
    src: '/photos/photo-new-2.jpg',
    caption: 'still smiling 🩷',
    initialRotation: 4,
    top: '38%',
    left: '72%',
    secret: false,
  },
  {
    id: 7,
    src: '/photos/photo-11.jpg',
    caption: 'still laughing',
    initialRotation: -4,
    top: '65%',
    left: '20%',
    secret: true,
    secretText: "you've found a secret! click the teddy bear in the letter 10 times 🛩️🧸",
  },
  {
    id: 8,
    src: '/photos/photo-new-3.jpg',
    caption: 'month two vibes 💕',
    initialRotation: 8,
    top: '68%',
    left: '75%',
    secret: false,
  },
  {
    id: 9,
    src: '/photos/late-night-call.png',
    caption: '1:07 AM · late night call 🌙',
    initialRotation: -3,
    top: '70%',
    left: '46%',
    secret: true,
    secretText: "you fell asleep under your pink floral blanket and I watched over you the whole night 🥹❤️",
  },
];

const Polaroid = ({ photo, constraintsRef }: any) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.2}
      whileHover={{ scale: 1.05, zIndex: 10, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      whileDrag={{ scale: 1.1, zIndex: 20, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
      initial={{ rotate: photo.initialRotation }}
      style={{
        position: 'absolute',
        top: photo.top,
        left: photo.left,
        touchAction: 'none',
        willChange: 'transform',
      }}
      className="cursor-grab active:cursor-grabbing w-32 md:w-48 xl:w-56"
      onClick={() => {
        if (photo.secret) {
          SoundEngine.pop();
          setFlipped(!flipped);
        } else {
          SoundEngine.shutter();
        }
      }}
    >
      <motion.div
        className="w-full relative shadow-md bg-white p-3 md:p-4 pb-8 md:pb-12"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Pushpin */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 shadow-sm border border-red-700 z-10 flex items-center justify-center" 
          style={{ transform: 'translateZ(1px)' }}
        >
          <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
        </div>

        {/* Front of Polaroid */}
        <div style={{ backfaceVisibility: 'hidden' }} className="w-full">
          <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
            <Image 
              src={photo.src} 
              alt={photo.caption} 
              fill 
              className="object-cover pointer-events-none" 
              sizes="(max-width: 768px) 128px, 224px" 
            />
          </div>
          <p className="mt-3 text-center text-lg md:text-2xl font-caveat text-[var(--plum)] leading-tight px-1 select-none pointer-events-none">
            {photo.caption}
          </p>
        </div>

        {/* Back of Polaroid (Secret) */}
        {photo.secret && (
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 bg-[#fdfd96] flex items-center justify-center p-4 shadow-inner"
          >
            <p className="text-center text-xl md:text-3xl font-caveat text-gray-800 leading-tight select-none">
              {photo.secretText}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function CorkboardSection() {
  const constraintsRef = useRef(null);

  return (
    <section className="py-10 sm:py-20 w-full overflow-hidden bg-[var(--cream)] font-nunito">
      <SectionHead
        eyebrow="exhibit c"
        title="The Corkboard"
        subtitle="drag them around, flip the secret ones"
      />
      
      <div className="container mx-auto px-2 sm:px-4 mt-8 sm:mt-12">
        <div 
          ref={constraintsRef}
          className="relative w-full h-[520px] sm:h-[650px] md:h-[800px] xl:h-[900px] rounded-xl shadow-2xl border-[8px] sm:border-[12px] md:border-[16px] border-[#5c4033] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #8B6914, #A0864E, #8B6914)',
          }}
        >
          {/* Subtle cork texture overlay using SVG noise */}
          <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none" 
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
            }}
          ></div>
          
          {polaroids.map((photo) => (
            <Polaroid key={photo.id} photo={photo} constraintsRef={constraintsRef} />
          ))}
        </div>
      </div>
    </section>
  );
}

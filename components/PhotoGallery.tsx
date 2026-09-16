'use client';

import React, { useState } from 'react';
import SectionHead from './SectionHead';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

const MOCK_PHOTOS = [
  { id: 1, caption: "the first time we went out", rotate: -3, video: false },
  { id: 2, caption: "when you made that face", rotate: 2, video: false },
  { id: 99, src: "/photos/late-night-call.png", caption: "1:07 AM video call · watching you sleep peacefully 🌸❤️", rotate: -1, video: false },
  { id: 3, caption: "fit check", rotate: -1.5, video: false },
  { id: 4, caption: "my fav selfie", rotate: 3, video: false },
  { id: 5, caption: "the prettiest smile", rotate: -2, video: false },
  { id: 6, caption: "your birthday date", rotate: 1.5, video: false },
  { id: 10, caption: "kissing your forehead, per usual", rotate: -3, video: false },
  { id: 11, caption: "you and that face right before laughing", rotate: 2, video: false },
  { id: 12, caption: "hand on your cheek, sun in your eyes", rotate: -1.5, video: false },
  { id: 13, caption: "her kissing me on the cheek", rotate: 3, video: false },
  { id: 14, caption: "old camcorder filter, timeless anyway", rotate: -2, video: false },
];

function TiltCard({ photo, idx, onClick }: { photo: typeof MOCK_PHOTOS[0]; idx: number; onClick: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const springX = useSpring(rotateX, { stiffness: 280, damping: 26 });
  const springY = useSpring(rotateY, { stiffness: 280, damping: 26 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50, rotate: photo.rotate * 3 }}
      whileInView={{ opacity: 1, scale: 1, y: 0, rotate: photo.rotate }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (idx % 3) * 0.15, type: "spring", bounce: 0.4 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, perspective: 1000, willChange: 'transform' }}
      className={`relative w-full aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-[var(--card-shadow)] cursor-pointer group origin-center`}
    >
      {photo.video ? (
        <video
          src="/videos/our-video-2.mp4"
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <img 
          src={(photo as any).src || `/photos/photo-${photo.id}.jpg`} 
          alt={photo.caption} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      {photo.video && (
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white text-sm z-10">
          ▶
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--pink)] to-[var(--lav)] opacity-20 -z-10" />
      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-50 -z-10">📸</div>
      
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white font-caveat text-2xl">{photo.caption}</p>
      </div>
    </motion.div>
  );
}

export default function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const selectedPhoto = currentIndex !== null ? MOCK_PHOTOS[currentIndex] : null;

  const nextPhoto = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex + 1) % MOCK_PHOTOS.length);
    }
  };

  const prevPhoto = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex - 1 + MOCK_PHOTOS.length) % MOCK_PHOTOS.length);
    }
  };

  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.x > 100) {
      prevPhoto();
    } else if (info.offset.x < -100) {
      nextPhoto();
    }
  };

  const openRandom = () => {
    const randomIdx = Math.floor(Math.random() * MOCK_PHOTOS.length);
    setCurrentIndex(randomIdx);
  };

  return (
    <section id="gallery" className="anniversary-section relative">
      <SectionHead 
        eyebrow="exhibit a" 
        title="the gallery" 
        subtitle="a collection of moments where I stared at you instead of the camera." 
      />
      
      <div className="flex justify-center mt-4">
        <button 
          onClick={openRandom}
          className="bg-white text-[var(--pink-deep)] border-2 border-[var(--pink)] px-6 py-2 rounded-full font-nunito font-bold hover:bg-[var(--pink)] hover:text-white transition-colors shadow-sm"
        >
          🎲 Random Memory
        </button>
      </div>

      <div className="mt-12 max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {MOCK_PHOTOS.map((photo, idx) => (
          <TiltCard key={photo.id} photo={photo} idx={idx} onClick={() => setCurrentIndex(idx)} />
        ))}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCurrentIndex(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          >
            <motion.div 
              key={selectedPhoto.id}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className={`relative bg-[var(--white)] p-4 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col items-center cursor-grab active:cursor-grabbing`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-full h-[60vh] bg-black rounded-lg overflow-hidden flex items-center justify-center relative`}>
                {selectedPhoto.video ? (
                  <video
                    src="/videos/our-video-2.mp4"
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <img 
                    src={(selectedPhoto as any).src || `/photos/photo-${selectedPhoto.id}.jpg`} 
                    alt={selectedPhoto.caption}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                )}
              </div>
              <p className="font-caveat text-4xl text-[var(--pink-deep)] mt-6 text-center">{selectedPhoto.caption}</p>
              
              <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2">
                <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110">&larr;</button>
              </div>
              <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2">
                <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110">&rarr;</button>
              </div>

              <button 
                onClick={() => setCurrentIndex(null)}
                className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full text-black flex items-center justify-center shadow-lg font-bold text-2xl hover:scale-110 transition-transform"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

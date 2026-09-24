'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHead from './SectionHead';
import { SoundEngine } from '@/lib/audio';

// ── Cloudinary config (Optional) ──────────────────────────────
// If provided, photos are uploaded to Cloudinary.
// If empty, photos are auto-compressed client-side to ~50KB JPEG
// and synced directly across devices via global cloud sync!
const CLOUDINARY_CLOUD_NAME: string   = 'fxq1fsm9'; 
const CLOUDINARY_UPLOAD_PRESET: string = 'nush_photos'; 
const CLOUDINARY_CONFIGURED: boolean   = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
// ───────────────────────────────────────────────────────────────

export interface CloudPhoto {
  id: string;
  author: 'nush' | 'yajat';
  url: string;
  caption: string;
  uploadedAt: string;
}

// Client-side image compression to ~50KB using HTML5 Canvas
const compressImageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 900;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // 0.72 quality delivers crisp photos under ~50KB
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        resolve(compressed);
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PhotoAlbum() {
  const [photos, setPhotos] = useState<CloudPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [author, setAuthor] = useState<'nush' | 'yajat'>('nush');
  const [caption, setCaption] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<CloudPhoto | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync?key=photos', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPhotos(data);
      }
    } catch (e) {
      console.error('Failed to fetch photos:', e);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 20000);
    window.addEventListener('focus', fetchPhotos);

    // Listen for custom open-photo-upload event (e.g. from Filmstrip)
    const handleOpenModal = () => {
      setShowUploadModal(true);
    };
    window.addEventListener('open-photo-upload', handleOpenModal);

    const handlePhotoDeleted = (e: Event) => {
      const customEvt = e as CustomEvent<{ id: string }>;
      const deletedId = customEvt.detail?.id;
      if (deletedId) {
        setPhotos((prev) => prev.filter((p) => p.id !== deletedId));
      }
    };
    window.addEventListener('photo-deleted', handlePhotoDeleted);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchPhotos);
      window.removeEventListener('open-photo-upload', handleOpenModal);
      window.removeEventListener('photo-deleted', handlePhotoDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    if (!CLOUDINARY_CONFIGURED) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'nush_album');
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.secure_url as string;
    } catch (e) {
      console.error('Cloudinary error:', e);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      let finalUrl = '';
      if (CLOUDINARY_CONFIGURED) {
        const cloudUrl = await uploadToCloudinary(selectedFile);
        if (cloudUrl) finalUrl = cloudUrl;
      }

      // If Cloudinary is not configured or failed, use smart client-side compression
      if (!finalUrl) {
        finalUrl = await compressImageToDataUrl(selectedFile);
      }

      const newPhoto: CloudPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        author,
        url: finalUrl,
        caption: caption.trim() || '💕 Our Memory',
        uploadedAt: new Date().toISOString(),
      };

      setPhotos((prev) => [newPhoto, ...prev]);
      setShowUploadModal(false);
      setCaption('');
      setSelectedFile(null);
      setPreview(null);
      SoundEngine.confettiPop();

      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'photos', action: 'add', item: newPhoto }),
      });
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('Could not save photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (id: string) => {
    if (!window.confirm('Remove this photo from our album? 🥺')) return;
    SoundEngine.click();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (lightboxPhoto?.id === id) setLightboxPhoto(null);
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'photos', action: 'delete', id }),
      });
      window.dispatchEvent(new CustomEvent('photo-deleted', { detail: { id } }));
    } catch (e) {
      console.error('Failed to delete photo:', e);
    }
  };

  return (
    <section id="photo-album" className="anniversary-section py-16 px-4 max-w-5xl mx-auto font-nunito">
      <SectionHead
        eyebrow="our shared memories · global photo vault"
        title="Our Photo Album 📸"
        subtitle="every pic we take together, kept forever in one place 🥹"
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-6">
        <span className="text-xs font-mono text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isSyncing ? 'Syncing...' : `${photos.length} memories saved globally ☁️`}
        </span>

        <button
          onClick={() => { SoundEngine.pop(); setShowUploadModal(true); }}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-mono font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>📷</span> Upload a Memory
        </button>
      </div>

      {/* Loading shimmer */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-white/60 border border-[var(--pink)]/20 animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-mono bg-white/40 rounded-3xl border border-dashed border-[var(--pink)]/30 p-8">
          <div className="text-5xl mb-3">📸</div>
          <p className="text-sm font-bold text-[var(--plum)]">No photos uploaded yet!</p>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Click &ldquo;Upload a Memory&rdquo; above to add your first photo together. It will sync globally!
          </p>
        </div>
      ) : (
        /* Responsive masonry grid */
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-md border-2 border-[var(--pink)]/20 hover:border-[var(--pink-deep)]/60 hover:shadow-xl transition-all cursor-pointer bg-white"
              onClick={() => { SoundEngine.click(); setLightboxPhoto(photo); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="font-caveat text-white text-lg leading-snug">{photo.caption}</p>
                <p className="text-[10px] font-mono text-white/80 mt-0.5">
                  {photo.author === 'nush' ? '👑 Nush' : '🐻 Yajat'}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 hover:bg-red-600 text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer z-10"
                title="Remove photo"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-mono cursor-pointer"
              >✕</button>

              <h3 className="font-bold text-lg text-[var(--plum)] font-mono flex items-center gap-2">
                <span>📷</span> Upload a Memory
              </h3>

              {/* Author */}
              <div>
                <label className="text-xs font-mono text-gray-500 block mb-1">Uploading as:</label>
                <div className="flex gap-2">
                  {(['nush', 'yajat'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAuthor(a)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        author === a
                          ? 'bg-[var(--pink-deep)] border-[var(--pink-deep)] text-white shadow'
                          : 'bg-white border-zinc-200 text-zinc-600'
                      }`}
                    >
                      {a === 'nush' ? '👑 Nush' : '🐻 Yajat'}
                    </button>
                  ))}
                </div>
              </div>

              {/* File picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-[var(--pink)]/40 bg-[var(--cream)]/60 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--pink-deep)] hover:bg-pink-50/50 transition-all overflow-hidden"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <>
                    <span className="text-3xl">🖼️</span>
                    <p className="text-xs font-mono text-gray-500">Tap to choose a photo</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Caption */}
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption... (optional)"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-zinc-200 text-sm text-[var(--plum)] focus:outline-none focus:border-[var(--pink-deep)] font-caveat text-xl"
              />

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--pink-deep)] to-[var(--lav)] text-white font-bold font-mono text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUploading ? '☁️ Saving to Cloud...' : '💾 Save to Our Album'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-nunito"
            onClick={() => setLightboxPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full"
            >
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕ Close
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="text-left">
                  <p className="font-caveat text-white text-2xl md:text-3xl">{lightboxPhoto.caption}</p>
                  <p className="font-mono text-xs text-white/60 mt-1">
                    {lightboxPhoto.author === 'nush' ? '👑 Anushka (Nush)' : '🐻 Yajat'} · {new Date(lightboxPhoto.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <button
                  onClick={() => deletePhoto(lightboxPhoto.id)}
                  className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>Remove Photo</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

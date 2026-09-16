'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useInView } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function QrFooter() {
  const [qrUrl, setQrUrl] = useState<string>('');
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.5 });
  const { theme } = useStore();

  useEffect(() => {
    // Generate QR code for the current URL
    QRCode.toDataURL(window.location.href, { 
      margin: 2, 
      width: 250,
      color: {
        dark: '#FF5C8E', // var(--pink-deep)
        light: '#ffffff'
      }
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, []);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 90,
          spread: 70,
          origin: { x: 0.5, y: 1 },
          colors: theme === 'dark' ? ['#fcebdc', '#c9a255'] : ['#FF9EC9', '#FFDD8C']
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isInView, theme]);

  return (
    <footer ref={footerRef} className="w-full bg-[var(--white)] py-16 px-4 mt-20 border-t border-[var(--pink)]/30 flex flex-col items-center justify-center text-center print:hidden">
      <h3 className="font-caveat text-4xl text-[var(--pink-deep)] mb-4">scan to open on your phone 🩷</h3>
      
      {qrUrl ? (
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-[var(--pink)]/20 mb-6 transform hover:scale-105 transition-transform duration-300">
          <img src={qrUrl} alt="QR Code to this site" className="w-48 h-48 rounded-xl" />
        </div>
      ) : (
        <div className="w-48 h-48 bg-gray-100 rounded-2xl animate-pulse mb-6 flex items-center justify-center">
          <span className="text-[var(--pink)] font-nunito">generating...</span>
        </div>
      )}

      <p className="font-nunito text-[var(--plum-soft)] mb-8 max-w-sm">
        Just point your camera at this QR code if you're viewing this on a laptop and want to check out the mobile layout!
      </p>

      {/* The Calculator Easter Egg Link */}
      <Link href="/calculator" className="calc-link group">
        <span className="group-hover:animate-bounce inline-block mr-2">🧮</span>
        Open Calculator (Easter Egg)
      </Link>
    </footer>
  );
}

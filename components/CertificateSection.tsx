'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SectionHead from './SectionHead';

export default function CertificateSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 560;

    // Set high-res canvas
    const scale = window.devicePixelRatio || 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#FFF8F0';
    ctx.fillRect(0, 0, width, height);

    // Gold borders
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Corner flourishes
    const drawFlourish = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, -20, 40, 0);
      ctx.quadraticCurveTo(20, 20, 0, 0);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();
      ctx.restore();
    };

    drawFlourish(40, 40, Math.PI / 4);
    drawFlourish(width - 40, 40, (Math.PI * 3) / 4);
    drawFlourish(width - 40, height - 40, (Math.PI * 5) / 4);
    drawFlourish(40, height - 40, (Math.PI * 7) / 4);

    // Texts
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = '#222';
    ctx.fillText('Certificate of Excellence', width / 2, 120);

    // Subtitle
    ctx.font = 'italic 18px serif';
    ctx.fillStyle = '#555';
    ctx.fillText('This certifies that', width / 2, 170);

    // Name
    ctx.font = 'bold 64px "Caveat", cursive, serif'; // Fallback to serif if caveat not loaded yet
    ctx.fillStyle = '#FF5C8E';
    ctx.fillText('Anushka', width / 2, 250);
    
    // Emojis around name
    ctx.font = '24px serif';
    ctx.fillText('🩷', width / 2 - 140, 240);
    ctx.fillText('💕', width / 2 + 140, 240);

    // Body
    ctx.font = '20px serif';
    ctx.fillStyle = '#333';
    ctx.fillText('is hereby officially recognized as the Best Girlfriend in the Universe', width / 2, 320);

    // Subtext
    ctx.font = 'italic 18px serif';
    ctx.fillStyle = '#666';
    ctx.fillText('for making every single day more beautiful than the last', width / 2, 360);

    // Date
    ctx.textAlign = 'left';
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#222';
    ctx.fillText('Issued: September 22, 2026 (Month 3)', 80, 480);

    // Signature
    ctx.textAlign = 'center';
    ctx.font = '24px "Caveat", cursive, serif';
    ctx.fillText('With all my love, Yajat Kataria 🐻🩷', width - 220, 475);
    
    // Signature line
    ctx.beginPath();
    ctx.moveTo(width - 340, 485);
    ctx.lineTo(width - 100, 485);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Gold seal
    ctx.save();
    ctx.translate(width / 2, 450);
    
    // Radiating lines
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40 * Math.cos(i * Math.PI / 15), 40 * Math.sin(i * Math.PI / 15));
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Inner seal
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#F4D03F';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#B7950B';
    ctx.stroke();
    
    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Seal text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('No. 1', 0, 0);
    
    ctx.restore();

  }, []);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'certificate-for-nush.png';
    link.href = url;
    link.click();
  };

  return (
    <section className="w-full py-20 px-4 bg-[var(--white)] overflow-hidden">
      <SectionHead 
        eyebrow="official document" 
        title="Certificate of Excellence" 
        subtitle="because you deserve an official award" 
      />

      <div className="max-w-4xl mx-auto mt-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full shadow-2xl rounded-lg overflow-hidden border border-[var(--pink-deep)]/20 bg-[#FFF8F0]"
        >
          {/* We use aspect-ratio to keep it responsive without distorting the drawing */}
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto aspect-[800/560] block"
            style={{ maxWidth: '800px', margin: '0 auto' }}
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onClick={handleDownload}
          className="mt-8 px-8 py-4 bg-[var(--pink)] text-white font-nunito font-bold rounded-full shadow-lg hover:bg-[var(--pink-deep)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
        >
          <span>📸 Download Certificate</span>
        </motion.button>
      </div>
    </section>
  );
}

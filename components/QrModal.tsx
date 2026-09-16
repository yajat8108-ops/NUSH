'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrModalProps {
  value: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrModal({ value, isOpen, onClose }: QrModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && value) {
      QRCode.toDataURL(value, { margin: 2, width: 200 })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [value, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="history-backdrop" style={{ zIndex: 100 }} onClick={onClose}>
      <div
        className="history-panel"
        style={{
          height: 'auto',
          maxHeight: '85vh',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          width: 'min(320px, 90vw)',
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          position: 'fixed',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="history-title" style={{ width: '100%', textAlign: 'center' }}>
          Scan Result
        </h3>

        {qrUrl ? (
          <img
            src={qrUrl}
            alt="QR Code"
            style={{ borderRadius: '12px', border: '4px solid #fff' }}
          />
        ) : (
          <p style={{ color: 'var(--mid)', fontSize: '14px' }}>Generating QR Code...</p>
        )}

        <div
          style={{
            fontSize: '11px',
            color: 'var(--mid)',
            wordBreak: 'break-all',
            textAlign: 'center',
            maxHeight: '80px',
            overflowY: 'auto',
          }}
        >
          {value}
        </div>

        <button
          className="hclr"
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

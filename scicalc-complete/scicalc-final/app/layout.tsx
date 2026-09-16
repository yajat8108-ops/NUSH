/**
 * app/layout.tsx
 * ============================================================================
 * Root layout for Next.js App Router. Sets up metadata, viewport, and fonts.
 * ============================================================================
 */

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'SciCalc — Scientific Calculator',
  description: 'Material You scientific calculator powered by WebAssembly. Supports trig, logarithms, complex expressions, and more.',
  keywords: ['calculator', 'scientific', 'webassembly', 'math', 'material you'],
  authors: [{ name: 'SciCalc' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SciCalc',
  },
  openGraph: {
    title: 'SciCalc — Scientific Calculator',
    description: 'Material You scientific calculator powered by WebAssembly.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1C1B1F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

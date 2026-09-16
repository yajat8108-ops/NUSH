/**
 * app/layout.tsx
 * ============================================================================
 * Root layout for Next.js App Router. Sets up metadata, viewport, and fonts.
 * ============================================================================
 */

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Caveat, Quicksand, Nunito } from 'next/font/google';
import './globals.css';
import PWARegistration from './PWARegistration';

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

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '600', '800'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Yajat & Nush — Three Months of Us (Quarter of a Year) 👑💖',
  description: 'Happy 3rd month anniversary, Nushi! Three months of pure magic, library study dates, your velvety voice, and our whole relationship universe ❤️',
  keywords: ['anniversary', 'love', 'vit bhopal', 'yajat and nush', 'month 3', 'three months'],
  authors: [{ name: 'Yajat Kataria' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Yajat & Nush',
  },
  openGraph: {
    title: 'Yajat & Nush — Three Months of Us (Quarter of a Year) 👑💖',
    description: 'Happy 3rd month anniversary, Nushi! Three months of pure magic, library study dates, your velvety voice, and our whole relationship universe ❤️',
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${caveat.variable} ${quicksand.variable} ${nunito.variable}`}>
      <body>
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}

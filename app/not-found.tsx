import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex flex-col items-center justify-center p-4 font-mono text-center">
      <h2 className="text-xl font-bold mb-2 text-pink-400">404 — Cosmic Void 🌌</h2>
      <p className="text-zinc-400 text-xs mb-4 max-w-sm">
        You wandered into uncharted space. Let&apos;s guide you back home.
      </p>
      <Link
        href="/"
        className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg hover:scale-105 transition-transform"
      >
        Return to Our Universe ✦
      </Link>
    </div>
  );
}

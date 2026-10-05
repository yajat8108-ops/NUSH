'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0c0c0e] text-white flex flex-col items-center justify-center min-h-screen p-4 font-mono text-center">
        <h2 className="text-xl font-bold mb-2 text-pink-400">Cosmic Flux Detected ✨</h2>
        <p className="text-zinc-400 text-xs mb-4">Something shifted in the stars. Let&apos;s recalibrate.</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg cursor-pointer"
        >
          Recalibrate Universe ✦
        </button>
      </body>
    </html>
  );
}

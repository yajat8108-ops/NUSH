'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0c0c0e] text-white flex flex-col items-center justify-center min-h-screen p-4 font-mono text-center">
        <h2 className="text-xl font-bold mb-2 text-pink-400">Cosmic Flux Detected ✨</h2>
        <p className="text-zinc-400 text-xs mb-3">Something shifted in the stars. Let&apos;s recalibrate.</p>
        {error && (
          <div className="bg-red-950/60 border border-red-500/40 p-4 rounded-2xl max-w-lg w-full text-left my-3 overflow-auto text-xs text-red-200">
            <p className="font-bold text-red-400 mb-1">{error.name}: {error.message}</p>
            {error.digest && <p className="text-[10px] text-zinc-400">Digest: {error.digest}</p>}
            {error.stack && (
              <pre className="mt-2 text-[10px] text-zinc-400 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                {error.stack}
              </pre>
            )}
          </div>
        )}
        <button
          onClick={() => reset()}
          className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
        >
          Recalibrate Universe ✦
        </button>
      </body>
    </html>
  );
}


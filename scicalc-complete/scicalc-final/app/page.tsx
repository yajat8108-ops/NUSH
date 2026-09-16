/**
 * app/page.tsx
 * ============================================================================
 * Root page — renders the Calculator component.
 * ============================================================================
 */

import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="app-main">
      <div className="bg-watermark">Made for Nush</div>
      <Calculator />
    </main>
  );
}

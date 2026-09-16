import Calculator from '@/components/Calculator';
import Link from 'next/link';

export default function CalculatorPage() {
  return (
    <main className="app-main" style={{ flexDirection: 'column' }}>
      <div className="w-full max-w-[400px] mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dim)] transition-colors"
        >
          &larr; Back to Anniversary Page
        </Link>
      </div>
      
      <div className="bg-watermark">Made for Nush</div>
      
      <Calculator />
      
      <div className="w-full max-w-[400px] mt-6 text-center text-xs text-[var(--lo)]">
        exhibit e, the apology
      </div>
    </main>
  );
}

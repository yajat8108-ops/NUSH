import type { Metadata } from 'next';
import SorrySection from '@/components/sorry/SorrySection';

export const metadata: Metadata = {
  title: "I'm Really Sorry, Nush 🤍",
  description: "A sincere apology and promises from Yajat to Nush.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SorryPage() {
  return (
    <main className="anniversary-body min-h-screen py-10">
      <SorrySection />
    </main>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DealTwin — Promise-to-Proof Verification',
  description: 'A phone-first assistant that checks risky offers before purchase and verifies whether final documents match what the seller promised.',
  openGraph: {
    title: 'DealTwin — Don’t trust the deal. Verify it.',
    description: 'Check offers before purchase, compare promise against proof, and keep every verdict linked to its source.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'DealTwin promise-to-proof verification' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealTwin — Know the deal before you sign',
    description: 'Phone-first promise-to-proof verification by Team ANKOR.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

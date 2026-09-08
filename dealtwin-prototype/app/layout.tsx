import type { Metadata } from 'next';
import './globals.css';
import { PwaRegister } from './pwa-register';

export const metadata: Metadata = {
  title: 'BuySure — Purchase Trust Layer',
  description: 'Capture seller promises, assess purchase risk, verify final documents, and create a claim-ready evidence pack.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'BuySure — Buy with evidence, not assumptions.',
    description: 'A privacy-first purchase trust layer from promise capture to claim-ready proof.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Promise-to-proof purchase verification by Team ANKOR' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuySure — Purchase Trust Layer',
    description: 'Capture the promise. Verify the proof. Be ready to claim.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister />{children}</body></html>;
}

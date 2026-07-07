import type { Metadata, Viewport } from 'next';
import { GiftLanding } from './GiftLanding';

export const viewport: Viewport = {
  themeColor: '#08141f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Una piccola cosa',
  description: 'Una piccola rivelazione privata.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: '/aury-bella-mia',
  },
};

export default function AuryBellaMiaPage() {
  return (
    <>
      <style>{'body { background: #08141f; }'}</style>
      <GiftLanding />
    </>
  );
}

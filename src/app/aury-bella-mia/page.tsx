import type { Metadata } from 'next';
import { GiftLanding } from './GiftLanding';

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
  return <GiftLanding />;
}

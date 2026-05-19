import type { Metadata } from 'next';
import { DM_Serif_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

/* ── Fonts (Next.js downloads & self-hosts at build time — no CDN at runtime) ── */
const dmSerif = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: true,
});

/* ── Metadata ── */
export const metadata: Metadata = {
  title: {
    default: 'Mattia Erigoni - Operational Software & AI Tools',
    template: '%s | Mattia Erigoni',
  },
  description:
    'Management Engineer building operational software for logistics, planning, data quality and private AI workflows.',
  metadataBase: new URL('https://mattiaerigoni.com'),
  alternates: { canonical: '/' },
  applicationName: 'Mattia Erigoni Portfolio',
  authors: [{ name: 'Mattia Erigoni', url: 'https://mattiaerigoni.com' }],
  creator: 'Mattia Erigoni',
  category: 'portfolio',
  keywords: [
    'Mattia Erigoni',
    'management engineer',
    'operations research',
    'logistics software',
    'bin packing',
    'data quality',
    'RAG',
    'private AI',
    'process digitalization',
  ],
  robots: { index: true, follow: true },
  verification: {
    google: 'tN29w67-KRAZFoXqL6hJGPQ0fM6wziVb7CwHz-csgqM',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title:       'Mattia Erigoni - Operational Software & AI Tools',
    description: 'Portfolio of logistics, planning, data quality and private AI tools for messy industrial workflows.',
    url:         'https://mattiaerigoni.com',
    siteName:    'Mattia Erigoni',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Mattia Erigoni portfolio preview' }],
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Mattia Erigoni - Operational Software & AI Tools',
    description: 'Operational software for logistics, planning, data quality and private AI workflows.',
    images:      ['/opengraph-image'],
  },
};

/* ── JSON-LD structured data ── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Mattia Erigoni',
  url: 'https://mattiaerigoni.com',
  jobTitle: 'Management Engineer and Digital Builder',
  description: 'Builder of operational software, optimization tools, data-quality systems and private AI workflows.',
  email: 'mattiaerigoni99@gmail.com',
  sameAs: ['https://www.linkedin.com/in/mattia-erigoni-b87614183/'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${plusJakarta.variable} h-full`}
      style={{ background: '#07101c' }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}

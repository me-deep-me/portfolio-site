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
  title: 'Mattia Erigoni — Management Engineer',
  description:
    'Management Engineer turning industrial complexity into software that works. Combinatorial optimization, AI pipelines, logistics tools, data governance.',
  metadataBase: new URL('https://mattiaerigoni.com'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title:       'Mattia Erigoni — Management Engineer',
    description: 'From NP-hard optimization to AI-assisted pipelines — tools that make hard operational problems disappear.',
    url:         'https://mattiaerigoni.com',
    siteName:    'Mattia Erigoni',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Mattia Erigoni — Management Engineer',
    description: 'From NP-hard optimization to AI-assisted pipelines — tools that make hard operational problems disappear.',
    images:      ['/og-image.png'],
  },
};

/* ── JSON-LD structured data ── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Mattia Erigoni',
  url: 'https://mattiaerigoni.com',
  jobTitle: 'Management Engineer',
  description: 'Management Engineer specialising in process digitalization, operations research and AI.',
  email: 'mattiaerigoni99@gmail.com',
  sameAs: [
    'https://linkedin.com/in/mattia-erigoni',
    'https://github.com/mattia-erigoni',
  ],
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

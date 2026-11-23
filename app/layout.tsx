import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopProgressBar from '@/components/TopProgressBar';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import SaweriaModal from '@/components/SaweriaModal';
import TurnstileGate from '@/components/TurnstileGate';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kurunime.com';

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kurunime - Nonton Anime Sub Indo & Baca Komik Manga Manhwa Terlengkap',
    template: '%s | Kurunime',
  },
  description:
    'Nonton streaming anime subtitle Indonesia dan baca komik manga, manhwa, manhua update tercepat kualitas HD gratis tanpa iklan mengganggu di Kurunime. Terinspirasi dari IDLIX.',
  keywords: [
    'Anime Subtitle Indonesia',
    'Nonton Anime Sub Indo',
    'Streaming Anime Sub Indo',
    'Download Anime Subtitle Indonesia',
    'Anime Sub Indo Gratis',
    'Komik Manga Manhwa Bahasa Indonesia',
    'Baca Komik Sub Indo',
    'Baca Manga Bahasa Indonesia',
    'Baca Manhwa Sub Indo',
    'Manhua Bahasa Indonesia',
    'Komik Bahasa Indonesia',
    'Kurunime',
    'Kurunime Next',
    'Otakudesu',
    'Samehadaku',
    'Komikcast',
    'Westmanga',
    'Komiku',
    'Kiryuu',
    'IDLIX Anime',
  ],
  authors: [{ name: 'Kurunime Team' }],
  creator: 'Kurunime',
  publisher: 'Kurunime',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'Kurunime',
    title: 'Kurunime - Nonton Anime Sub Indo & Baca Komik Manga Manhwa Terlengkap',
    description:
      'Nonton streaming anime subtitle Indonesia dan baca komik manga, manhwa, manhua update tercepat kualitas HD gratis tanpa iklan mengganggu.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Kurunime - Nonton Anime & Baca Komik Sub Indo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kurunime - Nonton Anime Sub Indo & Baca Komik Manga Manhwa',
    description:
      'Platform streaming anime subtitle Indonesia & baca komik manga manhwa update tercepat kualitas HD gratis.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'LCQreL27z-YLZHWDsh1YXHNFaAA04hOJvE8lX8Q3_5g',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data (JSON-LD) for Google Search Engine Optimization
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kurunime',
    alternateName: ['Kurunime Next', 'Kurunime Anime & Komik'],
    url: SITE_URL,
    description:
      'Nonton streaming anime subtitle Indonesia dan baca komik manga manhwa online gratis update tercepat kualitas HD.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kurunime',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  };

  return (
    <html lang="id" className={`dark ${inter.className}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-neutral-100 antialiased selection:bg-rose-600 selection:text-white">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <Suspense fallback={<div className="h-16 w-full bg-black/80" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsentBanner />
        <SaweriaModal />
        <TurnstileGate />
      </body>
    </html>
  );
}

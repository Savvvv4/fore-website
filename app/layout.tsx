import type { Metadata } from 'next';
import '../src/styles.css';

const siteUrl = new URL('https://foresports.in');

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'ForeSports | Golf platform for golfers, coaches & facilities',
    template: '%s | ForeSports',
  },
  description:
    'ForeSports connects golfers, golf coaches, and golf facilities in India for discovering and booking golf, managing coaching, and running facility operations.',
  applicationName: 'ForeSports',
  authors: [{ name: 'ForeSports Private Limited' }],
  creator: 'ForeSports Private Limited',
  publisher: 'ForeSports Private Limited',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'ForeSports',
    title: 'ForeSports | Golf platform for golfers, coaches & facilities',
    description:
      'ForeSports connects golfers, golf coaches, and golf facilities in India for discovering and booking golf, managing coaching, and running facility operations.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'ForeSports — Golf, connected.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ForeSports | Golf platform for golfers, coaches & facilities',
    description:
      'ForeSports connects golfers, golf coaches, and golf facilities in India.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://foresports.in/#organization',
        name: 'ForeSports',
        legalName: 'ForeSports Private Limited',
        url: 'https://foresports.in',
        logo: 'https://foresports.in/apple-touch-icon.svg',
        email: 'hello@foresports.in',
        description:
          'ForeSports connects golfers, golf coaches, and golf facilities in India.',
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://foresports.in/#website',
        name: 'ForeSports',
        url: 'https://foresports.in',
        inLanguage: 'en-IN',
        publisher: {
          '@id': 'https://foresports.in/#organization',
        },
      },
    ],
  };

  return (
    <html lang="en-IN">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {children}
      </body>
    </html>
  );
}

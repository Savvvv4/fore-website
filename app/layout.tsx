import type { Metadata } from 'next';
import '../src/styles.css';

const siteUrl = new URL('https://foresports.in');

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: 'ForeSports — Golf, connected.', template: '%s | ForeSports' },
  description: 'Fore connects golfers, coaches, and facilities to make golf easier to discover, book, and grow in India.',
  applicationName: 'ForeSports',
  authors: [{ name: 'ForeSports Private Limited' }],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_IN', url: '/', siteName: 'ForeSports', images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'ForeSports — Golf, connected.' }] },
  twitter: { card: 'summary_large_image', images: ['/og-image.svg'] },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.svg' },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', name: 'ForeSports', url: 'https://foresports.in', email: 'hello@foresports.in', areaServed: 'IN' },
    { '@type': 'WebSite', name: 'ForeSports', url: 'https://foresports.in', inLanguage: 'en-IN' },
  ] };
  return <html lang="en-IN"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</body></html>;
}

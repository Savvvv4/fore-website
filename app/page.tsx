import type { Metadata } from 'next';
import App from '../src/App';

export const metadata: Metadata = {
  title: 'Golf, connected.',
  description:
    'Discover and book golf, find coaches, and connect with golf facilities through ForeSports, a connected golf platform built in India.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Golf, connected. | ForeSports',
    description:
      'Discover and book golf, find coaches, and connect with golf facilities through ForeSports.',
    url: '/',
  },
};

export default function HomePage() {
  return <App page="home" />;
}

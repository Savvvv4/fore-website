import type { Metadata } from 'next';
import App from '../../src/App';

export const metadata: Metadata = {
  title: 'For Golfers',
  description: 'Find golf courses, tee times, ranges, coaches, lessons and practice opportunities in India with ForeSports.',
  alternates: { canonical: '/golfers' },
  openGraph: {
    title: 'Golf in India for golfers | ForeSports',
    description: 'Find and book more golf with ForeSports — courses, tee times, ranges, coaches and lessons in one connected platform.',
    url: '/golfers',
  },
};

export default function GolfersPage() {
  return <App page="golfers" />;
}

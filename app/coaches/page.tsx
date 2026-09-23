import type { Metadata } from 'next';
import App from '../../src/App';

export const metadata: Metadata = {
  title: 'For Golf Coaches',
  description: 'Build your golf coaching business with discovery, bookings, payments, student management and performance tools on ForeSports.',
  alternates: { canonical: '/coaches' },
  openGraph: {
    title: 'Golf coaching platform for coaches | ForeSports',
    description: 'Grow your golf coaching business with ForeSports — discovery, bookings, student management and performance tools.',
    url: '/coaches',
  },
};

export default function CoachesPage() {
  return <App page="coaches" />;
}

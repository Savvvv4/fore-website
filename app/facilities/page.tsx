import type { Metadata } from 'next';
import App from '../../src/App';

export const metadata: Metadata = {
  title: 'For Golf Facilities',
  description: 'Help golfers discover your facility, fill tee times and practice inventory, and manage golf facility operations with ForeSports.',
  alternates: { canonical: '/facilities' },
  openGraph: {
    title: 'Golf facility management & booking platform | ForeSports',
    description: 'Reach more golfers and run your golf facility from one connected system with ForeSports.',
    url: '/facilities',
  },
};

export default function FacilitiesPage() {
  return <App page="facilities" />;
}

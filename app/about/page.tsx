import type { Metadata } from 'next';
import App from '../../src/App';

export const metadata: Metadata = {
  title: 'About ForeSports',
  description: 'Learn why ForeSports is building a connected platform for golfers, coaches and facilities, starting in India and growing outward.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About ForeSports | Building golf's connected platform',
    description: 'Learn about ForeSports and our mission to build a more connected golf ecosystem from India to the world.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <App page="about" />;
}

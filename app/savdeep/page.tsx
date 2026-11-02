import type { Metadata } from 'next';
import { SiteShell } from '../../src/App';
import FounderPage from '../../src/founders/FounderPage';
import '../../src/founders/founder.css';

export const metadata: Metadata = {
  title: 'Savdeep Kadian, Founder & CPO',
  description: 'Savdeep Kadian is a founder of ForeSports. Message him on WhatsApp or email savdeep@foresports.in.',
  alternates: { canonical: '/savdeep' },
  openGraph: {
    title: 'Savdeep Kadian | Founder, ForeSports',
    description: 'More than a decade in golf, now building the connective layer for golf in India.',
    url: '/savdeep',
  },
};

export default function SavdeepPage() {
  return (
    <SiteShell>
      <FounderPage slug="savdeep" />
    </SiteShell>
  );
}

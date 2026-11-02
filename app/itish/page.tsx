import type { Metadata } from 'next';
import { SiteShell } from '../../src/App';
import FounderPage from '../../src/founders/FounderPage';
import '../../src/founders/founder.css';

export const metadata: Metadata = {
  title: 'Itish Arora, Founder & CEO',
  description: 'Itish Arora is a founder and CEO of ForeSports. Message him on WhatsApp or email itish@foresports.in.',
  alternates: { canonical: '/itish' },
  openGraph: {
    title: 'Itish Arora | Founder & CEO, ForeSports',
    description: 'From golf parent to founder, connecting golfers, coaches and facilities in India.',
    url: '/itish',
  },
};

export default function ItishPage() {
  return (
    <SiteShell>
      <FounderPage slug="itish" />
    </SiteShell>
  );
}

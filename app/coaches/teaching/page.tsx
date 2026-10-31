import type { Metadata } from 'next';
import { SiteShell } from '../../../src/App';
import { TeachingFunnel } from '../../../src/coach/CoachFunnels';
import '../../../src/coach/funnel.css';

export const metadata: Metadata = {
  title: 'For Teaching Pros',
  description: 'Get found by golfers near you, turn trial lessons into regulars and run your whole teaching week from one app.',
  alternates: { canonical: '/coaches/teaching' },
  openGraph: {
    title: 'Fore for Teaching Pros | ForeSports',
    description: 'Get more students, fill your calendar and run your teaching week from one app.',
    url: '/coaches/teaching',
  },
};

export default function TeachingPage() {
  return (
    <SiteShell>
      <TeachingFunnel />
    </SiteShell>
  );
}

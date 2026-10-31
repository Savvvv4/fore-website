import type { Metadata } from 'next';
import { SiteShell } from '../../src/App';
import { CoachesLanding } from '../../src/coach/CoachFunnels';
import '../../src/coach/coach.css';
import '../../src/coach/funnel.css';

export const metadata: Metadata = {
  title: 'For Golf Coaches',
  description: 'Get found by more golfers, keep every player improving and run your golf coaching from one app.',
  alternates: { canonical: '/coaches' },
  openGraph: {
    title: 'Coaches, on Fore | ForeSports',
    description: 'Get found by more golfers and run your golf coaching from one app.',
    url: '/coaches',
  },
};

export default function CoachesPage() {
  return (
    <SiteShell>
      <CoachesLanding />
    </SiteShell>
  );
}

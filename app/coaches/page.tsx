import type { Metadata } from 'next';
import { SiteShell } from '../../src/App';
import { CoachChooser } from '../../src/coach/CoachFunnels';
import '../../src/coach/coach.css';
import '../../src/coach/funnel.css';

export const metadata: Metadata = {
  title: 'For Golf Coaches',
  description: 'Two ways to coach on Fore: Teaching Pros get found by new students and run their week from one app; Performance Coaches run their whole squad from one shared record.',
  alternates: { canonical: '/coaches' },
  openGraph: {
    title: 'Coaches, on Fore | ForeSports',
    description: 'Fore for Teaching Pros and Fore for Performance Coaches.',
    url: '/coaches',
  },
};

export default function CoachesPage() {
  return (
    <SiteShell>
      <CoachChooser />
    </SiteShell>
  );
}

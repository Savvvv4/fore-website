import type { Metadata } from 'next';
import { SiteShell } from '../../../src/App';
import { PerformanceLanding } from '../../../src/coach/CoachFunnels';
import '../../../src/coach/coach.css';
import '../../../src/coach/funnel.css';

export const metadata: Metadata = {
  title: 'For Performance Coaches',
  description: 'One shared record for your squad: lesson notes, practice, rounds and progress, between you, your players and their parents.',
  alternates: { canonical: '/coaches/performance' },
  openGraph: {
    title: 'Fore for Performance Coaches | ForeSports',
    description: 'Help every player improve faster, and run your whole program from one app.',
    url: '/coaches/performance',
  },
};

export default function PerformancePage() {
  return (
    <SiteShell>
      <PerformanceLanding />
    </SiteShell>
  );
}

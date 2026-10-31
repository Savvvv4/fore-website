import type { Metadata } from 'next';
import CoachSignup from '../../../../src/coach/CoachSignup';
import '../../../../src/coach/coach.css';

export const metadata: Metadata = {
  title: 'Set Up Your Squad',
  description: 'Tell us about your program in two short steps. We’ll set up your squad with you.',
  alternates: { canonical: '/coaches/performance/join' },
};

export default function PerformanceJoinPage() {
  return <CoachSignup type="performance" />;
}

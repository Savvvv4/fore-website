import type { Metadata } from 'next';
import CoachSignup from '../../../../src/coach/CoachSignup';

export const metadata: Metadata = {
  title: 'Set Up Your Squad',
  description: 'Tell us about your program and the Fore team will set up your squad with you.',
  alternates: { canonical: '/coaches/performance/join' },
};

export default function PerformanceJoinPage() {
  return <CoachSignup type="performance" />;
}

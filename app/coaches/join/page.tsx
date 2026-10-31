import type { Metadata } from 'next';
import CoachSignup from '../../../src/coach/CoachSignup';
import '../../../src/coach/coach.css';

export const metadata: Metadata = {
  title: 'Join as a Coach',
  description: 'Join Fore as a golf coach in two short steps.',
  alternates: { canonical: '/coaches/join' },
};

export default function CoachJoinPage() {
  return <CoachSignup />;
}

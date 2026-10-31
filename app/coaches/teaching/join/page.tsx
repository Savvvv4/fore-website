import type { Metadata } from 'next';
import CoachSignup from '../../../../src/coach/CoachSignup';
import '../../../../src/coach/coach.css';

export const metadata: Metadata = {
  title: 'Create Your Coach Profile',
  description: 'Create your Fore coach profile in two short steps.',
  alternates: { canonical: '/coaches/teaching/join' },
};

export default function TeachingJoinPage() {
  return <CoachSignup type="teaching" />;
}

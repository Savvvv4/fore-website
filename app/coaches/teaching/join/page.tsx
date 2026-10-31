import type { Metadata } from 'next';
import CoachSignup from '../../../../src/coach/CoachSignup';

export const metadata: Metadata = {
  title: 'Create Your Coach Profile',
  description: 'Create your Fore coach profile in about five minutes and get listed in the Fore coach directory.',
  alternates: { canonical: '/coaches/teaching/join' },
};

export default function TeachingJoinPage() {
  return <CoachSignup type="teaching" />;
}

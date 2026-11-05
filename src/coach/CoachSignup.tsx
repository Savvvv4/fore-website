'use client';
import { SiteShell } from '../App';
import { CoachSignupForm } from '../signup/SignupFlows';
export default function CoachSignup({ type }: { type?: 'teaching' | 'performance' }) {
  return <SiteShell page="coaches"><CoachSignupForm fixedType={type}/></SiteShell>;
}

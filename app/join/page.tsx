import type { Metadata } from 'next';
import { RoleChooserPage } from '../../src/signup/SignupFlows';
export const metadata: Metadata = { title: 'Join ForeSports', description: 'Choose how you are joining ForeSports.', alternates: { canonical: '/join' } };
export default function JoinPage() { return <RoleChooserPage />; }

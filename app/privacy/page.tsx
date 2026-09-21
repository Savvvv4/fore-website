import type { Metadata } from 'next'; import App from '../../src/App';
export const metadata: Metadata = { title: 'Privacy Policy', description: 'Read the ForeSports website privacy policy.', alternates: { canonical: '/privacy' } };
export default function PrivacyPage() { return <App page="privacy" />; }

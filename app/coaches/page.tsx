import type { Metadata } from 'next'; import App from '../../src/App';
export const metadata: Metadata = { title: 'For Golf Coaches', description: 'Give your golf coaching business a modern home for discovery, bookings, and reputation with Fore.', alternates: { canonical: '/coaches' } };
export default function CoachesPage() { return <App page="coaches" />; }

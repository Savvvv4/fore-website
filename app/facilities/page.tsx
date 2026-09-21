import type { Metadata } from 'next'; import App from '../../src/App';
export const metadata: Metadata = { title: 'For Golf Facilities', description: 'Help golfers discover your facility, fill availability, and manage operations with Fore.', alternates: { canonical: '/facilities' } };
export default function FacilitiesPage() { return <App page="facilities" />; }

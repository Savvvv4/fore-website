import type { Metadata } from 'next'; import App from '../../src/App';
export const metadata: Metadata = { title: 'For Golfers', description: 'Discover places to play, coaches to learn from, and opportunities that fit your game with Fore.', alternates: { canonical: '/golfers' } };
export default function GolfersPage() { return <App page="golfers" />; }

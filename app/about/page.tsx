import type { Metadata } from 'next'; import App from '../../src/App';
export const metadata: Metadata = { title: 'About', description: 'Learn why ForeSports is building a more connected golf ecosystem, starting in India.', alternates: { canonical: '/about' } };
export default function AboutPage() { return <App page="about" />; }

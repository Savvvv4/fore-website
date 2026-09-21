import type { Metadata } from 'next'; import App from '../src/App';
export const metadata: Metadata = { title: 'Page Not Found', robots: { index: false, follow: true } };
export default function NotFound() { return <App page="not-found" />; }

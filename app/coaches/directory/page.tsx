import type { Metadata } from 'next';
import { SiteShell } from '../../../src/App';
import CoachDirectory from '../../../src/coach/CoachDirectory';
import { getApprovedCoaches } from '../../../src/coach/data';
import '../../../src/coach/coach.css';

// Newly approved coaches appear within a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Find a Golf Coach',
  description: 'Browse ForeSports golf coaches in India by city, speciality and coaching format. Every profile is reviewed before it goes live.',
  alternates: { canonical: '/coaches/directory' },
  openGraph: {
    title: 'Find a golf coach | ForeSports',
    description: 'Browse ForeSports golf coaches in India by city, speciality and coaching format.',
    url: '/coaches/directory',
  },
};

export default async function CoachDirectoryPage() {
  const { coaches, ok } = await getApprovedCoaches();
  return (
    <SiteShell>
      <CoachDirectory coaches={coaches} ok={ok} />
    </SiteShell>
  );
}

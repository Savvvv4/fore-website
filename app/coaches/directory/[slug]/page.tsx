import type { Metadata } from 'next';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteShell } from '../../../../src/App';
import CoachProfileView from '../../../../src/coach/CoachProfileView';
import EnquiryForm from '../../../../src/coach/EnquiryForm';
import { getCoachBySlug } from '../../../../src/coach/data';
import { lowestPrice } from '../../../../src/coach/shared';
import '../../../../src/coach/coach.css';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coach = await getCoachBySlug(slug);
  if (!coach) return { title: 'Coach not found', robots: { index: false } };
  const name = `${coach.firstName} ${coach.lastName}`;
  const description =
    coach.bio.slice(0, 155) ||
    `${name} is a golf coach in ${coach.city}${coach.specialties.length ? ` specialising in ${coach.specialties.slice(0, 3).join(', ').toLowerCase()}` : ''}.`;
  return {
    title: `${name}, Golf Coach in ${coach.city}`,
    description,
    alternates: { canonical: `/coaches/directory/${coach.slug}` },
    openGraph: {
      title: `${name} · Golf coach in ${coach.city} | ForeSports`,
      description,
      url: `/coaches/directory/${coach.slug}`,
      ...(coach.photoUrl ? { images: [{ url: coach.photoUrl, width: 600, height: 600, alt: name }] } : {}),
    },
  };
}

export default async function CoachPage({ params }: Props) {
  const { slug } = await params;
  const coach = await getCoachBySlug(slug);
  if (!coach) notFound();

  const name = `${coach.firstName} ${coach.lastName}`;
  const from = lowestPrice(coach.packages);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: 'Golf coach',
    description: coach.bio || undefined,
    image: coach.photoUrl || undefined,
    address: { '@type': 'PostalAddress', addressLocality: coach.city, addressCountry: 'IN' },
    knowsAbout: coach.specialties,
    url: `https://www.foresports.in/coaches/directory/${coach.slug}`,
    ...(from ? { makesOffer: { '@type': 'Offer', priceCurrency: 'INR', price: from, description: 'Golf lessons' } } : {}),
  };

  return (
    <SiteShell>
      <div className="cb-scope cb-dir cb-dir-profile">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <div className="cb-dir-wrap">
          <nav className="cb-crumbs" aria-label="Breadcrumb">
            <NextLink href="/coaches/directory"><ArrowLeft size={14} /> All coaches</NextLink>
          </nav>
          <CoachProfileView
            coach={coach}
            headingLevel="h1"
            badge={coach.foundingCoach ? 'Founding coach' : undefined}
            aside={<EnquiryForm coachId={coach.id} coachFirstName={coach.firstName} />}
          />
        </div>
      </div>
    </SiteShell>
  );
}

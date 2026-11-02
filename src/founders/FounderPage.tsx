import NextLink from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { founders, type FounderSlug } from './data';

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.6l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z"/>
    </svg>
  );
}

export default function FounderPage({ slug }: { slug: FounderSlug }) {
  const f = founders[slug];
  const other = founders[slug === 'savdeep' ? 'itish' : 'savdeep'];
  const waText = encodeURIComponent(`Hi ${f.firstName}, I found you on foresports.in and wanted to get in touch.`);
  const waHref = `https://wa.me/${f.whatsapp}?text=${waText}`;
  const mailHref = `mailto:${f.email}?subject=${encodeURIComponent(`Hello ${f.firstName}`)}`;

  return (
    <>
      <section className="fp-hero">
        <div className="container fp-hero-grid">
          <div className="fp-hero-copy">
            <h1>{f.name}</h1>
            <p className="fp-role">{f.role}</p>
            <p className="fp-headline">{f.headline}</p>
            <div className="fp-actions">
              <a className="button acid" href={waHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon /> Message on WhatsApp
              </a>
              <a className="button light" href={mailHref}>
                <Mail size={18} /> Email {f.firstName}
              </a>
            </div>
          </div>
          <div className="founder-photo fp-photo">
            <img src={f.photo.src} alt={f.name} className={`founder-photo-img ${f.photoClass ?? ''}`} />
          </div>
        </div>
      </section>

      <section className="section fp-story-section">
        <div className="container about-split">
          <div>
            <h2 className="about-split-h2">Why I'm building <span>FORE.</span></h2>
          </div>
          <div className="about-split-copy founder-text">
            {f.story.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>Meet my partner.</h2></div>
          </div>
          <NextLink href={`/${other.slug}`} className="fp-other founder-card">
            <div className="fp-other-photo">
              <img src={other.photo.src} alt={other.name} className={`founder-photo-img ${other.photoClass ?? ''}`} />
            </div>
            <div className="founder-story">
              <h3>{other.name}</h3>
              <small>{other.role}</small>
              <p className="fp-other-intro">{other.intro}</p>
              <span className="fp-other-link">Read {other.firstName}'s story <ArrowUpRight size={16} /></span>
            </div>
          </NextLink>
        </div>
      </section>
    </>
  );
}

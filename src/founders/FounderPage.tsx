import NextLink from 'next/link';
import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { founders, type FounderSlug } from './data';

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
            <div className="section-label"><span />Founder · ForeSports</div>
            <h1>{f.name}</h1>
            <p className="fp-role">{f.role}</p>
            <p className="fp-headline">{f.headline}</p>
            <div className="fp-actions">
              <a className="button acid" href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> Message on WhatsApp
              </a>
              <a className="button light" href={mailHref}>
                <Mail size={18} /> Email {f.firstName}
              </a>
            </div>
            <p className="fp-email">{f.email}</p>
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
            <div><h2>Two perspectives. <span>One idea.</span></h2></div>
          </div>
          <NextLink href={`/${other.slug}`} className="fp-other founder-card">
            <div className="fp-other-photo">
              <img src={other.photo.src} alt={other.name} className={`founder-photo-img ${other.photoClass ?? ''}`} />
            </div>
            <div className="founder-story">
              <h3>{other.name}</h3>
              <small>{other.role}</small>
              <p className="fp-other-intro">{other.intro}</p>
              <span className="fp-other-link">Meet {other.firstName} <ArrowUpRight size={16} /></span>
            </div>
          </NextLink>
        </div>
      </section>

      <section className="about-end">
        <div className="container">
          <h2>If you're part of golf,<br /><span>you're part of FORE.</span></h2>
          <div className="about-end-lines">
            <p>You might be a golfer, a parent, a coach or a facility.</p>
            <p>Wherever you are in golf, there is a place for you here.</p>
          </div>
          <div className="fp-actions fp-actions--center">
            <a className="button acid" href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> Message {f.firstName} on WhatsApp
            </a>
            <a className="button light" href={mailHref}>
              <Mail size={18} /> Send an email
            </a>
          </div>
          <div className="about-sign">— {f.firstName}</div>
        </div>
      </section>
    </>
  );
}

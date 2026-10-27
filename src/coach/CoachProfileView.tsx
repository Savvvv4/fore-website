import type { ReactNode } from 'react';
import { BadgeCheck, Check, MapPin } from 'lucide-react';
import {
  type CoachView,
  WEEKDAYS,
  cheapestPackage,
  coachHeadline,
  formatDays,
  formatHours,
  formatINR,
  initials,
} from './shared';

type Props = {
  coach: CoachView;
  /** Small pill beside the name, e.g. "Founding coach". */
  badge?: string;
  /** Content of the sticky side card under the price (the enquiry form). */
  aside?: ReactNode;
  /** Shows placeholder hints for empty sections (used while a coach builds their profile). */
  draft?: boolean;
  headingLevel?: 'h1' | 'h2';
};

export default function CoachProfileView({ coach: p, badge, aside, draft = false, headingLevel = 'h2' }: Props) {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const first = p.firstName || 'this coach';
  const priced = p.packages.filter((x) => x.price != null && x.price > 0);
  const cheapest = cheapestPackage(p.packages);
  const Heading = headingLevel;
  const headline = coachHeadline(p);
  const days = formatDays(p.days);
  const hours = formatHours(p.startTime, p.endTime);

  const price = (
    <div className="cp-price">
      {cheapest ? (
        <>
          <span>From</span>
          <strong>{formatINR(cheapest.price)}</strong>
          <small>{cheapest.name}</small>
        </>
      ) : (
        <strong className="cp-price-ask">{draft ? 'Add your prices' : 'Prices on request'}</strong>
      )}
    </div>
  );

  return (
    <article className="cp">
      <div className="cp-main">
        <header className="cp-head">
          <div className="cp-photo">
            {p.photoUrl ? <img src={p.photoUrl} alt={name ? `${name}, golf coach` : ''} /> : <span>{initials(p.firstName, p.lastName)}</span>}
          </div>
          <div className="cp-id">
            {badge && <span className="cl-badge">{badge}</span>}
            <Heading>
              {name || 'Your name'}
              {p.verified && <BadgeCheck size={22} className="cl-verified" aria-label="Verified by Fore" />}
            </Heading>
            {headline && <p className="cp-headline">{headline}</p>}
            {(p.city || draft) && (
              <p className="cp-loc"><MapPin size={15} aria-hidden="true" /> {[p.city || 'Your city', p.venue].filter(Boolean).join(' · ')}</p>
            )}
          </div>
        </header>

        <dl className="cp-facts">
          <div><dt>Experience</dt><dd>{p.yearsCoaching != null ? `${p.yearsCoaching} yrs` : '—'}</dd></div>
          <div><dt>Lessons from</dt><dd>{cheapest ? formatINR(cheapest.price) : 'On request'}</dd></div>
          <div><dt>Available</dt><dd>{days || '—'}</dd></div>
        </dl>

        {(p.bio || draft) && (
          <section className="cp-section">
            <h3>About {p.firstName || 'you'}</h3>
            <p className={`cp-bio${p.bio ? '' : ' is-empty'}`}>{p.bio || 'Your introduction appears here. Tell golfers about your background and how you coach.'}</p>
          </section>
        )}

        <section className="cp-section">
          <h3>Specialities</h3>
          <div className="cp-tags">
            {p.specialties.length ? p.specialties.map((x) => <span key={x}>{x}</span>) : <em>Pick your specialities to show them here.</em>}
          </div>
        </section>

        {(priced.length > 0 || draft) && (
          <section className="cp-section">
            <h3>Lessons & packages</h3>
            {priced.length ? (
              <ul className="cp-packages">
                {priced.map((x) => (
                  <li key={x.name}>
                    <div>
                      <strong>{x.name}</strong>
                      {x.detail && <span>{x.detail}</span>}
                    </div>
                    <b>{formatINR(x.price)}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <em>Add a price to show your lessons here.</em>
            )}
          </section>
        )}

        {p.formats.length > 0 && (
          <section className="cp-section">
            <h3>How {first} coaches</h3>
            <div className="cp-tags is-plain">{p.formats.map((x) => <span key={x}>{x}</span>)}</div>
          </section>
        )}

        {p.certifications.length > 0 && (
          <section className="cp-section">
            <h3>Qualifications</h3>
            <ul className="cp-creds">
              {p.certifications.map((x) => (
                <li key={x}><Check size={16} aria-hidden="true" /> {x}</li>
              ))}
            </ul>
            {p.verified && <p className="cp-verified-note"><BadgeCheck size={15} aria-hidden="true" /> Checked by the Fore team</p>}
          </section>
        )}

        {(p.days.length > 0 || draft) && (
          <section className="cp-section">
            <h3>Availability</h3>
            <div className="cp-days">
              {WEEKDAYS.map((x) => (
                <span className={p.days.includes(x) ? 'on' : ''} key={x} aria-label={`${x}${p.days.includes(x) ? ' available' : ' unavailable'}`}>{x}</span>
              ))}
            </div>
            {hours && <p className="cp-hours">Sessions {hours}</p>}
          </section>
        )}
      </div>

      <aside className="cp-side">
        <div className="cp-book">
          {price}
          {aside}
        </div>
      </aside>

      {!draft && (
        <div className="cp-mobile-bar">
          {price}
          <a className="cb-button cb-primary" href="#enquire">Message {p.firstName}</a>
        </div>
      )}
    </article>
  );
}

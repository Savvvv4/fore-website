import type { ReactNode } from 'react';
import { BadgeCheck, Check } from 'lucide-react';
import { type CoachView, WEEKDAYS, formatDays, formatINR, formatTime, initials } from './shared';

type Props = {
  coach: CoachView;
  /** Small pill in the header, e.g. "Draft preview" or "Founding coach". */
  badge?: string;
  /** Extra sidebar card below availability (next step, enquiry form). */
  aside?: ReactNode;
  /** Shows placeholder hints for empty sections (used while a coach builds their profile). */
  draft?: boolean;
  headingLevel?: 'h1' | 'h2';
};

export default function CoachProfileView({ coach: p, badge, aside, draft = false, headingLevel = 'h2' }: Props) {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const pricedPackages = p.packages.filter((x) => x.price != null && x.price > 0);
  const Heading = headingLevel;
  const subtitle = ['Golf coach', p.yearsCoaching != null ? `${p.yearsCoaching} years coaching` : '', p.playingLevel].filter(Boolean).join(' · ');

  return (
    <article className="cb-profile">
      <div className="cb-cover" />
      <header className="cb-profile-head">
        <div className="cb-avatar">
          {p.photoUrl ? <img src={p.photoUrl} alt={name ? `${name}, golf coach` : ''} /> : initials(p.firstName, p.lastName)}
        </div>
        <div>
          <Heading>
            {name || 'Your name'}
            {p.verified && (
              <span className="cb-verified" title="Credentials verified by ForeSports">
                <BadgeCheck size={20} aria-label="Verified" />
              </span>
            )}
          </Heading>
          <p>{subtitle}</p>
          <span>
            {p.city || (draft ? 'Your city' : '')}
            {p.venue ? ' · ' + p.venue : ''}
          </span>
        </div>
        {badge && <small>{badge}</small>}
      </header>

      <div className="cb-stats">
        <div><strong>{p.yearsCoaching ?? '—'}</strong><span>Years coaching</span></div>
        <div><strong>{p.specialties.length}</strong><span>Specialities</span></div>
        <div><strong>{p.certifications.length}</strong><span>Credentials listed</span></div>
        <div><strong>{p.days.length}</strong><span>Days available</span></div>
      </div>

      <div className="cb-preview-grid">
        <div>
          {(p.bio || draft) && (
            <section className="cb-card">
              <h3>About</h3>
              <p>{p.bio || 'Your introduction will appear here. Tell golfers about your coaching experience and approach.'}</p>
            </section>
          )}

          <section className="cb-card">
            <h3>Specialities</h3>
            <div className="cb-chips">
              {p.specialties.length ? p.specialties.map((x) => <span key={x}>{x}</span>) : <em>Add your coaching specialities in the editor.</em>}
            </div>
          </section>

          {(p.certifications.length > 0 || draft) && (
            <section className="cb-card">
              <h3>Certifications & memberships</h3>
              {p.certifications.length ? (
                p.certifications.map((x) => (
                  <p className="cb-credential" key={x}>
                    <Check size={15} />
                    {x}
                    <small>{p.verified ? 'Verified by ForeSports' : 'Listed by coach · Verification pending'}</small>
                  </p>
                ))
              ) : (
                <em>No credentials added yet.</em>
              )}
            </section>
          )}

          {(pricedPackages.length > 0 || draft) && (
            <section className="cb-card">
              <h3>Coaching packages</h3>
              <div className="cb-preview-packages">
                {pricedPackages.map((x) => (
                  <div key={x.name}>
                    <span>{x.name}</span>
                    <strong>{formatINR(x.price)}</strong>
                    <p>{x.detail}</p>
                  </div>
                ))}
                {!pricedPackages.length && <em>Add package prices to show them here.</em>}
              </div>
              {!draft && <p className="cb-card-note">Indicative prices set by the coach.</p>}
            </section>
          )}
        </div>

        <aside>
          <section className="cb-card">
            <h3>Availability</h3>
            <div className="cb-days">
              {WEEKDAYS.map((x) => (
                <span className={p.days.includes(x) ? 'chosen' : ''} key={x} aria-label={`${x}${p.days.includes(x) ? ' available' : ' unavailable'}`}>
                  {x[0]}
                </span>
              ))}
            </div>
            <p>
              {p.days.length ? formatDays(p.days) : 'Days not selected'}
              {p.startTime && p.endTime && (
                <>
                  <br />
                  {formatTime(p.startTime)} – {formatTime(p.endTime)}
                </>
              )}
            </p>
            {p.formats.length > 0 && (
              <div className="cb-preview-formats">
                {p.formats.map((x) => <span key={x}>{x}</span>)}
              </div>
            )}
          </section>
          {aside}
        </aside>
      </div>
    </article>
  );
}

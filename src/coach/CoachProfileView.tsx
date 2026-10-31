import type { ReactNode } from 'react';
import { BadgeCheck, Check, Clock, Languages, MapPin } from 'lucide-react';
import { CoverArt } from './art';
import { type CoachView, WEEKDAYS, formatDays, formatINR, formatTime, headlineCredential, initials } from './shared';

type Props = {
  coach: CoachView;
  /** Small pill in the header, e.g. "Preview" or "Founding coach". */
  badge?: string;
  /** Sidebar card below availability (enquiry form, next step). */
  aside?: ReactNode;
  /** Shows placeholder hints for empty sections (used while a coach builds their profile). */
  draft?: boolean;
  headingLevel?: 'h1' | 'h2';
};

export default function CoachProfileView({ coach: p, badge, aside, draft = false, headingLevel = 'h2' }: Props) {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const first = p.firstName || 'this coach';
  const priced = p.packages.filter((x) => x.price != null && x.price > 0);
  const Heading = headingLevel;
  const credential = headlineCredential(p);
  const meta = [credential || 'Golf coach', p.yearsCoaching != null ? `${p.yearsCoaching} years coaching` : '', p.playingLevel].filter(Boolean).join(' · ');
  const place = [p.venue, p.city].filter(Boolean).join(', ');

  return (
    <article className="cb-profile">
      <div className="cb-cover"><CoverArt wide variant={(p.firstName.length + p.lastName.length) % 4} /></div>
      <header className="cb-profile-head">
        <div className="cb-avatar">
          {p.photoUrl ? <img src={p.photoUrl} alt={name ? `${name}, golf coach` : ''} /> : initials(p.firstName, p.lastName)}
        </div>
        <div className="cb-profile-id">
          <Heading>
            {name || 'Your name'}
            {p.verified && (
              <span className="cb-verified" title="Credentials verified by ForeSports">
                <BadgeCheck size={22} aria-label="Verified" />
              </span>
            )}
          </Heading>
          <p>{meta}</p>
          <span className="cb-profile-place"><MapPin size={14} aria-hidden="true" />{place || (draft ? 'Where you teach' : '')}</span>
        </div>
        {badge && <small className="cb-profile-badge">{badge}</small>}
      </header>

      <dl className="cb-stats">
        <div><dt>Years coaching</dt><dd>{p.yearsCoaching ?? '—'}</dd></div>
        <div><dt>Credentials</dt><dd>{p.certifications.length}</dd></div>
        <div><dt>Languages</dt><dd>{p.languages.length || '—'}</dd></div>
        <div><dt>Teaching days</dt><dd>{p.days.length || '—'}</dd></div>
      </dl>

      <div className="cb-preview-grid">
        <div>
          {(p.bio || draft) && (
            <section className="cb-card" id="about">
              <h3>About {first}</h3>
              <p className="cb-bio">{p.bio || 'Your introduction will appear here. Tell golfers how you coach and who you work best with.'}</p>
              {p.languages.length > 0 && (
                <p className="cb-inline-meta"><Languages size={15} aria-hidden="true" /> Teaches in {p.languages.join(', ')}</p>
              )}
            </section>
          )}

          <section className="cb-card">
            <h3>What {first === 'this coach' ? 'they help' : `${first} helps`} with</h3>
            <div className="cb-chips">
              {p.specialties.length ? p.specialties.map((x) => <span key={x}>{x}</span>) : <em>Add your coaching specialities.</em>}
            </div>
          </section>

          {(priced.length > 0 || draft) && (
            <section className="cb-card" id="lessons">
              <h3>Lessons</h3>
              <div className="cb-lessons">
                {priced.map((x, i) => (
                  <div key={x.name} className={i === 0 && /trial/i.test(x.name) ? 'is-trial' : ''}>
                    <div>
                      <strong>{x.name}</strong>
                      {x.detail && <p>{x.detail}</p>}
                    </div>
                    <b>{formatINR(x.price)}</b>
                  </div>
                ))}
                {!priced.length && <em>Add lesson prices to show them here.</em>}
              </div>
              {p.formats.length > 0 && (
                <div className="cb-format-row">
                  {p.formats.map((x) => <span key={x}><Check size={13} aria-hidden="true" />{x}</span>)}
                </div>
              )}
              {!draft && <p className="cb-card-note">Prices set by {first}.</p>}
            </section>
          )}

          {(p.certifications.length > 0 || p.tools.length > 0 || draft) && (
            <section className="cb-card" id="credentials">
              <h3>Credentials</h3>
              {p.certifications.length ? (
                <ul className="cb-credentials">
                  {p.certifications.map((x) => (
                    <li key={x}>
                      <span className={p.verified ? 'ok' : ''}>{p.verified ? <BadgeCheck size={16} /> : <Check size={15} />}</span>
                      <div>
                        <strong>{x}</strong>
                        <small>{p.verified ? 'Verified by ForeSports' : 'Listed by the coach · verification pending'}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <em>No credentials added yet.</em>
              )}
              {p.tools.length > 0 && (
                <>
                  <h4>Teaches with</h4>
                  <div className="cb-chips">{p.tools.map((x) => <span key={x}>{x}</span>)}</div>
                </>
              )}
            </section>
          )}

          <section className="cb-card cb-howto">
            <h3>Getting started with {first}</h3>
            <ol>
              <li><span>1</span><div><strong>Send an enquiry</strong>Tell {first} about your game and what you’d like to work on.</div></li>
              <li><span>2</span><div><strong>Hear back by email</strong>Fore passes your message on. Your details aren’t shown publicly.</div></li>
              <li><span>3</span><div><strong>Book your first lesson</strong>Agree a time that suits you both{priced.some((x) => /trial/i.test(x.name)) ? ', starting with a trial' : ''}.</div></li>
            </ol>
          </section>
        </div>

        <aside className="cb-profile-aside">
          <section className="cb-card" id="availability">
            <h3>When {first === 'this coach' ? 'they teach' : `${first} teaches`}</h3>
            <div className="cb-days">
              {WEEKDAYS.map((x) => (
                <span className={p.days.includes(x) ? 'chosen' : ''} key={x} aria-label={`${x}${p.days.includes(x) ? ' available' : ' unavailable'}`}>
                  {x[0]}
                </span>
              ))}
            </div>
            <p className="cb-inline-meta">
              <Clock size={15} aria-hidden="true" />
              {p.days.length ? formatDays(p.days) : 'Days not selected'}
              {p.startTime && p.endTime ? `, ${formatTime(p.startTime)} – ${formatTime(p.endTime)}` : ''}
            </p>
          </section>
          {aside}
        </aside>
      </div>
    </article>
  );
}

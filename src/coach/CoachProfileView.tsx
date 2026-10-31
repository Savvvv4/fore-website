import type { ReactNode } from 'react';
import { BadgeCheck, Check, MapPin } from 'lucide-react';
import { CoverArt } from './art';
import { type CoachView, formatDays, formatINR, formatTime, headlineCredential, initials } from './shared';

type Props = {
  coach: CoachView;
  /** Sidebar content: the enquiry form, or a note while previewing. */
  aside?: ReactNode;
  /** Shows hints for empty sections while a coach builds their profile. */
  draft?: boolean;
  headingLevel?: 'h1' | 'h2';
};

/** ["Beginners", "Short game"] → "Beginners and short game". `lower` keeps later items lower-case mid-sentence. */
function listSentence(items: string[], lower = false): string {
  const list = lower ? items.map((x, i) => (i > 0 && !/[A-Z].*[A-Z]/.test(x) ? x.toLowerCase() : x)) : items;
  if (list.length < 2) return list[0] ?? '';
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

export default function CoachProfileView({ coach: p, aside, draft = false, headingLevel = 'h2' }: Props) {
  const Heading = headingLevel;
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const first = p.firstName || 'Your coach';
  const priced = p.packages.filter((x) => x.price != null && x.price > 0);
  const meta = [headlineCredential(p) || 'Golf coach', p.yearsCoaching != null ? `${p.yearsCoaching} years coaching` : '', p.playingLevel].filter(Boolean).join(' · ');
  const place = [p.venue, p.city].filter(Boolean).join(', ');
  const hours = p.startTime && p.endTime ? `${formatTime(p.startTime)} to ${formatTime(p.endTime)}` : '';

  return (
    <article className="cp">
      <div className="cp-cover"><CoverArt wide variant={(p.firstName.length + p.lastName.length) % 4} /></div>
      <header className="cp-head">
        <span className="cp-avatar">{p.photoUrl ? <img src={p.photoUrl} alt={name ? `${name}, golf coach` : ''} /> : initials(p.firstName, p.lastName)}</span>
        <div>
          <Heading className="cp-name">
            {name || 'Your name'}
            {p.verified && <BadgeCheck size={22} className="cp-verified" aria-label="Verified by Fore" />}
          </Heading>
          <p className="cp-meta">{meta}</p>
          {(place || draft) && <p className="cp-place"><MapPin size={15} aria-hidden="true" />{place || 'Where you teach'}</p>}
        </div>
      </header>

      <div className="cp-grid">
        <div className="cp-main">
          {(p.bio || draft) && (
            <section>
              <h2>About</h2>
              <p className="cp-bio">{p.bio || 'Tell golfers how you coach and who you work best with.'}</p>
              {p.languages.length > 0 && <p className="cp-small">Teaches in {listSentence(p.languages)}.</p>}
            </section>
          )}

          {(priced.length > 0 || draft) && (
            <section>
              <h2>Lessons</h2>
              {priced.length ? (
                <ul className="cp-lessons">
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
                <p className="cp-small">Add prices to show your lessons here.</p>
              )}
              {p.formats.length > 0 && <p className="cp-small">{listSentence(p.formats, true)}.</p>}
            </section>
          )}

          <section>
            <h2>Helps with</h2>
            <p>{p.specialties.length ? `${listSentence(p.specialties, true)}.` : 'Add what you teach best.'}</p>
          </section>

          {(p.certifications.length > 0 || draft) && (
            <section>
              <h2>Qualifications</h2>
              {p.certifications.length ? (
                <ul className="cp-quals">
                  {p.certifications.map((x) => (
                    <li key={x}>
                      {p.verified ? <BadgeCheck size={17} className="cp-verified" aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                      <span>{x}{!p.verified && <small> · being checked</small>}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cp-small">Add your qualifications.</p>
              )}
              {p.tools.length > 0 && <p className="cp-small">Teaches with {listSentence(p.tools)}.</p>}
            </section>
          )}

          {p.days.length > 0 && (
            <section>
              <h2>When {first === 'Your coach' ? 'they' : first} teach{first === 'Your coach' ? '' : 'es'}</h2>
              <p>{formatDays(p.days)}{hours ? `, ${hours}` : ''}</p>
            </section>
          )}
        </div>
        {aside && <aside className="cp-aside">{aside}</aside>}
      </div>
    </article>
  );
}

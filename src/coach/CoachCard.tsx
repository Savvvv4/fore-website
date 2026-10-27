import NextLink from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, MapPin } from 'lucide-react';
import { cheapestPackage, coachHeadline, formatDays, formatHours, formatINR, initials, type CoachView } from './shared';

type Props = {
  coach: CoachView & { slug?: string; foundingCoach?: boolean };
  /** Links the whole card to the coach's profile. Without it the card is static (sign-up preview). */
  href?: string;
  /** Placeholder text for empty fields while a coach builds their profile. */
  draft?: boolean;
};

/**
 * Directory listing card. Uses a container query, so the same card lays out as a
 * wide row in the directory and stacks in narrow columns (sign-up preview, phones).
 */
export default function CoachCard({ coach: c, href, draft = false }: Props) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || (draft ? 'Your name' : '');
  const headline = coachHeadline(c) || (draft ? 'Years coaching' : '');
  const pkg = cheapestPackage(c.packages);
  const shown = c.specialties.slice(0, 3);
  const more = c.specialties.length - shown.length;
  const days = formatDays(c.days);
  const hours = formatHours(c.startTime, c.endTime);
  const location = [c.city || (draft ? 'Your city' : ''), c.venue].filter(Boolean).join(' · ');

  const body = (
    <div className="cl-grid">
      <div className="cl-media">
        {c.photoUrl ? <img src={c.photoUrl} alt="" loading="lazy" /> : <span>{initials(c.firstName, c.lastName)}</span>}
      </div>

      <div className="cl-main">
        <div className="cl-title">
          <h2>
            {name}
            {c.verified && <BadgeCheck size={18} className="cl-verified" aria-label="Verified by Fore" />}
          </h2>
          {c.foundingCoach && <span className="cl-badge">Founding coach</span>}
        </div>
        {headline && <p className="cl-headline">{headline}</p>}
        {location && <p className="cl-loc"><MapPin size={14} aria-hidden="true" /> {location}</p>}

        {c.bio ? (
          <p className="cl-bio">{c.bio}</p>
        ) : draft ? (
          <p className="cl-bio is-empty">A few lines about how you coach appear here.</p>
        ) : null}

        <div className="cl-tags">
          {shown.length ? shown.map((s) => <span key={s}>{s}</span>) : draft && <span className="is-empty">Your specialities</span>}
          {more > 0 && <span className="more">+{more} more</span>}
        </div>
      </div>

      <div className="cl-side">
        <div className="cl-price">
          {pkg ? (
            <>
              <span>From</span>
              <strong>{formatINR(pkg.price)}</strong>
              <small>{pkg.name.toLowerCase()}</small>
            </>
          ) : (
            <>
              <span>Lessons</span>
              <strong className="cl-price-ask">{draft ? '₹ —' : 'On request'}</strong>
            </>
          )}
        </div>
        {(days || c.formats.length > 0) && (
          <ul className="cl-meta">
            {days && <li><CalendarDays size={14} aria-hidden="true" /> {days}{hours ? `, ${hours}` : ''}</li>}
            {c.formats.slice(0, 2).map((f) => <li key={f} className="cl-format">{f}</li>)}
          </ul>
        )}
        <span className="cl-cta">View profile <ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </div>
  );

  return href ? (
    <NextLink href={href} className="cl-card is-link" aria-label={`${name}, golf coach in ${c.city}. View profile`}>
      {body}
    </NextLink>
  ) : (
    <div className="cl-card">{body}</div>
  );
}

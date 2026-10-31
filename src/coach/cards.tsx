import { ArrowRight, BadgeCheck, MapPin } from 'lucide-react';
import { headlineCredential, initials, priceLine, type CoachListing } from './shared';

/** A coach's card in Find a coach. */
export function CoachCardView({ coach: c }: { coach: CoachListing }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  const performance = c.coachType === 'performance';
  const price = performance ? null : priceLine(c);
  const meta = [
    performance ? c.programRole || 'Performance coach' : headlineCredential(c),
    c.yearsCoaching != null ? `${c.yearsCoaching} yrs coaching` : '',
  ].filter(Boolean).join(' · ');
  const teaches = (performance && c.playerGroups.length ? c.playerGroups : c.specialties).slice(0, 3).join(' · ');
  const place = [c.venue, c.city].filter(Boolean).join(', ');

  return (
    <div className="cc">
      <div className="cc-head">
        <span className="cc-avatar">{c.photoUrl ? <img src={c.photoUrl} alt="" loading="lazy" /> : initials(c.firstName, c.lastName)}</span>
        <div className="cc-id">
          <h2 className="cc-name">
            {name}
            {c.verified && <BadgeCheck size={17} className="cc-verified" aria-label="Verified" />}
          </h2>
          <p className="cc-meta">{meta || 'Golf coach'}</p>
        </div>
      </div>
      {teaches && <p className="cc-teach">{teaches}</p>}
      {place && <p className="cc-loc"><MapPin size={14} aria-hidden="true" />{place}</p>}
      <div className="cc-foot">
        <span className="cc-price">
          {price ? <><small>{price.label}</small> {price.value}</> : <small>{performance ? c.programName || 'Squad coaching' : 'Price on request'}</small>}
        </span>
        <span className="cc-go">View <ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </div>
  );
}

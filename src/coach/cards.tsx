import { ArrowRight, BadgeCheck, MapPin, Users } from 'lucide-react';
import { headlineCredential, initials, priceLine, type CoachListing, type CoachView } from './shared';

function Avatar({ coach: c }: { coach: Pick<CoachView, 'photoUrl' | 'firstName' | 'lastName'> }) {
  return <span className="cc-avatar">{c.photoUrl ? <img src={c.photoUrl} alt="" loading="lazy" /> : initials(c.firstName, c.lastName)}</span>;
}

/** A teaching pro's card in Find a coach. Also the live preview while a coach builds their profile. */
export function CoachCardView({ coach: c, draft = false }: { coach: CoachListing; draft?: boolean }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your name';
  const price = priceLine(c);
  const meta = [headlineCredential(c), c.yearsCoaching != null ? `${c.yearsCoaching} yrs coaching` : ''].filter(Boolean).join(' · ');
  const teaches = c.specialties.slice(0, 3).join(' · ');
  const place = [c.venue, c.city].filter(Boolean).join(', ');

  return (
    <div className="cc">
      <div className="cc-head">
        <Avatar coach={c} />
        <div className="cc-id">
          <h2 className="cc-name">
            {name}
            {c.verified && <BadgeCheck size={17} className="cc-verified" aria-label="Verified" />}
          </h2>
          <p className="cc-meta">{meta || 'Golf coach'}</p>
        </div>
      </div>
      <p className={`cc-teach${teaches ? '' : ' is-empty'}`}>{teaches || (draft ? 'What you teach' : 'Golf lessons')}</p>
      {(place || draft) && (
        <p className={`cc-loc${place ? '' : ' is-empty'}`}><MapPin size={14} aria-hidden="true" />{place || 'Your city'}</p>
      )}
      <div className="cc-foot">
        <span className="cc-price">
          {price ? <><small>{price.label}</small> {price.value}</> : <small>{draft ? 'Add a trial price' : 'Price on request'}</small>}
        </span>
        <span className="cc-go">{draft ? 'Enquire' : 'View'} <ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </div>
  );
}

export type Program = { role: string; name: string; squad: number | null; groups: string[]; disciplines: string[] };

/** What players and parents see when they join a performance coach's squad. */
export function ProgramCard({ coach: c, program: p }: { coach: Pick<CoachView, 'photoUrl' | 'firstName' | 'lastName' | 'city'>; program: Program }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your name';
  const line = [p.name || 'Your program', p.squad != null ? `${p.squad} players` : ''].filter(Boolean).join(' · ');
  return (
    <div className="cc">
      <div className="cc-head">
        <Avatar coach={c} />
        <div className="cc-id">
          <h2 className="cc-name">{name}</h2>
          <p className="cc-meta">{[p.role || 'Performance coach', c.city].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <p className={`cc-teach${p.name ? '' : ' is-empty'}`}>{line}</p>
      <p className={`cc-loc${p.groups.length ? '' : ' is-empty'}`}>
        <Users size={14} aria-hidden="true" />
        {p.groups.length ? p.groups.join(', ') : 'Who you coach'}
      </p>
      <div className="cc-foot">
        <span className="cc-price"><small>Coaching team</small> {(p.disciplines.length ? p.disciplines : ['Swing']).join(', ')}</span>
        <span className="cc-go">Join <ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </div>
  );
}

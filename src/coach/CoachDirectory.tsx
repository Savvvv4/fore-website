'use client';

import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { ArrowUpRight, BadgeCheck, MapPin, Search } from 'lucide-react';
import { FORMATS, SPECIALTIES, formatINR, initials, lowestPrice, type CoachListing } from './shared';

type Props = { coaches: CoachListing[]; ok: boolean };

export default function CoachDirectory({ coaches, ok }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [format, setFormat] = useState('');

  const cities = useMemo(
    () => Array.from(new Set(coaches.map((c) => c.city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [coaches],
  );
  const specialties = useMemo(() => SPECIALTIES.filter((s) => coaches.some((c) => c.specialties.includes(s))), [coaches]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coaches.filter(
      (c) =>
        (!q || [c.firstName, c.lastName, c.city, c.venue, ...c.specialties].join(' ').toLowerCase().includes(q)) &&
        (!city || c.city.trim() === city) &&
        (!specialty || c.specialties.includes(specialty)) &&
        (!format || c.formats.includes(format)),
    );
  }, [coaches, query, city, specialty, format]);

  const filtered = Boolean(query || city || specialty || format);
  const clear = () => { setQuery(''); setCity(''); setSpecialty(''); setFormat(''); };

  return (
    <div className="cb-scope cb-dir">
      <section className="cb-dir-hero">
        <div className="cb-dir-wrap">
          <div className="section-label"><span />Coach directory</div>
          <h1>Find a golf coach who fits <em>your game.</em></h1>
          <p>Browse Fore founding coaches by city, speciality and how they teach. The Fore team reviews every profile before it goes live.</p>
        </div>
      </section>

      <section className="cb-dir-wrap cb-dir-body">
        {coaches.length > 0 && (
          <div className="cb-dir-filters" role="search">
            <label className="cb-dir-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search coaches</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, course or speciality" />
            </label>
            <label>
              <span className="sr-only">City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All cities</option>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Speciality</span>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">All specialities</option>
                {specialties.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Coaching format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="">Any format</option>
                {FORMATS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
          </div>
        )}

        {coaches.length > 0 && (
          <div className="cb-dir-count" aria-live="polite">
            <span>
              {results.length} {results.length === 1 ? 'coach' : 'coaches'}
              {filtered ? ' match your filters' : ''}
            </span>
            {filtered && <button type="button" className="cb-link" onClick={clear}>Clear filters</button>}
          </div>
        )}

        {results.length > 0 ? (
          <ul className="cb-dir-grid">
            {results.map((c) => <CoachCard key={c.id} coach={c} />)}
          </ul>
        ) : coaches.length > 0 ? (
          <div className="cb-dir-empty">
            <h2>No coaches match those filters.</h2>
            <p>Try another city or speciality, or clear the filters to see everyone.</p>
            <button type="button" className="cb-button cb-outline" onClick={clear}>Clear filters</button>
          </div>
        ) : (
          <div className="cb-dir-empty">
            <h2>{ok ? 'Our first coaches are being onboarded.' : 'The coach directory is warming up.'}</h2>
            <p>The Fore team is reviewing founding coach profiles now. Check back soon, or create your own profile if you coach.</p>
            <div className="cb-done-actions">
              <NextLink className="cb-button cb-primary" href="/coach-profile">Create your coach profile <ArrowUpRight size={15} /></NextLink>
              <NextLink className="cb-button cb-outline" href="/golfers">Join as a golfer</NextLink>
            </div>
          </div>
        )}

        <aside className="cb-dir-cta">
          <div>
            <strong>Are you a golf coach?</strong>
            <p>Get on Fore early. Create your founding coach profile and get listed here before launch.</p>
          </div>
          <NextLink className="cb-button cb-primary" href="/coach-profile">Create your profile <ArrowUpRight size={15} /></NextLink>
        </aside>
      </section>
    </div>
  );
}

function CoachCard({ coach: c }: { coach: CoachListing }) {
  const name = `${c.firstName} ${c.lastName}`;
  const from = lowestPrice(c.packages);
  const shown = c.specialties.slice(0, 3);
  const more = c.specialties.length - shown.length;

  return (
    <li className="cb-dir-card">
      <NextLink href={`/coaches/directory/${c.slug}`} className="cb-dir-card-link" aria-label={`View ${name}'s coaching profile`}>
        <div className="cb-dir-card-cover" />
        <div className="cb-dir-card-head">
          <div className="cb-avatar">{c.photoUrl ? <img src={c.photoUrl} alt="" loading="lazy" /> : initials(c.firstName, c.lastName)}</div>
          {c.foundingCoach && <small>FOUNDING COACH</small>}
        </div>
        <div className="cb-dir-card-body">
          <h2>
            {name}
            {c.verified && <BadgeCheck size={17} className="cb-verified" aria-label="Verified" />}
          </h2>
          <p className="cb-dir-card-loc"><MapPin size={13} aria-hidden="true" /> {c.city}{c.venue ? ` · ${c.venue}` : ''}</p>
          <div className="cb-dir-card-chips">
            {shown.map((s) => <span key={s}>{s}</span>)}
            {more > 0 && <span className="more">+{more}</span>}
          </div>
          <dl className="cb-dir-card-facts">
            <div><dt>Experience</dt><dd>{c.yearsCoaching != null ? `${c.yearsCoaching} yrs` : '—'}</dd></div>
            <div><dt>Lessons from</dt><dd>{from ? formatINR(from) : 'On request'}</dd></div>
          </dl>
          <span className="cb-dir-card-cta">View profile <ArrowUpRight size={14} /></span>
        </div>
      </NextLink>
    </li>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Languages, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { CoverArt } from './art';
import {
  FORMATS,
  SPECIALTIES,
  completeness,
  headlineCredential,
  initials,
  priceLine,
  type CoachListing,
} from './shared';

type Props = { coaches: CoachListing[]; ok: boolean };
type Sort = 'recommended' | 'experience' | 'newest';

/** Audience filters golfers think in, mapped onto coach specialities. */
const AUDIENCES: [string, string][] = [
  ['Beginners', 'Beginners'],
  ['Juniors', 'Junior golf'],
  ['Women', 'Ladies golf'],
  ['Competitive players', 'Competition prep'],
];

function hashVariant(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function CoachDirectory({ coaches, ok }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [audience, setAudience] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [format, setFormat] = useState('');
  const [language, setLanguage] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters live in the URL so a search can be shared.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get('q') ?? '');
    setCity(p.get('city') ?? '');
    setAudience(p.get('for') ?? '');
    setSpecialty(p.get('speciality') ?? '');
    setFormat(p.get('format') ?? '');
    setLanguage(p.get('language') ?? '');
    setVerifiedOnly(p.get('verified') === '1');
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (city) p.set('city', city);
    if (audience) p.set('for', audience);
    if (specialty) p.set('speciality', specialty);
    if (format) p.set('format', format);
    if (language) p.set('language', language);
    if (verifiedOnly) p.set('verified', '1');
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [query, city, audience, specialty, format, language, verifiedOnly]);

  const cities = useMemo(
    () => Array.from(new Set(coaches.map((c) => c.city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [coaches],
  );
  const specialties = useMemo(() => SPECIALTIES.filter((s) => coaches.some((c) => c.specialties.includes(s))), [coaches]);
  const languages = useMemo(() => Array.from(new Set(coaches.flatMap((c) => c.languages))).sort(), [coaches]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = coaches.filter(
      (c) =>
        (!q || [c.firstName, c.lastName, c.city, c.venue, ...c.specialties, ...c.certifications].join(' ').toLowerCase().includes(q)) &&
        (!city || c.city.trim() === city) &&
        (!audience || c.specialties.includes(audience)) &&
        (!specialty || c.specialties.includes(specialty)) &&
        (!format || c.formats.includes(format)) &&
        (!language || c.languages.includes(language)) &&
        (!verifiedOnly || c.verified),
    );
    if (sort === 'experience') return [...list].sort((a, b) => (b.yearsCoaching ?? -1) - (a.yearsCoaching ?? -1));
    if (sort === 'newest') return list;
    return [...list].sort((a, b) => Number(b.verified) - Number(a.verified) || completeness(b) - completeness(a));
  }, [coaches, query, city, audience, specialty, format, language, verifiedOnly, sort]);

  const activeCount = [specialty, format, language, verifiedOnly ? '1' : ''].filter(Boolean).length;
  const filtered = Boolean(query || city || audience || activeCount);
  const verifiedCount = results.filter((c) => c.verified).length;
  const clear = () => {
    setQuery(''); setCity(''); setAudience(''); setSpecialty(''); setFormat(''); setLanguage(''); setVerifiedOnly(false);
  };

  return (
    <div className="cb-scope cb-dir">
      <section className="cb-dir-hero">
        <div className="cb-dir-wrap">
          <div className="section-label"><span />Coach directory</div>
          <h1>Find a golf coach who fits <em>your game.</em></h1>
          <p>Browse Fore coaches by city, speciality and how they teach. The Fore team reviews every profile before it goes live.</p>

          {coaches.length > 0 && (
            <div className="cb-dir-searchbar" role="search">
              <label className="cb-dir-q">
                <Search size={18} aria-hidden="true" />
                <span className="sr-only">Search coaches</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, course or what you want to work on" />
              </label>
              <label className="cb-dir-city">
                <MapPin size={16} aria-hidden="true" />
                <span className="sr-only">City</span>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>
      </section>

      <section className="cb-dir-wrap cb-dir-body">
        {coaches.length > 0 && (
          <>
            <div className="cb-dir-toolbar">
              <div className="cb-dir-audience" role="group" aria-label="Coaches for">
                <button type="button" className={!audience ? 'on' : ''} aria-pressed={!audience} onClick={() => setAudience('')}>All golfers</button>
                {AUDIENCES.filter(([, s]) => coaches.some((c) => c.specialties.includes(s))).map(([label, s]) => (
                  <button type="button" key={s} className={audience === s ? 'on' : ''} aria-pressed={audience === s} onClick={() => setAudience(audience === s ? '' : s)}>{label}</button>
                ))}
              </div>
              <button type="button" className={`cb-dir-filter-toggle${filtersOpen ? ' on' : ''}`} aria-expanded={filtersOpen} aria-controls="coach-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal size={15} /> Filters{activeCount ? ` · ${activeCount}` : ''}
              </button>
            </div>

            <div id="coach-filters" className={`cb-dir-filters${filtersOpen ? ' open' : ''}`}>
              <label>
                <span className="cb-label">Speciality</span>
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  <option value="">Any speciality</option>
                  {specialties.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>
                <span className="cb-label">How they teach</span>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="">Any format</option>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </label>
              {languages.length > 0 && (
                <label>
                  <span className="cb-label">Language</span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="">Any language</option>
                    {languages.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
              )}
              <label className="cb-dir-check">
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                <span>Verified credentials only</span>
              </label>
            </div>

            <div className="cb-dir-count" aria-live="polite">
              <span>
                <strong>{results.length} {results.length === 1 ? 'coach' : 'coaches'}</strong>
                {city ? ` in ${city}` : ''}
                {verifiedCount > 0 ? ` · ${verifiedCount} verified` : ''}
              </span>
              <div>
                {filtered && <button type="button" className="cb-link" onClick={clear}><X size={13} /> Clear all</button>}
                <label className="cb-dir-sort">
                  <span>Sort</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                    <option value="recommended">Recommended</option>
                    <option value="experience">Most experienced</option>
                    <option value="newest">Newest on Fore</option>
                  </select>
                </label>
              </div>
            </div>
          </>
        )}

        {results.length > 0 ? (
          <ul className="cb-dir-grid">
            {results.map((c) => (
              <li key={c.id}>
                <NextLink href={`/coaches/directory/${c.slug}`} className="cb-dir-card-link" aria-label={`View ${c.firstName} ${c.lastName}'s coaching profile`}>
                  <CoachCardView coach={c} />
                </NextLink>
              </li>
            ))}
          </ul>
        ) : coaches.length > 0 ? (
          <div className="cb-dir-empty">
            <h2>No coaches match that search yet.</h2>
            <p>Try a nearby city, a different speciality, or online video lessons from a coach anywhere in India.</p>
            <div className="cb-done-actions">
              <button type="button" className="cb-button cb-primary" onClick={clear}>Show all coaches</button>
              {format !== 'Online video analysis' && (
                <button type="button" className="cb-button cb-outline" onClick={() => { setCity(''); setFormat('Online video analysis'); }}>Try online lessons</button>
              )}
            </div>
          </div>
        ) : (
          <div className="cb-dir-empty">
            <h2>{ok ? 'Our first coaches are being onboarded.' : 'The coach directory is warming up.'}</h2>
            <p>The Fore team is reviewing coach profiles now. Join as a golfer and we’ll let you know when coaches in your city are live.</p>
            <div className="cb-done-actions">
              <NextLink className="cb-button cb-primary" href="/golfers">Join as a golfer <ArrowUpRight size={15} /></NextLink>
              <NextLink className="cb-button cb-outline" href="/coaches/teaching">I’m a coach</NextLink>
            </div>
          </div>
        )}

        <aside className="cb-dir-cta">
          <div>
            <strong>Teach golf? Get found here.</strong>
            <p>Create your Fore coach profile in about five minutes and reach golfers looking for a coach in your city.</p>
          </div>
          <NextLink className="cb-button cb-primary" href="/coaches/teaching">Fore for Teaching Pros <ArrowRight size={15} /></NextLink>
        </aside>
      </section>
    </div>
  );
}

/** A coach's directory card. Also used as the live preview while a coach signs up. */
export function CoachCardView({ coach: c, draft = false }: { coach: CoachListing; draft?: boolean }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your name';
  const price = priceLine(c);
  const credential = headlineCredential(c);
  const shown = c.specialties.slice(0, 3);
  const more = c.specialties.length - shown.length;
  const meta = [credential, c.yearsCoaching != null ? `${c.yearsCoaching} yrs coaching` : ''].filter(Boolean).join(' · ');

  return (
    <div className="cb-card-v">
      <div className="cb-card-v-cover">
        <CoverArt variant={hashVariant(c.id + c.firstName)} />
        <div className="cb-card-v-badges">
          {c.verified && <span className="verified"><BadgeCheck size={13} /> Verified</span>}
          {c.foundingCoach && <span>★ Founding coach</span>}
        </div>
        <div className="cb-avatar">{c.photoUrl ? <img src={c.photoUrl} alt="" loading="lazy" /> : initials(c.firstName, c.lastName)}</div>
      </div>
      <div className="cb-card-v-body">
        <h2>{name}</h2>
        <p className="cb-card-v-meta">{meta || (draft ? 'Your credentials · years coaching' : 'Golf coach')}</p>
        <p className="cb-card-v-loc">
          <MapPin size={13} aria-hidden="true" />
          <span>{[c.venue, c.city].filter(Boolean).join(', ') || (draft ? 'Where you teach' : '')}</span>
        </p>
        <div className="cb-card-v-chips">
          {shown.length ? shown.map((s) => <span key={s}>{s}</span>) : draft && <span className="is-empty">Your specialities</span>}
          {more > 0 && <span className="more">+{more}</span>}
        </div>
        {c.languages.length > 0 && (
          <p className="cb-card-v-lang"><Languages size={13} aria-hidden="true" /> {c.languages.join(', ')}</p>
        )}
      </div>
      <div className="cb-card-v-foot">
        <div>
          <small>{price ? price.label : 'Lessons'}</small>
          <strong>{price ? price.value : draft ? '₹ —' : 'Price on request'}</strong>
        </div>
        <span className="cb-card-v-cta">{draft ? 'Enquire' : 'View profile'} <ArrowRight size={14} /></span>
      </div>
    </div>
  );
}

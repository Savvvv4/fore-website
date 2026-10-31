'use client';

import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { CoachCardView } from './cards';
import { FORMATS, SPECIALTIES, completeness, type CoachListing } from './shared';

type Props = { coaches: CoachListing[]; ok: boolean };
type Sort = 'recommended' | 'experience' | 'newest';

/** Who the coach is for, in a golfer's words, mapped onto coach specialities. */
const LEVELS: [string, string][] = [
  ['Beginners', 'Beginners'],
  ['Juniors', 'Junior golf'],
  ['Women', 'Ladies golf'],
  ['Competitive golfers', 'Competition prep'],
];

export default function CoachDirectory({ coaches, ok }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [level, setLevel] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [format, setFormat] = useState('');
  const [language, setLanguage] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters live in the URL, so a search can be shared or bookmarked.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get('q') ?? '');
    setCity(p.get('city') ?? '');
    setLevel(p.get('for') ?? '');
    setSpecialty(p.get('speciality') ?? '');
    setFormat(p.get('format') ?? '');
    setLanguage(p.get('language') ?? '');
    setVerifiedOnly(p.get('verified') === '1');
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (city) p.set('city', city);
    if (level) p.set('for', level);
    if (specialty) p.set('speciality', specialty);
    if (format) p.set('format', format);
    if (language) p.set('language', language);
    if (verifiedOnly) p.set('verified', '1');
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [query, city, level, specialty, format, language, verifiedOnly]);

  const cities = useMemo(() => Array.from(new Set(coaches.map((c) => c.city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [coaches]);
  const levels = useMemo(() => LEVELS.filter(([, s]) => coaches.some((c) => c.specialties.includes(s))), [coaches]);
  const specialties = useMemo(() => SPECIALTIES.filter((s) => coaches.some((c) => c.specialties.includes(s))), [coaches]);
  const languages = useMemo(() => Array.from(new Set(coaches.flatMap((c) => c.languages))).sort(), [coaches]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = coaches.filter(
      (c) =>
        (!q || [c.firstName, c.lastName, c.city, c.venue, ...c.specialties, ...c.certifications].join(' ').toLowerCase().includes(q)) &&
        (!city || c.city.trim() === city) &&
        (!level || c.specialties.includes(level)) &&
        (!specialty || c.specialties.includes(specialty)) &&
        (!format || c.formats.includes(format)) &&
        (!language || c.languages.includes(language)) &&
        (!verifiedOnly || c.verified),
    );
    if (sort === 'experience') return [...list].sort((a, b) => (b.yearsCoaching ?? -1) - (a.yearsCoaching ?? -1));
    if (sort === 'newest') return list;
    return [...list].sort((a, b) => Number(b.verified) - Number(a.verified) || completeness(b) - completeness(a));
  }, [coaches, query, city, level, specialty, format, language, verifiedOnly, sort]);

  const filterCount = [level, specialty, format, language, verifiedOnly ? '1' : ''].filter(Boolean).length;
  const filtered = Boolean(query || city || filterCount);
  const clear = () => {
    setQuery(''); setCity(''); setLevel(''); setSpecialty(''); setFormat(''); setLanguage(''); setVerifiedOnly(false);
  };

  return (
    <div className="cb-scope cd">
      <section className="cd-hero">
        <div className="container">
          <h1>Find your <em>coach.</em></h1>
          <p>Golf coaches near you, each one checked by Fore.</p>
          {coaches.length > 0 && (
            <form className="cd-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <label className="cd-q">
                <Search size={18} aria-hidden="true" />
                <span className="sr-only">Search</span>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, club or what to work on" />
              </label>
              <label className="cd-city">
                <span className="sr-only">City</span>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </form>
          )}
        </div>
      </section>

      <section className="container cd-body">
        {coaches.length > 0 && (
          <>
            <div className="cd-tools">
              <button type="button" className="cd-filter-toggle" aria-expanded={filtersOpen} aria-controls="cd-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal size={16} aria-hidden="true" /> Filters{filterCount ? ` (${filterCount})` : ''}
              </button>
              <div id="cd-filters" className={`cd-filters${filtersOpen ? ' open' : ''}`}>
                {levels.length > 0 && (
                  <label><span className="sr-only">Good for</span>
                    <select value={level} onChange={(e) => setLevel(e.target.value)}>
                      <option value="">Good for anyone</option>
                      {levels.map(([label, s]) => <option key={s} value={s}>{label}</option>)}
                    </select>
                  </label>
                )}
                <label><span className="sr-only">Speciality</span>
                  <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                    <option value="">Any speciality</option>
                    {specialties.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label><span className="sr-only">Lesson type</span>
                  <select value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="">Any lesson type</option>
                    {FORMATS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </label>
                {languages.length > 0 && (
                  <label><span className="sr-only">Language</span>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="">Any language</option>
                      {languages.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </label>
                )}
                <label className="cd-check">
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                  Verified only
                </label>
              </div>
            </div>

            <div className="cd-count" aria-live="polite">
              <p>
                {results.length} {results.length === 1 ? 'coach' : 'coaches'}{city ? ` in ${city}` : ''}
                {filtered && <> · <button type="button" className="cd-clear" onClick={clear}>Clear</button></>}
              </p>
              <label>
                <span className="sr-only">Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="recommended">Recommended</option>
                  <option value="experience">Most experienced</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
            </div>
          </>
        )}

        {results.length > 0 ? (
          <ul className="cd-grid">
            {results.map((c) => (
              <li key={c.id}>
                <NextLink href={`/coaches/directory/${c.slug}`} className="cd-card" aria-label={`${c.firstName} ${c.lastName}, view profile`}>
                  <CoachCardView coach={c} />
                </NextLink>
              </li>
            ))}
          </ul>
        ) : coaches.length > 0 ? (
          <div className="cd-empty">
            <h2>No matches yet.</h2>
            <p>Try another city or fewer filters, or learn online with a coach anywhere in India.</p>
            <div className="button-row">
              <button type="button" className="button acid" onClick={clear}>Clear filters</button>
              {format !== 'Online video analysis' && (
                <button type="button" className="button light" onClick={() => { setCity(''); setFormat('Online video analysis'); }}>Show online coaches</button>
              )}
            </div>
          </div>
        ) : (
          <div className="cd-empty">
            <h2>{ok ? 'Coaches are joining now.' : 'Back in a moment.'}</h2>
            <p>{ok ? 'We check every profile before it goes live. Join Fore and we’ll tell you when coaches near you are ready.' : 'We couldn’t load coaches just now. Please try again shortly.'}</p>
            <div className="button-row">
              <NextLink className="button acid" href="/golfers">Join as a golfer</NextLink>
            </div>
          </div>
        )}

        <p className="cd-coach-line">
          Teach golf? <NextLink href="/coaches/teaching">Get found by golfers near you <ArrowRight size={15} aria-hidden="true" /></NextLink>
        </p>
      </section>
    </div>
  );
}

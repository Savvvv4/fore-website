'use client';

import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import CoachCard from './CoachCard';
import { FORMATS, SPECIALTIES, lowestPrice, type CoachListing } from './shared';

type Props = { coaches: CoachListing[]; ok: boolean };
type Sort = 'recommended' | 'price' | 'experience';

export default function CoachDirectory({ coaches }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [format, setFormat] = useState('');
  const [sort, setSort] = useState<Sort>('recommended');

  const cities = useMemo(
    () => Array.from(new Set(coaches.map((c) => c.city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [coaches],
  );
  const specialties = useMemo(() => SPECIALTIES.filter((s) => coaches.some((c) => c.specialties.includes(s))), [coaches]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = coaches.filter(
      (c) =>
        (!q || [c.firstName, c.lastName, c.city, c.venue, ...c.specialties].join(' ').toLowerCase().includes(q)) &&
        (!city || c.city.trim() === city) &&
        (!specialty || c.specialties.includes(specialty)) &&
        (!format || c.formats.includes(format)),
    );
    if (sort === 'price') {
      return [...list].sort((a, b) => (lowestPrice(a.packages) ?? Infinity) - (lowestPrice(b.packages) ?? Infinity));
    }
    if (sort === 'experience') return [...list].sort((a, b) => (b.yearsCoaching ?? -1) - (a.yearsCoaching ?? -1));
    // Recommended: verified coaches first, then complete profiles (photo, then bio), keeping newest-first order.
    const score = (c: CoachListing) => (c.verified ? 4 : 0) + (c.photoUrl ? 2 : 0) + (c.bio ? 1 : 0);
    return [...list].sort((a, b) => score(b) - score(a));
  }, [coaches, query, city, specialty, format, sort]);

  const filtered = Boolean(query || city || specialty || format);
  const clear = () => { setQuery(''); setCity(''); setSpecialty(''); setFormat(''); };

  return (
    <div className="cb-scope cb-dir">
      <section className="cb-dir-hero">
        <div className="cb-dir-wrap">
          <div className="section-label"><span />Find a coach</div>
          <h1>The right golf coach <em>for your game.</em></h1>
          <p>Compare coaches near you by speciality, experience and price, then message the one that fits.</p>
        </div>
      </section>

      <section className="cb-dir-wrap cb-dir-body">
        {coaches.length > 0 && (
          <div className="cb-dir-filters" role="search">
            <div className="cb-dir-filter-row">
              <label className="cb-dir-search">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Search coaches</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, course or skill" />
              </label>
              <label>
                <span className="sr-only">City</span>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">Lesson format</span>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="">Any format</option>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </label>
            </div>
            {specialties.length > 1 && (
              <div className="cb-dir-pills" role="group" aria-label="Speciality">
                <button type="button" aria-pressed={!specialty} onClick={() => setSpecialty('')}>All</button>
                {specialties.map((s) => (
                  <button type="button" key={s} aria-pressed={specialty === s} onClick={() => setSpecialty(specialty === s ? '' : s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {coaches.length > 0 && (
          <div className="cb-dir-count">
            <p aria-live="polite">
              <strong>{results.length}</strong> {results.length === 1 ? 'coach' : 'coaches'}
              {city ? ` in ${city}` : ''}
              {filtered && <button type="button" className="cb-link" onClick={clear}>Clear filters</button>}
            </p>
            <label className="cb-dir-sort">
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="recommended">Recommended</option>
                <option value="price">Price: low to high</option>
                <option value="experience">Most experienced</option>
              </select>
            </label>
          </div>
        )}

        {results.length > 0 ? (
          <ul className="cb-dir-list">
            {results.map((c) => (
              <li key={c.id}><CoachCard coach={c} href={`/coaches/directory/${c.slug}`} /></li>
            ))}
          </ul>
        ) : coaches.length > 0 ? (
          <div className="cb-dir-empty">
            <h2>No coaches match those filters.</h2>
            <p>Try another city or speciality, or clear the filters to see everyone.</p>
            <button type="button" className="cb-button cb-outline" onClick={clear}>Clear filters</button>
          </div>
        ) : (
          <div className="cb-dir-empty">
            <h2>New coaches are on their way.</h2>
            <p>Check back soon to compare golf coaches near you. If you coach, you can list your lessons today.</p>
            <div className="cb-done-actions">
              <NextLink className="cb-button cb-primary" href="/coach-profile">List your coaching <ArrowRight size={15} /></NextLink>
            </div>
          </div>
        )}

        <aside className="cb-dir-cta">
          <div>
            <strong>Coach golf?</strong>
            <p>Get found by golfers in your city looking for lessons. It takes five minutes.</p>
          </div>
          <NextLink className="cb-button cb-primary" href="/coach-profile">Create your profile <ArrowRight size={15} /></NextLink>
        </aside>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { SiteShell } from '../App';
import ScrollToTop from './ScrollToTop';
import {
  CERTIFICATIONS,
  FORMATS,
  PHOTO_BUCKET,
  PLAYER_GROUPS,
  SPECIALTIES,
  type CoachType,
} from './shared';

const DRAFT_KEY = 'foresports-coach-signup-v4';
const STEPS = ['About you', 'Your coaching'];

type Form = {
  type: CoachType | '';
  first: string;
  last: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  venue: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  formats: string[];
  trial: string;
  lesson: string;
  squad: string;
  groups: string[];
  consent: boolean;
};
type ListField = 'specialties' | 'certifications' | 'formats' | 'groups';
type Errors = Partial<Record<keyof Form | 'photo', string>>;

const defaults: Form = {
  type: '',
  first: '',
  last: '',
  email: '',
  phone: '',
  city: '',
  experience: '',
  venue: '',
  bio: '',
  specialties: [],
  certifications: [],
  formats: ['In-person'],
  trial: '',
  lesson: '',
  squad: '',
  groups: [],
  consent: false,
};

const TYPE_OPTIONS: { value: CoachType; title: string; copy: string }[] = [
  { value: 'teaching', title: 'I teach lessons', copy: 'Private lessons, packs or group classes.' },
  { value: 'performance', title: 'I coach a squad', copy: 'An academy, a squad or elite players.' },
];

const digits = (s: string) => s.replace(/\D/g, '');
const nationalPhone = (s: string) => digits(s).replace(/^(91|0)(?=\d{10}$)/, '');
const priceNumber = (s: string) => {
  const n = parseInt(digits(s), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function validate(step: number, f: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!f.type) e.type = 'Choose how you coach.';
    if (!f.first.trim()) e.first = 'Enter your first name.';
    if (!f.last.trim()) e.last = 'Enter your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email, like name@gmail.com.';
    if (nationalPhone(f.phone).length !== 10) e.phone = 'Enter a 10-digit mobile number.';
    if (!f.city.trim()) e.city = 'Enter the city you coach in.';
  }
  if (step === 1) {
    const y = Number(f.experience);
    if (f.experience === '' || !Number.isInteger(y) || y < 0 || y > 60) e.experience = 'Enter a number from 0 to 60.';
    if (f.type === 'teaching') {
      if (!f.specialties.length) e.specialties = 'Choose at least one.';
      if (!f.formats.length) e.formats = 'Choose at least one.';
    } else {
      if (!f.groups.length) e.groups = 'Choose at least one.';
      const n = Number(f.squad);
      if (f.squad !== '' && (!Number.isInteger(n) || n < 0 || n > 2000)) e.squad = 'Enter a number, or leave it blank.';
    }
    if (!f.consent) e.consent = 'Please agree so we can list you on Fore.';
  }
  return e;
}

/** Centre-crops and resizes to a 600px square JPEG so uploads stay small. */
async function prepareImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('unreadable'));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.min(600, side);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.85),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Field({ label, error, wide, hint, children }: { label: ReactNode; error?: string; wide?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className={`${wide ? 'wide ' : ''}${error ? 'has-error' : ''}`}>
      <span className="cb-label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <span className="cb-field-error">{error}</span>}
    </label>
  );
}

function Checks({ legend, hint, options, value, onToggle, error }: {
  legend: string; hint?: string; options: readonly string[]; value: string[]; onToggle: (v: string) => void; error?: string;
}) {
  return (
    <fieldset className={`cb-checks${error ? ' has-error' : ''}`}>
      <legend>{legend}{hint && <em>{hint}</em>}</legend>
      <div>
        {options.map((x) => {
          const on = value.includes(x);
          return (
            <label key={x} className={on ? 'on' : ''}>
              <input type="checkbox" checked={on} onChange={() => onToggle(x)} />
              {x}
            </label>
          );
        })}
      </div>
      {error && <span className="cb-field-error" role="alert">{error}</span>}
    </fieldset>
  );
}

type SaveResult = 'saved' | 'duplicate' | 'failed';

export default function CoachSignup({ type: fixedType }: { type?: CoachType }) {
  const [f, setF] = useState<Form>({ ...defaults, type: fixedType ?? '' });
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [photoFile, setPhotoFile] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<SaveResult | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);

  // Restore an unfinished sign-up, and honour ?type= from shared links.
  useEffect(() => {
    let next: Form = { ...defaults };
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) next = { ...defaults, ...JSON.parse(saved), consent: false };
    } catch {}
    const q = new URLSearchParams(window.location.search).get('type');
    const type = fixedType ?? (q === 'teaching' || q === 'performance' ? q : next.type);
    setF({ ...next, type });
    setReady(true);
  }, [fixedType]);

  useEffect(() => {
    if (!ready || result) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...f, consent: false })); } catch {}
  }, [f, ready, result]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const teaching = f.type !== 'performance';

  function update(patch: Partial<Form>) {
    setF((old) => ({ ...old, ...patch }));
    setErrors((old) => {
      const next = { ...old };
      (Object.keys(patch) as (keyof Form)[]).forEach((k) => delete next[k]);
      return next;
    });
  }
  function toggle(field: ListField, value: string) {
    const current = f[field];
    update({ [field]: current.includes(value) ? current.filter((x) => x !== value) : [...current, value] } as Partial<Form>);
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: 'Choose a JPG, PNG or WebP under 10 MB.' }));
      return;
    }
    try {
      const blob = await prepareImage(file);
      setPhotoFile(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: 'We couldn’t read that image. Try another JPG or PNG.' }));
    }
  }

  function scrollToForm() {
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function next() {
    const e = validate(0, f);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep(1);
    scrollToForm();
  }

  async function submit() {
    const first = validate(0, f);
    if (Object.keys(first).length) { setErrors(first); setStep(0); scrollToForm(); return; }
    const e = validate(1, f);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (honeypot.current?.value) { setResult('saved'); return; }

    setSubmitting(true);
    setSubmitError('');
    const outcome = await save();
    setSubmitting(false);
    if (outcome === 'failed') {
      setSubmitError('We couldn’t send that. Check your connection and try again, or email hello@foresports.in. Your answers are saved here.');
      return;
    }
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setResult(outcome);
    window.scrollTo({ top: 0 });
  }

  /**
   * Every sign-up should land somewhere. Tries, in order:
   * 1. coach_profiles with every field;
   * 2. coach_profiles with the original columns, in case coach-directory.sql hasn't been re-run;
   * 3. waitlist_submissions, so the Fore team still gets the coach's contact details.
   */
  async function save(): Promise<SaveResult> {
    const supabase = await getSupabase();
    if (!supabase) return 'failed';
    const type = f.type || 'teaching';
    const squad = f.squad === '' ? null : Number(f.squad);
    const name = `${f.first.trim()} ${f.last.trim()}`;
    const email = f.email.trim().toLowerCase();
    const phone = '+91' + nationalPhone(f.phone);

    let photo_path: string | null = null;
    if (photoFile) {
      try {
        const path = `signups/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, photoFile, { contentType: 'image/jpeg', upsert: false });
        if (!error) photo_path = path;
        else console.error('Coach photo upload failed', error);
      } catch (err) {
        console.error('Coach photo upload failed', err);
      }
    }

    const base = {
      first_name: f.first.trim(),
      last_name: f.last.trim(),
      email,
      phone,
      city: f.city.trim(),
      venue: f.venue.trim() || null,
      years_coaching: Number(f.experience),
      bio: f.bio.trim() || null,
      photo_path,
      specialties: teaching ? f.specialties : f.specialties.length ? f.specialties : ['Competition prep'],
      certifications: f.certifications,
      packages: teaching
        ? [
            { name: 'Trial lesson', price: priceNumber(f.trial), detail: 'A first session to understand your game' },
            { name: 'Single lesson', price: priceNumber(f.lesson), detail: 'One coaching session' },
          ]
        : [],
      formats: f.formats.length ? f.formats : ['In-person'],
      days: [],
      consent: true,
      source: `${type}_signup`,
    };
    const programLine = teaching
      ? ''
      : `[Performance coach] ${[squad != null ? `${squad} players` : '', f.groups.join(', ')].filter(Boolean).join(' · ')}`;
    const attempts = [
      {
        ...base,
        coach_type: type,
        squad_size: teaching ? null : squad,
        player_groups: teaching ? [] : f.groups,
      },
      { ...base, bio: [programLine, base.bio].filter(Boolean).join('\n\n').slice(0, 800) || null },
    ];

    let duplicate = false;
    for (const row of attempts) {
      try {
        const { error } = await supabase.from('coach_profiles').insert(row);
        if (!error) return 'saved';
        console.error('Coach sign-up insert failed', error);
        if (error.code === '23505') { duplicate = true; break; }
      } catch (err) {
        console.error('Coach sign-up insert failed', err);
      }
    }

    try {
      const { error } = await supabase.from('waitlist_submissions').insert({
        name,
        email,
        phone,
        city: f.city.trim(),
        role: 'coach',
        source: `${type}_signup${duplicate ? '_repeat' : '_backup'}`,
      });
      if (!error) return duplicate ? 'duplicate' : 'saved';
      console.error('Coach sign-up backup failed', error);
    } catch (err) {
      console.error('Coach sign-up backup failed', err);
    }
    return duplicate ? 'duplicate' : 'failed';
  }

  if (!ready) {
    return (
      <SiteShell>
        <div className="cb-scope cb-page"><p className="cb-loading">Loading…</p></div>
      </SiteShell>
    );
  }

  if (result) {
    const nextSteps = teaching
      ? [
          ['You’re live', 'Golfers can find you in Find a coach and message you through Fore.'],
          ['Get verified', 'We check your qualifications and add a verified badge to your profile.'],
          ['You’re first in', 'Bookings, payments and student tools open to you first.'],
        ]
      : [
          ['We call you', 'A 20-minute chat about your program and players.'],
          ['We set up your squad', 'Players, coaches and parents, loaded with you.'],
          ['Your players start', 'Rounds, practice and progress flow into one record.'],
        ];
    return (
      <SiteShell>
        <div className="cb-scope cb-page">
          <section className="cb-done">
            <span className="cb-done-ring"><Check size={26} /></span>
            <h1>{result === 'duplicate' ? <>Welcome back, {f.first.trim() || 'coach'}.</> : <>You’re in, {f.first.trim() || 'coach'}.</>}</h1>
            <p>
              {result === 'duplicate'
                ? 'This phone number or email is already signed up. We’ve noted your new details and will be in touch.'
                : `We’ll be in touch at ${f.email.trim()} or on WhatsApp.`}
            </p>
            <ol className="cb-next">
              {nextSteps.map(([h, p], i) => (
                <li key={h}><span>{i + 1}</span><div><strong>{h}</strong>{p}</div></li>
              ))}
            </ol>
            <div className="button-row center">
              <NextLink className="button light" href="/coaches">Back to Fore for coaches</NextLink>
            </div>
            <p className="cb-help">Need to change something? Email hello@foresports.in.</p>
          </section>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ScrollToTop />
      <div className="cb-scope cb-page cb-signup">
        <div className="cb-signup-wrap" ref={top}>
          <h1>
            {fixedType === 'performance' ? <>Set up your <em>squad.</em></> : fixedType === 'teaching' ? <>Create your <em>coach profile.</em></> : <>Join Fore <em>as a coach.</em></>}
          </h1>
          <p className="cb-signup-sub">Two short steps. Your progress saves as you go.</p>

          <div className="cb-form">
            <nav className="cb-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
              {STEPS.map((label, i) => (
                <button
                  type="button"
                  key={label}
                  className={i <= step ? 'on' : ''}
                  disabled={i > step}
                  onClick={() => setStep(i)}
                  aria-label={label}
                  aria-current={i === step ? 'step' : undefined}
                />
              ))}
            </nav>

            {step === 0 && (
              <>
                <h2>About you</h2>
                <p>Your name is what golfers see. Your email and number stay private.</p>
                {!fixedType && (
                  <fieldset className={`cb-types${errors.type ? ' has-error' : ''}`}>
                    <legend>How do you coach?</legend>
                    <div>
                      {TYPE_OPTIONS.map((o) => (
                        <label key={o.value} className={f.type === o.value ? 'on' : ''}>
                          <input type="radio" name="coach-type" value={o.value} checked={f.type === o.value} onChange={() => update({ type: o.value })} />
                          <span><strong>{o.title}</strong>{o.copy}</span>
                        </label>
                      ))}
                    </div>
                    {errors.type && <span className="cb-field-error" role="alert">{errors.type}</span>}
                  </fieldset>
                )}
                <div className="cb-grid">
                  <Field label="First name" error={errors.first}><input autoComplete="given-name" value={f.first} onChange={(e) => update({ first: e.target.value })} /></Field>
                  <Field label="Last name" error={errors.last}><input autoComplete="family-name" value={f.last} onChange={(e) => update({ last: e.target.value })} /></Field>
                  <Field label="Email" error={errors.email} wide><input type="email" autoComplete="email" value={f.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" /></Field>
                  <Field label="Mobile (WhatsApp)" error={errors.phone}>
                    <div className="cb-phone"><span>+91</span><input type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="98765 43210" /></div>
                  </Field>
                  <Field label="City" error={errors.city}><input autoComplete="address-level2" value={f.city} onChange={(e) => update({ city: e.target.value })} placeholder="Gurugram" /></Field>
                </div>
                <input ref={honeypot} className="cb-hp" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
              </>
            )}

            {step === 1 && (
              <>
                <h2>Your coaching</h2>
                <p>{teaching ? 'What golfers see on your profile. You can change it anytime.' : 'So we can set Fore up around your program.'}</p>
                <div className="cb-grid">
                  <Field label="Years coaching" error={errors.experience}><input type="number" min="0" max="60" inputMode="numeric" value={f.experience} onChange={(e) => update({ experience: e.target.value })} placeholder="12" /></Field>
                  {!teaching && (
                    <Field label="Players" hint="Optional" error={errors.squad}><input type="number" min="0" max="2000" inputMode="numeric" value={f.squad} onChange={(e) => update({ squad: e.target.value })} placeholder="14" /></Field>
                  )}
                  <Field label="Where you coach" hint="Optional" wide><input value={f.venue} maxLength={120} onChange={(e) => update({ venue: e.target.value })} placeholder="DLF Golf & Country Club" /></Field>
                  {teaching && (
                    <>
                      <Field label="Trial lesson price" hint="Optional"><div className="cb-money"><span>₹</span><input inputMode="numeric" value={f.trial} onChange={(e) => update({ trial: e.target.value.replace(/[^\d,]/g, '') })} placeholder="2,500" /></div></Field>
                      <Field label="Single lesson price" hint="Optional"><div className="cb-money"><span>₹</span><input inputMode="numeric" value={f.lesson} onChange={(e) => update({ lesson: e.target.value.replace(/[^\d,]/g, '') })} placeholder="3,500" /></div></Field>
                    </>
                  )}
                </div>

                {teaching ? (
                  <>
                    <Checks legend="What you teach best" options={SPECIALTIES} value={f.specialties} onToggle={(x) => toggle('specialties', x)} error={errors.specialties} />
                    <Checks legend="Lesson types" options={FORMATS} value={f.formats} onToggle={(x) => toggle('formats', x)} error={errors.formats} />
                  </>
                ) : (
                  <Checks legend="Who you coach" options={PLAYER_GROUPS} value={f.groups} onToggle={(x) => toggle('groups', x)} error={errors.groups} />
                )}
                <Checks legend="Qualifications" hint="Optional" options={CERTIFICATIONS.filter((c) => c !== 'Other qualification')} value={f.certifications} onToggle={(x) => toggle('certifications', x)} />

                <div className="cb-grid cb-gap-top">
                  <Field label={teaching ? 'About you' : 'Your coaching philosophy'} hint="Optional" wide>
                    <textarea maxLength={800} rows={3} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder={teaching ? 'How you coach and who you work best with.' : 'How you develop players.'} />
                  </Field>
                </div>

                <label className="cb-photo">
                  <span className="cb-photo-img">{photoPreview ? <img src={photoPreview} alt="Your photo" /> : '+'}</span>
                  <span>
                    <strong>{photoPreview ? 'Change photo' : 'Add a photo'}</strong>
                    <small>Optional. Coaches with a clear headshot get chosen more.</small>
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} />
                </label>
                {errors.photo && <p className="cb-error" role="alert">{errors.photo}</p>}

                <label className={`cb-consent${errors.consent ? ' has-error' : ''}`}>
                  <input type="checkbox" checked={f.consent} onChange={(e) => update({ consent: e.target.checked })} />
                  <span>
                    My details are accurate. Fore can store them, show my profile in Find a coach without my email or number, and contact me by email or WhatsApp.{' '}
                    <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
                  </span>
                </label>
                {errors.consent && <p className="cb-error" role="alert">{errors.consent}</p>}
              </>
            )}

            {submitError && <p className="cb-error cb-submit-error" role="alert">{submitError}</p>}
            <div className="cb-footer">
              {step > 0 ? (
                <button type="button" className="cb-back" disabled={submitting} onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
              ) : <span />}
              {step === 0 ? (
                <button type="button" className="button acid" onClick={next}>Continue <ArrowRight size={16} /></button>
              ) : (
                <button type="button" className="button acid" disabled={submitting} onClick={submit}>
                  {submitting ? <><Loader2 size={16} className="cb-spin" /> Sending…</> : 'Join Fore'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

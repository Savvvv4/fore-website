'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowLeft, ArrowRight, Check, Eye, Loader2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { SiteShell } from '../App';
import CoachProfileView from './CoachProfileView';
import { CoachCardView, ProgramCard, type Program } from './cards';
import { CoverArt } from './art';
import { DEFAULT_PACKAGES, DRAFT_KEYS } from './draft';
import {
  CERTIFICATIONS,
  DISCIPLINES,
  FORMATS,
  HEARD_FROM,
  LANGUAGES,
  PHOTO_BUCKET,
  PLAYER_GROUPS,
  PLAYING_LEVELS,
  PRIORITIES,
  PROGRAM_ROLES,
  SPECIALTIES,
  TOOLS,
  WEEKDAYS,
  initials,
  type CoachType,
  type CoachView,
} from './shared';

type Pkg = { name: string; price: string; detail: string };
type Form = {
  first: string;
  last: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  level: string;
  venue: string;
  bio: string;
  languages: string[];
  specialties: string[];
  certifications: string[];
  otherCert: string;
  tools: string[];
  packages: Pkg[];
  formats: string[];
  days: string[];
  start: string;
  end: string;
  role: string;
  program: string;
  squad: string;
  groups: string[];
  disciplines: string[];
  priorities: string[];
  heard: string;
  consent: boolean;
};
type ListField = 'languages' | 'specialties' | 'certifications' | 'tools' | 'days' | 'formats' | 'groups' | 'disciplines' | 'priorities';
type Errors = Partial<Record<keyof Form | 'photo', string>>;

const defaults: Form = {
  first: '',
  last: '',
  email: '',
  phone: '',
  city: '',
  experience: '',
  level: '',
  venue: '',
  bio: '',
  languages: ['English'],
  specialties: [],
  certifications: [],
  otherCert: '',
  tools: [],
  packages: DEFAULT_PACKAGES,
  formats: ['In-person'],
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  start: '06:00',
  end: '19:00',
  role: '',
  program: '',
  squad: '',
  groups: [],
  disciplines: ['Swing'],
  priorities: [],
  heard: '',
  consent: false,
};

const FLOWS = {
  teaching: { steps: ['About you', 'Your coaching', 'What you teach', 'Lessons', 'Availability'], legacyDraftKey: 'foresports-coach-signup-draft-v2' },
  performance: { steps: ['About you', 'Your program', 'Your coaching', 'How you work', 'Review'], legacyDraftKey: '' },
} as const;

const PERFORMANCE_FORMATS = ['In-person', 'Squad sessions', 'On-course playing lesson', 'Online video analysis', 'Tournament support'];

const digits = (s: string) => s.replace(/\D/g, '');
const nationalPhone = (s: string) => digits(s).replace(/^(91|0)(?=\d{10}$)/, '');
const priceNumber = (s: string) => {
  const n = parseInt(digits(s), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function validateStep(type: CoachType, step: number, f: Form): Errors {
  const e: Errors = {};
  const years = () => {
    const y = Number(f.experience);
    if (f.experience === '' || !Number.isInteger(y) || y < 0 || y > 60) e.experience = 'Enter your years of coaching, from 0 to 60.';
  };
  if (step === 0) {
    if (!f.first.trim()) e.first = 'Enter your first name.';
    if (!f.last.trim()) e.last = 'Enter your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email, like name@gmail.com.';
    if (nationalPhone(f.phone).length !== 10) e.phone = 'Enter a 10-digit mobile number.';
    if (!f.city.trim()) e.city = 'Enter the city you coach in.';
  }
  if (type === 'teaching') {
    if (step === 1) years();
    if (step === 2 && !f.specialties.length) e.specialties = 'Choose at least one.';
    if (step === 3 && !f.formats.length) e.formats = 'Choose at least one.';
    if (step === 4) {
      if (f.start && f.end && f.start >= f.end) e.end = 'Choose a finish time after the start time.';
      if (!f.consent) e.consent = 'Please agree so we can review and publish your profile.';
    }
  } else {
    if (step === 1) {
      if (!f.role) e.role = 'Choose your role.';
      if (!f.groups.length) e.groups = 'Choose at least one.';
      const n = Number(f.squad);
      if (f.squad !== '' && (!Number.isInteger(n) || n < 0 || n > 2000)) e.squad = 'Enter a number of players, or leave it blank.';
    }
    if (step === 2) {
      years();
      if (!f.specialties.length) e.specialties = 'Choose at least one.';
    }
    if (step === 3 && !f.formats.length) e.formats = 'Choose at least one.';
    if (step === 4 && !f.consent) e.consent = 'Please agree so we can get in touch about your squad.';
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

/** A group of native checkboxes laid out as a grid. */
function Checks({ legend, hint, options, value, onToggle, error, max }: {
  legend: string; hint?: string; options: readonly string[]; value: string[]; onToggle: (v: string) => void; error?: string; max?: number;
}) {
  return (
    <fieldset className={`cb-checks${error ? ' has-error' : ''}`}>
      <legend>{legend}{hint && <em>{hint}</em>}</legend>
      <div>
        {options.map((x) => {
          const on = value.includes(x);
          return (
            <label key={x} className={on ? 'on' : ''}>
              <input type="checkbox" checked={on} disabled={!on && max != null && value.length >= max} onChange={() => onToggle(x)} />
              {x}
            </label>
          );
        })}
      </div>
      {error && <span className="cb-field-error" role="alert">{error}</span>}
    </fieldset>
  );
}

function certificationList(f: Form): string[] {
  const list = f.certifications.filter((c) => c !== 'Other qualification');
  if (f.certifications.includes('Other qualification') && f.otherCert.trim()) list.push(f.otherCert.trim());
  return list;
}

/** A missing column or column grant means supabase/coach-directory.sql hasn't been re-run yet. */
function isSchemaError(error: { code?: string; message?: string }): boolean {
  return ['PGRST204', '42703', '42501'].includes(error.code ?? '') || /column/i.test(error.message ?? '');
}

export default function CoachSignup({ type }: { type: CoachType }) {
  const flow = FLOWS[type];
  const STEPS = flow.steps;
  const draftKey = DRAFT_KEYS[type];
  const teaching = type === 'teaching';
  const [f, setF] = useState<Form>(defaults);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [preview, setPreview] = useState(false);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [photoFile, setPhotoFile] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const formTop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey) ?? (flow.legacyDraftKey ? localStorage.getItem(flow.legacyDraftKey) : null);
      if (saved) {
        const d = JSON.parse(saved);
        setF({ ...defaults, ...d.form, consent: false });
        setReached(Math.min(Number(d.reached) || 0, STEPS.length - 1));
      }
    } catch {}
    setReady(true);
  }, [draftKey, flow.legacyDraftKey, STEPS.length]);

  useEffect(() => {
    if (!ready || done) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ form: { ...f, consent: false }, reached }));
    } catch {}
  }, [f, reached, ready, done, draftKey]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  function update(patch: Partial<Form>) {
    setF((old) => ({ ...old, ...patch }));
    const keys = Object.keys(patch) as (keyof Form)[];
    setErrors((old) => {
      const next = { ...old };
      keys.forEach((k) => delete next[k]);
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

  function go(next: number) {
    setStep(next);
    setSubmitError('');
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function next() {
    const e = validateStep(type, step, f);
    setErrors(e);
    if (Object.keys(e).length) return;
    const n = step + 1;
    setReached((r) => Math.max(r, n));
    go(n);
  }

  const view: CoachView = useMemo(
    () => ({
      firstName: f.first.trim(),
      lastName: f.last.trim(),
      city: f.city.trim(),
      venue: f.venue.trim(),
      yearsCoaching: f.experience === '' ? null : Number(f.experience),
      playingLevel: f.level,
      bio: f.bio.trim(),
      photoUrl: photoPreview,
      specialties: f.specialties,
      certifications: certificationList(f),
      packages: teaching ? f.packages.map((p) => ({ name: p.name, price: priceNumber(p.price), detail: p.detail.trim() })) : [],
      formats: f.formats,
      days: teaching ? WEEKDAYS.filter((d) => f.days.includes(d)) : [],
      startTime: teaching ? f.start : '',
      endTime: teaching ? f.end : '',
      verified: false,
      languages: f.languages,
      tools: f.tools,
    }),
    [f, photoPreview, teaching],
  );

  const program: Program = {
    role: f.role,
    name: f.program.trim(),
    squad: f.squad === '' ? null : Number(f.squad),
    groups: f.groups,
    disciplines: f.disciplines,
  };

  async function submit() {
    for (let s = 0; s < STEPS.length; s++) {
      const e = validateStep(type, s, f);
      if (Object.keys(e).length) {
        setErrors(e);
        setPreview(false);
        go(s);
        return;
      }
    }
    if (honeypot.current?.value) {
      setDone(true);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    const supabase = await getSupabase();
    if (!supabase) {
      setSubmitting(false);
      setSubmitError('Sign-ups aren’t connected yet. Email hello@foresports.in and we’ll set you up.');
      return;
    }
    try {
      let photo_path: string | null = null;
      if (photoFile) {
        const path = `signups/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, photoFile, { contentType: 'image/jpeg', upsert: false });
        if (!error) photo_path = path;
        else console.error('Coach photo upload failed', error);
      }
      const legacy = {
        first_name: view.firstName,
        last_name: view.lastName,
        email: f.email.trim().toLowerCase(),
        phone: '+91' + nationalPhone(f.phone),
        city: view.city,
        venue: view.venue || null,
        years_coaching: view.yearsCoaching,
        playing_level: f.level || null,
        bio: view.bio || null,
        photo_path,
        specialties: view.specialties,
        certifications: view.certifications,
        packages: view.packages,
        formats: view.formats,
        days: view.days,
        start_time: teaching ? f.start || null : null,
        end_time: teaching ? f.end || null : null,
        heard_from: f.heard || null,
        consent: f.consent,
        source: `${type}_signup`,
      };
      const full = {
        ...legacy,
        coach_type: type,
        languages: f.languages,
        tools: f.tools,
        program_name: teaching ? null : program.name || null,
        program_role: teaching ? null : f.role || null,
        squad_size: teaching ? null : program.squad,
        player_groups: teaching ? [] : f.groups,
        disciplines: teaching ? [] : f.disciplines,
        priorities: teaching ? [] : f.priorities,
      };
      let { error } = await supabase.from('coach_profiles').insert(full);
      if (error && isSchemaError(error)) {
        // Database not migrated yet: save the essentials, with program details at the top of the bio for review.
        const programLine = teaching
          ? ''
          : `[Performance coach] ${[f.role, program.name, program.squad != null ? `${program.squad} players` : '', f.groups.join(', ')].filter(Boolean).join(' · ')}`;
        const bio = [programLine, legacy.bio].filter(Boolean).join('\n\n').slice(0, 800) || null;
        ({ error } = await supabase.from('coach_profiles').insert({ ...legacy, bio }));
      }
      if (error) {
        if (error.code === '23505') {
          setSubmitError('There’s already a profile with this email. To change it, email hello@foresports.in.');
        } else {
          console.error('Coach sign-up failed', error);
          setSubmitError('We couldn’t send that. Check your connection and try again — your answers are saved.');
        }
        return;
      }
      try {
        localStorage.removeItem(draftKey);
        if (flow.legacyDraftKey) localStorage.removeItem(flow.legacyDraftKey);
      } catch {}
      setDone(true);
      setPreview(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Coach sign-up failed', err);
      setSubmitError('We couldn’t send that. Check your connection and try again — your answers are saved.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <SiteShell>
        <div className="cb-scope cb-page"><p className="cb-loading">Loading…</p></div>
      </SiteShell>
    );
  }

  if (done) {
    const nextSteps = teaching
      ? [
          ['We check your profile', 'Usually within a few days.'],
          ['You go live', 'Golfers near you can find you and send you messages.'],
          ['You’re first in', 'Bookings, payments and student tools open to you first.'],
        ]
      : [
          ['We call you', 'A 20-minute chat about your program and players.'],
          ['We set up your squad', 'Players, coaches and parents, loaded with you.'],
          ['Your players start', 'Rounds and practice flow into one record.'],
        ];
    return (
      <SiteShell>
        <div className="cb-scope cb-page">
          <section className="cb-done">
            <span className="cb-done-ring"><Check size={26} /></span>
            <h1>{teaching ? <>You’re in, {view.firstName || 'coach'}.</> : <>Thanks, {view.firstName || 'coach'}.</>}</h1>
            <p>
              {teaching
                ? `We’ll email ${f.email.trim() || 'you'} as soon as your profile is live.`
                : `We’ll be in touch at ${f.email.trim() || 'your email'} or on WhatsApp to set up your squad.`}
            </p>
            <ol className="cb-next">
              {nextSteps.map(([h, p], i) => (
                <li key={h}><span>{i + 1}</span><div><strong>{h}</strong>{p}</div></li>
              ))}
            </ol>
            <NextLink className="button light" href={teaching ? '/coaches/directory' : '/coaches/performance'}>
              {teaching ? 'Browse Find a coach' : 'Back to Fore for squads'}
            </NextLink>
            <p className="cb-help">Need to change something? Email hello@foresports.in.</p>
          </section>
        </div>
      </SiteShell>
    );
  }

  const livePreview = (
    <div className="cb-live">
      {teaching ? <CoachCardView coach={{ ...view, slug: '', id: 'draft', foundingCoach: false }} draft /> : <ProgramCard coach={view} program={program} />}
      <button type="button" className="cb-link" onClick={() => setPreview(true)}><Eye size={15} /> {teaching ? 'Preview your full profile' : 'Preview what players see'}</button>
    </div>
  );

  return (
    <SiteShell>
      <div className={`cb-scope cb-page cb-signup ${type}`}>
        <section className="cb-signup-hero">
          <div className="container">
            <h1>
              {preview
                ? teaching ? <>Your profile, <em>as golfers see it.</em></> : <>Your program, <em>as players see it.</em></>
                : teaching ? <>Create your <em>coach profile.</em></> : <>Set up your <em>squad.</em></>}
            </h1>
            <p>
              {preview
                ? 'Nothing is submitted yet.'
                : teaching
                  ? 'About five minutes. Your progress saves as you go.'
                  : 'About five minutes. We’ll set up the rest with you.'}
            </p>
          </div>
        </section>

        {!preview ? (
          <div className="container cb-signup-grid">
            <div className="cb-form" ref={formTop}>
              <nav className="cb-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
                {STEPS.map((label, i) => (
                  <button
                    type="button"
                    key={label}
                    className={i <= step ? 'on' : ''}
                    disabled={i > reached}
                    onClick={() => go(i)}
                    aria-label={label}
                    aria-current={i === step ? 'step' : undefined}
                  />
                ))}
              </nav>

              {step === 0 && (
                <>
                  <h2>About you</h2>
                  <p>{teaching ? 'Your name is what golfers see. Your email and number stay private.' : 'Your name is what players see. Your email and number stay private.'}</p>
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

              {teaching && step === 1 && (
                <>
                  <h2>Your coaching</h2>
                  <p>Where you teach and how you coach.</p>
                  <div className="cb-grid">
                    <Field label="Years coaching" error={errors.experience}><input type="number" min="0" max="60" inputMode="numeric" value={f.experience} onChange={(e) => update({ experience: e.target.value })} placeholder="12" /></Field>
                    <Field label="Playing level" hint="Optional">
                      <select value={f.level} onChange={(e) => update({ level: e.target.value })}>
                        <option value="">Choose one</option>
                        {PLAYING_LEVELS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Where you teach" wide><input value={f.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="DLF Golf & Country Club" /></Field>
                    <Field label="About you" hint={`${f.bio.length}/800`} wide>
                      <textarea maxLength={800} rows={4} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="How you coach and who you work best with. Three or four sentences is plenty." />
                    </Field>
                  </div>
                  <Checks legend="Languages" options={LANGUAGES} value={f.languages} onToggle={(x) => toggle('languages', x)} />
                  <PhotoInput preview={photoPreview} onChange={onPhoto} error={errors.photo} />
                </>
              )}

              {teaching && step === 2 && (
                <>
                  <h2>What you teach</h2>
                  <p>Golfers search by these, so choose what you’re best at.</p>
                  <Checks legend="Specialities" options={SPECIALTIES} value={f.specialties} onToggle={(x) => toggle('specialties', x)} error={errors.specialties} />
                  <Credentials f={f} toggle={toggle} update={update} />
                  <Checks legend="Technology" hint="Optional" options={TOOLS.filter((t) => t !== 'Spreadsheets & WhatsApp')} value={f.tools} onToggle={(x) => toggle('tools', x)} />
                </>
              )}

              {teaching && step === 3 && (
                <>
                  <h2>Lessons</h2>
                  <p>Your prices, in rupees. Leave one blank to hide it. You can change these anytime.</p>
                  <div className="cb-packages">
                    {f.packages.map((item, i) => (
                      <div className="cb-package" key={item.name}>
                        <strong>{item.name}</strong>
                        <div className="cb-money"><span>₹</span><input aria-label={`${item.name} price`} inputMode="numeric" value={item.price} onChange={(e) => update({ packages: f.packages.map((x, j) => (i === j ? { ...x, price: e.target.value.replace(/[^\d,]/g, '') } : x)) })} placeholder={['2,500', '9,000', '20,000'][i]} /></div>
                        <input aria-label={`What's included in ${item.name}`} value={item.detail} maxLength={120} onChange={(e) => update({ packages: f.packages.map((x, j) => (i === j ? { ...x, detail: e.target.value } : x)) })} />
                      </div>
                    ))}
                  </div>
                  <Checks legend="Lesson types" options={FORMATS} value={f.formats} onToggle={(x) => toggle('formats', x)} error={errors.formats} />
                </>
              )}

              {teaching && step === 4 && (
                <>
                  <h2>Availability</h2>
                  <p>Roughly when you teach. Golfers see this on your profile.</p>
                  <fieldset className="cb-days">
                    <legend className="sr-only">Teaching days</legend>
                    {WEEKDAYS.map((x) => (
                      <label key={x} className={f.days.includes(x) ? 'on' : ''}>
                        <input type="checkbox" checked={f.days.includes(x)} onChange={() => toggle('days', x)} />
                        {x}
                      </label>
                    ))}
                  </fieldset>
                  <div className="cb-grid">
                    <Field label="From"><input type="time" value={f.start} onChange={(e) => update({ start: e.target.value })} /></Field>
                    <Field label="Until" error={errors.end}><input type="time" value={f.end} onChange={(e) => update({ end: e.target.value })} /></Field>
                    <HeardFrom value={f.heard} onChange={(heard) => update({ heard })} />
                  </div>
                  <Consent checked={f.consent} error={errors.consent} onChange={(consent) => update({ consent })}>
                    My details are accurate. Fore can store them, publish my approved profile without my email or number, and contact me by email or WhatsApp.
                  </Consent>
                </>
              )}

              {!teaching && step === 1 && (
                <>
                  <h2>Your program</h2>
                  <p>Rough numbers are fine.</p>
                  <div className="cb-grid">
                    <Field label="Your role" error={errors.role}>
                      <select value={f.role} onChange={(e) => update({ role: e.target.value })}>
                        <option value="">Choose one</option>
                        {PROGRAM_ROLES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Players" error={errors.squad}><input type="number" min="0" max="2000" inputMode="numeric" value={f.squad} onChange={(e) => update({ squad: e.target.value })} placeholder="14" /></Field>
                    <Field label="Program name" hint="Optional" wide><input value={f.program} maxLength={120} onChange={(e) => update({ program: e.target.value })} placeholder="U-18 Performance Squad" /></Field>
                    <Field label="Where you coach" hint="Optional" wide><input value={f.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="Karnataka Golf Association" /></Field>
                  </div>
                  <Checks legend="Who you coach" options={PLAYER_GROUPS} value={f.groups} onToggle={(x) => toggle('groups', x)} error={errors.groups} />
                  <Checks legend="Your coaching team covers" options={DISCIPLINES} value={f.disciplines} onToggle={(x) => toggle('disciplines', x)} />
                </>
              )}

              {!teaching && step === 2 && (
                <>
                  <h2>Your coaching</h2>
                  <p>Players and parents see this when they join your squad.</p>
                  <div className="cb-grid">
                    <Field label="Years coaching" error={errors.experience}><input type="number" min="0" max="60" inputMode="numeric" value={f.experience} onChange={(e) => update({ experience: e.target.value })} placeholder="15" /></Field>
                    <Field label="Playing level" hint="Optional">
                      <select value={f.level} onChange={(e) => update({ level: e.target.value })}>
                        <option value="">Choose one</option>
                        {PLAYING_LEVELS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Your coaching philosophy" hint="Optional" wide>
                      <textarea maxLength={800} rows={4} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="How you develop players and what you focus on." />
                    </Field>
                  </div>
                  <Checks legend="Specialities" options={SPECIALTIES} value={f.specialties} onToggle={(x) => toggle('specialties', x)} error={errors.specialties} />
                  <Credentials f={f} toggle={toggle} update={update} />
                  <PhotoInput preview={photoPreview} onChange={onPhoto} error={errors.photo} />
                </>
              )}

              {!teaching && step === 3 && (
                <>
                  <h2>How you work</h2>
                  <p>So we can set Fore up around the way you already coach.</p>
                  <Checks legend="How you coach" options={PERFORMANCE_FORMATS} value={f.formats} onToggle={(x) => toggle('formats', x)} error={errors.formats} />
                  <Checks legend="Tools you use today" hint="Optional" options={TOOLS} value={f.tools} onToggle={(x) => toggle('tools', x)} />
                  <Checks legend="Where should we start?" hint="Up to 3" options={PRIORITIES} value={f.priorities} onToggle={(x) => toggle('priorities', x)} max={3} />
                </>
              )}

              {!teaching && step === 4 && (
                <>
                  <h2>Review</h2>
                  <p>Check your details, then send them over.</p>
                  <dl className="cb-review">
                    {([
                      ['Name', [view.firstName, view.lastName].join(' ')],
                      ['Contact', `${f.email.trim()} · +91 ${nationalPhone(f.phone)}`],
                      ['Program', [f.role, program.name, program.squad != null ? `${program.squad} players` : '', view.city].filter(Boolean).join(' · ')],
                      ['Coaches', f.groups.join(', ')],
                      ['Start with', f.priorities.join(', ') || 'We’ll decide together'],
                    ] as [string, string][]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                  <div className="cb-grid"><HeardFrom value={f.heard} onChange={(heard) => update({ heard })} /></div>
                  <Consent checked={f.consent} error={errors.consent} onChange={(consent) => update({ consent })}>
                    My details are accurate. Fore can store them, share them with players and parents I invite, and contact me by email or WhatsApp. I won’t be listed publicly.
                  </Consent>
                </>
              )}

              {submitError && <p className="cb-error cb-submit-error" role="alert">{submitError}</p>}
              <div className="cb-footer">
                {step > 0 ? (
                  <button type="button" className="cb-back" disabled={submitting} onClick={() => go(step - 1)}><ArrowLeft size={16} /> Back</button>
                ) : <span />}
                <div>
                  <button type="button" className="cb-link cb-mobile-only" onClick={() => setPreview(true)}><Eye size={15} /> Preview</button>
                  {step < STEPS.length - 1 ? (
                    <button type="button" className="button acid" onClick={next}>Continue <ArrowRight size={16} /></button>
                  ) : (
                    <button type="button" className="button acid" disabled={submitting} onClick={submit}>
                      {submitting ? <><Loader2 size={16} className="cb-spin" /> Sending…</> : teaching ? 'Submit profile' : 'Send to Fore'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <aside className="cb-signup-side">{livePreview}</aside>
          </div>
        ) : (
          <section className="container cb-preview">
            {teaching ? (
              <CoachProfileView
                coach={view}
                draft
                aside={
                  <div className="cp-enquiry">
                    <h2>Ask {view.firstName || 'you'} about lessons</h2>
                    <p className="cp-enquiry-lead">Golfers message you here. Your email and number stay private.</p>
                  </div>
                }
              />
            ) : (
              <PerformancePreview coach={view} program={program} />
            )}
            <div className="cb-preview-actions">
              <button type="button" className="button light" onClick={() => setPreview(false)}><ArrowLeft size={16} /> Keep editing</button>
              {reached >= STEPS.length - 1 && (
                <button type="button" className="button acid" onClick={() => { setPreview(false); go(STEPS.length - 1); }}>Continue to submit <ArrowRight size={16} /></button>
              )}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}

/* ─── Form pieces ────────────────────────────────────────────────── */

function PhotoInput({ preview, onChange, error }: { preview: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; error?: string }) {
  return (
    <>
      <label className="cb-photo">
        <span className="cb-photo-img">{preview ? <img src={preview} alt="Your photo" /> : '+'}</span>
        <span>
          <strong>{preview ? 'Change photo' : 'Add a photo'}</strong>
          <small>A clear, smiling headshot. Profiles with photos get chosen more.</small>
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} />
      </label>
      {error && <p className="cb-error" role="alert">{error}</p>}
    </>
  );
}

function Credentials({ f, toggle, update }: { f: Form; toggle: (field: ListField, v: string) => void; update: (p: Partial<Form>) => void }) {
  return (
    <>
      <Checks legend="Qualifications" hint="We’ll verify these" options={CERTIFICATIONS} value={f.certifications} onToggle={(x) => toggle('certifications', x)} />
      {f.certifications.includes('Other qualification') && (
        <div className="cb-grid cb-gap-top">
          <Field label="Other qualification" wide><input value={f.otherCert} onChange={(e) => update({ otherCert: e.target.value })} placeholder="SNAG Level 1" /></Field>
        </div>
      )}
    </>
  );
}

function HeardFrom({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="How did you hear about Fore?" hint="Optional" wide>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose one</option>
        {HEARD_FROM.map((x) => <option key={x}>{x}</option>)}
      </select>
    </Field>
  );
}

function Consent({ checked, error, onChange, children }: { checked: boolean; error?: string; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <>
      <label className={`cb-consent${error ? ' has-error' : ''}`}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{children} <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a></span>
      </label>
      {error && <p className="cb-error" role="alert">{error}</p>}
    </>
  );
}

/* ─── What players see ───────────────────────────────────────────── */

function PerformancePreview({ coach: c, program: p }: { coach: CoachView; program: Program }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your name';
  return (
    <article className="cp">
      <div className="cp-cover"><CoverArt wide variant={3} /></div>
      <header className="cp-head">
        <span className="cp-avatar">{c.photoUrl ? <img src={c.photoUrl} alt="" /> : initials(c.firstName, c.lastName)}</span>
        <div>
          <h2 className="cp-name">{name}</h2>
          <p className="cp-meta">{[p.role || 'Performance coach', c.yearsCoaching != null ? `${c.yearsCoaching} years coaching` : ''].filter(Boolean).join(' · ')}</p>
          <p className="cp-place">{[p.name, p.squad != null ? `${p.squad} players` : '', c.city].filter(Boolean).join(' · ') || 'Your program'}</p>
        </div>
      </header>
      <div className="cp-grid">
        <div className="cp-main">
          <section>
            <h2>Coaching philosophy</h2>
            <p className="cp-bio">{c.bio || 'Players and parents read this when they join your squad.'}</p>
          </section>
          <section>
            <h2>Coaches</h2>
            <p>{p.groups.length ? `${p.groups.join(', ')}.` : 'Add who you coach.'}</p>
          </section>
          <section>
            <h2>Coaching team</h2>
            <p>{(p.disciplines.length ? p.disciplines : ['Swing']).join(', ')}.</p>
          </section>
          {c.certifications.length > 0 && (
            <section>
              <h2>Qualifications</h2>
              <p>{c.certifications.join(', ')}.</p>
            </section>
          )}
        </div>
        <aside className="cp-aside">
          <div className="cp-enquiry">
            <h2>Private to your squad</h2>
            <p className="cp-enquiry-lead">Only players, parents and coaches you invite see this.</p>
          </div>
        </aside>
      </div>
    </article>
  );
}

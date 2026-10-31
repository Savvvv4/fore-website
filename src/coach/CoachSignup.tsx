'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowLeft, ArrowRight, Check, Eye, Loader2, Send } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { SiteShell } from '../App';
import CoachProfileView from './CoachProfileView';
import { CoachCardView } from './CoachDirectory';
import { CoverArt } from './art';
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
import './coach.css';

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
  packages: [
    { name: 'Trial lesson', price: '', detail: 'A first session to understand your game' },
    { name: 'Lesson pack', price: '', detail: 'A block of 4 coaching sessions' },
    { name: 'Monthly programme', price: '', detail: 'Ongoing coaching and progress tracking' },
  ],
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
  teaching: {
    steps: ['Your details', 'Your coaching', 'Specialities', 'Lessons', 'Availability'],
    draftKey: 'foresports-coach-signup-teaching-v3',
    legacyDraftKey: 'foresports-coach-signup-draft-v2',
  },
  performance: {
    steps: ['Your details', 'Your program', 'Your coaching', 'How you work', 'Review'],
    draftKey: 'foresports-coach-signup-performance-v1',
    legacyDraftKey: '',
  },
} as const;

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address, like name@gmail.com.';
    if (nationalPhone(f.phone).length !== 10) e.phone = 'Enter a 10-digit mobile number.';
    if (!f.city.trim()) e.city = 'Enter the city you coach in.';
  }
  if (type === 'teaching') {
    if (step === 1) years();
    if (step === 2 && !f.specialties.length) e.specialties = 'Pick at least one speciality.';
    if (step === 3 && !f.formats.length) e.formats = 'Pick at least one way you coach.';
    if (step === 4) {
      if (f.start && f.end && f.start >= f.end) e.end = 'Choose an end time after the start time.';
      if (!f.consent) e.consent = 'Tick the box so we can contact you about your profile.';
    }
  } else {
    if (step === 1) {
      if (!f.role) e.role = 'Choose the role that fits you best.';
      if (!f.groups.length) e.groups = 'Pick at least one group of players you coach.';
      const n = Number(f.squad);
      if (f.squad !== '' && (!Number.isInteger(n) || n < 0 || n > 2000)) e.squad = 'Enter a number of players, or leave it blank.';
    }
    if (step === 2) {
      years();
      if (!f.specialties.length) e.specialties = 'Pick at least one speciality.';
    }
    if (step === 3 && !f.formats.length) e.formats = 'Pick at least one way you coach.';
    if (step === 4 && !f.consent) e.consent = 'Tick the box so we can contact you about your squad.';
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

function Chips({ options, value, onToggle, check = true }: { options: readonly string[]; value: string[]; onToggle: (v: string) => void; check?: boolean }) {
  return (
    <div className="cb-chips">
      {options.map((x) => (
        <button type="button" key={x} aria-pressed={value.includes(x)} className={value.includes(x) ? 'chosen' : ''} onClick={() => onToggle(x)}>
          {check && value.includes(x) ? '✓ ' : ''}{x}
        </button>
      ))}
    </div>
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
      const saved = localStorage.getItem(flow.draftKey) ?? (flow.legacyDraftKey ? localStorage.getItem(flow.legacyDraftKey) : null);
      if (saved) {
        const d = JSON.parse(saved);
        setF({ ...defaults, ...d.form, consent: false });
        setReached(Math.min(Number(d.reached) || 0, STEPS.length - 1));
      }
    } catch {}
    setReady(true);
  }, [flow.draftKey, flow.legacyDraftKey, STEPS.length]);

  useEffect(() => {
    if (!ready || done) return;
    try {
      localStorage.setItem(flow.draftKey, JSON.stringify({ form: { ...f, consent: false }, reached }));
    } catch {}
  }, [f, reached, ready, done, flow.draftKey]);

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
      setErrors((e) => ({ ...e, photo: 'Choose a JPG, PNG or WebP image smaller than 10 MB.' }));
      return;
    }
    try {
      const blob = await prepareImage(file);
      setPhotoFile(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: "We couldn't read that image. Try a different JPG or PNG." }));
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
      setSubmitError("Sign-ups aren't connected yet. Email hello@foresports.in and we'll set you up.");
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
      const squad = f.squad === '' ? null : Number(f.squad);
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
        program_name: teaching ? null : f.program.trim() || null,
        program_role: teaching ? null : f.role || null,
        squad_size: teaching ? null : squad,
        player_groups: teaching ? [] : f.groups,
        disciplines: teaching ? [] : f.disciplines,
        priorities: teaching ? [] : f.priorities,
      };
      let { error } = await supabase.from('coach_profiles').insert(full);
      if (error && isSchemaError(error)) {
        // Database not migrated yet: keep the essentials, and the program details in the bio for review.
        const programLine = teaching
          ? ''
          : `[Performance coach] ${[f.role, f.program.trim(), squad != null ? `${squad} players` : '', f.groups.join(', ')].filter(Boolean).join(' · ')}`;
        const bio = [programLine, legacy.bio].filter(Boolean).join('\n\n').slice(0, 800) || null;
        ({ error } = await supabase.from('coach_profiles').insert({ ...legacy, bio }));
      }
      if (error) {
        if (error.code === '23505') {
          setSubmitError('A coach profile with this email already exists. To change it, email hello@foresports.in.');
        } else {
          console.error('Coach sign-up failed', error);
          setSubmitError("We couldn't send your sign-up. Check your connection and try again. Your answers are still here.");
        }
        return;
      }
      try {
        localStorage.removeItem(flow.draftKey);
        if (flow.legacyDraftKey) localStorage.removeItem(flow.legacyDraftKey);
      } catch {}
      setDone(true);
      setPreview(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Coach sign-up failed', err);
      setSubmitError("We couldn't send your sign-up. Check your connection and try again. Your answers are still here.");
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

  const program = {
    role: f.role,
    name: f.program.trim(),
    squad: f.squad === '' ? null : Number(f.squad),
    groups: f.groups,
    disciplines: f.disciplines,
    priorities: f.priorities,
  };

  if (done) {
    return (
      <SiteShell>
        <div className="cb-scope cb-page">
          <section className="cb-done">
            <div className="cb-done-ring"><Check size={30} /></div>
            <div className="section-label"><span />{teaching ? 'Profile received' : 'Squad details received'}</div>
            <h1>Thanks, {view.firstName || 'coach'}. <em>{teaching ? "You're on Fore." : "Let's set up your squad."}</em></h1>
            <p>
              {teaching
                ? `We'll review your profile and email ${f.email.trim() || 'you'} as soon as it's live in the Fore coach directory.`
                : `We'll be in touch at ${f.email.trim() || 'your email'} or on WhatsApp to book a 20-minute call and set up your squad with you.`}
            </p>
            <ol className="cb-next">
              {(teaching
                ? [
                    ['We review your profile', 'The Fore team checks your details and credentials, usually within a few days.'],
                    ['Golfers find you', 'Your profile goes live in the coach directory, and golfers can send you enquiries.'],
                    ['First into the app', "You'll get early access to bookings, payments and student tools as they open."],
                  ]
                : [
                    ['A 20-minute call', 'We talk through your program, your players and how you coach today.'],
                    ['We set up your squad', 'Your players, coaches and parents, loaded with you, not by you.'],
                    ['Your players get started', 'They log rounds and practice, and you see it all in one record.'],
                  ]
              ).map(([h, p], i) => (
                <li key={h}><span>{i + 1}</span><div><strong>{h}</strong>{p}</div></li>
              ))}
            </ol>
            <div className="button-row center">
              {teaching ? (
                <NextLink className="button acid" href="/coaches/directory">See the coach directory <ArrowRight size={16} /></NextLink>
              ) : (
                <NextLink className="button acid" href="/coaches/performance">Back to Performance Coaches <ArrowRight size={16} /></NextLink>
              )}
              <NextLink className="button light" href="/coaches">Fore for coaches</NextLink>
            </div>
            <p className="cb-help">Need to change something? Email <strong>hello@foresports.in</strong>.</p>
          </section>
        </div>
      </SiteShell>
    );
  }

  const livePreview = teaching ? (
    <div className="cb-live">
      <div className="cb-live-label"><span className="cb-live-dot" />Live preview · how golfers see you</div>
      <CoachCardView coach={{ ...view, slug: '', id: 'draft', foundingCoach: true }} draft />
      <button type="button" className="cb-link" onClick={() => setPreview(true)}><Eye size={14} /> Open your full profile</button>
    </div>
  ) : (
    <div className="cb-live">
      <div className="cb-live-label"><span className="cb-live-dot" />Live preview · how players see you</div>
      <ProgramCard coach={view} program={program} />
      <button type="button" className="cb-link" onClick={() => setPreview(true)}><Eye size={14} /> Open your full preview</button>
    </div>
  );

  const stepsNav = (
    <nav className="cb-stepper" aria-label="Sign-up steps">
      {STEPS.map((label, i) => (
        <button
          type="button"
          key={label}
          className={step === i ? 'current' : i < reached || (i === reached && i !== step) ? 'visited' : ''}
          disabled={i > reached}
          aria-current={step === i ? 'step' : undefined}
          onClick={() => go(i)}
        >
          <span>{i < reached && step !== i ? <Check size={12} /> : i + 1}</span>
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <SiteShell>
      <div className={`cb-scope cb-page cb-signup ${type}`}>
        <section className="cb-signup-hero">
          <div className="cb-signup-wrap">
            <NextLink className="cb-back" href={teaching ? '/coaches/teaching' : '/coaches/performance'}>
              <ArrowLeft size={14} /> {teaching ? 'Fore for Teaching Pros' : 'Fore for Performance Coaches'}
            </NextLink>
            <h1>
              {preview
                ? teaching ? <>Your profile, <em>as golfers see it.</em></> : <>Your program, <em>as players see it.</em></>
                : teaching ? <>Your coach profile, <em>live on Fore.</em></> : <>Set up your squad <em>on Fore.</em></>}
            </h1>
            <p>
              {preview
                ? teaching
                  ? 'Nothing is submitted yet. Once the Fore team approves your profile, this is what golfers see in the coach directory.'
                  : 'Nothing is submitted yet. This is how you appear to your players and their parents when they link to you on Fore.'
                : teaching
                  ? 'About five minutes. We review every profile, and approved coaches are listed in the Fore coach directory.'
                  : 'Tell us about your program in about five minutes. We’ll set it up with you on a short call and help your first players get started.'}
            </p>
            {!preview && (
              <ul className="cb-hero-facts">
                {(teaching
                  ? ['Your progress saves as you go', 'Contact details stay private', 'Reviewed by the Fore team']
                  : ['Your progress saves as you go', 'Not listed publicly', 'Set up with you, personally']
                ).map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
          </div>
        </section>

        {!preview ? (
          <div className="cb-signup-wrap cb-signup-grid">
            <div className="cb-form" ref={formTop}>
              {stepsNav}
              <div className="cb-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
              <div className="cb-step-count">Step {step + 1} of {STEPS.length}</div>

              {step === 0 && (
                <>
                  <h2>Your details</h2>
                  <p>{teaching ? 'The name golfers will see, and how the Fore team can reach you.' : 'The name your players will see, and how the Fore team can reach you.'}</p>
                  <div className="cb-grid">
                    <Field label="First name *" error={errors.first}><input autoComplete="given-name" value={f.first} onChange={(e) => update({ first: e.target.value })} placeholder="e.g. Raj" /></Field>
                    <Field label="Last name *" error={errors.last}><input autoComplete="family-name" value={f.last} onChange={(e) => update({ last: e.target.value })} placeholder="e.g. Mehta" /></Field>
                    <Field label="Email *" error={errors.email} wide><input type="email" autoComplete="email" value={f.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" /></Field>
                    <Field label="Mobile (WhatsApp) *" error={errors.phone}>
                      <div className="cb-phone"><span>+91</span><input type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="98765 43210" /></div>
                    </Field>
                    <Field label="City *" error={errors.city}><input autoComplete="address-level2" value={f.city} onChange={(e) => update({ city: e.target.value })} placeholder="e.g. Gurugram" /></Field>
                  </div>
                  <input ref={honeypot} className="cb-hp" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
                </>
              )}

              {teaching && step === 1 && (
                <>
                  <h2>Your coaching</h2>
                  <p>Your experience, where you teach, and a few lines about how you coach.</p>
                  <div className="cb-grid">
                    <Field label="Years coaching *" error={errors.experience}><input type="number" min="0" max="60" inputMode="numeric" value={f.experience} onChange={(e) => update({ experience: e.target.value })} placeholder="e.g. 12" /></Field>
                    <Field label="Your playing level">
                      <select value={f.level} onChange={(e) => update({ level: e.target.value })}>
                        <option value="">Select…</option>
                        {PLAYING_LEVELS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Where you teach" wide><input value={f.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="e.g. DLF Golf & Country Club, Sector 59 range" /></Field>
                    <Field label="About you" hint="3–5 sentences" wide>
                      <textarea maxLength={800} rows={6} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="How you coach, the golfers you work best with, and what a lesson with you feels like." />
                      <small>{f.bio.length}/800 characters</small>
                    </Field>
                  </div>
                  <h3>Languages you teach in</h3>
                  <Chips options={LANGUAGES} value={f.languages} onToggle={(x) => toggle('languages', x)} />
                  <PhotoInput preview={photoPreview} onChange={onPhoto} error={errors.photo} />
                </>
              )}

              {teaching && step === 2 && (
                <>
                  <h2>Specialities & credentials</h2>
                  <p>Golfers filter the coach directory by these, so pick what you’re best at.</p>
                  <h3>Coaching specialities *</h3>
                  <Chips options={SPECIALTIES} value={f.specialties} onToggle={(x) => toggle('specialties', x)} />
                  {errors.specialties && <p className="cb-error" role="alert">{errors.specialties}</p>}
                  <Credentials f={f} toggle={toggle} update={update} />
                  <h3>Technology you teach with <em className="cb-optional">Optional</em></h3>
                  <Chips options={TOOLS.filter((t) => t !== 'Spreadsheets & WhatsApp')} value={f.tools} onToggle={(x) => toggle('tools', x)} />
                </>
              )}

              {teaching && step === 3 && (
                <>
                  <h2>Lessons</h2>
                  <p>What golfers can book with you, in your words and at your prices. You can change these at any time.</p>
                  {f.packages.map((item, i) => (
                    <div className="cb-package" key={item.name}>
                      <h3>{item.name}{i === 0 && <span className="cb-package-tag">Helps new students start</span>}</h3>
                      <div className="cb-package-row">
                        <label>
                          <span className="cb-label">Price (₹)</span>
                          <div className="cb-money"><span>₹</span><input inputMode="numeric" value={item.price} onChange={(e) => update({ packages: f.packages.map((x, j) => (i === j ? { ...x, price: e.target.value.replace(/[^\d,]/g, '') } : x)) })} placeholder={['1,200', '4,500', '12,000'][i]} /></div>
                        </label>
                        <label>
                          <span className="cb-label">What’s included</span>
                          <input value={item.detail} maxLength={120} onChange={(e) => update({ packages: f.packages.map((x, j) => (i === j ? { ...x, detail: e.target.value } : x)) })} />
                        </label>
                      </div>
                    </div>
                  ))}
                  <p className="cb-help">Leave a price blank to hide that package.</p>
                  <h3>How do you coach? *</h3>
                  <Chips options={FORMATS} value={f.formats} onToggle={(x) => toggle('formats', x)} />
                  {errors.formats && <p className="cb-error" role="alert">{errors.formats}</p>}
                </>
              )}

              {teaching && step === 4 && (
                <>
                  <h2>Availability & submit</h2>
                  <p>Give golfers a broad idea of when you teach, then send your profile to the Fore team.</p>
                  <h3>Teaching days</h3>
                  <div className="cb-days">
                    {WEEKDAYS.map((x) => (
                      <button type="button" key={x} aria-pressed={f.days.includes(x)} className={f.days.includes(x) ? 'chosen' : ''} onClick={() => toggle('days', x)}>{x}</button>
                    ))}
                  </div>
                  <div className="cb-grid">
                    <Field label="Lessons start from"><input type="time" value={f.start} onChange={(e) => update({ start: e.target.value })} /></Field>
                    <Field label="Lessons finish by" error={errors.end}><input type="time" value={f.end} onChange={(e) => update({ end: e.target.value })} /></Field>
                    <HeardFrom value={f.heard} onChange={(heard) => update({ heard })} />
                  </div>
                  <Review rows={[
                    ['Name', [view.firstName, view.lastName].join(' ')],
                    ['Contact', `${f.email.trim()} · +91 ${nationalPhone(f.phone)}`],
                    ['Coaching', `${view.yearsCoaching} yrs · ${view.city}${view.venue ? ' · ' + view.venue : ''}`],
                    ['Specialities', view.specialties.join(', ')],
                  ]} onPreview={() => setPreview(true)} />
                  <Consent checked={f.consent} error={errors.consent} onChange={(consent) => update({ consent })}>
                    I confirm these details are accurate, and I agree that ForeSports can store them, show my approved profile publicly (without my email or phone), and contact me by email or WhatsApp.
                  </Consent>
                </>
              )}

              {!teaching && step === 1 && (
                <>
                  <h2>Your program</h2>
                  <p>The squad, academy or players you coach. Rough numbers are fine.</p>
                  <div className="cb-grid">
                    <Field label="Your role *" error={errors.role}>
                      <select value={f.role} onChange={(e) => update({ role: e.target.value })}>
                        <option value="">Select…</option>
                        {PROGRAM_ROLES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Players you coach" error={errors.squad}><input type="number" min="0" max="2000" inputMode="numeric" value={f.squad} onChange={(e) => update({ squad: e.target.value })} placeholder="e.g. 14" /></Field>
                    <Field label="Academy or program name" hint="Optional" wide><input value={f.program} maxLength={120} onChange={(e) => update({ program: e.target.value })} placeholder="e.g. U-18 Performance Squad" /></Field>
                    <Field label="Where you coach" wide><input value={f.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="e.g. Karnataka Golf Association" /></Field>
                  </div>
                  <h3>Who you coach *</h3>
                  <Chips options={PLAYER_GROUPS} value={f.groups} onToggle={(x) => toggle('groups', x)} />
                  {errors.groups && <p className="cb-error" role="alert">{errors.groups}</p>}
                  <h3>Coaches in your program</h3>
                  <p className="cb-help cb-help-top">Pick every area someone in your team covers. They can join the same squad on Fore.</p>
                  <Chips options={DISCIPLINES} value={f.disciplines} onToggle={(x) => toggle('disciplines', x)} />
                </>
              )}

              {!teaching && step === 2 && (
                <>
                  <h2>Your coaching</h2>
                  <p>Your background and how you coach. Your players see this when they link to you.</p>
                  <div className="cb-grid">
                    <Field label="Years coaching *" error={errors.experience}><input type="number" min="0" max="60" inputMode="numeric" value={f.experience} onChange={(e) => update({ experience: e.target.value })} placeholder="e.g. 15" /></Field>
                    <Field label="Your playing level">
                      <select value={f.level} onChange={(e) => update({ level: e.target.value })}>
                        <option value="">Select…</option>
                        {PLAYING_LEVELS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Your coaching philosophy" hint="Optional" wide>
                      <textarea maxLength={800} rows={5} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="How you develop players, what you focus on, and the results you’re proud of." />
                      <small>{f.bio.length}/800 characters</small>
                    </Field>
                  </div>
                  <h3>Your specialities *</h3>
                  <Chips options={SPECIALTIES} value={f.specialties} onToggle={(x) => toggle('specialties', x)} />
                  {errors.specialties && <p className="cb-error" role="alert">{errors.specialties}</p>}
                  <Credentials f={f} toggle={toggle} update={update} />
                  <PhotoInput preview={photoPreview} onChange={onPhoto} error={errors.photo} />
                </>
              )}

              {!teaching && step === 3 && (
                <>
                  <h2>How you work</h2>
                  <p>So we can set Fore up around the way you already coach.</p>
                  <h3>How you coach your players *</h3>
                  <Chips options={['In-person', 'Squad sessions', 'On-course playing lesson', 'Online video analysis', 'Tournament support']} value={f.formats} onToggle={(x) => toggle('formats', x)} />
                  {errors.formats && <p className="cb-error" role="alert">{errors.formats}</p>}
                  <h3>Tools you use today</h3>
                  <Chips options={TOOLS} value={f.tools} onToggle={(x) => toggle('tools', x)} />
                  <h3>What should Fore help with first?</h3>
                  <p className="cb-help cb-help-top">Pick up to three. We’ll start your setup there.</p>
                  <Chips
                    options={PRIORITIES}
                    value={f.priorities}
                    onToggle={(x) => (f.priorities.includes(x) || f.priorities.length < 3) && toggle('priorities', x)}
                  />
                </>
              )}

              {!teaching && step === 4 && (
                <>
                  <h2>Review & send</h2>
                  <p>Check your details, then send them to the Fore team. We’ll be in touch to set up your squad.</p>
                  <Review rows={[
                    ['Name', [view.firstName, view.lastName].join(' ')],
                    ['Contact', `${f.email.trim()} · +91 ${nationalPhone(f.phone)}`],
                    ['Program', [f.role, f.program.trim(), program.squad != null ? `${program.squad} players` : '', view.city].filter(Boolean).join(' · ')],
                    ['Players', f.groups.join(', ')],
                    ['Coaching', `${view.yearsCoaching} yrs · ${view.specialties.join(', ')}`],
                    ['Start with', f.priorities.join(', ') || 'We’ll decide together'],
                  ]} onPreview={() => setPreview(true)} />
                  <div className="cb-grid cb-gap-bottom"><HeardFrom value={f.heard} onChange={(heard) => update({ heard })} /></div>
                  <Consent checked={f.consent} error={errors.consent} onChange={(consent) => update({ consent })}>
                    I confirm these details are accurate, and I agree that ForeSports can store them, show them to players and parents I link with on Fore, and contact me by email or WhatsApp. My details are not listed publicly.
                  </Consent>
                </>
              )}

              {submitError && <p className="cb-error cb-submit-error" role="alert">{submitError}</p>}
              <div className="cb-footer">
                <button type="button" className="cb-button cb-outline" disabled={step === 0 || submitting} onClick={() => go(step - 1)}><ArrowLeft size={15} /> Back</button>
                <div>
                  <button type="button" className="cb-button cb-outline cb-mobile-only" onClick={() => setPreview(true)}><Eye size={15} /> Preview</button>
                  {step < STEPS.length - 1 ? (
                    <button type="button" className="cb-button cb-primary" onClick={next}>Continue <ArrowRight size={15} /></button>
                  ) : (
                    <button type="button" className="cb-button cb-primary" disabled={submitting} onClick={submit}>
                      {submitting ? <><Loader2 size={15} className="cb-spin" /> Sending…</> : <><Send size={15} /> {teaching ? 'Submit my profile' : 'Send to the Fore team'}</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <aside className="cb-signup-side">{livePreview}</aside>
          </div>
        ) : (
          <section className="cb-signup-wrap cb-preview">
            {teaching ? (
              <CoachProfileView
                coach={view}
                badge="Preview"
                draft
                aside={
                  <section className="cb-card cb-enquiry-card">
                    <h3>Enquire about lessons</h3>
                    <p>Golfers send enquiries through Fore. We pass them on to you, so your phone number and email stay private.</p>
                    <span className="cb-button cb-primary cb-fake">Send enquiry</span>
                  </section>
                }
              />
            ) : (
              <PerformancePreview coach={view} program={program} />
            )}
            <div className="cb-preview-actions">
              <button type="button" className="cb-button cb-outline" onClick={() => setPreview(false)}><ArrowLeft size={15} /> Keep editing</button>
              {reached >= STEPS.length - 1 ? (
                <button type="button" className="cb-button cb-primary" onClick={() => { setPreview(false); go(STEPS.length - 1); }}>Continue to submit <ArrowRight size={15} /></button>
              ) : (
                <button type="button" className="cb-button cb-primary" onClick={() => setPreview(false)}>Continue sign-up <ArrowRight size={15} /></button>
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
      <h3>Profile photo <em className="cb-optional">Optional</em></h3>
      <label className="cb-photo">
        {preview ? <img src={preview} alt="Your photo" /> : <span className="cb-photo-icon">＋</span>}
        <span>
          <strong>{preview ? 'Change photo' : 'Upload a profile photo'}</strong>
          <small>JPG, PNG or WebP. A clear, front-facing headshot works best, and profiles with a photo are chosen more often.</small>
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} />
      </label>
      {error && <p className="cb-error" role="alert">{error}</p>}
      {preview && <p className="cb-help">Your photo uploads when you submit. You’ll need to add it again if you leave this page before then.</p>}
    </>
  );
}

function Credentials({ f, toggle, update }: { f: Form; toggle: (field: ListField, v: string) => void; update: (p: Partial<Form>) => void }) {
  return (
    <>
      <h3>Certifications & memberships</h3>
      <p className="cb-help cb-help-top">Select only qualifications you hold now. The Fore team checks them before your profile shows them as verified.</p>
      <div className="cb-options">
        {CERTIFICATIONS.map((x) => (
          <button type="button" key={x} aria-pressed={f.certifications.includes(x)} className={f.certifications.includes(x) ? 'chosen' : ''} onClick={() => toggle('certifications', x)}>
            {f.certifications.includes(x) ? '✓' : '＋'} {x}
          </button>
        ))}
      </div>
      {f.certifications.includes('Other qualification') && (
        <div className="cb-grid cb-gap-top">
          <Field label="Other qualification" wide><input value={f.otherCert} onChange={(e) => update({ otherCert: e.target.value })} placeholder="e.g. SNAG Level 1" /></Field>
        </div>
      )}
    </>
  );
}

function HeardFrom({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="How did you hear about Fore?" wide>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {HEARD_FROM.map((x) => <option key={x}>{x}</option>)}
      </select>
    </Field>
  );
}

function Review({ rows, onPreview }: { rows: [string, string][]; onPreview: () => void }) {
  return (
    <div className="cb-review">
      {rows.map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
      <button type="button" className="cb-link" onClick={onPreview}><Eye size={14} /> See your full preview</button>
    </div>
  );
}

function Consent({ checked, error, onChange, children }: { checked: boolean; error?: string; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <>
      <label className={`cb-consent${error ? ' has-error' : ''}`}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{children} See the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>
      </label>
      {error && <p className="cb-error" role="alert">{error}</p>}
    </>
  );
}

/* ─── Performance coach previews ─────────────────────────────────── */

type Program = { role: string; name: string; squad: number | null; groups: string[]; disciplines: string[]; priorities: string[] };

function ProgramCard({ coach: c, program: p }: { coach: CoachView; program: Program }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your name';
  return (
    <div className="cb-program-card">
      <div className="cb-program-cover">
        <CoverArt variant={3} />
        <span className="cb-program-badge">★ Performance coach</span>
      </div>
      <div className="cb-program-body">
        <div className="cb-program-id">
          <div className="cb-avatar sm">{c.photoUrl ? <img src={c.photoUrl} alt="" /> : initials(c.firstName, c.lastName)}</div>
          <div>
            <strong>{name}</strong>
            <small>{[p.role || 'Your role', c.city].filter(Boolean).join(' · ')}</small>
          </div>
        </div>
        <div className="cb-program-line">{[p.name || 'Your program', p.squad != null ? `${p.squad} players` : ''].filter(Boolean).join(' · ')}</div>
        <div className="cb-live-chips">
          {(p.groups.length ? p.groups.slice(0, 3) : ['Who you coach']).map((x) => <span key={x} className={p.groups.length ? '' : 'is-empty'}>{x}</span>)}
        </div>
        <div className="cb-program-team">
          <small>Coaching team</small>
          <div>{(p.disciplines.length ? p.disciplines : ['Swing']).map((d) => <span key={d}>{d}</span>)}</div>
        </div>
      </div>
      <div className="cb-program-foot">
        <span>Players link to you</span>
        <b>Join squad →</b>
      </div>
    </div>
  );
}

function PerformancePreview({ coach: c, program: p }: { coach: CoachView; program: Program }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Your name';
  return (
    <article className="cb-profile cb-program-preview">
      <div className="cb-cover"><CoverArt wide variant={3} /></div>
      <header className="cb-profile-head">
        <div className="cb-avatar">{c.photoUrl ? <img src={c.photoUrl} alt="" /> : initials(c.firstName, c.lastName)}</div>
        <div className="cb-profile-id">
          <h2>{name}</h2>
          <p>{[p.role || 'Performance coach', p.name, c.city].filter(Boolean).join(' · ')}</p>
        </div>
        <small className="cb-profile-badge">Preview</small>
      </header>
      <div className="cb-stats">
        <div><strong>{c.yearsCoaching ?? '—'}</strong><span>Years coaching</span></div>
        <div><strong>{p.squad ?? '—'}</strong><span>Players</span></div>
        <div><strong>{p.disciplines.length || 1}</strong><span>Coaching areas</span></div>
        <div><strong>{c.certifications.length}</strong><span>Credentials</span></div>
      </div>
      <div className="cb-preview-grid">
        <div>
          <section className="cb-card">
            <h3>Coaching philosophy</h3>
            <p>{c.bio || 'Your coaching philosophy will appear here. Players and parents read it when they link to you.'}</p>
          </section>
          <section className="cb-card">
            <h3>Who I coach</h3>
            <div className="cb-chips">{p.groups.length ? p.groups.map((x) => <span key={x}>{x}</span>) : <em>Add the players you coach.</em>}</div>
          </section>
          <section className="cb-card">
            <h3>Specialities</h3>
            <div className="cb-chips">{c.specialties.length ? c.specialties.map((x) => <span key={x}>{x}</span>) : <em>Add your specialities.</em>}</div>
          </section>
        </div>
        <aside>
          <section className="cb-card">
            <h3>Coaching team</h3>
            <div className="cb-team-list">{(p.disciplines.length ? p.disciplines : ['Swing']).map((d) => <span key={d}><Check size={14} />{d}</span>)}</div>
          </section>
          <section className="cb-card">
            <h3>Credentials</h3>
            {c.certifications.length ? c.certifications.map((x) => <p className="cb-credential" key={x}><Check size={15} />{x}</p>) : <em>No credentials added yet.</em>}
          </section>
          <section className="cb-card cb-private-note">
            <h3>Private to your program</h3>
            <p>Only players, parents and coaches you link with see this. Performance coaches aren’t listed in the public directory.</p>
          </section>
        </aside>
      </div>
    </article>
  );
}

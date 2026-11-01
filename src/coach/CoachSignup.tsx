'use client';

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowLeft, ArrowRight, Check, Loader2, Share2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { SiteShell } from '../App';
import ScrollToTop from './ScrollToTop';
import { getSource } from './source';
import {
  CERTIFICATIONS,
  FORMATS,
  NO_QUALIFICATION,
  OTHER_QUALIFICATION,
  PHOTO_BUCKET,
  PLAYER_GROUPS,
  SPECIALTIES,
  type CoachType,
} from './shared';

const DRAFT_KEY = 'foresports-coach-signup-v5';
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
  otherQual: string;
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
  otherQual: '',
  squad: '',
  groups: [],
  consent: false,
};

const TYPE_OPTIONS: { value: CoachType; title: string; copy: string }[] = [
  { value: 'teaching', title: 'Lessons', copy: 'Private or group' },
  { value: 'performance', title: 'Squad', copy: 'Academy or elite players' },
];

const digits = (s: string) => s.replace(/\D/g, '');
const nationalPhone = (s: string) => digits(s).replace(/^(91|0)(?=\d{10}$)/, '');

function validate(step: number, f: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!f.type) e.type = 'Choose one.';
    if (!f.first.trim()) e.first = 'Enter your first name.';
    if (!f.last.trim()) e.last = 'Enter your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email.';
    if (nationalPhone(f.phone).length !== 10) e.phone = 'Enter a 10-digit number.';
    if (!f.city.trim()) e.city = 'Enter your city.';
  }
  if (step === 1) {
    const y = Number(f.experience);
    if (f.experience === '' || !Number.isInteger(y) || y < 0 || y > 60) e.experience = 'Enter 0 to 60.';
    if (!f.venue.trim()) e.venue = 'Enter where you coach.';
    if (f.type === 'performance') {
      const n = Number(f.squad);
      if (f.squad === '' || !Number.isInteger(n) || n < 1 || n > 2000) e.squad = 'Enter 1 to 2000.';
      if (!f.groups.length) e.groups = 'Choose at least one.';
    } else {
      if (!f.specialties.length) e.specialties = 'Choose at least one.';
      if (!f.formats.length) e.formats = 'Choose at least one.';
    }
    if (!f.certifications.length) e.certifications = 'Choose at least one.';
    else if (f.certifications.includes(OTHER_QUALIFICATION) && !f.otherQual.trim()) e.otherQual = 'Enter your qualification.';
    if (!f.bio.trim()) e.bio = f.type === 'performance' ? 'Add a line about how you coach.' : 'Add a line about yourself.';
    if (!f.consent) e.consent = 'Tick to continue.';
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

function Field({ label, error, wide, hint, field, children }: { label: ReactNode; error?: string; wide?: boolean; hint?: string; field?: string; children: ReactNode }) {
  return (
    <label className={`${wide ? 'wide ' : ''}${error ? 'has-error' : ''}`} data-field={field}>
      <span className="cb-label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <span className="cb-field-error" role="alert">{error}</span>}
    </label>
  );
}

function Checks({ legend, hint, options, value, onToggle, error, field }: {
  legend: string; hint?: string; options: readonly string[]; value: string[]; onToggle: (v: string) => void; error?: string; field?: string;
}) {
  return (
    <fieldset className={`cb-checks${error ? ' has-error' : ''}`} data-field={field}>
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
  const [copied, setCopied] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);

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

  // Screen readers and keyboards land on the confirmation, not on the old form position.
  useEffect(() => { if (result) doneHeading.current?.focus({ preventScroll: true }); }, [result]);

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
    let next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    if (field === 'certifications' && !current.includes(value)) {
      next = value === NO_QUALIFICATION ? [NO_QUALIFICATION] : next.filter((x) => x !== NO_QUALIFICATION);
    }
    update({ [field]: next } as Partial<Form>);
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: 'Use a JPG, PNG or WebP under 10 MB.' }));
      return;
    }
    try {
      const blob = await prepareImage(file);
      setPhotoFile(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: 'Couldn’t read that image. Try another.' }));
    }
  }

  function scrollToForm() {
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Checks a field once the coach leaves it, so mistakes show before they tap Continue. */
  function check(key: keyof Form) {
    const v = f[key];
    if (typeof v === 'string' && !v.trim()) return;
    const e = validate(step, f);
    setErrors((old) => ({ ...old, [key]: e[key] }));
  }

  /** Scrolls to and focuses the first field with a problem (it may be under the keyboard). */
  function focusFirstError(e: Errors) {
    requestAnimationFrame(() => {
      const first = Array.from(top.current?.querySelectorAll<HTMLElement>('[data-field]') ?? []).find(
        (el) => e[el.dataset.field as keyof Errors],
      );
      if (!first) return;
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
    });
  }

  function next() {
    const e = validate(0, f);
    setErrors(e);
    if (Object.keys(e).length) { focusFirstError(e); return; }
    setStep(1);
    scrollToForm();
  }

  async function submit() {
    const first = validate(0, f);
    if (Object.keys(first).length) { setErrors(first); setStep(0); scrollToForm(); return; }
    const e = validate(1, f);
    if (!photoFile) e.photo = 'Add a photo.';
    setErrors(e);
    if (Object.keys(e).length) { focusFirstError(e); return; }
    if (honeypot.current?.value) { setResult('saved'); return; }

    setSubmitting(true);
    setSubmitError('');
    const outcome = await save();
    setSubmitting(false);
    if (outcome === 'failed') {
      setSubmitError('Couldn’t save. Check your connection and try again.');
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
      certifications: f.certifications
        .filter((c) => c !== NO_QUALIFICATION)
        .map((c) => (c === OTHER_QUALIFICATION ? f.otherQual.trim().slice(0, 80) : c))
        .filter(Boolean),
      packages: [],
      formats: f.formats.length ? f.formats : ['In-person'],
      days: [],
      heard_from: getSource(),
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
    const shareUrl = 'https://www.foresports.in/coaches?utm_source=coach_referral';
    const shareText = 'I just reserved my coach profile on Fore. Reserve yours:';
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    const shareMore = async () => {
      try {
        if (navigator.share) { await navigator.share({ title: 'Fore for coaches', text: shareText, url: shareUrl }); return; }
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } catch {}
    };
    return (
      <SiteShell>
        <div className="cb-scope cb-page">
          <section className="cb-done">
            <span className="cb-done-ring"><Check size={26} /></span>
            <h1 ref={doneHeading} tabIndex={-1}>
              {result === 'duplicate' ? 'Welcome back.' : <>You’re in, {f.first.trim() || 'coach'}.</>}
            </h1>
            <p>
              {result === 'duplicate'
                ? 'You’re already signed up. We’ll be in touch.'
                : teaching ? 'Your profile is live. We launch on 1 December.' : 'We’ll call you to set up your squad.'}
            </p>
            <div className="cb-share">
              <strong>Know a coach who’d love this?</strong>
              <div className="cb-share-actions">
                <a className="button acid" href={whatsapp} target="_blank" rel="noreferrer">Send on WhatsApp</a>
                <button type="button" className="button light" onClick={shareMore}>
                  {copied ? <><Check size={16} /> Copied</> : <><Share2 size={16} /> Share</>}
                </button>
              </div>
            </div>
            {teaching && <NextLink className="cb-link" href="/coaches/directory">See Find a coach</NextLink>}
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
            {fixedType === 'performance' ? <>Set up your <em>squad.</em></> : <>Reserve your <em>profile.</em></>}
          </h1>

          <div className="cb-form">
            <div className="cb-progress-wrap">
              <span className="cb-step-label">Step {step + 1} of {STEPS.length}</span>
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
            </div>

            {step === 0 && (
              <form id="cb-about" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
                <h2>About you</h2>
                <p className="cb-form-lead">Your email and number stay private.</p>
                {!fixedType && (
                  <fieldset className={`cb-types${errors.type ? ' has-error' : ''}`} data-field="type">
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
                  <Field label="First name" error={errors.first} field="first">
                    <input name="given-name" autoComplete="given-name" autoCapitalize="words" autoCorrect="off" spellCheck={false} enterKeyHint="next" value={f.first} onChange={(e) => update({ first: e.target.value })} onBlur={() => check('first')} />
                  </Field>
                  <Field label="Last name" error={errors.last} field="last">
                    <input name="family-name" autoComplete="family-name" autoCapitalize="words" autoCorrect="off" spellCheck={false} enterKeyHint="next" value={f.last} onChange={(e) => update({ last: e.target.value })} onBlur={() => check('last')} />
                  </Field>
                  <Field label="Email" error={errors.email} wide field="email">
                    <input type="email" name="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" value={f.email} onChange={(e) => update({ email: e.target.value })} onBlur={() => check('email')} placeholder="you@example.com" />
                  </Field>
                  <Field label="WhatsApp number" error={errors.phone} field="phone">
                    <div className="cb-phone"><span>+91</span><input type="tel" name="tel-national" inputMode="tel" autoComplete="tel-national" maxLength={16} enterKeyHint="next" value={f.phone} onChange={(e) => update({ phone: e.target.value })} onBlur={() => check('phone')} placeholder="98765 43210" /></div>
                  </Field>
                  <Field label="City" error={errors.city} field="city">
                    <input name="address-level2" autoComplete="address-level2" autoCapitalize="words" enterKeyHint="go" value={f.city} onChange={(e) => update({ city: e.target.value })} onBlur={() => check('city')} placeholder="Gurugram" />
                  </Field>
                </div>
                <input ref={honeypot} className="cb-hp" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
              </form>
            )}

            {step === 1 && (
              <>
                <h2>{teaching ? 'Your coaching' : 'Your squad'}</h2>
                <div className="cb-grid cb-gap-top">
                  <Field label="Years coaching" error={errors.experience} field="experience">
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={f.experience} onChange={(e) => update({ experience: digits(e.target.value) })} onBlur={() => check('experience')} placeholder="12" />
                  </Field>
                  {!teaching && (
                    <Field label="Players" error={errors.squad} field="squad">
                      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={f.squad} onChange={(e) => update({ squad: digits(e.target.value) })} onBlur={() => check('squad')} placeholder="14" />
                    </Field>
                  )}
                  <Field label="Where you coach" error={errors.venue} wide field="venue">
                    <input value={f.venue} maxLength={120} autoCapitalize="words" onChange={(e) => update({ venue: e.target.value })} onBlur={() => check('venue')} placeholder="Club, course or range" />
                  </Field>
                </div>

                {teaching ? (
                  <>
                    <Checks legend="Specialities" options={SPECIALTIES} value={f.specialties} onToggle={(x) => toggle('specialties', x)} error={errors.specialties} field="specialties" />
                    <Checks legend="Lesson types" options={FORMATS} value={f.formats} onToggle={(x) => toggle('formats', x)} error={errors.formats} field="formats" />
                  </>
                ) : (
                  <Checks legend="Who you coach" options={PLAYER_GROUPS} value={f.groups} onToggle={(x) => toggle('groups', x)} error={errors.groups} field="groups" />
                )}

                <Checks
                  legend="Qualifications"
                  options={[...CERTIFICATIONS, OTHER_QUALIFICATION, NO_QUALIFICATION]}
                  value={f.certifications}
                  onToggle={(x) => toggle('certifications', x)}
                  error={errors.certifications}
                  field="certifications"
                />
                {f.certifications.includes(OTHER_QUALIFICATION) && (
                  <div className="cb-grid cb-gap-top">
                    <Field label="Other qualification" error={errors.otherQual} wide field="otherQual">
                      <input value={f.otherQual} maxLength={80} autoCapitalize="words" onChange={(e) => update({ otherQual: e.target.value })} onBlur={() => check('otherQual')} placeholder="e.g. Golf Australia Level 2" />
                    </Field>
                  </div>
                )}

                <div className="cb-grid cb-gap-top">
                  <Field label={teaching ? 'Short bio' : 'Coaching philosophy'} error={errors.bio} wide field="bio">
                    <textarea maxLength={800} rows={3} value={f.bio} onChange={(e) => update({ bio: e.target.value })} onBlur={() => check('bio')} placeholder={teaching ? 'How you coach and who you work best with' : 'How you develop players'} />
                  </Field>
                </div>

                <label className={`cb-photo${errors.photo ? ' has-error' : ''}`} data-field="photo">
                  <span className="cb-photo-img">{photoPreview ? <img src={photoPreview} alt="Your photo" /> : '+'}</span>
                  <span>
                    <strong>{photoPreview ? 'Change photo' : 'Add a profile photo'}</strong>
                    <small>A clear headshot</small>
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} />
                </label>
                {errors.photo && <p className="cb-error" role="alert">{errors.photo}</p>}

                <label className={`cb-consent${errors.consent ? ' has-error' : ''}`} data-field="consent">
                  <input type="checkbox" checked={f.consent} onChange={(e) => update({ consent: e.target.checked })} />
                  <span>
                    Fore can list my profile, without my email or number, and contact me.{' '}
                    <a href="/privacy" target="_blank" rel="noreferrer">Privacy</a>
                  </span>
                </label>
                {errors.consent && <p className="cb-error" role="alert">{errors.consent}</p>}
              </>
            )}

            {submitError && <p className="cb-error cb-submit-error" role="alert">{submitError}</p>}
            <div className={`cb-footer${step === 0 ? ' solo' : ''}`}>
              {step > 0 && (
                <button type="button" className="cb-back" disabled={submitting} onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
              )}
              {step === 0 ? (
                <button type="submit" form="cb-about" className="button acid">Continue <ArrowRight size={16} /></button>
              ) : (
                <button type="button" className="button acid" disabled={submitting} onClick={submit}>
                  {submitting ? <><Loader2 size={16} className="cb-spin" /> Saving…</> : teaching ? 'Reserve profile' : 'Reserve spot'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

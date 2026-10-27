"use client";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, Eye, Loader2, X } from "lucide-react";
import { supabase } from "../../src/lib/supabase";
import CoachProfileView from "../../src/coach/CoachProfileView";
import CoachCard from "../../src/coach/CoachCard";
import { SiteShell } from "../../src/App";
import {
  CERTIFICATIONS,
  FORMATS,
  PHOTO_BUCKET,
  PLAYING_LEVELS,
  SPECIALTIES,
  WEEKDAYS,
  type CoachView,
} from "../../src/coach/shared";
import "../../src/coach/coach.css";

const DRAFT_KEY = "foresports-coach-signup-draft-v3";
const STEPS = ["About you", "Your coaching", "Profile & pricing"];
const PRICE_PLACEHOLDERS = ["1,500", "5,000", "15,000"];

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
  specialties: string[];
  certifications: string[];
  otherCert: string;
  packages: Pkg[];
  formats: string[];
  days: string[];
  start: string;
  end: string;
};
type ListField = "specialties" | "certifications" | "days" | "formats";
type Errors = Partial<Record<keyof Form | "photo", string>>;

const defaults: Form = {
  first: "",
  last: "",
  email: "",
  phone: "",
  city: "",
  experience: "",
  level: "",
  venue: "",
  bio: "",
  specialties: [],
  certifications: [],
  otherCert: "",
  packages: [
    { name: "Trial lesson", price: "", detail: "A first session to understand your game" },
    { name: "Lesson pack", price: "", detail: "4 coaching sessions" },
    { name: "Monthly programme", price: "", detail: "Ongoing coaching and progress tracking" },
  ],
  formats: ["In-person"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  start: "06:00",
  end: "19:00",
};

const digits = (s: string) => s.replace(/\D/g, "");
const nationalPhone = (s: string) => digits(s).replace(/^(91|0)(?=\d{10}$)/, "");
const priceNumber = (s: string) => {
  const n = parseInt(digits(s), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function validateStep(step: number, f: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!f.first.trim()) e.first = "Enter your first name.";
    if (!f.last.trim()) e.last = "Enter your last name.";
    if (nationalPhone(f.phone).length !== 10) e.phone = "Enter a 10-digit mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email, like name@gmail.com.";
    if (!f.city.trim()) e.city = "Enter the city you coach in.";
  }
  if (step === 1) {
    const y = Number(f.experience);
    if (f.experience === "" || !Number.isInteger(y) || y < 0 || y > 60) e.experience = "Enter a number from 0 to 60.";
    if (!f.specialties.length) e.specialties = "Pick at least one.";
    if (!f.formats.length) e.formats = "Pick at least one.";
  }
  if (step === 2) {
    if (f.start && f.end && f.start >= f.end) e.end = "Pick a time after the start time.";
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
      el.onerror = () => reject(new Error("unreadable"));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(600, side);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Field({ label, error, wide, optional, children }: { label: ReactNode; error?: string; wide?: boolean; optional?: boolean; children: ReactNode }) {
  return (
    <label className={`su-field${wide ? " wide" : ""}${error ? " has-error" : ""}`}>
      <span className="su-label">
        {label}
        {optional && <em>Optional</em>}
      </span>
      {children}
      {error && <span className="su-error">{error}</span>}
    </label>
  );
}

function Group({ title, optional, error, children }: { title: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <fieldset className={`su-group${error ? " has-error" : ""}`}>
      <legend className="su-label">
        {title}
        {optional && <em>Optional</em>}
      </legend>
      {children}
      {error && <span className="su-error" role="alert">{error}</span>}
    </fieldset>
  );
}

export default function CoachSignup() {
  const [f, setF] = useState<Form>(defaults);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [preview, setPreview] = useState(false);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [photoFile, setPhotoFile] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const formTop = useRef<HTMLElement>(null);

  // Restore an unfinished sign-up from this browser.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        setF({ ...defaults, ...d.form });
        setReached(Math.min(Number(d.reached) || 0, STEPS.length - 1));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || done) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: f, reached }));
    } catch {}
  }, [f, reached, ready, done]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  // Full-profile preview: close on Escape and keep the page behind it still.
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreview(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [preview]);

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
  function setPackage(i: number, patch: Partial<Pkg>) {
    update({ packages: f.packages.map((x, j) => (i === j ? { ...x, ...patch } : x)) });
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: "Choose a JPG, PNG or WebP image under 10 MB." }));
      return;
    }
    try {
      const blob = await prepareImage(file);
      setPhotoFile(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: "We couldn't read that image. Try a different one." }));
    }
  }

  function go(next: number) {
    setStep(next);
    setSubmitError("");
    formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function next() {
    const e = validateStep(step, f);
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
      yearsCoaching: f.experience === "" ? null : Number(f.experience),
      playingLevel: f.level,
      bio: f.bio.trim(),
      photoUrl: photoPreview,
      specialties: f.specialties,
      certifications: certificationList(f),
      packages: f.packages.map((p) => ({ name: p.name, price: priceNumber(p.price), detail: p.detail.trim() })),
      formats: f.formats,
      days: WEEKDAYS.filter((d) => f.days.includes(d)),
      startTime: f.start,
      endTime: f.end,
      verified: false,
    }),
    [f, photoPreview],
  );

  async function submit() {
    for (let s = 0; s < STEPS.length; s++) {
      const e = validateStep(s, f);
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
    if (!supabase) {
      setSubmitError("We couldn't send your profile right now. Email hello@foresports.in and we'll set it up for you.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      let photo_path: string | null = null;
      if (photoFile) {
        const path = `signups/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, photoFile, { contentType: "image/jpeg", upsert: false });
        if (!error) photo_path = path;
        else console.error("Coach photo upload failed", error);
      }
      const { error } = await supabase.from("coach_profiles").insert({
        first_name: view.firstName,
        last_name: view.lastName,
        email: f.email.trim().toLowerCase(),
        phone: "+91" + nationalPhone(f.phone),
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
        start_time: f.start || null,
        end_time: f.end || null,
        // Agreement is given by submitting; the terms line sits directly above the button.
        consent: true,
        source: "coach_signup",
      });
      if (error) {
        if (error.code === "23505") {
          setSubmitError("There's already a profile with this email. To update it, email hello@foresports.in.");
        } else {
          console.error("Coach sign-up failed", error);
          setSubmitError("We couldn't send your profile. Check your connection and try again.");
        }
        return;
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setDone(true);
      setPreview(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Coach sign-up failed", err);
      setSubmitError("We couldn't send your profile. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SiteShell>
        <div className="cb-scope cb-page">
          <section className="su-done">
            <div className="su-done-ring"><Check size={30} strokeWidth={2.5} /></div>
            <h1>You're all set, {view.firstName || "coach"}.</h1>
            <p>Our team is giving your profile a quick check. We'll email <strong>{f.email.trim()}</strong> the moment it's live.</p>
            <div className="su-done-card">
              <CoachCard coach={view} />
            </div>
            <div className="cb-done-actions">
              <a className="cb-button cb-primary" href="/coaches/directory">See the coach directory <ArrowRight size={16} /></a>
              <a className="cb-button cb-outline" href="/coaches">Fore for coaches</a>
            </div>
            <p className="su-done-help">Want to change something? Email <a href="mailto:hello@foresports.in">hello@foresports.in</a></p>
          </section>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="cb-scope cb-page">
        <header className="su-head">
          <div className="section-label"><span />For coaches</div>
          <h1>Get found by golfers <em>looking for a coach.</em></h1>
          <p>Create your Fore profile in five minutes. Golfers in your city compare coaches, see your lessons and prices, and message you directly.</p>
          <ul className="su-values">
            <li><Check size={16} aria-hidden="true" /> Listed where golfers search</li>
            <li><Check size={16} aria-hidden="true" /> Your prices, your schedule</li>
            <li><Check size={16} aria-hidden="true" /> No upfront cost</li>
          </ul>
        </header>

        <div className="su-layout">
          <section className="su-form" ref={formTop} aria-labelledby="su-step-title">
            <nav className="su-steps" aria-label="Sign-up steps">
              {STEPS.map((label, i) => (
                <button
                  type="button"
                  key={label}
                  className={i === step ? "is-current" : i < reached || i < step ? "is-done" : ""}
                  aria-current={i === step ? "step" : undefined}
                  disabled={i > reached || submitting}
                  onClick={() => go(i)}
                >
                  <span className="su-steps-bar" />
                  <span className="su-steps-text"><b>{i + 1}</b> {label}</span>
                </button>
              ))}
            </nav>

            <div className="su-body" key={step}>
              {ready && step === 0 && (
                <>
                  <h2 id="su-step-title">Let's start with you</h2>
                  <div className="su-grid">
                    <Field label="First name" error={errors.first}><input autoComplete="given-name" value={f.first} onChange={(e) => update({ first: e.target.value })} placeholder="Raj" /></Field>
                    <Field label="Last name" error={errors.last}><input autoComplete="family-name" value={f.last} onChange={(e) => update({ last: e.target.value })} placeholder="Mehta" /></Field>
                    <Field label="WhatsApp number" error={errors.phone}>
                      <div className="su-phone"><span>+91</span><input type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="98765 43210" /></div>
                    </Field>
                    <Field label="Email" error={errors.email}><input type="email" autoComplete="email" value={f.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" /></Field>
                    <Field label="City you coach in" error={errors.city} wide><input autoComplete="address-level2" value={f.city} onChange={(e) => update({ city: e.target.value })} placeholder="Gurugram" /></Field>
                  </div>
                </>
              )}

              {ready && step === 1 && (
                <>
                  <h2 id="su-step-title">Your coaching</h2>
                  <div className="su-grid">
                    <Field label="Years coaching" error={errors.experience}><input type="number" min="0" max="60" inputMode="numeric" value={f.experience} onChange={(e) => update({ experience: e.target.value })} placeholder="12" /></Field>
                    <Field label="Playing background" optional>
                      <select value={f.level} onChange={(e) => update({ level: e.target.value })}>
                        <option value="">Select</option>
                        {PLAYING_LEVELS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                    <Field label="Home course or academy" optional wide><input value={f.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="DLF Golf & Country Club" /></Field>
                  </div>

                  <Group title="What do you coach best?" error={errors.specialties}>
                    <div className="su-chips">
                      {SPECIALTIES.map((x) => (
                        <button type="button" key={x} aria-pressed={f.specialties.includes(x)} onClick={() => toggle("specialties", x)}>
                          {f.specialties.includes(x) && <Check size={14} aria-hidden="true" />}{x}
                        </button>
                      ))}
                    </div>
                  </Group>

                  <Group title="How do you coach?" error={errors.formats}>
                    <div className="su-chips">
                      {FORMATS.map((x) => (
                        <button type="button" key={x} aria-pressed={f.formats.includes(x)} onClick={() => toggle("formats", x)}>
                          {f.formats.includes(x) && <Check size={14} aria-hidden="true" />}{x}
                        </button>
                      ))}
                    </div>
                  </Group>

                  <Group title="Qualifications" optional>
                    <div className="su-chips">
                      {CERTIFICATIONS.map((x) => (
                        <button type="button" key={x} aria-pressed={f.certifications.includes(x)} onClick={() => toggle("certifications", x)}>
                          {f.certifications.includes(x) && <Check size={14} aria-hidden="true" />}{x}
                        </button>
                      ))}
                    </div>
                    {f.certifications.includes("Other qualification") && (
                      <input className="su-gap" aria-label="Other qualification" value={f.otherCert} onChange={(e) => update({ otherCert: e.target.value })} placeholder="e.g. SNAG Level 1" />
                    )}
                  </Group>
                </>
              )}

              {ready && step === 2 && (
                <>
                  <h2 id="su-step-title">Your profile & pricing</h2>

                  <div className="su-photo-row">
                    <label className="su-photo">
                      {photoPreview ? <img src={photoPreview} alt="Your photo" /> : <Camera size={22} aria-hidden="true" />}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} aria-label="Profile photo" />
                    </label>
                    <div>
                      <strong>Profile photo</strong>
                      <label className="su-photo-btn">
                        {photoPreview ? "Change photo" : "Upload a headshot"}
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} tabIndex={-1} aria-hidden="true" />
                      </label>
                      {errors.photo && <span className="su-error" role="alert">{errors.photo}</span>}
                    </div>
                  </div>

                  <Field label="About you" optional wide>
                    <textarea maxLength={800} rows={4} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="Your background, how you coach and the golfers you love working with." />
                    <small className="su-count">{f.bio.length}/800</small>
                  </Field>

                  <Group title="Lesson prices">
                    <ul className="su-prices">
                      {f.packages.map((item, i) => (
                        <li key={item.name}>
                          <div>
                            <strong>{item.name}</strong>
                            <input className="su-detail" aria-label={`${item.name}: what's included`} value={item.detail} maxLength={120} onChange={(e) => setPackage(i, { detail: e.target.value })} />
                          </div>
                          <div className="su-money">
                            <span>₹</span>
                            <input inputMode="numeric" aria-label={`${item.name} price in rupees`} value={item.price} onChange={(e) => setPackage(i, { price: e.target.value.replace(/[^\d,]/g, "") })} placeholder={PRICE_PLACEHOLDERS[i]} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Group>

                  <Group title="When do you coach?" error={errors.end}>
                    <div className="su-days">
                      {WEEKDAYS.map((x) => (
                        <button type="button" key={x} aria-pressed={f.days.includes(x)} onClick={() => toggle("days", x)}>{x}</button>
                      ))}
                    </div>
                    <div className="su-hours">
                      <label><span className="sr-only">From</span><input type="time" value={f.start} onChange={(e) => update({ start: e.target.value })} /></label>
                      <span aria-hidden="true">to</span>
                      <label><span className="sr-only">Until</span><input type="time" value={f.end} onChange={(e) => update({ end: e.target.value })} /></label>
                    </div>
                  </Group>
                </>
              )}
            </div>

            {/* Spam trap: kept mounted on every step so it is still there at submit. */}
            <input ref={honeypot} className="cb-hp" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />

            {submitError && <p className="cb-error su-submit-error" role="alert">{submitError}</p>}

            <div className="su-footer">
              {step > 0 ? (
                <button type="button" className="su-back" disabled={submitting} onClick={() => go(step - 1)}><ArrowLeft size={16} /> Back</button>
              ) : (
                <button type="button" className="su-back su-preview-link" onClick={() => setPreview(true)}><Eye size={16} /> Preview</button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="cb-button cb-primary" onClick={next}>Continue <ArrowRight size={16} /></button>
              ) : (
                <button type="button" className="cb-button cb-primary" disabled={submitting} onClick={submit}>
                  {submitting ? <><Loader2 size={16} className="cb-spin" /> Submitting…</> : <>Submit profile <ArrowRight size={16} /></>}
                </button>
              )}
            </div>
            {step === STEPS.length - 1 && (
              <p className="su-terms">By submitting, you agree to our <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
            )}
          </section>

          <aside className="su-side" aria-label="How golfers see your listing">
            <div className="su-side-head">
              <span>How golfers see you</span>
              <button type="button" className="cb-link" onClick={() => setPreview(true)}><Eye size={15} /> Full profile</button>
            </div>
            <CoachCard coach={view} draft />
          </aside>
        </div>

        {preview && (
          <div className="su-overlay" role="dialog" aria-modal="true" aria-label="Profile preview">
            <div className="su-overlay-bar">
              <span>Profile preview</span>
              <button type="button" className="cb-button cb-outline" onClick={() => setPreview(false)} autoFocus>
                <X size={16} /> Close
              </button>
            </div>
            <div className="su-overlay-body">
              <CoachProfileView
                coach={view}
                draft
                aside={
                  <div className="cb-enquiry is-mock" aria-hidden="true">
                    <h3>Message {view.firstName || "you"}</h3>
                    <div className="mock-input">Your name</div>
                    <div className="mock-input">Email</div>
                    <div className="mock-input tall">Your handicap, what you'd like to work on…</div>
                    <span className="cb-button cb-primary">Send message</span>
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function certificationList(f: Form): string[] {
  const list = f.certifications.filter((c) => c !== "Other qualification");
  if (f.certifications.includes("Other qualification") && f.otherCert.trim()) list.push(f.otherCert.trim());
  return list;
}

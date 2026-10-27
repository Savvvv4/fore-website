"use client";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, Loader2, Send } from "lucide-react";
import { getSupabase } from "../../src/lib/supabase";
import CoachProfileView from "../../src/coach/CoachProfileView";
import { SiteShell } from "../../src/App";
import {
  CERTIFICATIONS,
  FORMATS,
  HEARD_FROM,
  PHOTO_BUCKET,
  PLAYING_LEVELS,
  SPECIALTIES,
  WEEKDAYS,
  formatINR,
  initials,
  lowestPrice,
  type CoachView,
} from "../../src/coach/shared";
import "../../src/coach/coach.css";

const DRAFT_KEY = "foresports-coach-signup-draft-v2";
const STEPS = ["Your details", "Your coaching", "Specialities & credentials", "Packages & format", "Availability & submit"];

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
  heard: string;
  consent: boolean;
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
    { name: "Lesson pack", price: "", detail: "A block of 4 coaching sessions" },
    { name: "Monthly programme", price: "", detail: "Ongoing coaching and progress tracking" },
  ],
  formats: ["In-person"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  start: "06:00",
  end: "19:00",
  heard: "",
  consent: false,
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address, like name@gmail.com.";
    if (nationalPhone(f.phone).length !== 10) e.phone = "Enter a 10-digit mobile number.";
    if (!f.city.trim()) e.city = "Enter the city you coach in.";
  }
  if (step === 1) {
    const y = Number(f.experience);
    if (f.experience === "" || !Number.isInteger(y) || y < 0 || y > 60) e.experience = "Enter your years of coaching, from 0 to 60.";
  }
  if (step === 2 && !f.specialties.length) e.specialties = "Pick at least one speciality.";
  if (step === 3 && !f.formats.length) e.formats = "Pick at least one way you coach.";
  if (step === 4) {
    if (f.start && f.end && f.start >= f.end) e.end = "Choose an end time after the start time.";
    if (!f.consent) e.consent = "Tick the box so we can contact you about your profile.";
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

function Field({ label, error, wide, hint, children }: { label: ReactNode; error?: string; wide?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className={`${wide ? "wide " : ""}${error ? "has-error" : ""}`}>
      <span className="cb-label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <span className="cb-field-error">{error}</span>}
    </label>
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        setF({ ...defaults, ...d.form, consent: false });
        setReached(Math.min(Number(d.reached) || 0, STEPS.length - 1));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || done) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: { ...f, consent: false }, reached }));
    } catch {}
  }, [f, reached, ready, done]);

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
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: "Choose a JPG, PNG or WebP image smaller than 10 MB." }));
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
    setSubmitting(true);
    const supabase = await getSupabase();
    if (!supabase) {
      setSubmitting(false);
      setSubmitError("Sign-ups aren't connected yet. Email hello@foresports.in and we'll set up your profile for you.");
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
        heard_from: f.heard || null,
        consent: f.consent,
        source: "coach_signup",
      });
      if (error) {
        if (error.code === "23505") {
          setSubmitError("A coach profile with this email already exists. To change it, email hello@foresports.in.");
        } else {
          console.error("Coach sign-up failed", error);
          setSubmitError("We couldn't send your sign-up. Check your connection and try again. Your answers are still here.");
        }
        return;
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setDone(true);
      setPreview(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Coach sign-up failed", err);
      setSubmitError("We couldn't send your sign-up. Check your connection and try again. Your answers are still here.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <SiteShell>
        <div className="cb-scope cb-page"><p className="cb-loading">Loading coach sign-up…</p></div>
      </SiteShell>
    );
  }

  const fromPrice = lowestPrice(view.packages);
  const liveCard = (
    <div className="aud-mock cb-live-card" aria-label="Live preview of your profile card">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-bar-label">FORE · YOUR COACH PROFILE</span>
        <span className="mock-preview-badge">Live preview</span>
      </div>
      <div className="mock-body">
        <div className="cb-live-head">
          <div className="cb-live-avatar">{photoPreview ? <img src={photoPreview} alt="" /> : initials(view.firstName, view.lastName)}</div>
          <div>
            <strong>{[view.firstName, view.lastName].filter(Boolean).join(" ") || "Your name"}</strong>
            <span>{["Golf coach", view.yearsCoaching != null ? `${view.yearsCoaching} yrs` : "", view.city].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
        <div className="cb-live-chips">
          {(view.specialties.length ? view.specialties.slice(0, 4) : ["Your specialities"]).map((x) => (
            <span key={x} className={view.specialties.length ? "" : "is-empty"}>{x}</span>
          ))}
        </div>
        <div className="cb-live-label">Coaching days</div>
        <div className="cb-live-days">
          {WEEKDAYS.map((d) => <span key={d} className={f.days.includes(d) ? "on" : ""}>{d[0]}</span>)}
        </div>
        <div className="cb-live-foot">
          <div>
            <strong>{fromPrice ? formatINR(fromPrice) : "₹ —"}</strong>
            <span>{fromPrice ? "lessons from" : "add your prices"}</span>
          </div>
          <span className="cb-live-cta">Enquire</span>
        </div>
      </div>
    </div>
  );

  if (done) {
    return (
      <SiteShell>
        <div className="cb-scope cb-page">
          <section className="container cb-done">
            <div className="cb-done-ring"><Check size={30} /></div>
            <div className="section-label"><span />Profile received</div>
            <h1>Thanks, {view.firstName || "coach"}. <em>You're on Fore early.</em></h1>
            <p>We'll review your profile and email {f.email.trim() || "you"} as soon as it's live in the Fore coach directory.</p>
            <ol className="cb-next">
              <li><span>1</span><div><strong>We review your profile</strong>The Fore team checks your details and credentials, usually within a few days.</div></li>
              <li><span>2</span><div><strong>Golfers find you</strong>Your profile goes live in the coach directory with a founding coach badge, and golfers can send you enquiries.</div></li>
              <li><span>3</span><div><strong>First into the app</strong>You'll get early access when bookings, payments and student tools open.</div></li>
            </ol>
            <div className="button-row center">
              <a className="button acid" href="/coaches/directory">Browse the coach directory <ArrowRight size={16} /></a>
              <a className="button light" href="/coaches">Back to Fore for coaches</a>
            </div>
            <p className="cb-help">Need to change something? Email <strong>hello@foresports.in</strong>.</p>
          </section>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
    <div className="cb-scope cb-page">
      <section className={`aud-hero-section cb-hero${preview ? " is-preview" : ""}`}>
        <div className="container aud-hero">
          <div className="aud-hero-copy">
            <div className="section-label"><span />{preview ? "Profile preview" : "Founding coaches"}</div>
            <h1>{preview ? <>Your profile, <em>as golfers see it.</em></> : <>Get found by golfers <em>before launch.</em></>}</h1>
            <p>
              {preview
                ? "Nothing is submitted yet. Once our team approves your profile, this is what golfers see in the Fore coach directory."
                : "Create your Fore coach profile in about five minutes. We review every profile, and approved coaches are listed in the Fore coach directory from day one."}
            </p>
            <div className="button-row">
              {preview ? (
                <button type="button" className="button acid" onClick={() => setPreview(false)}><ArrowLeft size={16} /> Back to editing</button>
              ) : (
                <>
                  <a className="button acid" href="#sign-up">Start your profile <ArrowRight size={16} /></a>
                  <button type="button" className="button light" onClick={() => setPreview(true)}><Eye size={16} /> Preview your profile</button>
                </>
              )}
            </div>
            {!preview && (
              <ul className="cb-hero-facts">
                <li>About 5 minutes</li>
                <li>Reviewed by the Fore team</li>
                <li>No upfront cost</li>
              </ul>
            )}
          </div>
          {!preview && liveCard}
        </div>
      </section>

      <div id="sign-up" className="cb-anchor" />
      {!preview ? (
        <div className="cb-layout">
          <aside className="cb-steps">
            <div className="section-label"><span />Your profile</div>
            {STEPS.map((label, i) => (
              <button
                type="button"
                key={label}
                className={step === i ? "current" : i < reached || (i === reached && i !== step) ? "visited" : ""}
                disabled={i > reached}
                onClick={() => go(i)}
              >
                <span>{i < reached && step !== i ? <Check size={13} /> : i + 1}</span>
                {label}
              </button>
            ))}
            <p>Your progress saves in this browser. Your email and phone number are never shown on your profile.</p>
          </aside>

          <section className="cb-form" ref={formTop}>
            <div className="section-label"><span />Step {step + 1} of {STEPS.length}</div>
            <div className="cb-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>

            {step === 0 && (
              <>
                <h2>Your details</h2>
                <p>The name golfers will see, and how the Fore team can reach you.</p>
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

            {step === 1 && (
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
                  <Field label="Home course or venue" wide><input value={f.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="e.g. DLF Golf & Country Club" /></Field>
                  <Field label="About you" hint="3–5 sentences" wide>
                    <textarea maxLength={800} rows={6} value={f.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="Describe your coaching background, playing experience, approach, and the golfers you work best with." />
                    <small>{f.bio.length}/800 characters</small>
                  </Field>
                </div>
                <h3>Profile photo <em className="cb-optional">Optional</em></h3>
                <label className="cb-photo">
                  {photoPreview ? <img src={photoPreview} alt="Your photo" /> : <span className="cb-photo-icon">＋</span>}
                  <strong>{photoPreview ? "Change photo" : "Upload a profile photo"}</strong>
                  <span>JPG, PNG or WebP · a clear, front-facing headshot works best</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} />
                </label>
                {errors.photo && <p className="cb-error" role="alert">{errors.photo}</p>}
                {photoPreview && <p className="cb-help">Your photo uploads when you submit. You'll need to add it again if you leave this page before then.</p>}
              </>
            )}

            {step === 2 && (
              <>
                <h2>Specialities & credentials</h2>
                <p>Golfers filter the coach directory by these, so pick what you're best at.</p>
                <h3>Coaching specialities *</h3>
                <div className="cb-chips">
                  {SPECIALTIES.map((x) => (
                    <button type="button" key={x} aria-pressed={f.specialties.includes(x)} className={f.specialties.includes(x) ? "chosen" : ""} onClick={() => toggle("specialties", x)}>
                      {f.specialties.includes(x) ? "✓ " : ""}{x}
                    </button>
                  ))}
                </div>
                {errors.specialties && <p className="cb-error" role="alert">{errors.specialties}</p>}
                <h3>Certifications & memberships</h3>
                <p className="cb-help">Select only qualifications you hold now. The Fore team checks them before your profile shows them as verified.</p>
                <div className="cb-options">
                  {CERTIFICATIONS.map((x) => (
                    <button type="button" key={x} aria-pressed={f.certifications.includes(x)} className={f.certifications.includes(x) ? "chosen" : ""} onClick={() => toggle("certifications", x)}>
                      {f.certifications.includes(x) ? "✓" : "＋"} {x}
                    </button>
                  ))}
                </div>
                {f.certifications.includes("Other qualification") && (
                  <div className="cb-grid cb-gap-top">
                    <Field label="Other qualification" wide><input value={f.otherCert} onChange={(e) => update({ otherCert: e.target.value })} placeholder="e.g. SNAG Level 1" /></Field>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2>Packages & format</h2>
                <p>Indicative prices in rupees. You can change them before bookings open on Fore.</p>
                {f.packages.map((item, i) => (
                  <div className="cb-package" key={item.name}>
                    <h3>{item.name}</h3>
                    <div className="cb-package-row">
                      <label>
                        <span className="cb-label">Price (₹)</span>
                        <div className="cb-money"><span>₹</span><input inputMode="numeric" value={item.price} onChange={(e) => update({ packages: f.packages.map((x, j) => (i === j ? { ...x, price: e.target.value.replace(/[^\d,]/g, "") } : x)) })} placeholder={["1,200", "4,500", "12,000"][i]} /></div>
                      </label>
                      <label>
                        <span className="cb-label">What's included</span>
                        <input value={item.detail} maxLength={120} onChange={(e) => update({ packages: f.packages.map((x, j) => (i === j ? { ...x, detail: e.target.value } : x)) })} />
                      </label>
                    </div>
                  </div>
                ))}
                <p className="cb-help">Leave a price blank to hide that package. Bookings and payments aren't live yet.</p>
                <h3>How do you coach? *</h3>
                <div className="cb-chips">
                  {FORMATS.map((x) => (
                    <button type="button" key={x} aria-pressed={f.formats.includes(x)} className={f.formats.includes(x) ? "chosen" : ""} onClick={() => toggle("formats", x)}>
                      {f.formats.includes(x) ? "✓ " : ""}{x}
                    </button>
                  ))}
                </div>
                {errors.formats && <p className="cb-error" role="alert">{errors.formats}</p>}
              </>
            )}

            {step === 4 && (
              <>
                <h2>Availability & submit</h2>
                <p>Give golfers a broad idea of when you coach, then send your profile to the Fore team.</p>
                <h3>Coaching days</h3>
                <div className="cb-days">
                  {WEEKDAYS.map((x) => (
                    <button type="button" key={x} aria-pressed={f.days.includes(x)} className={f.days.includes(x) ? "chosen" : ""} onClick={() => toggle("days", x)}>{x}</button>
                  ))}
                </div>
                <div className="cb-grid">
                  <Field label="Sessions start from"><input type="time" value={f.start} onChange={(e) => update({ start: e.target.value })} /></Field>
                  <Field label="Sessions finish by" error={errors.end}><input type="time" value={f.end} onChange={(e) => update({ end: e.target.value })} /></Field>
                  <Field label="How did you hear about Fore?" wide>
                    <select value={f.heard} onChange={(e) => update({ heard: e.target.value })}>
                      <option value="">Select…</option>
                      {HEARD_FROM.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="cb-review">
                  <div><span>Name</span><strong>{[view.firstName, view.lastName].join(" ")}</strong></div>
                  <div><span>Contact</span><strong>{f.email.trim()} · +91 {nationalPhone(f.phone)}</strong></div>
                  <div><span>Coaching</span><strong>{view.yearsCoaching} yrs · {view.city}{view.venue ? " · " + view.venue : ""}</strong></div>
                  <div><span>Specialities</span><strong>{view.specialties.join(", ")}</strong></div>
                  <button type="button" className="cb-link" onClick={() => setPreview(true)}><Eye size={14} /> See your full profile preview</button>
                </div>
                <label className={`cb-consent${errors.consent ? " has-error" : ""}`}>
                  <input type="checkbox" checked={f.consent} onChange={(e) => update({ consent: e.target.checked })} />
                  <span>I confirm these details are accurate, and I agree that ForeSports can store them, show my approved profile publicly (without my email or phone), and contact me by email or WhatsApp. See the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>
                </label>
                {errors.consent && <p className="cb-error" role="alert">{errors.consent}</p>}
              </>
            )}

            {submitError && <p className="cb-error cb-submit-error" role="alert">{submitError}</p>}
            <div className="cb-footer">
              <button type="button" className="cb-button cb-outline" disabled={step === 0 || submitting} onClick={() => go(step - 1)}><ArrowLeft size={15} /> Back</button>
              <div>
                {step < STEPS.length - 1 ? (
                  <button type="button" className="cb-button cb-primary" onClick={next}>Continue <ArrowRight size={15} /></button>
                ) : (
                  <button type="button" className="cb-button cb-primary" disabled={submitting} onClick={submit}>
                    {submitting ? <><Loader2 size={15} className="cb-spin" /> Sending…</> : <><Send size={15} /> Submit my profile</>}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="cb-preview">
          <CoachProfileView
            coach={view}
            badge="PREVIEW"
            draft
            aside={
              <section className="cb-card">
                <h3>Enquiries</h3>
                <p>Golfers send enquiries through Fore. We pass them on to you, so your phone number and email stay private.</p>
              </section>
            }
          />
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

function certificationList(f: Form): string[] {
  const list = f.certifications.filter((c) => c !== "Other qualification");
  if (f.certifications.includes("Other qualification") && f.otherCert.trim()) list.push(f.otherCert.trim());
  return list;
}

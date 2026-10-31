'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

export default function EnquiryForm({ coachId, coachFirstName, options = [] }: { coachId: string; coachFirstName: string; options?: string[] }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const honeypot = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const interest = String(data.get('interest') ?? '').trim();
    const note = String(data.get('message') ?? '').trim();
    const message = interest && note ? `Interested in: ${interest}\n\n${note}` : note;

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !message) {
      setError('Add your name, a valid email address and a short message.');
      return;
    }
    if (honeypot.current?.value) { setSent(true); return; }
    setSending(true);
    setError('');
    const supabase = await getSupabase();
    if (!supabase) { setSending(false); setError('Enquiries are not connected yet. Email hello@foresports.in instead.'); return; }

    const { error: dbError } = await supabase.from('coach_enquiries').insert({
      coach_id: coachId,
      name: name.slice(0, 100),
      email: email.slice(0, 254),
      phone: phone ? phone.slice(0, 20) : null,
      message: message.slice(0, 1500),
    });
    setSending(false);
    if (dbError) {
      console.error('Coach enquiry failed', dbError);
      setError("We couldn't send your enquiry. Check your connection and try again.");
      return;
    }
    form.reset();
    setSent(true);
  }

  if (sent) {
    return (
      <section className="cp-enquiry">
        <h2>Message sent</h2>
        <div className="cp-enquiry-sent">
          <span><Check size={18} /></span>
          <p>{coachFirstName} will reply by email.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cp-enquiry" id="enquire">
      <h2>Ask {coachFirstName} about lessons</h2>
      <p className="cp-enquiry-lead">Replies come to your email.</p>
      <form onSubmit={submit} noValidate>
        <label><span className="cb-label">Your name</span><input name="name" autoComplete="name" required maxLength={100} /></label>
        <label><span className="cb-label">Email</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label><span className="cb-label">Phone <em>Optional</em></span><input name="phone" type="tel" autoComplete="tel" maxLength={20} /></label>
        {options.length > 0 && (
          <label>
            <span className="cb-label">Interested in</span>
            <select name="interest" defaultValue="">
              <option value="">Not sure yet</option>
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        )}
        <label>
          <span className="cb-label">Message</span>
          <textarea name="message" rows={4} required maxLength={1500} placeholder="Your level, what you want to work on and when you're free" />
        </label>
        <input ref={honeypot} className="cb-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {error && <p className="cb-error" role="alert">{error}</p>}
        <button className="button acid" type="submit" disabled={sending}>
          {sending ? <><Loader2 size={15} className="cb-spin" /> Sending…</> : <>Send message</>}
        </button>
        <p className="cp-enquiry-note">Your details stay private.</p>
      </form>
    </section>
  );
}

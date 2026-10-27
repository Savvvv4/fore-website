'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EnquiryForm({ coachId, coachFirstName }: { coachId: string; coachFirstName: string }) {
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
    const message = String(data.get('message') ?? '').trim();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !message) {
      setError('Add your name, a valid email address and a short message.');
      return;
    }
    if (honeypot.current?.value) { setSent(true); return; }
    if (!supabase) { setError('Enquiries are not connected yet. Email hello@foresports.in instead.'); return; }

    setSending(true);
    setError('');
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
      <section className="cb-card cb-enquiry">
        <h3>Enquiry sent</h3>
        <div className="cb-enquiry-sent">
          <span><Check size={18} /></span>
          <p>Thanks. We've passed your message to {coachFirstName}, and you'll hear back by email.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cb-card cb-enquiry" id="enquire">
      <h3>Enquire about lessons</h3>
      <form onSubmit={submit} noValidate>
        <label><span className="cb-label">Your name</span><input name="name" autoComplete="name" required maxLength={100} /></label>
        <label><span className="cb-label">Email</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label><span className="cb-label">Phone <em>Optional</em></span><input name="phone" type="tel" autoComplete="tel" maxLength={20} /></label>
        <label>
          <span className="cb-label">Message</span>
          <textarea name="message" rows={4} required maxLength={1500} placeholder={`Tell ${coachFirstName} about your game and what you'd like to work on.`} />
        </label>
        <input ref={honeypot} className="cb-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {error && <p className="cb-error" role="alert">{error}</p>}
        <button className="cb-button cb-primary" type="submit" disabled={sending}>
          {sending ? <><Loader2 size={15} className="cb-spin" /> Sending…</> : <><Send size={15} /> Send enquiry</>}
        </button>
        <p className="cb-enquiry-note">Fore passes your message to the coach. Your details aren't shown publicly.</p>
      </form>
    </section>
  );
}

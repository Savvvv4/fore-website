'use client';
import { useEffect, useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronLeft, Share2, Upload } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

type Role = 'golfer' | 'coach' | 'facility';
type Goal = 'lessons' | 'students' | 'both';
type SaveResult = { duplicate: boolean };
const CODES = [['India','+91'],['United States','+1'],['United Kingdom','+44'],['UAE','+971'],['Australia','+61'],['Canada','+1'],['Singapore','+65'],['New Zealand','+64'],['Pakistan','+92'],['Bangladesh','+880'],['Nepal','+977'],['Sri Lanka','+94'],['South Africa','+27'],['Saudi Arabia','+966'],['Qatar','+974'],['Kuwait','+965'],['Bahrain','+973'],['Oman','+968'],['Germany','+49'],['France','+33'],['Italy','+39'],['Spain','+34'],['Netherlands','+31'],['Switzerland','+41'],['Ireland','+353'],['China','+86'],['Japan','+81'],['South Korea','+82'],['Malaysia','+60'],['Thailand','+66'],['Indonesia','+62'],['Philippines','+63'],['Vietnam','+84'],['Brazil','+55'],['Mexico','+52'],['Turkey','+90']] as const;
const CITIES = ['Agra','Ahmedabad','Amritsar','Bengaluru','Bhopal','Chandigarh','Chennai','Dehradun','Delhi','Faridabad','Ghaziabad','Goa','Gurugram','Hyderabad','Jaipur','Jalandhar','Kolkata','Lucknow','Ludhiana','Mumbai','Mysuru','Nagpur','Noida','Pune','Surat','Udaipur','Vadodara','Varanasi'];
const GROUPS = ['Beginners','Juniors','Ladies','Club golfers','Competitive players'];
const YEARS = ['Under 2','2–5','6–10','10+'];
const TIMES = ['Morning','Afternoon','Evening'];
const FACILITY_ROLES = ['Owner / Director','Club Secretary / GM','Committee member','Manager','Head pro','Other'];
const CONTACT = ['WhatsApp','Phone call','Email'];
const FACILITY_TYPES = ['Golf course','Driving range','Academy','Simulator centre'];
const phoneValue = (code: string, phone: string) => code + phone.replace(/\D/g, '');
const validPhone = (phone: string) => /^\+[1-9]\d{6,14}$/.test(phone);
function attribution() {
  const q = new URLSearchParams(window.location.search);
  return { source_page: window.location.pathname, utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign'), utm_term: q.get('utm_term'), utm_content: q.get('utm_content') };
}
async function saveLead(data: { type: Role; first: string; last?: string; email: string; phone: string; city: string; details: Record<string, unknown>; photo?: File | null }) {
  const db = await getSupabase();
  if (!db) throw new Error('Sign-up is temporarily unavailable. Please try again.');
  let photoPath: string | null = null;
  if (data.photo) {
    const ext = data.photo.type === 'image/png' ? 'png' : data.photo.type === 'image/webp' ? 'webp' : 'jpg';
    photoPath = 'signups/' + crypto.randomUUID() + '.' + ext;
    const upload = await db.storage.from('coach-photos').upload(photoPath, data.photo, { contentType: data.photo.type, upsert: false });
    if (upload.error) throw new Error('We could not upload that photo. Please try again.');
  }
  const { error } = await db.from('signup_leads').insert({
    first_name: data.first.trim(), last_name: data.last?.trim() || null, email: data.email.trim().toLowerCase(),
    whatsapp: data.phone, city: data.city.trim(), signup_type: data.type,
    details: { ...data.details, photo_path: photoPath }, consent: true, ...attribution(),
  });
  if (error?.code === '23505') {
    if (photoPath) await db.storage.from('coach-photos').remove([photoPath]);
    return { duplicate: true } as SaveResult;
  }
  if (error) {
    if (photoPath) await db.storage.from('coach-photos').remove([photoPath]);
    throw new Error(error.message || 'We could not save your details. Please try again.');
  }
  if (data.type === 'coach') {
    const d = data.details;
    const years = String(d.years_coaching || '');
    const yearNumber = years === 'Under 2' ? 1 : years === '2–5' ? 3 : years === '6–10' ? 8 : 10;
    const { error: profileError } = await db.from('coach_profiles').insert({
      first_name: data.first.trim(), last_name: data.last?.trim() || '', email: data.email.trim().toLowerCase(),
      phone: data.phone, city: data.city.trim(), venue: String(d.teaches_at || '').trim() || null,
      years_coaching: yearNumber, playing_level: null, bio: null, photo_path: photoPath,
      specialties: Array.isArray(d.coaches_who) ? d.coaches_who : [], certifications: [], packages: [],
      formats: ['In-person'], days: [], heard_from: String(attribution().utm_source || 'Website').slice(0,80),
      consent: true, source: 'coach_signup', coach_type: d.coach_goal === 'students' ? 'performance' : 'teaching',
      coach_goal: String(d.coach_goal || ''), call_time: String(d.call_time || ''),
    });
    if (profileError) console.error('Coach profile is saved as a lead; directory reservation needs follow-up:', profileError);
  }
  return { duplicate: false } as SaveResult;
}
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="fs-field"><span>{label}{hint && <small>{hint}</small>}</span>{children}</label>;
}
function Phone({ code, setCode, value, setValue, hint }: { code: string; setCode: (s:string)=>void; value:string; setValue:(s:string)=>void; hint?:string }) {
  return <Field label="WhatsApp number" hint={hint}><div className="fs-phone">
    <select aria-label="Country calling code" value={code} onChange={e=>setCode(e.target.value)}>{CODES.map(([n,c])=><option key={n} value={c}>{n} ({c})</option>)}</select>
    <input required type="tel" inputMode="tel" autoComplete="tel-national" value={value} onChange={e=>setValue(e.target.value)} placeholder="98765 43210" />
  </div></Field>;
}
function City({ value, setValue }: { value:string; setValue:(s:string)=>void }) {
  return <Field label="City"><input required list="fs-city-list" value={value} onChange={e=>setValue(e.target.value)} placeholder="Start typing your city" autoComplete="address-level2" /><datalist id="fs-city-list">{CITIES.map(c=><option key={c} value={c}/>)}</datalist></Field>;
}
function Consent({ value, setValue, listing=false }: { value:boolean; setValue:(b:boolean)=>void; listing?:boolean }) {
  return <label className="fs-consent"><input type="checkbox" required checked={value} onChange={e=>setValue(e.target.checked)}/><span>{listing ? 'List my profile on Fore! when it opens. My number and email are never shown.' : <>Fore! can contact me on WhatsApp and email about my sign-up. <Link href="/privacy">Privacy</Link></>}</span></label>;
}
function Trap({ value, setValue }: { value:string; setValue:(s:string)=>void }) {
  return <div className="fs-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={value} onChange={e=>setValue(e.target.value)}/></label></div>;
}
function ShareButton({ text }: { text:string }) {
  return <a className="fs-button fs-dark" href={'https://wa.me/?text='+encodeURIComponent(text+' Join here: foresports.in/golfers')} target="_blank" rel="noreferrer">Share on WhatsApp <Share2 size={16}/></a>;
}

export function RoleChooserPage() {
  return <main className="fs-chooser-page"><section className="fs-chooser-sheet">
    <span className="fs-eyebrow">FORESPORTS</span><h1>How are you joining Fore!?</h1><p>Choose the option that best describes you.</p>
    <nav className="fs-role-options" aria-label="Choose your sign-up">
      <Link href="/golfers#join">I play golf <ArrowRight size={18}/></Link>
      <Link href="/golfers#join?for=child">My child plays golf <ArrowRight size={18}/></Link>
      <Link href="/coaches#join">I coach <ArrowRight size={18}/></Link>
      <Link href="/facilities#join">I run a golf facility <ArrowRight size={18}/></Link>
    </nav><Link className="fs-back-link" href="/">Back to ForeSports</Link>
  </section></main>;
}

export function GolferJoinForm() {
  const [joining,setJoining] = useState<'me'|'child'|'both'>('me');
  const [ages,setAges] = useState<string[]>([]);
  const [first,setFirst] = useState(''); const [email,setEmail] = useState(''); const [city,setCity] = useState('');
  const [code,setCode] = useState('+91'); const [phone,setPhone] = useState(''); const [consent,setConsent] = useState(false);
  const [website,setWebsite] = useState(''); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [done,setDone] = useState<SaveResult|null>(null);
  useEffect(()=>{const h=new URLSearchParams(window.location.hash.split('?')[1]||'');if(new URLSearchParams(window.location.search).get('for')==='child'||h.get('for')==='child')setJoining('child');},[]);
  const toggleAge=(a:string)=>setAges(old=>old.includes(a)?old.filter(x=>x!==a):[...old,a]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(step===0){next();return;}setError('');if(website){setDone({duplicate:false});return;}const phoneE164=phoneValue(code,phone);if(!validPhone(phoneE164)){setError('Enter a valid WhatsApp number.');return;}if(joining!=='me'&&!ages.length){setError('Choose your child’s age.');return;}setBusy(true);try{setDone(await saveLead({type:'golfer',first,email,phone:phoneE164,city,details:{joining_for:joining,child_age:ages}}));}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}
  if(done)return <section id="join" className="fs-form-section"><div className="fs-success-card"><span className="fs-success-icon"><Check/></span><span className="fs-eyebrow">GOLFER WAITLIST</span><h2>{done.duplicate?'You’re already on the list.':'You’re on the list, '+first+'.'}</h2><p>{done.duplicate?'We already have a sign-up with this WhatsApp number.':joining==='me'?'We’ll message you on WhatsApp the day Fore! opens in '+city+'.':'When Fore! opens in '+city+', we’ll show you coaches who work with juniors aged '+ages.join(', ')+'.'}</p>{!done.duplicate&&<ShareButton text="I just joined the Fore! waitlist." />}</div></section>;
  return <section id="join" className="fs-form-section"><div className="fs-form-intro"><span className="fs-eyebrow">GOLFERS & PARENTS</span><h2>Join the waitlist and be first on the tee.</h2><p>Free. We’ll message you the day Fore! opens in your city.</p></div>
    <form className="fs-form-card" onSubmit={submit}>
      <fieldset className="fs-choice-fieldset"><legend>Who’s joining?</legend><div className="fs-choice-row">{([['me','Just me'],['child','My child'],['both','Me and my child']] as const).map(([v,l])=><button key={v} type="button" className={joining===v?'is-selected':''} onClick={()=>{setJoining(v);if(v==='me')setAges([]);}}>{l}</button>)}</div></fieldset>
      <div className="fs-fields"><Field label={joining==='me'?'First name':'Your first name'}><input required value={first} onChange={e=>setFirst(e.target.value)} autoComplete="given-name" placeholder="Your first name"/></Field>
      {joining!=='me'&&<fieldset className="fs-choice-fieldset"><legend>Child’s age <small>Select all that apply</small></legend><div className="fs-choice-row">{['Under 8','8–12','13–17'].map(a=><button key={a} type="button" className={ages.includes(a)?'is-selected':''} onClick={()=>toggleAge(a)} aria-pressed={ages.includes(a)}>{a}</button>)}</div></fieldset>}
      <div className="fs-wide"><Phone code={code} setCode={setCode} value={phone} setValue={setPhone} hint={joining==='me'?'We’ll only use this to message you about Fore!':'We’ll message you, not your child.'}/></div>
      <Field label="Email"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com"/></Field><City value={city} setValue={setCity}/></div>
      <Consent value={consent} setValue={setConsent}/><Trap value={website} setValue={setWebsite}/>{error&&<p className="fs-error" role="alert">{error}</p>}
      <button className="fs-button fs-primary" type="submit" disabled={busy}>{busy?'Joining…':joining==='me'?'Join the waitlist':'Join as a parent'} <ArrowRight size={17}/></button>
    </form></section>;
}

export function FacilityJoinForm() {
  const [name,setName]=useState(''),[role,setRole]=useState(''),[facility,setFacility]=useState(''),[city,setCity]=useState('');
  const [code,setCode]=useState('+91'),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[pref,setPref]=useState(''),[kind,setKind]=useState('');
  const [consent,setConsent]=useState(false),[website,setWebsite]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState<SaveResult|null>(null);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');if(website){setDone({duplicate:false});return;}const p=phoneValue(code,phone);if(!validPhone(p)){setError('Enter a valid WhatsApp number.');return;}setBusy(true);try{setDone(await saveLead({type:'facility',first:name,email,phone:p,city,details:{role,facility_name:facility,contact_pref:pref||null,facility_type:kind||null}}));}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}
  if(done)return <section id="join" className="fs-form-section"><div className="fs-success-card"><span className="fs-success-icon"><Check/></span><span className="fs-eyebrow">FACILITY PARTNERSHIPS</span><h2>{done.duplicate?'We already have your details.':'Thanks, '+name+'.'}</h2><p>{done.duplicate?'We already have a sign-up with this WhatsApp number.':'We’ll be in touch to start the conversation. We’ll reach you by '+(pref||'your preferred contact method')+'. Prefer to write? hello@foresports.in'}</p><a className="fs-button fs-dark" href="mailto:hello@foresports.in">Email ForeSports <ArrowRight size={16}/></a></div></section>;
  return <section id="join" className="fs-form-section"><div className="fs-form-intro"><span className="fs-eyebrow">FACILITY PARTNERSHIPS</span><h2>Build with us.</h2><p>Tell us who you are and where you’re from. We’ll get in touch to start the conversation.</p></div>
    <form className="fs-form-card" onSubmit={submit}>
      <div className="fs-group"><h3>You</h3><div className="fs-fields"><Field label="Your name"><input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Your full name"/></Field><Field label="Your role"><select required value={role} onChange={e=>setRole(e.target.value)}><option value="">Choose your role</option>{FACILITY_ROLES.map(x=><option key={x}>{x}</option>)}</select></Field></div></div>
      <div className="fs-group"><h3>Your facility</h3><div className="fs-fields"><Field label="Facility name"><input required value={facility} onChange={e=>setFacility(e.target.value)} placeholder="Name of your golf facility"/></Field><City value={city} setValue={setCity}/><fieldset className="fs-choice-fieldset fs-wide"><legend>Facility type <small>Optional</small></legend><div className="fs-choice-row">{FACILITY_TYPES.map(x=><button key={x} type="button" className={kind===x?'is-selected':''} onClick={()=>setKind(kind===x?'':x)}>{x}</button>)}</div></fieldset></div></div>
      <div className="fs-group"><h3>Reach you</h3><div className="fs-fields"><div className="fs-wide"><Phone code={code} setCode={setCode} value={phone} setValue={setPhone}/></div><Field label="Email"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@facility.com"/></Field><fieldset className="fs-choice-fieldset fs-wide"><legend>Best way to reach you <small>Optional</small></legend><div className="fs-choice-row">{CONTACT.map(x=><button key={x} type="button" className={pref===x?'is-selected':''} onClick={()=>setPref(pref===x?'':x)}>{x}</button>)}</div></fieldset></div></div>
      <Consent value={consent} setValue={setConsent}/><Trap value={website} setValue={setWebsite}/>{error&&<p className="fs-error" role="alert">{error}</p>}<button className="fs-button fs-primary" type="submit" disabled={busy}>{busy?'Sending…':'Let’s talk'} <ArrowRight size={17}/></button>
    </form></section>;
}

export function CoachSignupForm({fixedType}:{fixedType?:'teaching'|'performance'}) {
  const [step,setStep]=useState(0),[goal,setGoal]=useState<Goal|' '>(' '),[first,setFirst]=useState(''),[last,setLast]=useState(''),[email,setEmail]=useState(''),[city,setCity]=useState('');
  const [code,setCode]=useState('+91'),[phone,setPhone]=useState(''),[who,setWho]=useState<string[]>([]),[venue,setVenue]=useState(''),[years,setYears]=useState(''),[callTime,setCallTime]=useState('');
  const [photo,setPhoto]=useState<File|null>(null),[photoUrl,setPhotoUrl]=useState(''),[contact,setContact]=useState(false),[listing,setListing]=useState(false),[website,setWebsite]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState<SaveResult|null>(null);
  useEffect(()=>{const t=new URLSearchParams(window.location.search).get('type');if(fixedType==='teaching'||t==='teaching')setGoal('lessons');else if(fixedType==='performance'||t==='performance')setGoal('students');},[fixedType]);
  const phoneE164=phoneValue(code,phone), initials=((first[0]||'')+(last[0]||'')).toUpperCase()||'FS';
  function toggleWho(x:string){setWho(old=>old.includes(x)?old.filter(v=>v!==x):old.length<3?[...old,x]:old);}
  function onPhoto(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];e.target.value='';if(!f)return;if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size>5*1024*1024){setError('Use a JPG, PNG or WebP under 5 MB.');return;}setError('');setPhoto(f);setPhotoUrl(URL.createObjectURL(f));}
  function next(){setError('');if(!first.trim()||!last.trim()||!email.trim()||!city.trim()){setError('Complete all fields before continuing.');return;}if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){setError('Enter a valid email address.');return;}if(!validPhone(phoneE164)){setError('Enter a valid WhatsApp number.');return;}setStep(1);}
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');if(website){setDone({duplicate:false});return;}if(!goal.trim()||!who.length||!venue.trim()||!years||!callTime){setError('Complete each required field to reserve your profile.');return;}if(!contact||!listing){setError('Please confirm both consent statements.');return;}setBusy(true);try{setDone(await saveLead({type:'coach',first,last,email,phone:phoneE164,city,photo,details:{coach_goal:goal,coaches_who:who,teaches_at:venue.trim(),years_coaching:years,call_time:callTime,list_profile_on_launch:listing}}));}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}
  const card=<article className="fs-coach-preview"><div className="fs-coach-head"><div className="fs-coach-avatar">{photoUrl?<img src={photoUrl} alt=""/>:initials}</div><div><strong>{(first+' '+last).trim()||'Your name'}</strong><span>{city||'Your city'}</span></div><b>Founding coach</b></div><p>{years||'Years coaching'} · {venue||'Where you teach'}</p><div className="fs-coach-tags">{(who.length?who:['Who you coach']).map(x=><span key={x}>{x}</span>)}</div></article>;
  if(done)return <section id="join" className="fs-form-section fs-coach-page"><div className="fs-success-card"><span className="fs-success-icon"><Check/></span><span className="fs-eyebrow">FOUNDING COACH</span><h2>{done.duplicate?'Your profile is already reserved.':'Your founding profile is reserved, '+first+'.'}</h2><p>{done.duplicate?'We already have a reservation with this WhatsApp number.':'We’ll call you in the '+callTime.toLowerCase()+' to verify you and hear how you coach. Here’s your card as golfers will see it.'}</p>{card}{!done.duplicate&&<a className="fs-button fs-dark" href={'https://wa.me/?text='+encodeURIComponent('I just reserved my founding coach profile on Fore! Reserve yours: foresports.in/coaches')} target="_blank" rel="noreferrer">Share with a coach friend <Share2 size={16}/></a>}</div></section>;
  return <section id="join" className="fs-form-section fs-coach-page"><div className="fs-form-intro"><span className="fs-eyebrow">FOUNDING COACHES</span><h2>Reserve your founding profile today.</h2><p>Free and takes 90 seconds. We’ll call to verify you and get to know how you coach.</p></div>
    <div className="fs-coach-layout"><form className="fs-form-card" onSubmit={submit}><div className="fs-step-head"><span>STEP {step+1} OF 2</span><b>{step===0?'How to reach you':'Your listing card'}</b><div className="fs-progress"><i className="on"/><i className={step===1?'on':''}/></div></div>
      {step===0?<><div className="fs-fields"><Field label="First name"><input required value={first} onChange={e=>setFirst(e.target.value)} placeholder="First name"/></Field><Field label="Last name"><input required value={last} onChange={e=>setLast(e.target.value)} placeholder="Last name"/></Field><div className="fs-wide"><Phone code={code} setCode={setCode} value={phone} setValue={setPhone} hint="Golfers never see your number."/></div><Field label="Email"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></Field><City value={city} setValue={setCity}/></div><Trap value={website} setValue={setWebsite}/><button className="fs-button fs-primary" type="button" onClick={next}>Continue <ArrowRight size={17}/></button></>:<>
        <button type="button" className="fs-back-step" onClick={()=>setStep(0)}><ChevronLeft size={16}/> Back to contact details</button>
        <fieldset className="fs-choice-fieldset"><legend>What do you want from Fore!?</legend><div className="fs-goals">{([['lessons','More lessons and revenue'],['students','Coach my students better'],['both','Both']] as const).map(([v,l])=><button type="button" key={v} className={goal===v?'is-selected':''} onClick={()=>setGoal(v)}>{l}</button>)}</div></fieldset>
        <fieldset className="fs-choice-fieldset"><legend>Who do you mostly coach? <small>Choose up to 3</small></legend><div className="fs-choice-row">{GROUPS.map(x=><button type="button" key={x} className={who.includes(x)?'is-selected':''} onClick={()=>toggleWho(x)}>{x}</button>)}</div></fieldset>
        <div className="fs-fields"><Field label="Where do you teach?" hint="e.g. DLF Golf & Country Club or Independent, I travel"><input required maxLength={120} value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Golf course, academy or independent"/></Field>
        <fieldset className="fs-choice-fieldset"><legend>Years coaching</legend><div className="fs-choice-row">{YEARS.map(x=><button type="button" key={x} className={years===x?'is-selected':''} onClick={()=>setYears(x)}>{x}</button>)}</div></fieldset>
        <Field label="Profile photo" hint="Optional. A clear headshot. You can add it later."><span className="fs-upload"><Upload size={16}/>{photo?photo.name:'Choose a photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto}/></span></Field>
        <fieldset className="fs-choice-fieldset"><legend>Best time to call you</legend><div className="fs-choice-row">{TIMES.map(x=><button type="button" key={x} className={callTime===x?'is-selected':''} onClick={()=>setCallTime(x)}>{x}</button>)}</div></fieldset></div>
        <div className="fs-consent-stack"><Consent value={contact} setValue={setContact}/><Consent value={listing} setValue={setListing} listing/></div><Trap value={website} setValue={setWebsite}/><button className="fs-button fs-primary" type="submit" disabled={busy}>{busy?'Reserving…':'Reserve my profile'} <ArrowRight size={17}/></button>
      </>}
      {error&&<p className="fs-error" role="alert">{error}</p>}
    </form><aside className="fs-preview-panel"><span className="fs-eyebrow">LIVE PREVIEW</span><h3>Your card on Fore!</h3><p>This is how golfers will see your profile.</p>{card}</aside></div>
  </section>;
}

'use client';

import { useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CoverArt } from './art';
import { CoachCardView, ProgramCard } from './cards';
import { DEFAULT_PACKAGES, readDraft, seedDraft, splitName } from './draft';
import { PLAYER_GROUPS, SPECIALTIES, type CoachListing } from './shared';
import {
  PerfCompareScreen,
  PerfNoteScreen,
  PerfParentScreen,
  PerfPlayersScreen,
  PerfPracticeScreen,
  PerfStrokesScreen,
  TeachCalendarScreen,
  TeachEarningsScreen,
  TeachNudgeScreen,
  TeachPlanScreen,
  TeachProfileScreen,
  TeachSearchScreen,
} from './screens';

export const TEACHING_JOIN = '/coaches/teaching/join';
export const PERFORMANCE_JOIN = '/coaches/performance/join';

/* ─── Building blocks ────────────────────────────────────────────── */

function Hero({ title, copy, cta, note, visual }: { title: ReactNode; copy: string; cta: { href: string; label: string }; note: string; visual: ReactNode }) {
  return (
    <section className="cf-hero">
      <div className="container cf-hero-grid">
        <div className="cf-hero-copy">
          <h1>{title}</h1>
          <p>{copy}</p>
          <div className="button-row">
            <NextLink className="button acid" href={cta.href}>{cta.label} <ArrowUpRight size={17} /></NextLink>
            <a className="button light" href="#how">See how it works</a>
          </div>
          <p className="cf-note">{note}</p>
        </div>
        <div className="cf-hero-visual">{visual}</div>
      </div>
    </section>
  );
}

function Intro({ title, copy }: { title: ReactNode; copy?: string }) {
  return (
    <div className="cf-intro">
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

type Step = { label: string; copy: string; screen: ReactNode };

/** Tap through a coach's week. One phone; the steps change what it shows. */
function Walkthrough({ id, title, steps }: { id: string; title: ReactNode; steps: Step[] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <section id="how" className="cf-section cf-walk">
      <div className="container">
        <div className="cf-walk-grid">
          <div>
          <Intro title={title} />
          <div className="cf-walk-steps" role="tablist" aria-label="How it works">
            {steps.map((s, i) => (
              <button
                key={s.label}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${id}-panel`}
                className={i === active ? 'on' : ''}
                onClick={() => setActive(i)}
              >
                <span className="cf-walk-n">{i + 1}</span>
                <span className="cf-walk-text">
                  <strong>{s.label}</strong>
                  <span className="cf-walk-copy">{s.copy}</span>
                </span>
              </button>
            ))}
          </div>
          </div>
          <div className="cf-walk-stage" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
            <p className="cf-walk-mobile-copy">{step.copy}</p>
            <div className="cf-walk-phone" key={active}>{step.screen}</div>
            <div className="cf-walk-nav">
              <button type="button" disabled={active === 0} onClick={() => setActive(active - 1)} aria-label="Previous step">←</button>
              <span>{active + 1} / {steps.length}</span>
              <button type="button" disabled={active === steps.length - 1} onClick={() => setActive(active + 1)} aria-label="Next step">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq({ items }: { items: [string, string][] }) {
  return (
    <section className="cf-section cf-faq">
      <div className="container cf-faq-grid">
        <h2>Questions, answered.</h2>
        <div className="cf-faq-list">
          {items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span className="cf-plus" aria-hidden="true" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? 'wide' : ''}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/* ─── /coaches ───────────────────────────────────────────────────── */

export function CoachChooser() {
  const paths = [
    {
      href: '/coaches/teaching',
      art: 1,
      title: 'I teach lessons',
      copy: 'Get found by golfers near you, fill your week and get paid before you teach.',
      cta: 'For teaching pros',
    },
    {
      href: '/coaches/performance',
      art: 3,
      title: 'I coach a squad',
      copy: 'Keep every player’s lessons, rounds and practice in one record your whole team shares.',
      cta: 'For performance coaches',
    },
  ];
  return (
    <div className="cb-scope cf">
      <section className="cf-hero cf-chooser">
        <div className="container">
          <h1>Coach on <em>Fore.</em></h1>
          <p>Built around the way you coach. Which sounds like you?</p>
          <div className="cf-paths">
            {paths.map((p) => (
              <NextLink key={p.href} href={p.href} className="cf-path">
                <span className="cf-path-art"><CoverArt wide variant={p.art} /></span>
                <span className="cf-path-body">
                  <strong>{p.title}</strong>
                  <span>{p.copy}</span>
                  <span className="cf-path-go">{p.cta} <ArrowRight size={16} aria-hidden="true" /></span>
                </span>
              </NextLink>
            ))}
          </div>
          <p className="cf-aside">Looking for a coach? <NextLink href="/coaches/directory">Find one near you</NextLink></p>
        </div>
      </section>
    </div>
  );
}

/* ─── /coaches/teaching ──────────────────────────────────────────── */

function TeachingBuilder() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [best, setBest] = useState('');
  const [trial, setTrial] = useState('');
  const { first, last } = splitName(name);
  const price = parseInt(trial.replace(/\D/g, ''), 10);

  const coach: CoachListing = {
    id: 'draft', slug: '', foundingCoach: false, verified: false,
    firstName: first, lastName: last, city: city.trim(), venue: '', yearsCoaching: null, playingLevel: '', bio: '', photoUrl: '',
    specialties: best ? [best] : [], certifications: [], formats: [], days: [], startTime: '', endTime: '', languages: [], tools: [],
    packages: price > 0 ? [{ name: 'Trial lesson', price, detail: '' }] : [],
  };

  function carryOver() {
    const patch: Record<string, unknown> = {};
    if (first) patch.first = first;
    if (last) patch.last = last;
    if (city.trim()) patch.city = city.trim();
    if (best) patch.specialties = [best];
    if (price > 0) {
      const saved = readDraft('teaching').form?.packages;
      const packages = Array.isArray(saved) && saved.length ? saved : DEFAULT_PACKAGES;
      patch.packages = packages.map((p: { price?: string }, i: number) => (i === 0 ? { ...p, price: String(price) } : p));
    }
    seedDraft('teaching', patch);
  }

  return (
    <section className="cf-section cf-build" id="start">
      <div className="container">
        <Intro title={<>See your profile <span>first.</span></>} copy="Add a few details and watch it come together. Finish the rest in about five minutes." />
        <div className="cf-build-grid">
        <div>
          <div className="cf-form">
            <Field label="Your name"><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Aarav Sharma" /></Field>
            <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" placeholder="Gurugram" /></Field>
            <Field label="What you teach best">
              <select value={best} onChange={(e) => setBest(e.target.value)}>
                <option value="">Choose one</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Trial lesson price (₹)"><input value={trial} onChange={(e) => setTrial(e.target.value.replace(/[^\d,]/g, ''))} inputMode="numeric" placeholder="2,500" /></Field>
          </div>
          <NextLink className="button acid" href={TEACHING_JOIN} onClick={carryOver}>Continue <ArrowRight size={17} /></NextLink>
        </div>
        <div className="cf-build-preview" aria-live="polite">
          <CoachCardView coach={coach} draft />
          <p className="cf-note">How golfers see you on Fore</p>
        </div>
        </div>
      </div>
    </section>
  );
}

export function TeachingFunnel() {
  return (
    <div className="cb-scope cf">
      <Hero
        title={<>More students. <em>Less admin.</em></>}
        copy="Get found by golfers near you, fill your calendar and get paid before every lesson."
        cta={{ href: '#start', label: 'Create your profile' }}
        note="Takes five minutes. Your prices, your hours."
        visual={<TeachProfileScreen />}
      />
      <Walkthrough
        id="teach"
        title={<>From first search <span>to regular student.</span></>}
        steps={[
          { label: 'Get found', copy: 'Golfers nearby find your profile, see what you teach and book a trial in a tap.', screen: <TeachSearchScreen /> },
          { label: 'Turn trials into plans', copy: 'Send a lesson plan after the trial. The trial fee comes off when they sign up.', screen: <TeachPlanScreen /> },
          { label: 'Fill your week', copy: 'Set your hours once. Students book and reschedule themselves, with reminders.', screen: <TeachCalendarScreen /> },
          { label: 'Get paid upfront', copy: 'Students pay by UPI or card when they book. No chasing after lessons.', screen: <TeachEarningsScreen /> },
          { label: 'Keep them coming back', copy: 'When a student goes quiet, send them your next free slot in one tap.', screen: <TeachNudgeScreen /> },
        ]}
      />
      <TeachingBuilder />
      <Faq
        items={[
          ['How do golfers find me?', 'They search Fore by city, speciality and level. Profiles with a photo, a short introduction and clear prices get chosen most.'],
          ['Can I bring my current students?', 'Yes, and there’s no exclusivity. Bring your regulars onto Fore so lessons, notes and payments live in one place.'],
          ['Who sets my prices?', 'You do. Offer trials, lesson packs, monthly plans and group classes, and change them whenever you like.'],
          ['Is my phone number shared?', 'Never. Golfers message you through Fore, so your number and email stay private.'],
          ['What can I use today?', 'Profiles and enquiries are live now. Bookings, payments and student tools open to coaches on Fore first.'],
        ]}
      />
    </div>
  );
}

/* ─── /coaches/performance ───────────────────────────────────────── */

function PerformanceBuilder() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [program, setProgram] = useState('');
  const [squad, setSquad] = useState('');
  const [group, setGroup] = useState('');
  const { first, last } = splitName(name);
  const players = squad === '' ? null : Math.min(2000, Number(squad.replace(/\D/g, '')) || 0);

  function carryOver() {
    const patch: Record<string, unknown> = {};
    if (first) patch.first = first;
    if (last) patch.last = last;
    if (city.trim()) patch.city = city.trim();
    if (program.trim()) patch.program = program.trim();
    if (players != null) patch.squad = String(players);
    if (group) patch.groups = [group];
    seedDraft('performance', patch);
  }

  return (
    <section className="cf-section cf-build" id="start">
      <div className="container">
        <Intro title={<>Bring your squad <span>to Fore.</span></>} copy="Tell us a little about your program. We’ll set up the rest with you on a short call." />
        <div className="cf-build-grid">
        <div>
          <div className="cf-form">
            <Field label="Your name"><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Meera Iyer" /></Field>
            <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" placeholder="Bengaluru" /></Field>
            <Field label="Program name"><input value={program} onChange={(e) => setProgram(e.target.value)} placeholder="U-18 Performance Squad" /></Field>
            <Field label="Players"><input value={squad} onChange={(e) => setSquad(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="14" /></Field>
            <Field label="Who you coach" wide>
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="">Choose one</option>
                {PLAYER_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <NextLink className="button acid" href={PERFORMANCE_JOIN} onClick={carryOver}>Continue <ArrowRight size={17} /></NextLink>
        </div>
        <div className="cf-build-preview" aria-live="polite">
          <ProgramCard
            coach={{ firstName: first, lastName: last, city: city.trim(), photoUrl: '' }}
            program={{ role: '', name: program.trim(), squad: players, groups: group ? [group] : [], disciplines: [] }}
          />
          <p className="cf-note">What your players see when they join</p>
        </div>
        </div>
      </div>
    </section>
  );
}

export function PerformanceFunnel() {
  const circle: [string, string][] = [
    ['You', 'Every player’s status at a glance, so you spot problems before they cost a season.'],
    ['Your players', 'A clear focus, drills for the week and proof they’re getting better.'],
    ['Parents', 'A monthly report instead of weekly calls.'],
    ['Your team', 'Swing, short-game, fitness and mental coaches working from one record.'],
  ];
  return (
    <div className="cb-scope cf">
      <Hero
        title={<>Every player. <em>One record.</em></>}
        copy="Lessons, rounds, practice and progress in one place, shared with your players, their parents and your coaching team."
        cta={{ href: '#start', label: 'Set up your squad' }}
        note="We set it up with you on a 20-minute call."
        visual={<PerfPlayersScreen />}
      />
      <Walkthrough
        id="perf"
        title={<>Close the loop <span>between lessons.</span></>}
        steps={[
          { label: 'Find the leak', copy: 'Players log rounds in minutes. Strokes gained shows exactly where shots go.', screen: <PerfStrokesScreen /> },
          { label: 'Coach it', copy: 'Film the swing and talk. Fore writes the note and sends the drills.', screen: <PerfNoteScreen /> },
          { label: 'See the work', copy: 'Know who practised before the next lesson, and nudge who didn’t.', screen: <PerfPracticeScreen /> },
          { label: 'Show the change', copy: 'Put two swings side by side so players see what moved.', screen: <PerfCompareScreen /> },
          { label: 'Report home', copy: 'Send parents a monthly progress report in one tap.', screen: <PerfParentScreen /> },
        ]}
      />
      <section className="cf-section cf-circle">
        <div className="container">
          <Intro title={<>Everyone around the player, <span>on the same page.</span></>} />
          <ul className="cf-circle-grid">
            {circle.map(([h, p]) => (
              <li key={h}><strong>{h}</strong><span>{p}</span></li>
            ))}
          </ul>
          <p className="cf-note">Players own their record. Your notes and drills stay yours.</p>
        </div>
      </section>
      <PerformanceBuilder />
      <Faq
        items={[
          ['Do my players need the app?', 'Yes. Players log rounds and practice, and see your notes and drills. Parents of juniors get their own view.'],
          ['Who owns the data?', 'Players own their record and choose which coaches see it. Your notes, drills and videos stay yours.'],
          ['Can my whole coaching team join?', 'Yes. Swing, short-game, fitness and mental coaches share one squad and one view of every player.'],
          ['Will I show up in Find a coach?', 'No, squads stay private. If you also teach lessons to the public, create a teaching profile too.'],
          ['How long does setup take?', 'About 20 minutes on a call. We load your squad with you.'],
        ]}
      />
    </div>
  );
}

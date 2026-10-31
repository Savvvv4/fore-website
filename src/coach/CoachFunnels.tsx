'use client';

import { useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CoverArt } from './art';
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

export const JOIN = '/coaches/join';
export const TEACHING_JOIN = '/coaches/teaching/join';
export const PERFORMANCE_JOIN = '/coaches/performance/join';

/* ─── Building blocks ────────────────────────────────────────────── */

function Hero({ title, copy, actions, note, visual }: { title: ReactNode; copy: string; actions: ReactNode; note?: string; visual: ReactNode }) {
  return (
    <section className="cf-hero">
      <div className="container cf-hero-grid">
        <div className="cf-hero-copy">
          <h1>{title}</h1>
          <p>{copy}</p>
          <div className="button-row">{actions}</div>
          {note && <p className="cf-note">{note}</p>}
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

function Values({ title, copy, items }: { title: ReactNode; copy?: string; items: [string, string][] }) {
  return (
    <section className="cf-section">
      <div className="container">
        <Intro title={title} copy={copy} />
        <div className="cf-values">
          {items.map(([h, p]) => (
            <div key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Step = { label: string; copy: string; screen: ReactNode };

/** Tap through the product. One phone; the steps change what it shows. */
function Walkthrough({ id, title, steps }: { id: string; title: ReactNode; steps: Step[] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <section className="cf-section cf-walk">
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

function Closing({ title, copy, href, label }: { title: ReactNode; copy: string; href: string; label: string }) {
  return (
    <section className="cf-closing">
      <div className="container">
        <div className="cf-closing-band">
          <div>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          <NextLink className="button acid" href={href}>{label} <ArrowUpRight size={17} /></NextLink>
        </div>
      </div>
    </section>
  );
}

/* ─── /coaches — for every coach ─────────────────────────────────── */

export function CoachesLanding() {
  const paths = [
    {
      href: '/coaches/teaching',
      art: 1,
      title: 'Teaching pros',
      copy: 'You teach lessons to golfers in your city. Fore brings you new students and runs your week.',
    },
    {
      href: '/coaches/performance',
      art: 3,
      title: 'Performance coaches',
      copy: 'You run a squad, an academy or work with elite players. Fore keeps every player in one record.',
    },
  ];
  return (
    <div className="cb-scope cf">
      <Hero
        title={<>Coach beyond <em>your network.</em></>}
        copy="Get found by more golfers, keep every player improving and run your coaching from one app."
        actions={
          <>
            <NextLink className="button acid" href={JOIN}>Join as a coach <ArrowUpRight size={17} /></NextLink>
            <NextLink className="button light" href="/coaches/directory">Find a coach</NextLink>
          </>
        }
        note="Two minutes to sign up. Your prices, your hours."
        visual={<TeachProfileScreen />}
      />
      <Values
        title={<>Get found. Get booked. <span>Coach better.</span></>}
        copy="One home for your coaching, from the first message to the hundredth lesson."
        items={[
          ['Be easy to choose', 'Your qualifications, specialities, prices and reviews in one profile golfers trust.'],
          ['Leave the admin to Fore', 'Bookings, reminders and payments, without the WhatsApp back-and-forth.'],
          ['Show the progress', 'Lesson notes, drills, rounds and swing videos in one record you share with every player.'],
        ]}
      />
      <Walkthrough
        id="all"
        title={<>From first lesson <span>to lasting progress.</span></>}
        steps={[
          { label: 'Get found', copy: 'Golfers near you find your profile and send you a message.', screen: <TeachSearchScreen /> },
          { label: 'Fill your week', copy: 'Students book and reschedule themselves, with reminders.', screen: <TeachCalendarScreen /> },
          { label: 'Coach it', copy: 'Film the swing and talk. Fore writes the note and sends the drills.', screen: <PerfNoteScreen /> },
          { label: 'See the work', copy: 'Know who practised before the next lesson.', screen: <PerfPracticeScreen /> },
          { label: 'Show the change', copy: 'Put two swings side by side so players see what moved.', screen: <PerfCompareScreen /> },
        ]}
      />
      <section className="cf-section">
        <div className="container">
          <Intro title={<>Built for <span>how you coach.</span></>} />
          <div className="cf-paths">
            {paths.map((p) => (
              <NextLink key={p.href} href={p.href} className="cf-path">
                <span className="cf-path-art"><CoverArt wide variant={p.art} /></span>
                <span className="cf-path-body">
                  <strong>{p.title}</strong>
                  <span>{p.copy}</span>
                  <span className="cf-path-go">Learn more <ArrowRight size={16} aria-hidden="true" /></span>
                </span>
              </NextLink>
            ))}
          </div>
        </div>
      </section>
      <Faq
        items={[
          ['Who can join?', 'Any golf coach in India, from teaching pros at a local range to coaches of national squads and touring professionals.'],
          ['How do golfers find me?', 'Through Find a coach, by city, speciality and level. We check every coach before they go live.'],
          ['Can I bring my current students?', 'Yes, and there’s no exclusivity. Bring your regulars so lessons, notes and progress live in one place.'],
          ['Is my phone number shared?', 'Never. Golfers message you through Fore, so your number and email stay private.'],
          ['What can I use today?', 'Coach profiles and messages from golfers are live now. Bookings, payments and player tools open to coaches on Fore first.'],
        ]}
      />
      <Closing
        title={<>Your coaching, <span>on Fore.</span></>}
        copy="Sign up in two minutes. We’ll review your details and get you live."
        href={JOIN}
        label="Join as a coach"
      />
    </div>
  );
}

/* ─── /coaches/teaching — shareable page for teaching pros ───────── */

export function TeachingLanding() {
  return (
    <div className="cb-scope cf">
      <Hero
        title={<>More students. <em>Less admin.</em></>}
        copy="Get found by golfers near you, fill your calendar and get paid before every lesson."
        actions={<NextLink className="button acid" href={TEACHING_JOIN}>Create your profile <ArrowUpRight size={17} /></NextLink>}
        note="Two minutes to sign up. Your prices, your hours."
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
      <Values
        title={<>Teach more. <span>Chase less.</span></>}
        items={[
          ['Look like the pro you are', 'Your training, specialities and prices in one profile. Golfers trust you before they meet you.'],
          ['Sell plans, not single lessons', 'Offer trials, lesson packs and group classes, at prices you set.'],
          ['Let reviews sell for you', 'Only students who took a lesson can review you. Good reviews move you up.'],
        ]}
      />
      <Faq
        items={[
          ['How do golfers find me?', 'They search Find a coach by city, speciality and level. Profiles with a photo and clear prices get chosen most.'],
          ['Can I bring my current students?', 'Yes, and there’s no exclusivity. Move your regulars onto Fore so lessons, notes and payments live in one place.'],
          ['Who sets my prices?', 'You do. Offer trials, lesson packs, monthly plans and group classes, and change them whenever you like.'],
          ['Is my phone number shared?', 'Never. Golfers message you through Fore, so your number and email stay private.'],
        ]}
      />
      <Closing
        title={<>Your profile, <span>live on Fore.</span></>}
        copy="Two minutes to sign up. We’ll check your details and list you in Find a coach."
        href={TEACHING_JOIN}
        label="Create your profile"
      />
    </div>
  );
}

/* ─── /coaches/performance — shareable page for performance coaches ─ */

export function PerformanceLanding() {
  return (
    <div className="cb-scope cf">
      <Hero
        title={<>Every player. <em>One record.</em></>}
        copy="Lessons, rounds, practice and progress in one place, shared with your players, their parents and your coaching team."
        actions={<NextLink className="button acid" href={PERFORMANCE_JOIN}>Set up your squad <ArrowUpRight size={17} /></NextLink>}
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
      <Values
        title={<>Everyone around the player, <span>on the same page.</span></>}
        copy="Players own their record. Your notes and drills stay yours."
        items={[
          ['You', 'Every player’s status at a glance, so you spot problems before they cost a season.'],
          ['Players and parents', 'A clear focus, drills for the week and a monthly report instead of weekly calls.'],
          ['Your team', 'Swing, short-game, fitness and mental coaches working from one record.'],
        ]}
      />
      <Faq
        items={[
          ['Do my players need the app?', 'Yes. Players log rounds and practice, and see your notes and drills. Parents of juniors get their own view.'],
          ['Who owns the data?', 'Players own their record and choose which coaches see it. Your notes, drills and videos stay yours.'],
          ['Can my whole coaching team join?', 'Yes. Swing, short-game, fitness and mental coaches share one squad and one view of every player.'],
          ['How long does setup take?', 'About 20 minutes on a call. We load your squad with you.'],
        ]}
      />
      <Closing
        title={<>Your squad, <span>on Fore.</span></>}
        copy="Tell us about your program in two minutes. We’ll set up the rest with you."
        href={PERFORMANCE_JOIN}
        label="Set up your squad"
      />
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ScrollToTop from './ScrollToTop';

/* Coach pages use the same building blocks and type scale as the golfers and facilities
   pages in src/App.tsx: .aud-hero-section, .aud-section-intro, .val-grid and .form-section. */

export const JOIN = '/coaches/join';
export const TEACHING_JOIN = '/coaches/teaching/join';
export const PERFORMANCE_JOIN = '/coaches/performance/join';


function Hero({ title, copy, cta, mock }: { title: ReactNode; copy: string; cta: { href: string; label: string }; mock: ReactNode }) {
  return (
    <section className="aud-hero-section">
      <div className="container aud-hero">
        <motion.div className="aud-hero-copy" initial={{ y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
          <h1>{title}</h1>
          <p>{copy}</p>
          <div className="button-row">
            <NextLink className="button acid" href={cta.href}>{cta.label} <ArrowUpRight size={18} /></NextLink>
          </div>
        </motion.div>
        {mock}
      </div>
    </section>
  );
}

function Section({ title, copy, children }: { title: ReactNode; copy?: string; children: ReactNode }) {
  return (
    <section className="section">
      <div className="container">
        <div className="aud-section-intro">
          <div><h2>{title}</h2></div>
          {copy && <p>{copy}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Cards({ items, two = false }: { items: [string, string, string][]; two?: boolean }) {
  return (
    <div className={`val-grid${two ? ' two-col' : ''}`}>
      {items.map(([num, h, p]) => (
        <div className="val-card" key={h}>
          <div className="val-num">{num}</div>
          <h3>{h}</h3>
          <p>{p}</p>
        </div>
      ))}
    </div>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="pill-strip">
      <span className="pill-strip-label">AND MORE</span>
      {items.map((f) => <span key={f} className="pill">{f}</span>)}
    </div>
  );
}

function Join({ title, copy, steps, href, label }: { title: string; copy: string; steps: [string, string][]; href: string; label: string }) {
  return (
    <section className="form-section">
      <div className="container form-layout">
        <div>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        <div className="form-card coach-join-card">
          <ol className="coach-join-steps">
            {steps.map(([h, p], i) => (
              <li key={h}><span>{i + 1}</span><div><strong>{h}</strong>{p}</div></li>
            ))}
          </ol>
          <div className="coach-join-actions">
            <NextLink className="button acid" href={href}>{label} <ArrowUpRight size={16} /></NextLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Mock-ups (same browser-window chrome as the golfers page) ──── */

function MockFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="aud-mock" aria-hidden="true">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-bar-label">{label}</span>
        <span className="mock-preview-badge">Concept preview</span>
      </div>
      <div className="mock-body">{children}</div>
    </div>
  );
}

function ProfileMock() {
  return (
    <MockFrame label="FORE · COACH PROFILE">
      <div className="cm-person">
        <span className="cm-avatar lg">AR</span>
        <div>
          <strong>Arjun Rao</strong>
          <small>PGA Coach · 12 yrs · Gurugram</small>
          <small className="cm-ink">★★★★★ 4.9 · 86 reviews</small>
        </div>
      </div>
      <div className="cm-chips">{['Beginners', 'Short game', 'Full swing', 'TrackMan'].map((s) => <span key={s}>{s}</span>)}</div>
      <div>
        <div className="cm-label">Next available</div>
        <div className="cm-slots">{['Sat 07:00', 'Sat 10:00', 'Sun 09:00'].map((s) => <span key={s}>{s}</span>)}</div>
      </div>
      <div className="cm-foot">
        <div><strong>₹2,500</strong><small>trial lesson</small></div>
        <span className="cm-cta">Book trial</span>
      </div>
    </MockFrame>
  );
}

function WeekMock() {
  const slots: [string, string, string, string][] = [
    ['07:00', 'Regular student', 'Lesson 4 of 8', ''],
    ['08:00', 'Open slot', 'Golfers can book this', 'open'],
    ['09:00', 'Group class', '5 of 6 places booked', ''],
    ['11:00', 'Trial lesson', 'New student via Fore', 'new'],
  ];
  return (
    <MockFrame label="FORE · MY WEEK">
      <div className="cm-label">Saturday · 4 lessons</div>
      <div className="cm-list">
        {slots.map(([t, h, s, k]) => (
          <div key={t} className={`cm-slot ${k}`}>
            <time>{t}</time>
            <div><strong>{h}</strong><small>{s}</small></div>
          </div>
        ))}
      </div>
      <div className="cm-foot">
        <div><strong>₹21,250</strong><small>paid before the lesson</small></div>
        <span className="cm-badge">Rain? Move all</span>
      </div>
    </MockFrame>
  );
}

function SquadMock() {
  return (
    <MockFrame label="FORE · MY SQUAD">
      <div className="cm-label">U-18 squad · 14 players</div>
      <div className="cm-tiles">
        <div><strong>82%</strong><small>practice done</small></div>
        <div><strong>3</strong><small>events this week</small></div>
        <div className="warn"><strong>2</strong><small>need help</small></div>
      </div>
      <div className="cm-list">
        <div className="cm-row"><span className="cm-avatar">09</span><div><strong>Practice down 40%</strong><small>Missed 3 sessions</small></div><span className="cm-badge orange">Nudge</span></div>
        <div className="cm-row"><span className="cm-avatar">06</span><div><strong>Wrist pain logged</strong><small>By the fitness coach</small></div><span className="cm-badge">Rest</span></div>
      </div>
      <div>
        <div className="cm-label">Strokes gained · player 04</div>
        {([['Off the tee', 0.4], ['Approach', -1.2], ['Short game', -0.3], ['Putting', 0.2]] as [string, number][]).map(([n, v]) => (
          <div className="cm-sg" key={n}>
            <small>{n}</small>
            <span><i className={v < 0 ? 'neg' : 'pos'} style={{ width: `${Math.abs(v) * 40}%` }} /></span>
            <b className={v < 0 ? 'neg' : ''}>{v > 0 ? '+' : '−'}{Math.abs(v).toFixed(1)}</b>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

/* ─── /coaches ───────────────────────────────────────────────────── */

export function CoachesLanding() {
  return (
    <>
      <ScrollToTop />
      <Hero
        title={<>Coach beyond <em>your network.</em></>}
        copy="Get discovered by more golfers, fill your calendar and keep every player improving, all from one place."
        cta={{ href: JOIN, label: 'Join as a coach' }}
        mock={<ProfileMock />}
      />
      <Section title={<>Get found. Get booked. <span>Coach better.</span></>} copy="A professional home for your coaching, from the first message to the hundredth lesson.">
        <Cards
          items={[
            ['01 · GET FOUND', 'Be easier to choose.', 'Show your qualifications, specialities, prices and reviews in one profile golfers trust.'],
            ['02 · RUN YOUR WEEK', 'Leave the admin to Fore.', 'Bookings, reminders, rescheduling and payments, without the WhatsApp back-and-forth.'],
            ['03 · SHOW PROGRESS', 'Keep players improving.', 'Lesson notes, drills, rounds and swing videos in one record you share with every player.'],
          ]}
        />
      </Section>
      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>Built for <span>how you coach.</span></h2></div>
            <p>Whether you teach lessons or run a squad, Fore fits the way you already work.</p>
          </div>
          <div className="val-grid two-col">
            <NextLink className="val-card cf-link-card" href="/coaches/teaching">
              <div className="val-num">TEACHING PROS</div>
              <h3>More students. Less admin.</h3>
              <p>Get found by golfers near you, turn trials into regulars and get paid before every lesson.</p>
              <span className="cf-more">Fore for teaching pros <ArrowRight size={16} aria-hidden="true" /></span>
            </NextLink>
            <NextLink className="val-card cf-link-card" href="/coaches/performance">
              <div className="val-num">PERFORMANCE COACHES</div>
              <h3>Every player. One record.</h3>
              <p>Lessons, rounds, practice and progress in one place, shared with players, parents and your team.</p>
              <span className="cf-more">Fore for performance coaches <ArrowRight size={16} aria-hidden="true" /></span>
            </NextLink>
          </div>
        </div>
      </section>
      <Section title={<>Keep every player <span>moving forward.</span></>} copy="Connect what happens in the lesson with what happens between lessons.">
        <Cards
          items={[
            ['ONE', 'Diagnose', 'Capture lesson notes, swing video and the one thing each player needs to work on next.'],
            ['TWO', 'Prescribe', 'Assign drills and practice with clear targets, frequency and duration.'],
            ['THREE', 'Measure', 'See practice, rounds and swing changes, then use them to plan the next lesson.'],
          ]}
        />
        <Pills items={['Calendar & availability', 'Lesson packs', 'UPI & card payments', 'Session notes', 'Swing analysis', 'Drill assignments', 'Round stats', 'Parent reports']} />
      </Section>
      <Join
        title="Get on Fore early."
        copy="Join the first coaches on Fore and help shape the future of golf coaching in India. It takes two minutes."
        steps={[
          ['Sign up', 'Your details, how you coach and what you teach. About two minutes.'],
          ['Go live', 'Your profile appears in Find a coach straight away.'],
          ['Get verified', 'We check your qualifications and add a verified badge.'],
        ]}
        href={JOIN}
        label="Join as a coach"
      />
    </>
  );
}

/* ─── /coaches/teaching ──────────────────────────────────────────── */

export function TeachingLanding() {
  return (
    <>
      <ScrollToTop />
      <Hero
        title={<>More students. <em>Less admin.</em></>}
        copy="Get found by golfers near you, fill your calendar and get paid before every lesson."
        cta={{ href: TEACHING_JOIN, label: 'Create your profile' }}
        mock={<WeekMock />}
      />
      <Section title={<>From first search <span>to regular student.</span></>} copy="Fore brings you new students and keeps them coming back.">
        <Cards
          items={[
            ['01 · GET FOUND', 'Show up near you.', 'Golfers nearby find your profile, see what you teach and book a trial in a tap.'],
            ['02 · CONVERT', 'Turn trials into plans.', 'Send a lesson plan after the trial. The trial fee comes off when they sign up.'],
            ['03 · RETAIN', 'Bring students back.', 'When a student goes quiet, send them your next free slot in one tap.'],
          ]}
        />
      </Section>
      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>Your profile <span>does the selling.</span></h2></div>
            <p>Put your reputation, prices and availability in front of golfers already looking to improve.</p>
          </div>
          <div className="val-grid two-col">
            <div className="val-card">
              <div className="val-num">YOUR PROFILE</div>
              <h3>Look like the pro you are.</h3>
              <p>Qualifications, specialities and reviews from real students help golfers trust you before they meet you.</p>
            </div>
            <div className="val-card">
              <div className="val-num">YOUR PRICES</div>
              <h3>Sell plans, not single lessons.</h3>
              <ul className="offer-list">
                {[['Trial lesson', '₹2,500'], ['4-lesson pack', '₹15,000'], ['8-lesson swing rebuild', '₹28,000'], ['Group class · 4 weeks', '₹9,000']].map(([n, p]) => (
                  <li key={n} className="offer-row"><span className="offer-name">{n}</span><span className="offer-price">{p}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <Pills items={['Calendar & availability', 'Online booking', 'UPI & card payments', 'Reminders', 'Rain rescheduling', 'Verified reviews', 'Video notes']} />
        </div>
      </section>
      <Join
        title="Your profile, live on Fore."
        copy="Create your profile in two minutes and start getting found by golfers near you."
        steps={[
          ['Create your profile', 'What you teach, where and your prices.'],
          ['Go live', 'Golfers find you in Find a coach straight away.'],
          ['Get verified', 'We check your qualifications and add a verified badge.'],
        ]}
        href={TEACHING_JOIN}
        label="Create your profile"
      />
    </>
  );
}

/* ─── /coaches/performance ───────────────────────────────────────── */

export function PerformanceLanding() {
  return (
    <>
      <ScrollToTop />
      <Hero
        title={<>Every player. <em>One record.</em></>}
        copy="Lessons, rounds, practice and progress in one place, shared with your players, their parents and your coaching team."
        cta={{ href: PERFORMANCE_JOIN, label: 'Set up your squad' }}
        mock={<SquadMock />}
      />
      <Section title={<>Close the loop <span>between lessons.</span></>} copy="See what happens between lessons, and shape it.">
        <Cards
          items={[
            ['01 · FIND THE LEAK', 'Know where shots go.', 'Players log rounds in minutes. Strokes gained shows exactly which part of their game needs work.'],
            ['02 · COACH IT', 'Lesson notes in one tap.', 'Film the swing and talk. Fore writes the note and sends the drills.'],
            ['03 · SEE THE WORK', 'See who did their homework.', 'Know who practised before the next lesson, and nudge who didn’t.'],
          ]}
        />
        <div className="perf-card">
          <div className="perf-card-copy">
            <div className="val-num">SHOW THE CHANGE</div>
            <h3>Progress players can see.</h3>
            <p>Put two swings side by side and share a monthly report with players and parents.</p>
          </div>
          <div className="perf-stats">
            <span className="perf-stats-label">PLAYER 04 · MARCH TO OCTOBER</span>
            <div className="perf-stat-row"><span className="perf-stat-name">Spine angle at impact</span><span className="perf-stat-val">31° → 38°</span></div>
            <div className="perf-stat-row"><span className="perf-stat-name">Head movement</span><span className="perf-stat-val">9 → 3 cm</span></div>
            <div className="perf-stat-row"><span className="perf-stat-name">Club speed</span><span className="perf-stat-val">94 → 101 mph</span></div>
          </div>
        </div>
      </Section>
      <Section title={<>Everyone around the player, <span>on the same page.</span></>} copy="Players own their record. Your notes and drills stay yours.">
        <Cards
          items={[
            ['YOU', 'Spot problems early.', 'Every player’s status at a glance, so nothing costs a season.'],
            ['PLAYERS & PARENTS', 'Fewer calls, happier parents.', 'A clear focus, drills for the week and a monthly report.'],
            ['YOUR TEAM', 'One record, many coaches.', 'Swing, short-game, fitness and mental coaches working from the same page.'],
          ]}
        />
      </Section>
      <Join
        title="Your squad, on Fore."
        copy="Tell us about your program in two minutes. We’ll set up the rest with you on a short call."
        steps={[
          ['Sign up', 'You, your players and how you coach.'],
          ['A 20-minute call', 'We set up your squad with you.'],
          ['Players join', 'Rounds, practice and progress flow into one record.'],
        ]}
        href={PERFORMANCE_JOIN}
        label="Set up your squad"
      />
    </>
  );
}

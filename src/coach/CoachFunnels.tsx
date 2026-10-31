import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { CoverArt } from './art';
import {
  PerfCompareScreen,
  PerfEventScreen,
  PerfNoteScreen,
  PerfParentScreen,
  PerfPlayersScreen,
  PerfPracticeScreen,
  PerfSquadScreen,
  PerfStrokesScreen,
  TeachCalendarScreen,
  TeachEarningsScreen,
  TeachNudgeScreen,
  TeachPackagesScreen,
  TeachPlanScreen,
  TeachProfileScreen,
  TeachReviewsScreen,
  TeachSearchScreen,
} from './screens';

export const TEACHING_JOIN = '/coaches/teaching/join';
export const PERFORMANCE_JOIN = '/coaches/performance/join';

/* ─── Building blocks ────────────────────────────────────────────── */

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="section-label"><span />{children}</div>;
}

function HeroCard({ kind }: { kind: 'teaching' | 'performance' }) {
  const teaching = kind === 'teaching';
  return (
    <div className="cf-herocard" aria-hidden="true">
      <CoverArt variant={teaching ? 0 : 3} />
      <span className="cf-herocard-badge">★ {teaching ? 'Featured' : 'Performance coach'}</span>
      <div className="cf-herocard-body">
        <div className="cf-herocard-chips"><span>★ {teaching ? '4.9' : '5.0'}</span><span>{teaching ? 'Golf coach' : 'Juniors & elite'}</span></div>
        <strong>Head Coach</strong>
        <small>{teaching ? 'PGA member · Gurugram · 2.1 km away' : 'U-18 squad · 14 players · Bengaluru'}</small>
      </div>
      <div className="cf-herocard-foot">
        <span>{teaching ? 'Trial lesson' : 'Linked players'}</span>
        <b>{teaching ? 'Book trial →' : 'View squad →'}</b>
      </div>
    </div>
  );
}

function Hero({
  kind,
  eyebrow,
  title,
  copy,
  primary,
  facts,
  screen,
}: {
  kind: 'teaching' | 'performance';
  eyebrow: string;
  title: ReactNode;
  copy: string;
  primary: { href: string; label: string };
  facts: string[];
  screen: ReactNode;
}) {
  return (
    <section className="aud-hero-section cf-hero">
      <div className="container cf-hero-grid">
        <div className="cf-hero-copy">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p>{copy}</p>
          <div className="button-row">
            <NextLink className="button acid" href={primary.href}>{primary.label} <ArrowUpRight size={18} /></NextLink>
            <a className="button light" href="#how">See how it works</a>
          </div>
          <ul className="cf-facts">{facts.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <div className="cf-hero-visual">
          <HeroCard kind={kind} />
          {screen}
        </div>
      </div>
    </section>
  );
}

function Pains({ title, rows }: { title: ReactNode; rows: [string, string][] }) {
  return (
    <section className="section cf-pains-section">
      <div className="container">
        <div className="aud-section-intro">
          <div><h2>{title}</h2></div>
          <p>The work you love, without the admin around it.</p>
        </div>
        <ul className="cf-pains">
          {rows.map(([before, after]) => (
            <li key={before}>
              <span className="cf-pains-before">{before}</span>
              <ArrowRight size={18} aria-hidden="true" />
              <span className="cf-pains-after"><Check size={16} aria-hidden="true" />{after}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type Story = { label: string; title: string; copy: string; points: string[]; screen: ReactNode };

function Stories({ id, intro, stories }: { id: string; intro: { title: ReactNode; copy: string }; stories: Story[] }) {
  return (
    <section id={id} className="section cf-stories">
      <div className="container">
        <div className="aud-section-intro">
          <div><h2>{intro.title}</h2></div>
          <p>{intro.copy}</p>
        </div>
        {stories.map((s, i) => (
          <article className={`cf-story${i % 2 ? ' flip' : ''}`} key={s.title}>
            <div className="cf-story-copy">
              <span className="cf-story-num">{String(i + 1).padStart(2, '0')} · {s.label}</span>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
              <ul>{s.points.map((p) => <li key={p}><Check size={16} aria-hidden="true" />{p}</li>)}</ul>
            </div>
            <div className="cf-story-visual">{s.screen}</div>
          </article>
        ))}
        <p className="cf-note">Mock-ups and figures are illustrative.</p>
      </div>
    </section>
  );
}

function Steps({ title, steps }: { title: ReactNode; steps: [string, string][] }) {
  return (
    <section className="section cf-steps-section">
      <div className="container">
        <div className="aud-section-intro aud-section-intro--compact">
          <div><h2>{title}</h2></div>
        </div>
        <ol className="cf-steps">
          {steps.map(([h, p], i) => (
            <li key={h}>
              <span>{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Faq({ items }: { items: [string, string][] }) {
  return (
    <section className="faq-section section cf-faq">
      <div className="container faq-layout">
        <div className="faq-intro"><h2>Good questions</h2></div>
        <div className="faq-list">
          {items.map(([q, a]) => (
            <details className="faq-item cf-faq-item" key={q}>
              <summary className="faq-question"><span>{q}</span><span className="faq-plus" aria-hidden="true" /></summary>
              <div className="faq-answer"><p>{a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing({ title, copy, talk, href, label }: { title: ReactNode; copy: string; talk: string; href: string; label: string }) {
  return (
    <section className="aud-cta-wrap cf-closing">
      <div className="container">
        <div className="aud-cta-band">
          <div className="aud-cta-band-text">
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          <div className="cf-closing-actions">
            <NextLink className="button acid" href={href}>{label} <ArrowUpRight size={18} /></NextLink>
            <p><strong>Let’s talk.</strong> {talk} <a href="mailto:hello@foresports.in">hello@foresports.in</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SwitchBand({ to }: { to: 'teaching' | 'performance' }) {
  const teaching = to === 'teaching';
  return (
    <div className="container cf-switch">
      <p>
        {teaching ? 'Teach lessons to golfers in your city?' : 'Run a squad, an academy or work with elite players?'}{' '}
        <NextLink href={teaching ? '/coaches/teaching' : '/coaches/performance'}>
          {teaching ? 'See Fore for Teaching Pros' : 'See Fore for Performance Coaches'} <ArrowRight size={14} />
        </NextLink>
      </p>
    </div>
  );
}

/* ─── /coaches ───────────────────────────────────────────────────── */

export function CoachChooser() {
  const paths = [
    {
      kind: 'teaching' as const,
      eyebrow: 'Teaching Pros',
      title: 'Get more students. Fill your calendar.',
      copy: 'For coaches who teach lessons to golfers in their city, from first-timers to single-figure players.',
      points: ['Get found by golfers searching near you', 'A profile with your packages and reviews', 'Trials that turn into regulars', 'A calendar students book themselves'],
      href: '/coaches/teaching',
      join: TEACHING_JOIN,
      joinLabel: 'Create your profile',
    },
    {
      kind: 'performance' as const,
      eyebrow: 'Performance Coaches',
      title: 'Help every player improve faster.',
      copy: 'For coaches who run squads, academies and elite players, and want one record of every player’s game.',
      points: ['Lesson notes in one tap', 'Practice, rounds and swings in one record', 'See who did their homework', 'Monthly reports for parents'],
      href: '/coaches/performance',
      join: PERFORMANCE_JOIN,
      joinLabel: 'Set up your squad',
    },
  ];
  return (
    <div className="cf">
      <section className="aud-hero-section cf-chooser-hero">
        <div className="container">
          <Eyebrow>Fore for coaches</Eyebrow>
          <h1>Coaches, <em>on Fore.</em></h1>
          <p>Two ways to coach on Fore, each built around how you work. Choose yours.</p>
        </div>
      </section>

      <section className="container cf-paths" aria-label="Choose how you coach">
        {paths.map((p) => (
          <article className={`cf-path ${p.kind}`} key={p.kind}>
            <HeroCard kind={p.kind} />
            <div className="cf-path-body">
              <span className="cf-path-eyebrow">{p.eyebrow}</span>
              <h2>{p.title}</h2>
              <p>{p.copy}</p>
              <ul>{p.points.map((x) => <li key={x}><Check size={16} aria-hidden="true" />{x}</li>)}</ul>
              <div className="cf-path-actions">
                <NextLink className="button acid" href={p.href}>Explore {p.eyebrow} <ArrowUpRight size={16} /></NextLink>
                <NextLink className="cf-textlink" href={p.join}>{p.joinLabel} <ArrowRight size={14} /></NextLink>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="section cf-which">
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>Not sure <span>which fits?</span></h2></div>
            <p>Many coaches do both. Start with the one that describes most of your week. You can add the other later.</p>
          </div>
          <div className="cf-which-grid">
            <div>
              <h3>Teaching Pros</h3>
              <ul>
                <li>You teach private lessons, packs or group classes</li>
                <li>New students find you through word of mouth, your range or social media</li>
                <li>Your week is managed on WhatsApp and a diary</li>
                <li>You want golfers in your city to find and book you</li>
              </ul>
              <NextLink className="cf-textlink" href="/coaches/teaching">Fore for Teaching Pros <ArrowRight size={14} /></NextLink>
            </div>
            <div>
              <h3>Performance Coaches</h3>
              <ul>
                <li>You coach a squad, an academy or a few elite players</li>
                <li>Your players compete in junior, amateur or professional events</li>
                <li>You work alongside fitness, mental or short-game coaches</li>
                <li>You want to see what happens between lessons</li>
              </ul>
              <NextLink className="cf-textlink" href="/coaches/performance">Fore for Performance Coaches <ArrowRight size={14} /></NextLink>
            </div>
          </div>
        </div>
      </section>

      <section className="container cf-golfer-band">
        <div>
          <strong>Looking for a coach?</strong>
          <p>Browse Fore coaches by city, speciality and how they teach.</p>
        </div>
        <NextLink className="button light" href="/coaches/directory">Find a coach <ArrowUpRight size={16} /></NextLink>
      </section>
    </div>
  );
}

/* ─── /coaches/teaching ──────────────────────────────────────────── */

export function TeachingFunnel() {
  const stories: Story[] = [
    {
      label: 'Get found',
      title: 'Get found by new students.',
      copy: 'Golfers near you search for a coach on Fore. Your profile shows up, ready to book.',
      points: ['Show up when golfers search near your range', 'Filters for speciality, level and language', 'A trial lesson that makes the first step easy'],
      screen: <TeachSearchScreen />,
    },
    {
      label: 'Your profile',
      title: 'Look like the pro you are.',
      copy: 'Show your training, skills and prices in one place. Golfers trust you before they meet you.',
      points: ['Credentials checked by the Fore team', 'Specialities, languages and where you teach', 'Packages and a trial lesson, in your words'],
      screen: <TeachProfileScreen />,
    },
    {
      label: 'Reviews',
      title: 'Let reviews do the selling.',
      copy: 'Only students who took a lesson can review you. Good reviews move you up the list.',
      points: ['Every review tied to a real lesson', 'What students value, at a glance', 'One link to share your profile anywhere'],
      screen: <TeachReviewsScreen />,
    },
    {
      label: 'Trials',
      title: 'Turn trials into regulars.',
      copy: 'Send a lesson plan right after the trial. If they buy it, the trial fee comes off the price.',
      points: ['A clear focus for the weeks ahead', 'Your recommended package, one tap to buy', 'Video notes and practice between lessons'],
      screen: <TeachPlanScreen />,
    },
    {
      label: 'Packages',
      title: 'Sell plans, not single lessons.',
      copy: 'Offer lesson packs, monthly plans and group classes, at prices you set.',
      points: ['Packs, programmes and group classes', 'Video feedback between sessions', 'Change your plans whenever you like'],
      screen: <TeachPackagesScreen />,
    },
    {
      label: 'Calendar',
      title: 'Your calendar, sorted.',
      copy: 'Set your hours once. Students book and move lessons themselves, with reminders.',
      points: ['Open slots that golfers can book', 'Group classes with places left', 'Rain? Move every lesson in one tap'],
      screen: <TeachCalendarScreen />,
    },
    {
      label: 'Payments',
      title: 'Get paid before you teach.',
      copy: 'Students pay by UPI or card when they book. No chasing, and invoices are ready when you need them.',
      points: ['Paid at booking, not after the lesson', 'Every payment in one place', 'Invoices ready to download'],
      screen: <TeachEarningsScreen />,
    },
    {
      label: 'Bring them back',
      title: 'Bring students back.',
      copy: 'When a student goes quiet, send them your next free slot in one tap.',
      points: ['See who hasn’t booked in a while', 'A friendly nudge from you, not an ad', 'Keep swing changes going'],
      screen: <TeachNudgeScreen />,
    },
  ];

  return (
    <div className="cf cf-teaching">
      <Hero
        kind="teaching"
        eyebrow="Fore for Teaching Pros"
        title={<>Get more students. <em>Fill your calendar.</em></>}
        copy="Get found by golfers near you, turn trial lessons into regulars and run your whole teaching week from one app."
        primary={{ href: TEACHING_JOIN, label: 'Create your coach profile' }}
        facts={['About 5 minutes', 'Reviewed by the Fore team', 'Your prices, your schedule']}
        screen={<TeachProfileScreen />}
      />
      <SwitchBand to="performance" />

      <Pains
        title={<>Teach more. <span>Chase less.</span></>}
        rows={[
          ['New students only by word of mouth', 'Golfers nearby find you on Fore'],
          ['Fixing times over WhatsApp', 'Students book your open slots'],
          ['Trials that never come back', 'A lesson plan sent after every trial'],
          ['Chasing payments after lessons', 'Paid when they book'],
          ['Calling everyone when it rains', 'Move lessons in one tap'],
          ['Students who quietly drift away', 'A nudge with your next free slot'],
        ]}
      />

      <Stories
        id="how"
        intro={{ title: <>Everything a teaching pro <span>needs, in one app.</span></>, copy: 'From the first search to the tenth lesson, Fore handles the admin so you can teach.' }}
        stories={stories}
      />

      <Steps
        title={<>Live on Fore <span>in three steps.</span></>}
        steps={[
          ['Build your profile', 'Your experience, specialities, packages and when you teach. About five minutes.'],
          ['We review it', 'The Fore team checks your details and credentials, then gets in touch.'],
          ['Golfers find you', 'Your profile goes live in the Fore coach directory, and golfers can send you enquiries.'],
        ]}
      />

      <Faq
        items={[
          ['How do golfers find me?', 'Golfers search the Fore coach directory by city, speciality, level and how you teach. Complete profiles with a photo, a clear introduction and your packages are easier to choose.'],
          ['Can I keep my existing students?', 'Yes. Fore doesn’t ask for exclusivity. Bring your regulars onto Fore so their lessons, notes and progress live in one place, or keep working with them as you do today.'],
          ['Do I set my own prices and packages?', 'Yes. You decide what you offer, from a trial lesson to monthly plans and group classes, and you can change it at any time.'],
          ['Who sees my phone number and email?', 'No one. Golfers contact you through Fore, and we pass their enquiries on to you. Your contact details never appear on your profile.'],
          ['How does verification work?', 'Tell us which qualifications you hold, such as PGA of India or PGTI. The Fore team checks them, and your profile then shows a verified badge.'],
          ['What can I use today?', 'Coach profiles and the coach directory are open now, with golfer enquiries passed on to you. Bookings, payments, the calendar and student tools are rolling out to coaches on Fore first.'],
        ]}
      />

      <Closing
        title={<>Your profile, <span className="cf-accent">live on Fore.</span></>}
        copy="Show golfers in your city who you are, how you teach and why they should book you."
        talk="20 minutes, and we’ll set up your coach profile with you."
        href={TEACHING_JOIN}
        label="Create your coach profile"
      />
    </div>
  );
}

/* ─── /coaches/performance ───────────────────────────────────────── */

export function PerformanceFunnel() {
  const stories: Story[] = [
    {
      label: 'Lesson notes',
      title: 'Lesson notes in one tap.',
      copy: 'Film the swing and talk. Fore writes the notes and sends your player the drills.',
      points: ['Video, voice note and summary together', 'Drills added straight to their week', 'Notes reach the player the same day'],
      screen: <PerfNoteScreen />,
    },
    {
      label: 'Progress',
      title: 'Show players their progress.',
      copy: 'Put two swings side by side so players can see what has changed.',
      points: ['Any two sessions, side by side', 'The numbers that moved, in plain words', 'Share with the player and their parent'],
      screen: <PerfCompareScreen />,
    },
    {
      label: 'Practice',
      title: 'See who did their homework.',
      copy: 'Send drills for the week. Know who practised before the next lesson.',
      points: ['Practice plans for each player or the squad', 'Sessions logged as they happen', 'Nudge the players who fall behind'],
      screen: <PerfPracticeScreen />,
    },
    {
      label: 'Rounds',
      title: 'Find where players lose shots.',
      copy: 'Players log their rounds. You see which part of their game needs work.',
      points: ['Strokes gained by part of the game', 'Last ten rounds or the whole season', 'Turn the leak into a training block'],
      screen: <PerfStrokesScreen />,
    },
    {
      label: 'Events',
      title: 'Debrief every event with facts.',
      copy: 'See each round next to the player’s season average, hole by hole.',
      points: ['Tournament rounds, shot by shot', 'Compared with the player’s own season', 'Your debrief note, kept with the round'],
      screen: <PerfEventScreen />,
    },
    {
      label: 'Squad',
      title: 'Your whole squad in one place.',
      copy: 'All players and coaches share one record. Spot problems early.',
      points: ['Swing, short game, fitness and mental coaches together', 'Flags from any coach, seen by all', 'Every player’s status at a glance'],
      screen: <PerfSquadScreen />,
    },
    {
      label: 'Parents',
      title: 'Keep parents on your side.',
      copy: 'Send a monthly progress report in one tap. Fewer calls, happier parents.',
      points: ['Lessons, practice and scores for the month', 'Swing video from then and now', 'Your note, in your words'],
      screen: <PerfParentScreen />,
    },
  ];

  const loop: [string, string][] = [
    ['Play', 'The player logs a round in minutes.'],
    ['Review', 'You see where shots were lost.'],
    ['Prescribe', 'You assign one focus and the drills.'],
    ['Practise', 'The player logs practice. You see it.'],
    ['Repeat', 'The next round shows what moved.'],
  ];

  return (
    <div className="cf cf-performance">
      <Hero
        kind="performance"
        eyebrow="Fore for Performance Coaches"
        title={<>Help every player <em>improve faster.</em></>}
        copy="One shared record for your whole program: lesson notes, practice, rounds and progress, between you, your players and their parents."
        primary={{ href: PERFORMANCE_JOIN, label: 'Set up your squad' }}
        facts={['Built with founding coaches', 'Set up with you, personally', 'Players own their record']}
        screen={<PerfPlayersScreen />}
      />
      <SwitchBand to="teaching" />

      <section className="section cf-loop-section">
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>Close the loop <span>between lessons.</span></h2></div>
            <p>What happens between lessons decides how fast a player improves. Fore lets you see it, and shape it.</p>
          </div>
          <ol className="cf-loop">
            {loop.map(([h, p], i) => (
              <li key={h}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Stories
        id="how"
        intro={{ title: <>Run your whole program <span>from one app.</span></>, copy: 'Every note, drill, round and swing in one record that you, your players and their parents share.' }}
        stories={stories}
      />

      <section className="section cf-built">
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>Built for <span>serious golf.</span></h2></div>
            <p>Designed with coaches of national-level juniors, top amateurs and touring professionals.</p>
          </div>
          <div className="cf-built-grid">
            {[
              ['One record, many coaches', 'Swing, short game, fitness and mental coaches see the same player, so nothing gets lost between you.'],
              ['The player owns the record', 'Players share their record with a coach and can take it with them. Your own notes and drills stay yours.'],
              ['Parents in the loop', 'For juniors, a parent sees reports and is part of every conversation, with consent from day one.'],
              ['Works with your tools', 'Keep using the launch monitors and apps you trust. Fore brings what matters into one place.'],
            ].map(([h, p]) => (
              <div className="cf-built-card" key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cf-founding">
        <div className="container cf-founding-grid">
          <div>
            <Eyebrow>Founding coaches</Eyebrow>
            <h2>Shape what we build.</h2>
            <p>We’re onboarding a small group of performance coaches personally. We load your squad with you, listen every week, and build around how you coach.</p>
          </div>
          <ul className="cf-founding-list">
            {['Your squad set up with you, not by you', 'A direct line to the people building Fore', 'Early access to every new coaching tool', 'A founding coach badge on your profile'].map((x) => (
              <li key={x}><Check size={18} aria-hidden="true" />{x}</li>
            ))}
          </ul>
        </div>
      </section>

      <Faq
        items={[
          ['Who is Fore for Performance Coaches for?', 'Head coaches and academy directors, independent performance coaches, junior program coaches and coaches of touring professionals. If you run a squad or work closely with players who compete, it’s for you.'],
          ['Do my players need the app?', 'Yes. Players log rounds and practice in the Fore app, and see your notes, drills and progress there. Parents of juniors get their own view.'],
          ['Who owns the data?', 'The player owns their record and decides which coaches can see it. The notes, drills and videos you create stay yours.'],
          ['Can other coaches in my program use it?', 'Yes. Swing, short-game, fitness and mental coaches can share the same squad, each with their own notes and the same view of every player.'],
          ['Will I be listed in the public coach directory?', 'No. The directory is for teaching pros who take new students. If you also teach lessons, you can create a teaching profile as well.'],
          ['How long does setup take?', 'About 20 minutes on a call. We set up your squad with you and help your players get started.'],
        ]}
      />

      <Closing
        title={<>Your squad, <span className="cf-accent">on Fore.</span></>}
        copy="Tell us about your program. We’ll set it up with you and your first players."
        talk="20 minutes, and we’ll set up your squad with you."
        href={PERFORMANCE_JOIN}
        label="Set up your squad"
      />
    </div>
  );
}

import type { ReactNode } from 'react';
import { CoverArt, Phone } from './art';

/* Mock-up screens for the coach funnels, drawn from the Fore for Coaches decks.
   Names, numbers and reviews inside them are illustrative. */

function Head({ title, sub, back = true }: { title: string; sub?: string; back?: boolean }) {
  return (
    <div className="cf-s-head">
      {back && <span className="cf-s-back">‹</span>}
      <div>
        <strong>{title}</strong>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

function Tag({ tone = 'grey', children }: { tone?: 'grey' | 'orange' | 'green' | 'red'; children: ReactNode }) {
  return <span className={`cf-s-tag ${tone}`}>{children}</span>;
}

function Row({ lead, title, sub, end }: { lead?: ReactNode; title: ReactNode; sub?: ReactNode; end?: ReactNode }) {
  return (
    <div className="cf-s-row">
      {lead && <span className="cf-s-lead">{lead}</span>}
      <div className="cf-s-row-main">
        <strong>{title}</strong>
        {sub && <small>{sub}</small>}
      </div>
      {end}
    </div>
  );
}

function Foot({ label, value, cta }: { label: string; value: string; cta: string }) {
  return (
    <div className="cf-s-foot">
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span>{cta} →</span>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div className="cf-s-label">{children}</div>;
}

function Golfer({ lean = 0 }: { lean?: number }) {
  return (
    <svg viewBox="0 0 80 100" className="cf-s-golfer" aria-hidden="true">
      <rect width="80" height="100" fill="#2B3A2F" />
      <path d="M0 86 H80 V100 H0Z" fill="#3F5A45" />
      <g stroke="#F4EDE6" strokeWidth="4" strokeLinecap="round" fill="none" transform={`rotate(${lean} 40 60)`}>
        <circle cx="40" cy="26" r="7" fill="#F4EDE6" stroke="none" />
        <path d="M40 34 L44 58 L36 84 M44 58 L52 84 M42 40 L30 58 L22 80" />
      </g>
      <line x1="22" y1="80" x2="16" y2="88" stroke="#FF6E00" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="20" x2="48" y2="84" stroke="#FF6E00" strokeWidth="1.2" strokeDasharray="3 3" />
    </svg>
  );
}

/* ─── Teaching Pros ──────────────────────────────────────────────── */

export function TeachProfileScreen() {
  return (
    <Phone label="A coach's profile on Fore with packages and a trial lesson">
      <div className="cf-s-cover"><CoverArt variant={2} /><span className="cf-s-back light">‹</span></div>
      <div className="cf-s-body">
        <div className="cf-s-title">Head Coach <span className="cf-s-verified">✓</span></div>
        <small className="cf-s-meta">★ 4.9 · 86 reviews · Gurugram</small>
        <div className="cf-s-facts"><div><b>PGA</b>member</div><div><b>12 yrs</b>teaching</div><div><b>2</b>languages</div></div>
        <div className="cf-s-chips"><span>Beginners</span><span>Slice fix</span><span>Short game</span></div>
        <Label>Packages</Label>
        <Row lead="⛳" title="Swing rebuild" sub="8 lessons · 60 min" end={<b>₹28,000</b>} />
        <Row lead="⛳" title="Starter" sub="4 lessons · 60 min" end={<b>₹15,000</b>} />
      </div>
      <Foot label="Trial lesson" value="₹2,500" cta="Book trial" />
    </Phone>
  );
}

export function TeachSearchScreen() {
  return (
    <Phone label="Golfers searching for a coach near them on Fore">
      <div className="cf-s-body">
        <div className="cf-s-title lg">Find a coach</div>
        <small className="cf-s-meta">Near Sector 59, Gurugram</small>
        <div className="cf-s-search">⌕ Golf coach near me</div>
        <div className="cf-s-tabs"><span>Courses</span><span>Ranges</span><span className="on">Coaches</span></div>
        <div className="cf-s-feature">
          <CoverArt variant={1} />
          <div>
            <strong>Head Coach <Tag tone="orange">★ 4.9</Tag></strong>
            <small>PGA member · 2.1 km away</small>
            <div className="cf-s-chips sm"><span>Beginners</span><span>Slice fix</span></div>
          </div>
        </div>
        <Label>More coaches nearby</Label>
        <Row lead="◎" title="Golf coach" sub="3.4 km · ★ 4.7" end={<b>₹3,500</b>} />
        <Row lead="◎" title="Short game coach" sub="5.0 km · ★ 4.8" end={<b>₹4,000</b>} />
      </div>
      <Foot label="Trial from" value="₹2,500" cta="View profile" />
    </Phone>
  );
}

export function TeachPlanScreen() {
  return (
    <Phone label="A lesson plan sent to a golfer after their trial">
      <Head title="Lesson plan" sub="Sent after the trial" />
      <div className="cf-s-body">
        <Row lead="HC" title="Head Coach" sub="Trial on Sat 11 Oct" />
        <div className="cf-s-panel">
          <small>Focus for the next 8 weeks</small>
          <strong>Slice, setup and tempo</strong>
        </div>
        <div className="cf-s-panel accent">
          <Tag tone="orange">Recommended</Tag>
          <Row title="Swing rebuild" sub="8 lessons · 60 min each" end={<b>₹28,000</b>} />
          <small className="cf-s-good">✓ Trial fee of ₹2,500 taken off</small>
        </div>
        <ul className="cf-s-checks">
          <li>Video notes after each lesson</li>
          <li>Practice plan between lessons</li>
          <li>Free reschedule if it rains</li>
        </ul>
      </div>
      <Foot label="Student pays" value="₹25,500" cta="Buy plan" />
    </Phone>
  );
}

export function TeachCalendarScreen() {
  return (
    <Phone label="A coach's weekly calendar with lessons, open slots and a group class">
      <div className="cf-s-body">
        <div className="cf-s-title lg">My calendar</div>
        <small className="cf-s-meta">October 2026</small>
        <div className="cf-s-week">
          {['Mon 6', 'Tue 7', 'Wed 8', 'Thu 9', 'Fri 10', 'Sat 11'].map((d, i) => {
            const [day, n] = d.split(' ');
            return <span key={d} className={i === 5 ? 'on' : ''}><small>{day}</small>{n}</span>;
          })}
        </div>
        <div className="cf-s-slot"><time>07:00</time><div><strong>Regular student</strong><small>Lesson 4 of 8 · every Sat</small></div><b>₹3,500</b></div>
        <div className="cf-s-slot open"><time>08:00</time><div><strong>Open slot</strong><small>Golfers can book this</small></div></div>
        <div className="cf-s-slot"><time>09:00</time><div><strong>Group class</strong><small>5 of 6 places booked</small></div><b>₹11,250</b></div>
        <div className="cf-s-slot new"><time>11:00</time><div><strong>Trial lesson</strong><small>New student via Fore</small></div><b>₹2,500</b></div>
        <div className="cf-s-rain">☂ Rain? Move lessons for me</div>
      </div>
      <Foot label="Saturday" value="₹21,250" cta="Add slot" />
    </Phone>
  );
}

export function TeachEarningsScreen() {
  return (
    <Phone label="Earnings with payments made before each lesson">
      <div className="cf-s-body">
        <div className="cf-s-title lg">Earnings</div>
        <small className="cf-s-meta">6 to 11 October</small>
        <div className="cf-s-panel dark">
          <small>Paid this week</small>
          <strong className="xl">₹1,42,000</strong>
          <small>In your bank tomorrow</small>
        </div>
        <Label>Recent payments</Label>
        <Row lead="₹" title="Swing rebuild" sub="8 lessons · UPI" end={<b>₹28,000</b>} />
        <Row lead="₹" title="Group class" sub="5 golfers · UPI" end={<b>₹45,000</b>} />
        <Row lead="₹" title="Starter pack" sub="4 lessons · Card" end={<b>₹15,000</b>} />
        <Row lead="₹" title="Trial lesson" sub="New student · UPI" end={<b>₹2,500</b>} />
      </div>
      <Foot label="GST invoices" value="Ready" cta="Download" />
    </Phone>
  );
}

export function TeachNudgeScreen() {
  return (
    <Phone label="A lock-screen reminder inviting a student to book their next lesson" className="is-lock">
      <div className="cf-s-lock">
        <small>Saturday 11 October</small>
        <strong>9:41</strong>
        <div className="cf-s-notif">
          <span className="cf-s-notif-icon">F</span>
          <div>
            <small>FORE · YOUR COACH <em>now</em></small>
            <strong>Saturday 7:00 is free</strong>
            <p>Keep your swing changes going. Tap to book your next lesson.</p>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* ─── Performance Coaches ────────────────────────────────────────── */

export function PerfPlayersScreen() {
  return (
    <Phone label="A performance coach's squad overview with players who need attention">
      <div className="cf-s-body">
        <div className="cf-s-title lg">My players</div>
        <small className="cf-s-meta">U-18 squad · 14 players</small>
        <div className="cf-s-tiles">
          <div><b>82%</b><small>practice done</small></div>
          <div><b>3</b><small>events this week</small></div>
          <div className="warn"><b>2</b><small>need help</small></div>
        </div>
        <Label>Needs attention</Label>
        <Row lead="#09" title="Practice down 40%" sub="Missed 3 sessions" end={<Tag tone="orange">Nudge</Tag>} />
        <Row lead="#06" title="Wrist pain logged" sub="By the fitness coach" end={<Tag>Rest</Tag>} />
        <Label>Today</Label>
        <Row lead="◷" title="07:00 · Lesson" sub="Player #04 · driver" />
        <Row lead="◷" title="16:00 · Squad session" sub="8 players · short game" />
      </div>
      <Foot label="This week" value="12 sessions" cta="View" />
    </Phone>
  );
}

export function PerfNoteScreen() {
  return (
    <Phone label="A lesson note written from a swing video and a voice note">
      <Head title="Lesson note" sub="Player #04 · Tue 14 Oct" />
      <div className="cf-s-body">
        <div className="cf-s-video"><Golfer lean={-4} /><span>Face-on · Impact</span><Tag tone="orange">Spine 38°</Tag></div>
        <div className="cf-s-panel">
          <small>AI lesson summary</small>
          <ul className="cf-s-bullets">
            <li>Hips move toward the ball at impact</li>
            <li>New grip is holding well</li>
            <li>Next: keep posture through the ball</li>
          </ul>
        </div>
        <Label>Drills for this week</Label>
        <Row lead="◉" title="Chair drill" sub="3 sets of 10, every day" end={<Tag tone="green">Added</Tag>} />
        <Row lead="◉" title="Wall turn" sub="15 min, 3 times a week" end={<Tag tone="green">Added</Tag>} />
      </div>
      <Foot label="Your voice note" value="2:14" cta="Send to player" />
    </Phone>
  );
}

export function PerfCompareScreen() {
  return (
    <Phone label="Two swings side by side showing what changed between March and October">
      <Head title="Compare swings" sub="Player #04 · Driver" />
      <div className="cf-s-body">
        <div className="cf-s-tabs"><span className="on">Face-on</span><span>Down the line</span></div>
        <div className="cf-s-compare">
          <div><Golfer lean={-10} /><small>MAR · 31°</small></div>
          <div><Golfer lean={-2} /><small>OCT · 38°</small></div>
        </div>
        <Row title="Spine angle at impact" end={<b>31° → 38°</b>} />
        <Row title="Head movement" end={<b>9 cm → 3 cm</b>} />
        <Row title="Club speed" end={<b>94 → 101 mph</b>} />
      </div>
      <Foot label="Share with" value="Player + parent" cta="Send" />
    </Phone>
  );
}

export function PerfPracticeScreen() {
  const rows: [string, string, number, 'green' | 'orange' | 'grey', string][] = [
    ['#04', 'Chair drill · wedges', 5, 'green', 'Done'],
    ['#09', 'Missed 3 days', 2, 'orange', 'Nudge'],
    ['#11', 'Putting · gate drill', 4, 'grey', 'On track'],
    ['#02', 'Range bay · 9 shots', 5, 'green', 'Done'],
    ['#06', 'Resting a sore wrist', 1, 'grey', 'Rest'],
  ];
  return (
    <Phone label="Practice completion for each player in the squad this week">
      <Head title="Practice this week" sub="Drills sent on Monday" />
      <div className="cf-s-body">
        <div className="cf-s-panel row"><small>Squad average</small><strong>82% done</strong></div>
        {rows.map(([id, sub, n, tone, tag]) => (
          <div className="cf-s-prog" key={id}>
            <span className="cf-s-lead">{id}</span>
            <div>
              <small>{sub}</small>
              <i><em style={{ width: `${n * 20}%` }} /></i>
              <small>{n} of 5 sessions</small>
            </div>
            <Tag tone={tone}>{tag}</Tag>
          </div>
        ))}
      </div>
      <Foot label="Next week" value="Plan ready" cta="Send drills" />
    </Phone>
  );
}

export function PerfStrokesScreen() {
  const bars: [string, number][] = [['Off the tee', 0.4], ['Approach', -1.2], ['Short game', -0.3], ['Putting', 0.2]];
  return (
    <Phone label="Strokes gained by part of the game over a player's last ten rounds">
      <Head title="Player #04" sub="Strokes gained · last 10 rounds" />
      <div className="cf-s-body">
        <div className="cf-s-tabs"><span className="on">Last 10 rounds</span><span>Season</span></div>
        <div className="cf-s-axis"><small>← shots lost</small><small>shots gained →</small></div>
        {bars.map(([name, v]) => (
          <div className="cf-s-sg" key={name}>
            <small>{name}</small>
            <div className="cf-s-sg-track">
              <i className={v < 0 ? 'neg' : 'pos'} style={{ width: `${Math.abs(v) * 40}%` }} />
            </div>
            <b className={v < 0 ? 'neg' : ''}>{v > 0 ? '+' : '−'}{Math.abs(v).toFixed(1)}</b>
          </div>
        ))}
        <div className="cf-s-panel accent">
          <small>Coach next: wedge distances</small>
          <strong>Shots from 100–150 m cost 1.2 a round</strong>
        </div>
      </div>
      <Foot label="Training block" value="Wedges · 3 wks" cta="Assign" />
    </Phone>
  );
}

export function PerfParentScreen() {
  return (
    <Phone label="A monthly progress report for a junior player's parent">
      <Head title="October report" sub="For the parent of #09" />
      <div className="cf-s-body">
        <div className="cf-s-tiles">
          <div><b>6/6</b><small>lessons</small></div>
          <div><b>11</b><small>practice days</small></div>
          <div className="good"><b>3.1 ↘</b><small>handicap</small></div>
        </div>
        <div className="cf-s-panel">
          <small>Your note <em>Edit</em></small>
          <p>Great month. Wedge shots are much more accurate. Next focus before nationals: long putts.</p>
        </div>
        <Label>Included in the report</Label>
        <ul className="cf-s-checks">
          <li>Swing video, March vs October</li>
          <li>Practice log and round scores</li>
          <li>Next month’s lessons and events</li>
        </ul>
      </div>
      <Foot label="Ready to send" value="14 reports" cta="Send all" />
    </Phone>
  );
}

import React, { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import heroImg from './imports/welcome-23Iyt5HSJ-c-unsplash-1.jpg';
import itishImg from './imports/itish-arora.jpg';
import savdeepImg from './imports/PFP.jpeg';
import ProductDemo from './components/ProductDemo';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const audiences = [
  {
    id: 'golfers',
    label: 'Golfers',
    title: 'Your golf life, connected.',
    copy: 'Discover places to play, coaches to learn from and opportunities that fit your game — all in one place.',
    tone: 'sage',
    href: '/golfers',
  },
  {
    id: 'coaches',
    label: 'Coaches',
    title: 'Make your expertise discoverable.',
    copy: 'A modern home for your coaching business, from profile and availability to bookings and reputation.',
    tone: 'sand',
    href: '/coaches',
  },
  {
    id: 'facilities',
    label: 'Facilities',
    title: 'Turn availability into opportunity.',
    copy: 'Put inventory online, reach new demand and build a smarter operating layer around your facility.',
    tone: 'forest',
    href: '/facilities',
  },
];

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ForeSports">
      FORE
      <svg className="logo-ball" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="4.5" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
        <circle cx="3.6" cy="3.8" r="0.7" fill="rgba(0,0,0,0.15)"/>
        <circle cx="6.4" cy="3.8" r="0.7" fill="rgba(0,0,0,0.15)"/>
        <circle cx="5" cy="5.8" r="0.7" fill="rgba(0,0,0,0.15)"/>
        <circle cx="3.2" cy="6.4" r="0.7" fill="rgba(0,0,0,0.15)"/>
        <circle cx="6.8" cy="6.4" r="0.7" fill="rgba(0,0,0,0.15)"/>
      </svg>
      SPORTS
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (currentScrollY < 24) {
        setHidden(false);
      } else if (scrollDelta > 4) {
        setHidden(true);
        setOpen(false);
      } else if (scrollDelta < -4) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    ['Golfers', '/golfers'],
    ['Coaches', '/coaches'],
    ['Facilities', '/facilities'],
    ['About', '/about'],
  ];

  return (
    <header className={`header${hidden ? ' is-hidden' : ''}${open ? ' is-open' : ''}`}>
      <div className="nav container">
        <Logo />

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {links.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="button dark small" to="/facilities#join">
            Partner with Fore
            <ArrowUpRight size={14} />
          </Link>

          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p>The connective layer for golf in India. Starting in Delhi NCR.</p>
        </div>

        <div>
          <span>Explore</span>
          <Link to="/golfers">Golfers</Link>
          <Link to="/coaches">Coaches</Link>
          <Link to="/facilities">Facilities</Link>
        </div>

        <div>
          <span>Company</span>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div>
          <span>Legal</span>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 ForeSports Private Limited</span>
        <span>Delhi NCR, India · hello@foresports.in</span>
      </div>
    </footer>
  );
}

function Layout() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/golfers" element={<GolfersPage />} />
          <Route path="/coaches" element={<CoachesPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/privacy"
            element={<Legal title="Privacy Policy" />}
          />
          <Route
            path="/terms"
            element={<Legal title="Terms of Use" />}
          />
        </Routes>
      </main>

      <Footer />
      <Toaster position="bottom-center" />
    </>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="section-label">
      <span />
      {children}
    </div>
  );
}



function Home() {
  return (
    <>
      <section className="hero-bg">
        <img
          className="hero-background-image"
          src={heroImg}
          alt=""
          aria-hidden="true"
        />

        <div className="hero container">
          <div className="hero-copy">
            <h1>
              Golf, <em>finally</em> connected.
            </h1>

            <p>
              Fore connects golfers, coaches, and facilities — making it easier
              to discover and book, grow revenue, and streamline operations.
            </p>

            <div className="button-row">
              <Link className="button acid" to="/facilities">
                For facilities <ArrowUpRight />
              </Link>
              <Link className="button hero-ghost" to="/golfers">
                For golfers <ArrowUpRight />
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Ecosystem />
      <ProductTeaser />
      <FinalCTA />
    </>
  );
}


function Ecosystem() {
  const cards = [
    {
      ...audiences[0],
      title: "Play beyond your usual.",
      copy: "Find and book your next tee time, range session or lesson with ease.",
    },
    {
      ...audiences[1],
      title: "Coach beyond your network.",
      copy: "Get discovered by golfers beyond your network, fill your calendar and grow your coaching business.",
    },
    {
      ...audiences[2],
      title: "Grow beyond your members.",
      copy: "Fill more tee times and practice bays, reach new golfers, grow revenue and manage your bookings, members and operations — all in one place.",
    },
  ];

  return (
    <section className="section ecosystem-section">
      <div className="container">
        <div className="section-intro ecosystem-intro">
          <div>
            <h2>
              Making the game
              <br />
              bigger, together.
            </h2>
          </div>

          <p>
            Golfers need places to play and people to learn from. Coaches need
            golfers to find them. Facilities need golfers to fill empty tee
            times and bays.
          </p>
        </div>

        <div className="ecosystem-cards">
          {cards.map((a, i) => (
            <motion.article
              key={a.id}
              className="ecosystem-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
              }}
            >
              <div className="card-eyebrow">{a.label.toUpperCase()}</div>
              <h3>{a.title}</h3>
              <p>{a.copy}</p>
              <Link className="ecosystem-cta" to={`${a.href}#join`}>
                {i === 0 ? 'For golfers' : i === 1 ? 'For coaches' : 'For facilities'}
                <ArrowUpRight size={16} />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductTeaser() {
  return (
    <section className="product-teaser-section">
      <div className="section container">
      <div className="product-teaser-intro">
        <h2>The platform for <span>modern golf.</span></h2>
        <p>
          One connected ecosystem for playing, coaching, and operating golf.
        </p>
      </div>
      <ProductDemo />
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container">
        <h2>Be the first on <span className="cta-fore">Fore.</span></h2>

        <p>
          We're building one connected ecosystem for golf in India.<br />Join early — as a golfer, a coach or a facility.
        </p>

        <div className="button-row center">
          <Link className="button acid" to="/golfers#join">
            Join as a golfer <ArrowUpRight size={16} />
          </Link>

          <Link className="button acid" to="/coaches#join">
            Join as a coach <ArrowUpRight size={16} />
          </Link>

          <Link className="button acid" to="/facilities#join">
            Partner with Fore <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PageHero({
  label,
  title,
  desc,
  cta,
}: {
  label: string;
  title: ReactNode;
  desc: string;
  cta?: string;
}) {
  return (
    <section className="page-hero container">
      <SectionLabel>{label}</SectionLabel>

      <h1>{title}</h1>

      <p>{desc}</p>

      {cta && (
        <Link className="button dark" to="#join">
          {cta}
          <ArrowUpRight />
        </Link>
      )}
    </section>
  );
}

function JoinForm({ title }: { title: string }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.success("Thanks — you’re on the early-access list.");

    e.currentTarget.reset();
  };

  return (
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Get in early</SectionLabel>

          <h2>{title}</h2>

          <p>
            We're working with a small group of early users and partners as
            the product takes shape.
          </p>
        </div>

        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label>
              Name
              <input required name="name" />
            </label>

            <label>
              Email
              <input required type="email" name="email" />
            </label>

            <label>
              City
              <input required name="city" />
            </label>

            <label>
              Phone
              <input name="phone" />
            </label>
          </div>

          <button className="button dark" type="submit">
            Join the waitlist
            <ArrowUpRight />
          </button>
        </form>
      </div>
    </section>
  );
}

function About() {
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <h1>We started FORE because <em>we love golf.</em></h1>
          <div className="about-hero-intro">
            <p>Golf has given us a lot. The people we've met. The places we've played. The coaches who've helped us. The hours spent practising, competing, learning and simply enjoying being out there.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div><h2>FORE is...</h2></div>
          </div>
          <div className="about-cards">
            <article className="about-card">
              <div className="val-num">01 / THE GOLFER</div>
              <div>
                <h3>For the golfer trying to get better.</h3>
                <p>You might be picking up a club for the first time. You might be playing every weekend. Wherever you are, there is always a next step. We want to make it easier to find yours.</p>
              </div>
            </article>
            <article className="about-card about-card--dark">
              <div className="val-num">02 / THE COACH</div>
              <div>
                <h3>For the coach who wants to help people improve.</h3>
                <p>Coaches spend too much time finding students and managing everything around the lesson. We want to make it easier for the right golfers to find them.</p>
              </div>
            </article>
            <article className="about-card about-card--sage">
              <div className="val-num">03 / THE FACILITY</div>
              <div>
                <h3>For the people who create places to play.</h3>
                <p>Ranges, academies, courses and facilities are where golfers meet, practise, learn and become part of the game. We want to help these places become easier to discover, easier to run and more connected.</p>
              </div>
            </article>
            <article className="about-card">
              <div className="val-num">04 / THE NEXT GENERATION</div>
              <div>
                <h3>For the next generation of golfers.</h3>
                <p>Every golfer starts somewhere. A first swing. A first lesson. A first tournament. Behind each one is usually a parent, a coach or a facility. We want to help more of those journeys happen.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="aud-section-intro">
            <div><h2 style={{ whiteSpace: 'nowrap' }}>Two perspectives. <span>One idea.</span></h2></div>
          </div>
          <div className="founder-grid">
            <article className="founder-card">
              <div className="founder-photo">
                <img src={itishImg} alt="Itish Arora" className="founder-photo-img" />
              </div>
              <div className="founder-story">
                <h3>Itish Arora</h3>
                <small>Founder &amp; CEO</small>
                <div className="founder-text">
                  <p>My journey into golf started as a parent trying to help my son navigate the game.</p>
                  <p>Like many parents, I found myself constantly searching for answers. Which coach was right? Which facilities offered the best opportunities? What tournaments should he play? How do you measure progress?</p>
                  <p>The more involved I became, the more I realized how difficult it was to find reliable information. So much of the journey depended on who you knew, who you could ask, or whether someone happened to point you in the right direction.</p>
                  <p>Golf already has talented coaches, great facilities and passionate people. What was missing was a way to connect them.</p>
                  <p>My professional journey has been across sales, partnerships and operations, working with people and businesses to build, grow and run organisations. I saw an opportunity to bring that experience to a game I had become deeply invested in personally.</p>
                </div>
              </div>
            </article>
            <article className="founder-card founder-card--alt">
              <div className="founder-photo">
                <img src={savdeepImg} alt="Savdeep Kadian" className="founder-photo-img founder-photo-img--savdeep" />
              </div>
              <div className="founder-story">
                <h3>Savdeep Kadian</h3>
                <small>Founder, CPO</small>
                <div className="founder-text">
                  <p>I've been playing golf for more than ten years. I started with a club a coach lent me, spent my early years in junior training camps, and gradually worked my way through the national junior and amateur circuits.</p>
                  <p>I've played at courses and facilities across the country, meeting juniors, amateurs, professionals, coaches, parents and people picking up a club for the first time. I've seen almost every side of the game.</p>
                  <p>And everywhere I've gone, I've seen the same thing: there is a lot of golf out there, but very little connecting it. Most of the time, you find things because someone happens to tell you about them.</p>
                  <p>A coach recommendation. A better facility. A junior program. A tournament. The right place to practise. You get lucky, or you don't.</p>
                  <p>I've spent more than a decade finding my way through golf. Now I want to build something that makes that journey easier for the next golfer.</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-split">
          <div>
            <h2 className="about-split-h2">Help us build <span>FORE.</span></h2>
          </div>
          <div className="about-split-copy">
            <p>If you run a facility, academy, institution or golf business, we want you to be part of building FORE with us.</p>
            <p>Bring what you already do, help us shape the platform and help us build a better connected golf ecosystem.</p>
            <div className="about-invite">
              <Link className="button acid" to="/facilities">Build with us <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container about-split">
          <div>
            <h2 className="about-split-h2">India <span>→ the world.</span></h2>
          </div>
          <div className="about-split-copy">
            <p>FORE is being built in India.</p>
            <p>This is the golf community we know. These are the golfers, coaches, parents, academies, ranges and facilities we've spent years around.</p>
            <p>We've seen the enthusiasm for the game. We've seen the talent. We've also seen people building great things with limited tools, and golfers trying to find their way through a fragmented ecosystem.</p>
            <p>So we're starting here. We'll learn here, build with this community and see how far we can take it.</p>
            <p>What we learn in India should have a place far beyond India.</p>
          </div>
        </div>
      </section>

      <section className="about-end">
        <div className="container">
          <h2>If you're part of golf,<br /><span>you're part of FORE.</span></h2>
          <div className="about-end-lines">
            <p>You might be picking up a club for the first time.</p>
            <p>You might have been playing for fifty years.</p>
            <p>You might be a golfer, a parent, a coach, a facility or simply someone who loves the game.</p>
            <p>Wherever you are in golf, there is a place for you here.</p>
          </div>
          <div className="about-sign">
            We're building FORE for the game we love.<br />
            And we're building it with you.<br />
            <br />
            — Itish &amp; Savdeep
          </div>
        </div>
      </section>
    </>
  );
}

function Contact() {
  return (
    <>
      <PageHero
        label="Contact"
        title={
          <>
            Let's build the
            <br />
            <em>next layer of golf.</em>
          </>
        }
        desc="For facilities, coaches, investors, partners, press and general enquiries."
      />

      <JoinForm title="Get in touch." />
    </>
  );
}

function Legal({ title }: { title: string }) {
  return (
    <>
      <PageHero
        label="Legal"
        title={title}
        desc="Information governing use of the ForeSports website."
      />

      <section className="section container legal">
        <h2>Website purpose</h2>

        <p>
          This website provides information about ForeSports and its planned
          product. Product descriptions and previews are directional and may
          change before launch.
        </p>

        <h2>Contact</h2>

        <p>Questions can be sent to hello@foresports.in.</p>
      </section>
    </>
  );
}

// ─── Audience join forms ──────────────────────────────────────────

function GolferJoinForm() {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("You're on the list — we'll be in touch.");
    e.currentTarget.reset();
  };
  return (
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Join as a golfer</SectionLabel>
          <h2>Be one of the first.</h2>
          <p>We're starting in Delhi NCR with a small group of early golfers. Drop your details and we'll be in touch.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label>Name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@email.com" /></label>
            <label>Phone<input name="phone" placeholder="+91" /></label>
            <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
          </div>
          <button className="button dark" type="submit">
            Get early access <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

function CoachJoinForm() {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Thanks — we'll reach out soon.");
    e.currentTarget.reset();
  };
  return (
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Join as a coach</SectionLabel>
          <h2>Get on Fore early.</h2>
          <p>We're working with a small number of coaches from the start. Leave your details and we'll reach out.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label>Name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@email.com" /></label>
            <label>Phone<input name="phone" placeholder="+91" /></label>
            <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
          </div>
          <button className="button dark" type="submit">
            Apply for early access <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

function FacilityJoinForm() {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Thanks — someone from Fore will be in touch shortly.");
    e.currentTarget.reset();
  };
  return (
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Partner with Fore</SectionLabel>
          <h2>Build with us.</h2>
          <p>We're bringing a small number of facilities in Delhi NCR on board to shape the platform together. Leave your details and we'll be in touch.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label className="full-width">Facility name<input required name="facility" placeholder="Name of your course, range or academy" /></label>
            <label>Your name<input required name="name" placeholder="Contact name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@facility.com" /></label>
            <label>Phone<input name="phone" placeholder="+91" /></label>
            <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
          </div>
          <button className="button dark" type="submit">
            Get in touch <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Audience page mock UIs ───────────────────────────────────────

function GolfersMock() {
  return (
    <div className="aud-mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-bar-label">FORE · DISCOVER</span>
      </div>
      <div className="mock-body">
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)' }}>
          Delhi · This weekend
        </div>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--muted)' }}>
          Search courses, ranges or coaches
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)', marginBottom: 10 }}>Tee times for you</div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Delhi Golf Club</span>
              <span style={{ background: '#e8f1d8', color: '#2d5038', borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>7.4 km</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>18 holes · New Delhi · 3 times available</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>From ₹2,500</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2d5038' }}>View times →</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)', marginBottom: 10 }}>Coaches you may like</div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--acid)', color: '#2d5038', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>AM</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Arjun Mehta</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Short game · 4.9 ★ · 94 reviews</div>
            </div>
            <span style={{ background: '#e8f1d8', color: '#2d5038', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachesMock() {
  return (
    <div className="aud-mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-bar-label">FORE · COACH PROFILE</span>
      </div>
      <div className="mock-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--acid)', color: '#2d5038', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>AR</div>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>Arjun Rao</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>PGA Coach · 12 yrs · Delhi</div>
            <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 3 }}>★★★★★ 4.8 · 94 reviews</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {['Short game', 'Full swing', 'Juniors', 'TrackMan'].map((s) => (
            <span key={s} style={{ background: '#e8f1d8', color: '#2d5038', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>{s}</span>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)', marginBottom: 10 }}>Next available</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {['Sat 10:00', 'Sat 14:00', 'Sun 09:00'].map((slot) => (
              <span key={slot} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{slot}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>₹3,000</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>/ lesson</div>
          </div>
          <span style={{ background: '#2d5038', color: '#fff', borderRadius: 999, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Book lesson</span>
        </div>
      </div>
    </div>
  );
}

function FacilitiesMock() {
  const barHeights = [48, 63, 82, 90, 58, 42, 30];
  return (
    <div className="aud-mock">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-bar-label">FORE · FACILITY</span>
      </div>
      <div className="mock-body">
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)', marginBottom: 8 }}>Today's utilisation</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 44, letterSpacing: '-.04em', color: 'var(--ink)', lineHeight: 1 }}>72%</span>
            <span style={{ background: '#e8f1d8', color: '#2d5038', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>+14% vs last week</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 72 }}>
          {barHeights.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, background: i === 3 ? '#2d5038' : '#e8f1d8' }} />
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>11:00 · 8 open slots</span>
            <span style={{ background: 'var(--acid)', color: '#2d5038', borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>Fore price ₹1,500</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Turn softer hours into bookable demand.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Audience page components ─────────────────────────────────────

function GolfersPage() {
  return (
    <>
      <section className="aud-hero-section">
        <div className="container aud-hero">
          <motion.div
            className="aud-hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1>Play beyond <em>your usual.</em></h1>
            <p>Discover more places to play, find the right coach, and book golf in a few taps — all in one place.</p>
            <div className="button-row">
              <a className="button acid" href="#join">
                Join as a golfer <ArrowUpRight size={18} />
              </a>
              <a className="button light" href="#how">
                See the experience <ArrowUpRight size={18} />
              </a>
            </div>
          </motion.div>
          <GolfersMock />
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Find it. Book it. <span>Keep improving.</span></h2>
            </div>
            <p>More of golf, without the fragmentation — courses, coaches, tee times and progress in one place.</p>
          </div>
          <div className="val-grid">
            <div className="val-card">
              <div className="val-num">01 · DISCOVER</div>
              <h3>See more of golf.</h3>
              <p>Find courses, ranges and coaches beyond your usual network — with prices, availability, reviews and details in one place.</p>
            </div>
            <div className="val-card">
              <div className="val-num">02 · BOOK</div>
              <h3>Book without the back-and-forth.</h3>
              <p>Book tee times, lessons, caddies, carts and rental clubs with clear availability before you commit.</p>
            </div>
            <div className="val-card">
              <div className="val-num">03 · IMPROVE</div>
              <h3>Keep your progress.</h3>
              <p>Rounds, practice, swing analysis and lessons stay connected over time — so your development does not disappear after a session.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Find a coach who <span>fits your game.</span></h2>
            </div>
            <p>See qualifications, specialties, reviews, fees and availability — then try a lesson before committing.</p>
          </div>
          <div className="val-grid two-col">
            <div className="val-card">
              <div className="val-num">COACH PROFILE</div>
              <h3>Know who you're booking.</h3>
              <p>See qualifications, specialties, reviews, fees, packages and availability before you choose.</p>
            </div>
            <div className="val-card">
              <div className="val-num">YOUR PROGRESS</div>
              <h3>Make every lesson count.</h3>
              <p>Practice results, swing analysis, drills and lesson history stay connected to your coach — so the next session starts where the last one ended.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Your golf, <span>connected.</span></h2>
            </div>
            <p>Playing, practicing, improving and staying connected to golf — without needing a different app for every part of the journey.</p>
          </div>
          <div className="val-grid">
            <div className="val-card">
              <div className="val-num">PLAY</div>
              <h3>Courses, ranges and tee times.</h3>
              <p>Tee times, range sessions, tournaments, caddies, carts and rental clubs — bookable in one place.</p>
            </div>
            <div className="val-card">
              <div className="val-num">PRACTICE</div>
              <h3>Range and lesson packages.</h3>
              <p>Range passes, lesson bundles and off-peak slots — available when your schedule is.</p>
            </div>
            <div className="val-card">
              <div className="val-num">IMPROVE</div>
              <h3>A record that follows your game.</h3>
              <p>Coaching history, performance data and swing feedback stay connected over time — not lost between sessions.</p>
            </div>
          </div>
          <div className="pill-strip">
            <span className="pill-strip-label">AND MORE</span>
            {['Lesson & range packages', 'Loyalty & perks', 'Memberships', 'UPI & card payments', 'Corporate / society golf', 'Golf news & content'].map((f) => (
              <span key={f} className="pill">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <GolferJoinForm />
    </>
  );
}

function CoachesPage() {
  return (
    <>
      <section className="aud-hero-section">
        <div className="container aud-hero">
          <motion.div
            className="aud-hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1>Coach beyond <em>your network.</em></h1>
            <p>Get discovered by more golfers, fill your calendar, and run your coaching business from one place.</p>
            <div className="button-row">
              <a className="button acid" href="#join">
                Join as a coach <ArrowUpRight size={18} />
              </a>
              <a className="button light" href="#business">
                See what you get <ArrowUpRight size={18} />
              </a>
            </div>
          </motion.div>
          <CoachesMock />
        </div>
      </section>

      <section id="business" className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Get found. Get booked. <span>Coach better.</span></h2>
            </div>
            <p>A professional home for your coaching business — discovery, bookings, admin and progress in one place.</p>
          </div>
          <div className="val-grid">
            <div className="val-card">
              <div className="val-num">01 · GET FOUND</div>
              <h3>Be easier to choose.</h3>
              <p>Show qualifications, specialties, experience, fees, packages, availability and reviews in one credible profile.</p>
            </div>
            <div className="val-card">
              <div className="val-num">02 · RUN YOUR BUSINESS</div>
              <h3>Keep the admin in one place.</h3>
              <p>Manage your calendar, sessions, students, lesson history, notes, payments and rescheduling without the WhatsApp back-and-forth.</p>
            </div>
            <div className="val-card">
              <div className="val-num">03 · GROW</div>
              <h3>Turn more golfers into students.</h3>
              <p>Offer trials and packages, receive warm leads from the Fore network, and build reputation through reviews and visible progress.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Your profile <span>does the selling.</span></h2>
            </div>
            <p>Put your reputation, offer and availability in front of golfers already looking to improve.</p>
          </div>
          <div className="val-grid two-col">
            <div className="val-card">
              <div className="val-num">ARJUN RAO · COACH</div>
              <h3>Turn your track record into trust.</h3>
              <p>Qualifications, reviews, lessons and visible results give golfers more confidence in choosing you.</p>
              <div className="coach-trust-pills">
                {['4.8 ★', '94 reviews', '340+ lessons', '#2 at Delhi Golf Club'].map((t) => (
                  <span key={t} className="pill">{t}</span>
                ))}
              </div>
            </div>
            <div className="val-card">
              <div className="val-num">YOUR OFFER</div>
              <h3>Clear pricing. Every package.</h3>
              <ul className="offer-list">
                {[
                  ['Trial Lesson', '₹800'],
                  ['Single Lesson', '₹3,000'],
                  ['6-Lesson Bundle', '₹16,200'],
                  ['12-Lesson Bundle', '₹30,000'],
                ].map(([name, price]) => (
                  <li key={name} className="offer-row">
                    <span className="offer-name">{name}</span>
                    <span className="offer-price">{price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Everything <span>after the booking.</span></h2>
            </div>
            <p>Run your schedule and sessions, manage students and payments, analyse swings, assign practice and review results — all from your Fore workspace.</p>
          </div>
          <div className="pill-strip">
            {['Calendar & availability', 'Session notes', 'Student lesson history', 'Payments', 'Swing analysis', 'Drill assignments', 'Practice results', 'Rounds & performance'].map((f) => (
              <span key={f} className="pill">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Keep every student <span>moving forward.</span></h2>
            </div>
            <p>Connect what happens in the lesson with what happens between lessons.</p>
          </div>
          <div className="val-grid">
            <div className="val-card">
              <div className="val-num">01</div>
              <h3>Diagnose</h3>
              <p>Capture lesson notes, swing feedback and what the student needs to work on next.</p>
            </div>
            <div className="val-card">
              <div className="val-num">02</div>
              <h3>Prescribe</h3>
              <p>Assign drills and practice with clear targets, frequency and duration.</p>
            </div>
            <div className="val-card">
              <div className="val-num">03</div>
              <h3>Measure</h3>
              <p>Review practice results, rounds and swing feedback, then use the data to guide the next session.</p>
            </div>
          </div>
          <div className="perf-card">
            <div className="perf-card-copy">
              <div className="val-num">PERFORMANCE SUITE</div>
              <h3>See what changed between lessons.</h3>
              <p>Rounds, practice results, swing feedback and drill completion give you a clearer picture of the golfer you're coaching.</p>
            </div>
            <div className="perf-stats">
              <span className="perf-stats-label">MEERA · LAST 30 DAYS</span>
              <div className="perf-stat-row">
                <span className="perf-stat-name">Avg score</span>
                <span className="perf-stat-val">74.8</span>
              </div>
              <div className="perf-stat-row">
                <span className="perf-stat-name">Fairways</span>
                <span className="perf-stat-val">62%</span>
              </div>
              <div className="perf-stat-row">
                <span className="perf-stat-name">GIR</span>
                <span className="perf-stat-val">58%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CoachJoinForm />
    </>
  );
}

function FacilitiesPage() {
  const pricingRows = [
    { time: '09:00', standard: '₹2,500', fore: '₹2,500', status: 'high' as const, statusLabel: 'High demand' },
    { time: '11:00', standard: '₹2,500', fore: '₹1,800', status: 'fill' as const, statusLabel: 'Fill' },
    { time: '12:00', standard: '₹2,500', fore: '₹1,500', status: 'fill' as const, statusLabel: 'Fill' },
  ];

  return (
    <>
      <section className="aud-hero-section">
        <div className="container aud-hero">
          <motion.div
            className="aud-hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1>Increase revenue. <em>Streamline operations.</em></h1>
            <p>Reach more golfers, fill more tee times and bays, and run your facility from one connected system.</p>
            <div className="button-row">
              <a className="button acid" href="#join">
                Partner with Fore <ArrowUpRight size={18} />
              </a>
              <a className="button light" href="#revenue">
                See the platform <ArrowUpRight size={18} />
              </a>
            </div>
          </motion.div>
          <FacilitiesMock />
        </div>
      </section>

      <section id="revenue" className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Make every slot <span>work harder.</span></h2>
            </div>
            <p>Reach golfers beyond your existing base, fill softer inventory and create more revenue from capacity that would otherwise go unused.</p>
          </div>
          <div className="val-grid">
            <div className="val-card">
              <div className="val-num">01</div>
              <h3>Reach more golfers.</h3>
              <p>Put available tee times, range buckets and simulator bays in front of golfers beyond your existing base.</p>
            </div>
            <div className="val-card">
              <div className="val-num">02</div>
              <h3>Fill more capacity.</h3>
              <p>Use demand-based pricing, last-minute offers and live utilisation data to fill softer inventory.</p>
            </div>
            <div className="val-card">
              <div className="val-num">03</div>
              <h3>Grow each visit.</h3>
              <p>Turn visits into repeat revenue with memberships, passes and timely pro-shop or F&B offers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Price inventory <span>around demand.</span></h2>
            </div>
            <p>Treat tee times, range buckets and simulator bays as inventory — not fixed-price slots.</p>
          </div>
          <div className="pricing-table-card">
            <div className="pricing-table">
              <div className="pricing-th">TEE TIME</div>
              <div className="pricing-th">STANDARD</div>
              <div className="pricing-th">FORE</div>
              <div className="pricing-th">STATUS</div>
              {pricingRows.map((row) => (
                <React.Fragment key={row.time}>
                  <div className="pricing-td">{row.time}</div>
                  <div className="pricing-td">{row.standard}</div>
                  <div className="pricing-td fore-val">{row.fore}</div>
                  <div className="pricing-td">
                    <span className={`status-pill ${row.status}`}>{row.statusLabel}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p className="pricing-footer">Fill softer hours without changing your peak-time pricing.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="aud-section-intro">
            <div>
              <h2>Run the whole facility <span>from one system.</span></h2>
            </div>
            <p>Replace disconnected desk workflows with one operating system for bookings, check-ins, caddies, maintenance, members and management.</p>
          </div>
          <div className="val-grid">
            <div className="val-card">
              <div className="val-num">BOOKINGS & DESKS</div>
              <h3>Bookings & desks</h3>
              <p>Run green-fee and range desks, walk-ins, group bills and booking changes in one place.</p>
            </div>
            <div className="val-card">
              <div className="val-num">STARTERS & CADDIES</div>
              <h3>Starters & caddies</h3>
              <p>Check in golfers, manage foursomes, and coordinate caddy availability and bookings.</p>
            </div>
            <div className="val-card">
              <div className="val-num">MAINTENANCE</div>
              <h3>Maintenance</h3>
              <p>Block holes or course inventory, schedule maintenance and keep live availability up to date.</p>
            </div>
            <div className="val-card">
              <div className="val-num">MEMBERS</div>
              <h3>Members</h3>
              <p>Manage membership types, member rates, expiry, renewals and member communications.</p>
            </div>
            <div className="val-card">
              <div className="val-num">ANALYTICS</div>
              <h3>Analytics</h3>
              <p>See utilisation and demand patterns, then price and plan around what is actually selling.</p>
            </div>
            <div className="val-card">
              <div className="val-num">GROWTH</div>
              <h3>Growth</h3>
              <p>Reconnect lapsed golfers and surface pro-shop, F&B, pass or membership offers at the right moment.</p>
            </div>
          </div>
        </div>
      </section>

      <FacilityJoinForm />
    </>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Layout />
      </motion.div>
    </AnimatePresence>
  );
}
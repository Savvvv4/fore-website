'use client';

import React, { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import heroImg from './imports/welcome-23Iyt5HSJ-c-unsplash-1.jpg';
import logoDark from './imports/foresports-logo.png';
import logoWhite from './imports/foresports-logo-white.png';
import itishImg from './imports/itish-arora.jpg';
import savdeepImg from './imports/PFP.jpeg';
import ProductDemo from './components/ProductDemo';
import { supabase } from './lib/supabase';
import NextLink from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';

type AppLinkProps = Omit<React.ComponentProps<typeof NextLink>, 'href'> & { to: string };
function Link({ to, ...props }: AppLinkProps) { return <NextLink href={to} {...props} />; }
function NavLink({ to, ...props }: AppLinkProps) { return <NextLink href={to} {...props} />; }

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

function Logo({ variant = 'dark' }: { variant?: 'dark' | 'white' }) {
  const src = variant === 'white' ? logoWhite.src : logoDark.src;
  return (
    <Link to="/" className="logo" aria-label="ForeSports">
      <img src={src} alt="ForeSports" className="logo-img" />
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

        <nav id="primary-navigation" className={open ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
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
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="primary-navigation"
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
          <Logo variant="white" />
          <p>The connective layer for golf in India.</p>
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
          <Link to="/facilities#join">Partner with Fore</Link>
        </div>

        <div>
          <span>Legal</span>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 ForeSports Private Limited</span>
        <span>hello@foresports.in</span>
      </div>
    </footer>
  );
}

export type Page = 'home' | 'golfers' | 'coaches' | 'facilities' | 'about' | 'privacy' | 'terms' | 'not-found';

function Layout({ page }: { page: Page }) {
  const content = { home: <Home />, golfers: <GolfersPage />, coaches: <CoachesPage />, facilities: <FacilitiesPage />, about: <About />, privacy: <Privacy />, terms: <Terms />, 'not-found': <NotFound /> }[page];
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />

      <main id="main-content" tabIndex={-1}>
        {content}
      </main>

      <Footer />
      <FloatingWaitlistCTA />
      <Toaster position="bottom-center" />
    </>
  );
}

function FloatingWaitlistCTA() {
  const [minimized, setMinimized] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [productDemoVisible, setProductDemoVisible] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMinimized(false);
    setModalOpen(false);
    setSubmitted(false);
  }, []);

  useEffect(() => {
    setHeroPassed(false);
    setFooterVisible(false);
    setProductDemoVisible(false);

    const hero = document.querySelector<HTMLElement>('.hero-bg, .aud-hero-section, .about-hero, .page-hero');
    const footer = document.querySelector<HTMLElement>('.footer');
    if (!hero || !footer) return;

    const updateHeroState = () => {
      setHeroPassed(hero.getBoundingClientRect().bottom <= 0);
    };

    updateHeroState();
    window.addEventListener('scroll', updateHeroState, { passive: true });

    const footerObserver = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    footerObserver.observe(footer);

    const productDemo = document.querySelector<HTMLElement>('.product-demo');
    const mobileQuery = window.matchMedia('(max-width: 600px)');
    const demoObserver = productDemo
      ? new IntersectionObserver(
          ([entry]) => setProductDemoVisible(mobileQuery.matches && entry.isIntersecting),
          { threshold: 0.1 },
        )
      : null;
    if (productDemo) demoObserver?.observe(productDemo);

    return () => {
      window.removeEventListener('scroll', updateHeroState);
      footerObserver.disconnect();
      demoObserver?.disconnect();
    };
  }, []);

  const submitFloatingForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      await submitWaitlist({
        name: String(data.get('name') ?? ''),
        phone: String(data.get('phone') ?? ''),
        city: '',
        role: String(data.get('role') ?? 'general') as WaitlistSubmission['role'],
        source: 'floating_cta',
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error('Floating waitlist submission failed', error);
      toast.error('We could not save your details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (distance < -60) setMinimized(true);
  };

  if (!heroPassed || footerVisible || productDemoVisible) return null;

  return (
    <>
      {minimized ? (
        <button className="floating-waitlist-restore" type="button" onClick={() => setMinimized(false)} aria-label="Restore early member invitation">
          <ChevronRight size={17} />
        </button>
      ) : (
      <aside className="floating-waitlist-cta" aria-label="Become an early member" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <button className="floating-waitlist-minimize" type="button" onClick={() => setMinimized(true)} aria-label="Minimize early member invitation" title="Minimize">
          <ChevronDown size={15} />
        </button>
        <div className="floating-waitlist-copy">
          <strong>Get in early.</strong>
          <span>Become an early member.</span>
        </div>
        <div className="floating-waitlist-actions">
          <button className="button acid small floating-waitlist-button" type="button" onClick={() => { setSubmitted(false); setModalOpen(true); }}>
            Join Fore
            <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
      )}

      {modalOpen && (
        <div className="early-member-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="early-member-modal" role="dialog" aria-modal="true" aria-labelledby="early-member-title">
            {!submitted ? (
              <>
                <div className="early-member-modal-header">
                  <div>
                    <span className="section-label">Get in early</span>
                    <h2 id="early-member-title">Become an early member.</h2>
                  </div>
                  <button className="early-member-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close early member form">{String.fromCharCode(215)}</button>
                </div>
                <form className="early-member-form" onSubmit={submitFloatingForm}>
                  <label>Name<input required name="name" placeholder="Your name" /></label>
                  <label>Phone<input required name="phone" type="tel" placeholder="+91" /></label>
                  <fieldset className="early-member-role-fieldset">
                    <legend>I am a</legend>
                    <div className="early-member-role-options">
                      {(['golfer', 'coach', 'facility'] as const).map((role) => (
                        <label key={role} className="early-member-role-option">
                          <input required type="radio" name="role" value={role} />
                          <span>{role === 'facility' ? 'Facility Rep' : role[0].toUpperCase() + role.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button className="button acid" type="submit" disabled={submitting}>{submitting ? 'Joining...' : 'Join Fore'}</button>
                </form>
              </>
            ) : (
              <div className="early-member-success">
                <div className="early-member-success-icon">✓</div>
                <h2 id="early-member-title">You’re on the list.</h2>
                <p>Thanks for joining Fore early. We’ll be in touch soon.</p>
                <button className="button dark" type="button" onClick={() => setModalOpen(false)}>Done</button>
              </div>
            )}
          </section>
        </div>
      )}
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

type WaitlistSubmission = {
  name: string;
  email?: string;
  phone?: string;
  city: string;
  role: 'general' | 'golfer' | 'coach' | 'facility';
  source: 'golfer_join' | 'coach_join' | 'facility_join' | 'floating_cta';
  facility_name?: string;
};

async function submitWaitlist(submission: WaitlistSubmission) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('waitlist_submissions').insert(submission);

  if (error) {
    throw new Error(`Supabase submission failed: ${error.message}`);
  }
}

function SubmissionConfirmation({ role, onClose }: { role: 'general' | 'golfer' | 'coach' | 'facility'; onClose: () => void }) {
  const copy = {
    general: ['Thanks for reaching out.', 'We have your details and will be in touch soon.'],
    golfer: ['You’re on the list.', 'We’ll let you know as soon as Fore is ready for your next round.'],
    coach: ['Profile reserved.', 'We’ll be in touch soon to help you get set up on Fore.'],
    facility: ['Let’s build together.', 'We’ll be in touch soon to talk about bringing your facility onto Fore.'],
  }[role];

  return (
    <div className="form-confirmation-overlay" role="presentation">
      <section className="form-confirmation" role="dialog" aria-modal="true" aria-labelledby="form-confirmation-title">
        <div className="early-member-success-icon">✓</div>
        <h2 id="form-confirmation-title">{copy[0]}</h2>
        <p>{copy[1]}</p>
        <button className="button dark" type="button" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}



function Home() {
  return (
    <>
      <section className="hero-bg">
        <img
          className="hero-background-image"
          src={heroImg.src}
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

            <div className="button-row hero-cta-row">
              <Link className="button acid" to="/facilities">
                For facilities <ArrowUpRight />
              </Link>
              <div className="hero-audience-ctas">
                <Link className="button hero-ghost" to="/golfers">
                  For golfers <ArrowUpRight />
                </Link>
                <Link className="button hero-ghost" to="/coaches">
                  For coaches <ArrowUpRight />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Ecosystem />
      <ProductTeaser />
      <FAQ />
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
              Built for golfers, coaches,
              <br />
              and facilities.
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
              <Link className="ecosystem-cta" to={a.href}>
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
        <h2>One place for <span>every part of golf.</span></h2>
        <p>
          One connected ecosystem for playing, coaching, and operating golf.
        </p>
      </div>
      <ProductDemo />
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: 'When does Fore actually launch?',
    answer: 'We\'re in early access now, onboarding a small group of golfers, coaches and facilities in Delhi NCR. Public booking opens in phases as we onboard more facilities — early sign-ups get first access.',
  },
  {
    question: 'Is it free to join?',
    answer: 'Yes. Joining as a golfer or coach during early access is free. Facilities get a walkthrough of pricing before agreeing to anything.',
  },
  {
    question: 'How are coaches and facilities vetted?',
    answer: 'Every coach profile is verified for qualifications and current affiliation before it goes live. Facilities are onboarded individually by our team, not self-served, during early access.',
  },
  {
    question: 'Which cities are next after Delhi NCR?',
    answer: 'We\'re focused on Delhi NCR first to get the experience right. Mumbai and Bangalore are next, based on waitlist demand — join early to help us prioritise your city.',
  },
  {
    question: 'What does partnering cost a facility or coach?',
    answer: 'There\'s no upfront cost to join. Facilities pay a small commission only on bookings made through Fore; coaches keep full pricing control and only pay for bookings sourced through the platform. Full terms shared before you commit.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq-section section">
      <div className="container faq-layout">
        <div className="faq-intro">
          <h2>Good Questions</h2>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.question}>
                <button
                  className="faq-question"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-plus" aria-hidden="true" />
                </button>
                <div className="faq-answer" id={answerId} hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
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
                <img src={itishImg.src} alt="Itish Arora" className="founder-photo-img" />
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
                <img src={savdeepImg.src} alt="Savdeep Kadian" className="founder-photo-img founder-photo-img--savdeep" />
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
            <h2 className="about-split-h2"><span>From India to the world.</span></h2>
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
            <p>You might be a golfer, a parent, a coach or a facility.</p>
            <p>You might simply be someone who loves the game.</p>
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

function Privacy() {
  return <><PageHero label="Legal" title="Privacy Policy" desc="How ForeSports handles information collected through this website." /><section className="section container legal">
    <p><strong>Last updated: September 21, 2026.</strong> This policy applies to the ForeSports website and waitlist forms.</p>
    <h2>Information we collect</h2><p>When you submit a form, we collect the details you provide, such as your name, email address, phone number, city, role, and facility name where applicable. We may also receive basic technical information automatically provided by your browser, such as IP address, device, and request logs.</p>
    <h2>How we use information</h2><p>We use submitted information to respond to enquiries, manage the Fore waitlist, communicate about the planned product, and operate and protect this website. We do not use the website for advertising or sell personal information.</p>
    <h2>Sharing and storage</h2><p>Information is stored using service providers that support the website and form submissions. We share information only when needed to operate those services, comply with law, or protect our rights and users. We retain it only for as long as reasonably needed for these purposes, unless a longer period is required by law.</p>
    <h2>Cookies</h2><p>This website does not currently use analytics, advertising, or tracking cookies. Essential browser storage or cookies may be used by services supporting form delivery or security. If this changes, this policy will be updated.</p>
    <h2>Your choices</h2><p>You may request access, correction, deletion, or to stop receiving marketing communications by contacting us. Some requests may be limited by applicable law or operational requirements.</p>
    <h2>Children and changes</h2><p>The website is not directed to children. We may update this policy as the website and product develop; the updated version will be posted here with a revised date.</p>
    <h2>Contact</h2><p>For privacy questions, contact <a href="mailto:hello@foresports.in">hello@foresports.in</a>.</p>
  </section></>;
}
function Terms() {
  return <><PageHero label="Legal" title="Terms of Service" desc="Terms governing your use of the ForeSports website." /><section className="section container legal">
    <p><strong>Last updated: September 21, 2026.</strong> These terms govern use of the ForeSports website.</p>
    <h2>Acceptance and use</h2><p>By using this website, you agree to these terms. You may use it for lawful, personal, and business-information purposes. Do not misuse the site, interfere with its operation, submit false information, or attempt to access systems or data without permission.</p>
    <h2>Website and product information</h2><p>The website describes ForeSports and a planned product. Features, availability, and product previews are directional and may change. Submitting a waitlist or enquiry form does not create a contract, account, partnership, or guarantee product access.</p>
    <h2>Intellectual property</h2><p>The ForeSports name, branding, website content, and design are owned by or licensed to ForeSports Private Limited. You may not copy, modify, distribute, or use them without prior written permission, except as permitted by law.</p>
    <h2>Third-party services and links</h2><p>Where the website uses third-party services to operate, their terms and policies may also apply. ForeSports is not responsible for third-party content or services outside its control.</p>
    <h2>Disclaimers and liability</h2><p>The website is provided on an “as is” and “as available” basis. To the extent permitted by applicable law, ForeSports disclaims warranties and is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the website.</p>
    <h2>Changes and contact</h2><p>We may update these terms by posting a revised version here. Questions can be sent to <a href="mailto:hello@foresports.in">hello@foresports.in</a>. These terms are governed by the laws of the National Capital Territory of Delhi, India, and disputes will be subject to its applicable courts.</p>
  </section></>;
}
function NotFound() { return <><PageHero label="404" title="Page not found." desc="The page you were looking for does not exist or may have moved." /><section className="section container legal"><Link className="button acid" to="/">Return to ForeSports <ArrowUpRight /></Link></section></>; }

type AudienceRole = 'golfer' | 'coach' | 'facility';

function AudienceSignupModal({ role, onClose }: { role: AudienceRole; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isFacility = role === 'facility';
  const details = {
    golfer: { label: 'Join as a golfer', title: 'Be one of the first.', button: 'Join Fore', source: 'golfer_join' as const },
    coach: { label: 'Join as a coach', title: 'Get on Fore early.', button: 'Reserve coach profile', source: 'coach_join' as const },
    facility: { label: 'Partner with Fore', title: 'Build with us.', button: 'Let’s build together', source: 'facility_join' as const },
  }[role];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await submitWaitlist({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        city: String(data.get('city') ?? ''),
        role,
        source: details.source,
        ...(isFacility ? { facility_name: String(data.get('facility') ?? '') } : {}),
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error(`${role} waitlist submission failed`, error);
      toast.error('We could not save your details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="early-member-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="early-member-modal" role="dialog" aria-modal="true" aria-labelledby="audience-signup-title">
        {submitted ? (
          <div className="early-member-success">
            <div className="early-member-success-icon">✓</div>
            <h2 id="audience-signup-title">{role === 'coach' ? 'Profile reserved.' : role === 'facility' ? 'Let’s build together.' : 'You’re on the list.'}</h2>
            <p>We’ll be in touch soon.</p>
            <button className="button dark" type="button" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="early-member-modal-header">
              <div>
                <SectionLabel>{details.label}</SectionLabel>
                <h2 id="audience-signup-title">{details.title}</h2>
              </div>
              <button className="early-member-close" type="button" onClick={onClose} aria-label="Close sign-up form"><X size={18} /></button>
            </div>
            <form className="early-member-form" onSubmit={submit}>
              {isFacility && <label>Facility name<input required name="facility" placeholder="Name of your golf facility" /></label>}
              <label>{isFacility ? 'Your name' : 'Name'}<input required name="name" placeholder={isFacility ? 'Contact name' : 'Your name'} /></label>
              <label>Email<input required type="email" name="email" placeholder={isFacility ? 'you@facility.com' : 'you@email.com'} /></label>
              <label>Phone<input name="phone" placeholder="+91" /></label>
              <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
              <button className="button acid" type="submit" disabled={submitting}>{submitting ? 'Saving...' : <>{details.button} <ArrowUpRight size={16} /></>}</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

// ─── Audience join forms ──────────────────────────────────────────

function GolferJoinForm() {
  const [confirmed, setConfirmed] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await submitWaitlist({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        city: String(data.get('city') ?? ''),
        role: 'golfer',
        source: 'golfer_join',
      });
      setConfirmed(true);
      form.reset();
    } catch (error) {
      console.error('Golfer waitlist submission failed', error);
      toast.error('We could not save your details. Please try again.');
    }
  };
  return (
    <>
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Join as a golfer</SectionLabel>
          <h2>Be one of the first.</h2>
          <p>Be among the first golfers to experience a more connected way to discover, play and improve. Wherever you are in your golfing journey, share your details and join the FORE community.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label>Name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@email.com" /></label>
            <label>Phone<input name="phone" placeholder="+91" /></label>
            <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
          </div>
          <button className="button acid" type="submit">
            Join Fore <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </section>
    {confirmed && <SubmissionConfirmation role="golfer" onClose={() => setConfirmed(false)} />}
    </>
  );
}

function CoachJoinForm() {
  const [confirmed, setConfirmed] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await submitWaitlist({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        city: String(data.get('city') ?? ''),
        role: 'coach',
        source: 'coach_join',
      });
      setConfirmed(true);
      form.reset();
    } catch (error) {
      console.error('Coach waitlist submission failed', error);
      toast.error('We could not save your details. Please try again.');
    }
  };
  return (
    <>
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Join as a coach</SectionLabel>
          <h2>Get on Fore early.</h2>
          <p>Be part of a global community shaping the future of golf coaching. Join FORE to connect with more golfers, strengthen your coaching business and help more players progress.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label>Name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@email.com" /></label>
            <label>Phone<input name="phone" placeholder="+91" /></label>
            <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
          </div>
          <button className="button acid" type="submit">
            Reserve coach profile <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </section>
    {confirmed && <SubmissionConfirmation role="coach" onClose={() => setConfirmed(false)} />}
    </>
  );
}

function FacilityJoinForm() {
  const [confirmed, setConfirmed] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await submitWaitlist({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: String(data.get('phone') ?? ''),
        city: String(data.get('city') ?? ''),
        role: 'facility',
        source: 'facility_join',
        facility_name: String(data.get('facility') ?? ''),
      });
      setConfirmed(true);
      form.reset();
    } catch (error) {
      console.error('Facility waitlist submission failed', error);
      toast.error('We could not save your details. Please try again.');
    }
  };
  return (
    <>
    <section id="join" className="form-section">
      <div className="container form-layout">
        <div>
          <SectionLabel>Partner with Fore</SectionLabel>
          <h2>Build with us.</h2>
          <p>We’re partnering with forward-thinking golf facilities across India and worldwide to shape a platform built around their needs. If you share our vision for a more connected future for golf, leave your details and let’s start the conversation.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-fields">
            <label className="full-width">Facility name<input required name="facility" placeholder="Name of your golf facility" /></label>
            <label>Your name<input required name="name" placeholder="Contact name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@facility.com" /></label>
            <label>Phone<input name="phone" placeholder="+91" /></label>
            <label>City<input required name="city" placeholder="Delhi, Gurugram…" /></label>
          </div>
          <button className="button acid" type="submit">
            Let’s build together <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    </section>
    {confirmed && <SubmissionConfirmation role="facility" onClose={() => setConfirmed(false)} />}
    </>
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
        <span className="mock-preview-badge">Concept preview</span>
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
              <span style={{ background: '#CFF1D2', color: '#0F3B27', borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>7.4 km</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>18 holes · New Delhi · 3 times available</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>From ₹2,500</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0F3B27' }}>View times →</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)', marginBottom: 10 }}>Coaches you may like</div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--acid)', color: '#0F3B27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>AM</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Arjun Mehta</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Short game · 4.9 ★ · 94 reviews</div>
            </div>
            <span style={{ background: '#CFF1D2', color: '#0F3B27', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>Available</span>
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
        <span className="mock-preview-badge">Concept preview</span>
      </div>
      <div className="mock-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--acid)', color: '#0F3B27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>AR</div>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>Arjun Rao</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>PGA Coach · 12 yrs · Delhi</div>
            <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 3 }}>★★★★★ 4.8 · 94 reviews</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {['Short game', 'Full swing', 'Juniors', 'TrackMan'].map((s) => (
            <span key={s} style={{ background: '#CFF1D2', color: '#0F3B27', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>{s}</span>
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
          <span style={{ background: '#0F3B27', color: '#fff', borderRadius: 999, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Book lesson</span>
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
        <span className="mock-preview-badge">Concept preview</span>
      </div>
      <div className="mock-body">
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--label)', marginBottom: 8 }}>Today's utilisation</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 44, letterSpacing: '-.04em', color: 'var(--ink)', lineHeight: 1 }}>72%</span>
            <span style={{ background: '#CFF1D2', color: '#0F3B27', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>+14% vs last week</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 72 }}>
          {barHeights.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, background: i === 3 ? '#0F3B27' : '#CFF1D2' }} />
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>11:00 · 8 open slots</span>
            <span style={{ background: 'var(--acid)', color: '#0F3B27', borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>Fore price ₹1,500</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Turn softer hours into bookable demand.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Audience page components ─────────────────────────────────────

function GolfersPage() {
  const [signupOpen, setSignupOpen] = useState(false);

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
              <button className="button acid" type="button" onClick={() => setSignupOpen(true)}>
                Join as a golfer <ArrowUpRight size={18} />
              </button>
              <a className="button light" href="#how">
                See how it works <ArrowUpRight size={18} />
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
      {signupOpen && <AudienceSignupModal role="golfer" onClose={() => setSignupOpen(false)} />}
    </>
  );
}

function CoachesPage() {
  const [signupOpen, setSignupOpen] = useState(false);

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
              <button className="button acid" type="button" onClick={() => setSignupOpen(true)}>
                Join as a coach <ArrowUpRight size={18} />
              </button>
              <a className="button light" href="#business">
                See how it works <ArrowUpRight size={18} />
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
              <div className="val-num">ONE</div>
              <h3>Diagnose</h3>
              <p>Capture lesson notes, swing feedback and what the student needs to work on next.</p>
            </div>
            <div className="val-card">
              <div className="val-num">TWO</div>
              <h3>Prescribe</h3>
              <p>Assign drills and practice with clear targets, frequency and duration.</p>
            </div>
            <div className="val-card">
              <div className="val-num">THREE</div>
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
      {signupOpen && <AudienceSignupModal role="coach" onClose={() => setSignupOpen(false)} />}
    </>
  );
}

function FacilitiesPage() {
  const [signupOpen, setSignupOpen] = useState(false);
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
              <button className="button acid" type="button" onClick={() => setSignupOpen(true)}>
                Partner with Fore <ArrowUpRight size={18} />
              </button>
              <a className="button light" href="#revenue">
                See how it works <ArrowUpRight size={18} />
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
              <div className="val-num">ONE</div>
              <h3>Reach more golfers.</h3>
              <p>Put available tee times, range buckets and simulator bays in front of golfers beyond your existing base.</p>
            </div>
            <div className="val-card">
              <div className="val-num">TWO</div>
              <h3>Fill more capacity.</h3>
              <p>Use demand-based pricing, last-minute offers and live utilisation data to fill softer inventory.</p>
            </div>
            <div className="val-card">
              <div className="val-num">THREE</div>
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
      {signupOpen && <AudienceSignupModal role="facility" onClose={() => setSignupOpen(false)} />}
    </>
  );
}

export default function App({ page }: { page: Page }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Layout page={page} />
      </motion.div>
    </AnimatePresence>
  );
}
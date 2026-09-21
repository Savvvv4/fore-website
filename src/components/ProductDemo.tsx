import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Role = 'golfer' | 'coach' | 'facility';
const ADV = 1400;

// ─── SVG icons ───────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  search: '<circle cx="10.2" cy="10.2" r="6.2"/><line x1="14.9" y1="14.9" x2="19.6" y2="19.6"/>',
  check: '<polyline points="5,13 10,18 19,7"/>',
  x: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor" stroke="none"/>',
  flag: '<line x1="5" y1="3" x2="5" y2="21"/><path d="M5 4h13l-3 4 3 4H5"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.3 19c0-3 2.6-5.2 5.7-5.2s5.7 2.2 5.7 5.2"/><circle cx="17.3" cy="9" r="2.3"/><path d="M15.7 14c2.6.3 4.6 2.2 5 4.7"/>',
  shield: '<path d="M12 3.4l6.8 2.5v5.2c0 4.9-2.9 7.9-6.8 8.9-3.9-1-6.8-4-6.8-8.9V5.9z"/><polyline points="9,12 11,14 15.2,9.4"/>',
  trend: '<polyline points="4,17 9,10.5 13,13.3 20,5.3"/><polyline points="14.3,5.3 20,5.3 20,11"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8.5" y1="3.2" x2="8.5" y2="7"/><line x1="15.5" y1="3.2" x2="15.5" y2="7"/>',
  wallet: '<path d="M4.5 7.2h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><path d="M4.5 7.2 15 4.6a1.6 1.6 0 0 1 2 1.5v1.1"/><circle cx="16.3" cy="13.5" r="1.1" fill="currentColor" stroke="none"/>',
  chart: '<line x1="5" y1="20" x2="5" y2="10"/><line x1="12" y1="20" x2="12" y2="5.5"/><line x1="19" y1="20" x2="19" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>',
  gift: '<rect x="4" y="9.5" width="16" height="10.5" rx="1.5"/><line x1="4" y1="13.4" x2="20" y2="13.4"/><line x1="12" y1="9.5" x2="12" y2="20"/><path d="M12 9.5C9.8 9.5 8.2 8 9 6.3c.6-1.3 2.3-1 3 .3.7-1.3 2.4-1.6 3-.3.8 1.7-.8 3.2-3 3.2z"/>',
  history: '<circle cx="12" cy="12" r="8.4"/><polyline points="12,7.6 12,12.2 15,13.8"/><path d="M4 5.2v4h4"/>',
  cart: '<circle cx="9.5" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/><path d="M3.5 4.5h2.6l2.1 11h9.6l1.9-7.6H7"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><polyline points="4,6.5 12,13 20,6.5"/>',
  chevronLeft: '<polyline points="15.5,5 8.5,12 15.5,19"/>',
  chevronRight: '<polyline points="8.5,5 15.5,12 8.5,19"/>',
};
function Ico({ name }: { name: string }) {
  return (
    <svg className="ft-ico" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />
  );
}

// ─── Shared micro-components ──────────────────────────────────────

function ConfirmScreen({ title, body, declined }: { title: string; body: string; declined?: boolean }) {
  return (
    <div className={`ft-confirm ft-fadein${declined ? ' ft-declined' : ''}`}>
      <div className="ft-check">
        <Ico name={declined ? 'x' : 'check'} />
      </div>
      <h3 className="ft-serif">{title}</h3>
      <p>{body}</p>
    </div>
  );
}

const PHONE_GUIDES: Record<string, string> = {
  Discover: 'Select a course',
  Rounds: 'Pick a tee time',
  Coaches: 'Choose a coach',
  Lessons: 'Choose a lesson plan',
  Range: 'Book your range session',
  Gear: 'Get fitting and equipment',
  More: 'Click a card to learn more',
  'Your profile': 'Set your profile',
  Availability: 'Open a time slot',
  'Lesson requests': 'Respond to a request',
  Students: 'Click a card to learn more',
  Payments: 'Review your earnings',
  'Green-fee desk': 'Select a golfer',
  'Coach schedules': 'Manage coaching schedules',
  Operations: 'Click a card to learn more',
  Growth: 'Click a card to learn more',
};

const DemoBackContext = createContext<(() => void) | null>(null);

function Phone({ header, guide, children, onContinue, continueLabel = 'Continue' }: { header: string; guide?: string; children: ReactNode; onContinue?: () => void; continueLabel?: string }) {
  const onBack = useContext(DemoBackContext);

  return (
    <div className="ft-phone">
      <div className="ft-phoneHeader">
        {onBack && (
          <button className="ft-phoneBack" type="button" onClick={onBack} aria-label="Back to previous step">
            <Ico name="chevronLeft" />
          </button>
        )}
        <div className="ft-phone-guide">{guide ?? PHONE_GUIDES[header] ?? header}</div>
      </div>
      <div className="ft-phone-body">{children}</div>
      {onContinue && (
        <div className="ft-phone-footer">
          <button className="ft-btn ft-primary ft-block" type="button" onClick={onContinue}>
            {continueLabel} <Ico name="chevronRight" />
          </button>
        </div>
      )}
    </div>
  );
}

function Narr({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ft-narr">
      <div className="ft-eyebrow">{label}</div>
      {children}
    </div>
  );
}

function inr(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function SaveBtn({ label, onSave }: { label: string; onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      className="ft-btn ft-primary ft-block"
      disabled={saved}
      onClick={() => {
        setSaved(true);
        onSave();
      }}
    >
      {saved ? 'Saved ✓' : label}
    </button>
  );
}

// ─── Golfer Step 1: Discover ──────────────────────────────────────

function GolferStep1({
  onCourseSelect,
  advance,
}: {
  onCourseSelect: (c: { name: string; price: number }) => void;
  advance: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const courses = [
    { key: 'dgc', name: 'Delhi Golf Club', meta: '4.2 km · 4.7★', price: 2900, cls: '' },
    { key: 'qgc', name: 'Qutub Golf Course', meta: '6.8 km · 4.4★', price: 1800, cls: 'b' },
    { key: 'dlf', name: 'DLF Golf & Country Club', meta: '9.1 km · 4.8★', price: 4200, cls: 'c' },
    { key: 'cgc', name: 'Classic Golf & Country Club', meta: '12.6 km · 4.9★', price: 6500, cls: 'd' },
  ];
  return (
    <section className="ft-step ft-active">
      <Narr label="Discover">
        <h2 className="ft-serif">Find your next round.</h2>
        <p>See nearby courses, live tee times and prices in one place.</p>
      </Narr>
      <Phone header="Discover">
        <div className="ft-search">
          <Ico name="search" />Find a course or coach
        </div>
        {courses.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`ft-course${selected === c.key ? ' ft-selected' : ''}`}
            onClick={() => {
              setSelected(c.key);
              onCourseSelect({ name: c.name, price: c.price });
              advance();
            }}
          >
            <div className={`ft-course-img${c.cls ? ' ' + c.cls : ''}`}>
              <div className="ft-course-check"><Ico name="check" /></div>
            </div>
            <div className="ft-course-body">
              <div>
                <div className="ft-cname">{c.name}</div>
                <div className="ft-cmeta">{c.meta}</div>
              </div>
              <div className="ft-cprice">{inr(c.price)}</div>
            </div>
          </button>
        ))}
      </Phone>
    </section>
  );
}

// ─── Golfer Step 2: Book a round ─────────────────────────────────

function GolferStep2({ course, advance }: { course: { name: string; price: number }; advance: () => void }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [caddy, setCaddy] = useState(true);
  const [cart, setCart] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const CADDY = 650, CART = 800;
  const total = course.price + (caddy ? CADDY : 0) + (cart ? CART : 0);

  return (
    <section className="ft-step ft-active">
      <Narr label="Rounds">
        <h2 className="ft-serif">Book your round in a few taps.</h2>
        <p>Pick a time and add what you need. The rest is sorted.</p>
      </Narr>
      <Phone header="Rounds">
        {confirmed ? (
          <ConfirmScreen title="You're booked" body="You can reschedule up to 24 hours before your tee time." />
        ) : (
          <>
            <div className="ft-chiplabel">{course.name} · 6 tee times today</div>
            <div className="ft-chips ft-grid3">
              {['6:40 AM', '7:20 AM', '8:10 AM', '9:00 AM', '9:40 AM', '10:20 AM'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ft-chip${slot === t ? ' ft-selected' : ''}`}
                  onClick={() => setSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {slot && (
              <div className="ft-fadein">
                <div className="ft-row">
                  <div className="ft-rchip"><Ico name="flag" /></div>
                  <div><strong>Caddy</strong><small>Ravi Kumar · assigned for you</small></div>
                  <div className="ft-row-side">
                    <div
                      className={`ft-tswitch${caddy ? ' ft-on' : ''}`}
                      data-price={CADDY}
                      onClick={() => setCaddy(!caddy)}
                    ><i /></div>
                  </div>
                </div>
                <div className="ft-row">
                  <div className="ft-rchip"><Ico name="shield" /></div>
                  <div><strong>Cart</strong><small>Ready for your round</small></div>
                  <div className="ft-row-side">
                    <div
                      className={`ft-tswitch${cart ? ' ft-on' : ''}`}
                      data-price={CART}
                      onClick={() => setCart(!cart)}
                    ><i /></div>
                  </div>
                </div>
                <div className="ft-divider" />
                <div className="ft-totalRow"><span>Total</span><b className="ft-serif">{inr(total)}</b></div>
                <button
                  className="ft-btn ft-primary ft-block"
                  onClick={() => {
                    setConfirmed(true);
                    advance();
                  }}
                >
                  Confirm &amp; pay
                </button>
              </div>
            )}
          </>
        )}
      </Phone>
    </section>
  );
}

// ─── Golfer Step 3: Coaches ───────────────────────────────────────

const COACHES: Record<string, { n: string; i: string; price: number; trial: number; r: string; rev: number; slots: string[] }> = {
  meera: { n: 'Meera Shah', i: 'MS', price: 1800, trial: 800, r: '4.9', rev: 112, slots: ['Tue 5:30 PM', 'Wed 7:00 AM'] },
  arjun: { n: 'Arjun Mehta', i: 'AM', price: 2200, trial: 900, r: '4.8', rev: 86, slots: ['Thu 6:15 PM', 'Sat 8:00 AM'] },
  kabir: { n: 'Kabir Singh', i: 'KS', price: 1500, trial: 700, r: '4.7', rev: 54, slots: ['Mon 4:00 PM', 'Fri 6:30 AM'] },
};

function GolferStep3({
  onCoachSelect,
  advance,
}: {
  onCoachSelect: (key: string) => void;
  advance: () => void;
}) {
  const [openCoach, setOpenCoach] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({
    meera: 'Tue 5:30 PM',
    arjun: 'Thu 6:15 PM',
    kabir: 'Mon 4:00 PM',
  });
  const [confirmed, setConfirmed] = useState<{ name: string; slot: string } | null>(null);

  if (confirmed) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Coaches">
          <h2 className="ft-serif">Find a coach who fits your game.</h2>
          <p>Try a first lesson before you commit to a full package.</p>
        </Narr>
        <Phone header="Coaches">
          <ConfirmScreen title="First lesson booked" body={`${confirmed.name} · ${confirmed.slot}`} />
        </Phone>
      </section>
    );
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Coaches">
        <h2 className="ft-serif">Find a coach who fits your game.</h2>
        <p>Try a first lesson before you commit to a full package.</p>
      </Narr>
      <Phone header="Coaches">
        {Object.entries(COACHES).map(([key, c]) => (
          <div key={key} className={`ft-coach${openCoach === key ? ' ft-open' : ''}`}>
            <button
              type="button"
              className="ft-coachhead"
              onClick={() => setOpenCoach(openCoach === key ? null : key)}
            >
              <div className="ft-coachface">{c.i}</div>
              <div>
                <b>{c.n}</b>
                <small>Category A · {c.r} ★ ({c.rev})</small>
              </div>
              <div className="ft-cright">
                <b>{inr(c.price)}</b>
                <small>/ lesson</small>
              </div>
            </button>
            <div className="ft-coach-detail">
              <div className="ft-coach-detail-in">
                <div className="ft-chiplabel">Trial lesson · {inr(c.trial)}</div>
                <div className="ft-chips ft-grid2">
                  {c.slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`ft-chip${selectedSlots[key] === s ? ' ft-selected' : ''}`}
                      onClick={() => setSelectedSlots({ ...selectedSlots, [key]: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="ft-btn ft-accent ft-block"
                  onClick={() => {
                    onCoachSelect(key);
                    setConfirmed({ name: c.n, slot: selectedSlots[key] });
                    advance();
                  }}
                >
                  Try this coach · {inr(c.trial)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Phone>
    </section>
  );
}

// ─── Golfer Step 4: Packages ──────────────────────────────────────

function GolferStep4({ coachKey, advance }: { coachKey: string; advance: () => void }) {
  const c = COACHES[coachKey] || COACHES.meera;
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  type Pkg = { name: string; total: number; list: number; badge?: boolean };
  const pkgs: Pkg[] = [
    { name: '1 lesson', total: c.price, list: c.price },
    { name: '5 lessons', total: c.price * 5 * 0.9, list: c.price * 5, badge: true },
    { name: '10 lessons', total: c.price * 10 * 0.8, list: c.price * 10 },
  ];

  if (confirmed) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Lessons">
          <h2 className="ft-serif">Make progress with a plan.</h2>
          <p>Stay with the coach you like and save on a lesson package.</p>
        </Narr>
        <Phone header="Lessons">
          <ConfirmScreen title="Package booked" body={`Your sessions with ${c.n} are ready to book.`} />
        </Phone>
      </section>
    );
  }

  const selPkg = pkgs.find((p) => p.name === selected);

  return (
    <section className="ft-step ft-active">
      <Narr label="Lessons">
        <h2 className="ft-serif">Make progress with a plan.</h2>
        <p>Stay with the coach you like and save on a lesson package.</p>
      </Narr>
      <Phone header="Lessons">
        <div className="ft-chiplabel">{c.n}</div>
        <div className="ft-optionGrid ft-stack">
          {pkgs.map((p) => {
            const save = p.list - p.total;
            return (
              <button
                key={p.name}
                type="button"
                className={`ft-option${selected === p.name ? ' ft-active' : ''}`}
                onClick={() => setSelected(p.name)}
              >
                <b>
                  {p.name}
                  {p.badge && <i className="ft-badge">Most booked</i>}
                </b>
                <span>
                  {inr(p.total)}
                  {save > 0 ? ` · save ${Math.round((1 - p.total / p.list) * 100)}%` : ''}
                </span>
              </button>
            );
          })}
        </div>
        {selPkg && (
          <div className="ft-fadein">
            {selPkg.list - selPkg.total > 0 && (
              <div className="ft-callout">
                <span>You save</span>
                <b>{inr(selPkg.list - selPkg.total)}</b>
              </div>
            )}
            <div className="ft-totalRow">
              <span>Total</span>
              <b className="ft-serif">{inr(selPkg.total)}</b>
            </div>
            <button
              className="ft-btn ft-primary ft-block"
              onClick={() => {
                setConfirmed(true);
                advance();
              }}
            >
              Book package
            </button>
          </div>
        )}
      </Phone>
    </section>
  );
}

// ─── Golfer Step 5: Range ─────────────────────────────────────────

function GolferStep5({ advance }: { advance: () => void }) {
  const [balls, setBalls] = useState<'50' | '100' | null>(null);
  const [club, setClub] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const total = 300 + (balls === '50' ? 150 : balls === '100' ? 300 : 0) + (club ? 200 : 0);

  if (confirmed) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Range">
          <h2 className="ft-serif">Practice when you have the time.</h2>
          <p>Pay for your range session, add balls or a club, and get on with your practice.</p>
        </Narr>
        <Phone header="Range">
          <ConfirmScreen title="Range session booked" body={`ZEN GOLF Range · ${inr(total)}`} />
        </Phone>
      </section>
    );
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Range">
        <h2 className="ft-serif">Practice when you have the time.</h2>
        <p>Pay for your range session, add balls or a club, and get on with your practice.</p>
      </Narr>
      <Phone header="Range">
        <div className="ft-chiplabel">ZEN GOLF Range &amp; Academy</div>
        <div className="ft-optionGrid">
          <div className="ft-option ft-active ft-locked" data-price="300">
            <b>Range entry</b>
            <span>{inr(300)} · required</span>
          </div>
          <button
            type="button"
            className={`ft-option${balls === '50' ? ' ft-active' : ''}`}
            onClick={() => setBalls(balls === '50' ? null : '50')}
          >
            <b>50 balls</b>
            <span>{inr(150)}</span>
          </button>
          <button
            type="button"
            className={`ft-option${balls === '100' ? ' ft-active' : ''}`}
            onClick={() => setBalls(balls === '100' ? null : '100')}
          >
            <b>100 balls</b>
            <span>{inr(300)}</span>
          </button>
          <button
            type="button"
            className={`ft-option${club ? ' ft-active' : ''}`}
            onClick={() => setClub(!club)}
          >
            <b>Rental club</b>
            <span>{inr(200)}</span>
          </button>
        </div>
        <div className="ft-divider" />
        <div className="ft-totalRow">
          <span>Total</span>
          <b className="ft-serif">{inr(total)}</b>
        </div>
        <button
          className="ft-btn ft-primary ft-block"
          onClick={() => {
            setConfirmed(true);
            advance();
          }}
        >
          Book &amp; pay
        </button>
      </Phone>
    </section>
  );
}

// ─── Golfer Step 6: Gear ──────────────────────────────────────────

function GolferStep6({ advance }: { advance: () => void }) {
  const equipment = [
    { name: 'TaylorMade Qi4D', price: '₹59,900' },
    { name: 'Callaway Quantum Max', price: '₹54,900' },
    { name: 'Titleist GTS2', price: '₹62,900' },
    { name: 'Pro V1x Left Dash', price: '₹5,500' },
  ];
  const [selEquip, setSelEquip] = useState(0);
  const [fittingBooked, setFittingBooked] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const done = fittingBooked && ordered;

  return (
    <section className="ft-step ft-active">
      <Narr label="Gear">
        <h2 className="ft-serif">Find the right gear, then buy it.</h2>
        <p>Book a fitting, or order straight from partner shops.</p>
      </Narr>
      <Phone header="Gear">
        {done ? (
          <ConfirmScreen title="All done" body="Fitting booked and order placed." />
        ) : (
          <>
            <div className="ft-fitCard">
              <div>
                <b>Club fitting</b>
                <small>Sat · 11:00 AM · 60 min</small>
              </div>
              <button
                type="button"
                className="ft-btn ft-accent ft-sm"
                disabled={fittingBooked}
                onClick={() => {
                  setFittingBooked(true);
                  if (ordered) advance();
                }}
              >
                {fittingBooked ? 'Booked ✓' : 'Book'}
              </button>
            </div>
            <div className="ft-chiplabel">Available gear</div>
            <div className="ft-equipmentList">
              {equipment.map((e, i) => (
                <button
                  key={e.name}
                  type="button"
                  className={`ft-equipmentItem${selEquip === i ? ' ft-active' : ''}`}
                  onClick={() => setSelEquip(i)}
                >
                  <span>{e.name}</span>
                  <strong>{e.price}</strong>
                </button>
              ))}
            </div>
            <div className="ft-orderRow">
              <span>{equipment[selEquip].name} · {equipment[selEquip].price}</span>
              <button
                type="button"
                className="ft-btn ft-accent ft-sm"
                disabled={ordered}
                onClick={() => {
                  setOrdered(true);
                  if (fittingBooked) advance();
                }}
              >
                {ordered ? 'Ordered ✓' : 'Order'}
              </button>
            </div>
          </>
        )}
      </Phone>
    </section>
  );
}

// ─── Golfer Step 7: More ──────────────────────────────────────────

function MCard({ icon, title, small, reveal, open, onToggle }: { icon: string; title: string; small: string; reveal: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`ft-mcard${open ? ' ft-open' : ''}`}
      onClick={onToggle}
    >
      <span className="ft-mico"><Ico name={icon} /></span>
      <span>
        <b>{title}</b>
        <small>{small}</small>
        <span className="ft-reveal">{reveal}</span>
      </span>
      <span className="ft-mplus" />
    </button>
  );
}

function GolferStep7({ advance }: { advance: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen(prev => prev === key ? null : key);
  return (
    <section className="ft-step ft-active">
      <Narr label="More">
        <h2 className="ft-serif">Everything else, in one place.</h2>
        <p>Keep your membership, rewards, golf history and payments together.</p>
      </Narr>
      <Phone header="More" onContinue={advance} continueLabel="End tour">
        <MCard icon="shield" title="Membership" small="Your member rate is applied automatically." reveal="Your member rate is ready when you book. Join, renew or pause whenever it suits you." open={open === 'membership'} onToggle={() => toggle('membership')} />
        <MCard icon="gift" title="Loyalty" small="Turn your bookings into rewards." reveal="You have 1,240 points ready to use. That's ₹500 toward your next round." open={open === 'loyalty'} onToggle={() => toggle('loyalty')} />
        <MCard icon="history" title="Golf record" small="Keep every round and score in one place." reveal="Your handicap moved from 16.8 to 14.2 in three months. Your progress is easy to see." open={open === 'record'} onToggle={() => toggle('record')} />
        <MCard icon="wallet" title="Payments" small="Keep every payment and receipt together." reveal="Rounds, lessons and purchases are all saved here, so every receipt is easy to find." open={open === 'payments'} onToggle={() => toggle('payments')} />
      </Phone>
    </section>
  );
}

// ─── Coach Step 1: Profile ────────────────────────────────────────

function CoachStep1({
  coachPrice,
  onPriceChange,
  advance,
}: {
  coachPrice: number;
  onPriceChange: (p: number) => void;
  advance: () => void;
}) {
  const [specialties, setSpecialties] = useState(new Set(['Full swing']));
  const prices = [1500, 1800, 2200];

  function toggleSpec(s: string) {
    const next = new Set(specialties);
    next.has(s) ? next.delete(s) : next.add(s);
    setSpecialties(next);
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Profile">
        <h2 className="ft-serif">Help the right students find you.</h2>
        <p>Show your experience, specialties and pricing before a golfer books.</p>
      </Narr>
      <Phone header="Your profile">
        <div className="ft-row">
          <div className="ft-coachface">MS</div>
          <div>
            <strong>Meera Shah</strong>
            <small>Delhi Golf Club · Category A · 4.9 ★ (112)</small>
          </div>
        </div>
        <div className="ft-chiplabel" style={{ marginTop: 8 }}>Specialties</div>
        <div className="ft-chips">
          {['Full swing', 'Course strategy', 'Beginners'].map((s) => (
            <button
              key={s}
              type="button"
              className={`ft-chip${specialties.has(s) ? ' ft-selected' : ''}`}
              onClick={() => toggleSpec(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ft-chiplabel">Lesson price</div>
        <div className="ft-chips">
          {prices.map((p) => (
            <button
              key={p}
              type="button"
              className={`ft-chip${coachPrice === p ? ' ft-selected' : ''}`}
              onClick={() => onPriceChange(p)}
            >
              {inr(p)}
            </button>
          ))}
        </div>
        <div className="ft-chiplabel">Packages</div>
        <div className="ft-optionGrid">
          <div className="ft-option">
            <b>5 lessons</b>
            <span>{inr(coachPrice * 5 * 0.9)} · 10% off</span>
          </div>
          <div className="ft-option">
            <b>10 lessons</b>
            <span>{inr(coachPrice * 10 * 0.8)} · 20% off</span>
          </div>
        </div>
        <SaveBtn label="Save profile" onSave={advance} />
      </Phone>
    </section>
  );
}

// ─── Coach Step 2: Availability ───────────────────────────────────

const LESSONS_DATA: Record<string, { name: string; club: string }> = {
  '18-9': { name: 'Priya Nair', club: 'Delhi Golf Club' },
  '19-8': { name: 'Aditya Nair', club: 'Delhi Golf Club' },
  '19-10': { name: 'Rohit Jain', club: 'Qutub Golf Course' },
  '20-9': { name: 'Priya Nair', club: 'Delhi Golf Club' },
};
const HOURS = [8, 9, 10, 11];
function fmt(h: number) {
  return (h > 12 ? h - 12 : h) + ':00 ' + (h >= 12 ? 'PM' : 'AM');
}

function CoachStep2({ advance }: { advance: () => void }) {
  const [dayOffset, setDayOffset] = useState(0);
  const [openSlots, setOpenSlots] = useState(new Set(['19-9']));

  function toggleSlot(key: string) {
    const next = new Set(openSlots);
    next.has(key) ? next.delete(key) : next.add(key);
    setOpenSlots(next);
  }

  const day = 19 + dayOffset;
  const past = dayOffset === -1;
  const dayLabel = ['Yesterday', 'Today', 'Tomorrow'][dayOffset + 1];

  return (
    <section className="ft-step ft-active">
      <Narr label="Availability">
        <h2 className="ft-serif">Set your availability around your day.</h2>
        <p>Only the times you open are bookable, so your calendar stays under control.</p>
      </Narr>
      <Phone header="Availability">
        <div className="ft-dayNav">
          <button
            type="button"
            disabled={past}
            onClick={() => setDayOffset(Math.max(-1, dayOffset - 1))}
          >
            ‹
          </button>
          <strong>{dayLabel}</strong>
          <button
            type="button"
            disabled={dayOffset === 1}
            onClick={() => setDayOffset(Math.min(1, dayOffset + 1))}
          >
            ›
          </button>
        </div>
        <div className="ft-slotList">
          {HOURS.map((h) => {
            const key = `${day}-${h}`;
            const lesson = LESSONS_DATA[key];
            const open = openSlots.has(key);
            if (lesson) {
              return (
                <div key={h} className={`ft-slotRow ft-lesson${past ? ' ft-dim' : ''}`}>
                  <span className="ft-timeLabel">{fmt(h)}</span>
                  <span className="ft-slotMain">
                    <b>{lesson.name}</b>
                    <small>{lesson.club}</small>
                  </span>
                  <span className="ft-pill">Confirmed</span>
                </div>
              );
            }
            return (
              <button
                key={h}
                type="button"
                className={`ft-slotRow${open ? ' ft-on' : ''}${past ? ' ft-dim' : ''}`}
                disabled={past}
                onClick={() => toggleSlot(key)}
              >
                <span className="ft-timeLabel">{fmt(h)}</span>
                <span className="ft-slotMain">
                  <b>{open ? 'Available' : 'Unavailable'}</b>
                </span>
                <span className={`ft-tswitch${open ? ' ft-on' : ''}`}><i /></span>
              </button>
            );
          })}
        </div>
        <SaveBtn label="Save changes" onSave={advance} />
      </Phone>
    </section>
  );
}

// ─── Coach Step 3: Lesson requests ───────────────────────────────

function CoachStep3({ coachPrice, advance }: { coachPrice: number; advance: () => void }) {
  const [result, setResult] = useState<boolean | null>(null);

  if (result !== null) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Lesson requests">
          <h2 className="ft-serif">Handle lesson requests in a few taps.</h2>
          <p>See the golfer, time and lesson details before you respond.</p>
        </Narr>
        <Phone header="Lesson requests">
          {result ? (
            <ConfirmScreen
              title="Lesson accepted"
              body={`Vikram Rao · Today, 5:30 PM. Payout ${inr(coachPrice)}.`}
            />
          ) : (
            <ConfirmScreen title="Request declined" body="Vikram Rao has been notified." declined />
          )}
        </Phone>
      </section>
    );
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Lesson requests">
        <h2 className="ft-serif">Handle lesson requests in a few taps.</h2>
        <p>See the golfer, time and lesson details before you respond.</p>
      </Narr>
      <Phone header="Lesson requests">
        <div className="ft-reqCard">
          <span className="ft-tag">Pending</span>
          <b>Vikram Rao · Lesson</b>
          <small>Today · 5:30 PM · Delhi Golf Club · {inr(coachPrice)}</small>
          <div className="ft-reqActions">
            <button type="button" className="ft-btn ft-sm" onClick={() => { setResult(false); advance(); }}>Decline</button>
            <button type="button" className="ft-btn ft-sm ft-accent" onClick={() => { setResult(true); advance(); }}>Accept</button>
          </div>
        </div>
      </Phone>
    </section>
  );
}

// ─── Coach Step 4: Students ───────────────────────────────────────

function CoachStep4({ advance }: { advance: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen(prev => prev === key ? null : key);
  return (
    <section className="ft-step ft-active">
      <Narr label="Students">
        <h2 className="ft-serif">Keep every student close.</h2>
        <p>See who needs attention and walk into every lesson prepared.</p>
      </Narr>
      <Phone header="Students" onContinue={advance} continueLabel="Continue to payments">
        <MCard icon="users" title="Roster" small="See your active students and upcoming lessons." reveal="18 active students and 3 lessons booked this week. Your schedule and income stay together." open={open === 'roster'} onToggle={() => toggle('roster')} />
        <MCard icon="history" title="History" small="Know where each student left off." reveal="Vikram Rao has 12 lessons logged, with his wedge notes ready before the next lesson." open={open === 'history'} onToggle={() => toggle('history')} />
        <MCard icon="target" title="Feedback" small="Keep practice focused between lessons." reveal="Assign a drill in seconds, such as driver dispersion three times a week, so students know exactly what to practise." open={open === 'feedback'} onToggle={() => toggle('feedback')} />
        <MCard icon="trend" title="Progress" small="See the progress your coaching creates." reveal="Vikram Rao's handicap moved from 16.8 to 14.2. Progress like this makes the value of continued coaching easy to see." open={open === 'progress'} onToggle={() => toggle('progress')} />
      </Phone>
    </section>
  );
}

// ─── Coach Step 5: Payments ───────────────────────────────────────

function CoachStep5({ coachPrice }: { coachPrice: number }) {
  const [period, setPeriod] = useState<'month' | 'last'>('month');

  const PERIODS = {
    month: { les: 76, f: 0.95, d: '↑ 12% vs last month' },
    last: { les: 68, f: 0.93, d: '↑ 4% vs prior month' },
  };
  const p = PERIODS[period];
  const rev = p.les * coachPrice * p.f;

  return (
    <section className="ft-step ft-active">
      <Narr label="Payments">
        <h2 className="ft-serif">Keep your earnings clear.</h2>
        <p>See lessons, packages and payouts together, so you always know what you've earned.</p>
      </Narr>
      <Phone header="Payments">
        <div className="ft-miniTabs">
          {(['month', 'last'] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`ft-miniChip${period === k ? ' ft-on' : ''}`}
              onClick={() => setPeriod(k)}
            >
              {k === 'month' ? 'This month' : 'Last month'}
            </button>
          ))}
        </div>
        <div className="ft-grid2">
          <div className="ft-metric">
            <small>Revenue</small>
            <strong>{inr(rev)}</strong>
            <span className="ft-up">{p.d}</span>
          </div>
          <div className="ft-metric">
            <small>Lessons</small>
            <strong>{p.les}</strong>
            <span>avg {inr(rev / p.les)}</span>
          </div>
        </div>
        <div className="ft-chiplabel">Recent</div>
        <div className="ft-row">
          <div className="ft-rchip"><Ico name="wallet" /></div>
          <div><strong>Vikram Rao</strong><small>Lesson · Thu</small></div>
          <div className="ft-row-side"><b>{inr(coachPrice)}</b></div>
        </div>
        <div className="ft-row">
          <div className="ft-rchip"><Ico name="wallet" /></div>
          <div><strong>Priya Nair</strong><small>5-lesson pack · Wed</small></div>
          <div className="ft-row-side"><b>{inr(coachPrice * 5 * 0.9)}</b></div>
        </div>
      </Phone>
    </section>
  );
}

// ─── Facility Step 1: Green-fee desk ─────────────────────────────

function FacilityStep1({ advance }: { advance: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [caddy, setCaddy] = useState(true);
  const [cart, setCart] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const CADDY = 650, CART = 800, BASE = 2900;
  const total = BASE + (caddy ? CADDY : 0) + (cart ? CART : 0);

  const golfers = [
    { name: 'Sameer Kohli', meta: 'First visit' },
  ];

  if (confirmed) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Green-fee desk">
          <h2 className="ft-serif">Check golfers in without the queue.</h2>
          <p>Check golfers in faster and keep the first tee moving.</p>
        </Narr>
        <Phone header="Green-fee desk">
          <ConfirmScreen title="Payment complete" body="Receipt sent to the golfer." />
        </Phone>
      </section>
    );
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Green-fee desk">
        <h2 className="ft-serif">Check golfers in without the queue.</h2>
        <p>Check golfers in faster and keep the first tee moving.</p>
      </Narr>
      <Phone header="Green-fee desk">
        <div className="ft-chiplabel">Golfers in queue</div>
        {golfers.map((g) => (
          <div
            key={g.name}
            className={`ft-row ft-rowclick${picked === g.name ? ' ft-selected' : ''}`}
            onClick={() => {
              if (picked === g.name) { setPicked(null); setSlot(null); return; }
              setPicked(g.name);
              setSlot(null);
            }}
          >
            <div className="ft-rchip"><Ico name="users" /></div>
            <div><strong>{g.name}</strong><small>{g.meta}</small></div>
          </div>
        ))}
        {picked && (
          <div className="ft-fadein">
            <div className="ft-chiplabel" style={{ marginTop: 12 }}>Choose a tee time</div>
            <div className="ft-chips ft-grid3">
              {['10:20 AM', '11:00 AM', '11:40 AM'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ft-chip${slot === t ? ' ft-selected' : ''}`}
                  onClick={() => setSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {slot && (
              <div className="ft-fadein">
                <div className="ft-row">
                  <div className="ft-rchip"><Ico name="flag" /></div>
                  <div><strong>Caddy</strong><small>{inr(CADDY)}</small></div>
                  <div className="ft-row-side">
                    <div className={`ft-tswitch${caddy ? ' ft-on' : ''}`} onClick={() => setCaddy(!caddy)}><i /></div>
                  </div>
                </div>
                <div className="ft-row">
                  <div className="ft-rchip"><Ico name="shield" /></div>
                  <div><strong>Cart</strong><small>{inr(CART)}</small></div>
                  <div className="ft-row-side">
                    <div className={`ft-tswitch${cart ? ' ft-on' : ''}`} onClick={() => setCart(!cart)}><i /></div>
                  </div>
                </div>
                <div className="ft-divider" />
                <div className="ft-totalRow"><span>Total</span><b className="ft-serif">{inr(total)}</b></div>
                <button className="ft-btn ft-primary ft-block" onClick={() => { setConfirmed(true); advance(); }}>
                  Complete payment
                </button>
              </div>
            )}
          </div>
        )}
      </Phone>
    </section>
  );
}

// ─── Facility Step 2: Range desk ─────────────────────────────────

function FacilityStep2({ advance }: { advance: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [balls, setBalls] = useState<'50' | '100' | null>(null);
  const [club, setClub] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const total = 300 + (balls === '50' ? 150 : balls === '100' ? 300 : 0) + (club ? 200 : 0);

  const customers = [
    { name: 'Rohit Verma', meta: 'Range pass holder' },
    { name: 'Ananya Iyer', meta: 'Walk-in' },
  ];

  if (confirmed) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Range">
          <h2 className="ft-serif">Keep range check-in moving.</h2>
          <p>A simple check-in means less waiting and more time on the range.</p>
        </Narr>
        <Phone header="Range">
          <ConfirmScreen title="Payment complete" body="Receipt sent to the golfer." />
        </Phone>
      </section>
    );
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Range">
        <h2 className="ft-serif">Keep range check-in moving.</h2>
        <p>A simple check-in means less waiting and more time on the range.</p>
      </Narr>
      <Phone header="Range" guide={picked ? 'Choose items' : 'Select the golfer'}>
        <div className="ft-chiplabel">Customer</div>
        {customers.map((c) => (
          <div
            key={c.name}
            className={`ft-row ft-rowclick${picked === c.name ? ' ft-selected' : ''}`}
            onClick={() => setPicked(picked === c.name ? null : c.name)}
          >
            <div className="ft-rchip"><Ico name="users" /></div>
            <div><strong>{c.name}</strong><small>{c.meta}</small></div>
          </div>
        ))}
        {picked && (
          <div className="ft-fadein">
            <div className="ft-optionGrid" style={{ marginTop: 12 }}>
              <div className="ft-option ft-active ft-locked"><b>Range entry</b><span>{inr(300)} · required</span></div>
              <button type="button" className={`ft-option${balls === '50' ? ' ft-active' : ''}`} onClick={() => setBalls(balls === '50' ? null : '50')}><b>50 balls</b><span>{inr(150)}</span></button>
              <button type="button" className={`ft-option${balls === '100' ? ' ft-active' : ''}`} onClick={() => setBalls(balls === '100' ? null : '100')}><b>100 balls</b><span>{inr(300)}</span></button>
              <button type="button" className={`ft-option${club ? ' ft-active' : ''}`} onClick={() => setClub(!club)}><b>Rental club</b><span>{inr(200)}</span></button>
            </div>
            <div className="ft-divider" />
            <div className="ft-totalRow"><span>Total</span><b className="ft-serif">{inr(total)}</b></div>
            <button className="ft-btn ft-primary ft-block" onClick={() => { setConfirmed(true); advance(); }}>Take payment</button>
          </div>
        )}
      </Phone>
    </section>
  );
}

// ─── Facility Step 3: Coach schedules ────────────────────────────

function FacilityStep3({ advance }: { advance: () => void }) {
  const [coach, setCoach] = useState<'meera' | 'arjun'>('meera');
  const [openSlots, setOpenSlots] = useState<Record<string, Set<number>>>({
    meera: new Set([9]),
    arjun: new Set([8, 11]),
  });

  function toggleSlot(h: number) {
    const s = new Set(openSlots[coach]);
    s.has(h) ? s.delete(h) : s.add(h);
    setOpenSlots({ ...openSlots, [coach]: s });
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Coach schedules">
        <h2 className="ft-serif">Keep every coach on the same schedule.</h2>
        <p>See and update coach availability without leaving the desk.</p>
      </Narr>
      <Phone header="Coach schedules">
        <div className="ft-chips ft-grid2">
          {(['meera', 'arjun'] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`ft-chip${coach === k ? ' ft-selected' : ''}`}
              onClick={() => setCoach(k)}
            >
              {k === 'meera' ? 'Meera Shah' : 'Arjun Mehta'}
            </button>
          ))}
        </div>
        <div className="ft-slotList">
          {HOURS.map((h) => {
            const key = `19-${h}`;
            const lesson = coach === 'meera' ? LESSONS_DATA[key] : null;
            const open = openSlots[coach].has(h);
            if (lesson) {
              return (
                <div key={h} className="ft-slotRow ft-lesson">
                  <span className="ft-timeLabel">{fmt(h)}</span>
                  <span className="ft-slotMain"><b>{lesson.name}</b><small>{lesson.club}</small></span>
                  <span className="ft-pill">Confirmed</span>
                </div>
              );
            }
            return (
              <button key={h} type="button" className={`ft-slotRow${open ? ' ft-on' : ''}`} onClick={() => toggleSlot(h)}>
                <span className="ft-timeLabel">{fmt(h)}</span>
                <span className="ft-slotMain"><b>{open ? 'Available' : 'Unavailable'}</b></span>
                <span className={`ft-tswitch${open ? ' ft-on' : ''}`}><i /></span>
              </button>
            );
          })}
        </div>
        <SaveBtn label="Save changes" onSave={advance} />
      </Phone>
    </section>
  );
}

// ─── Facility Step 4: Lesson requests ────────────────────────────

function FacilityStep4({ advance }: { advance: () => void }) {
  const [result, setResult] = useState<boolean | null>(null);

  if (result !== null) {
    return (
      <section className="ft-step ft-active">
        <Narr label="Lesson requests">
          <h2 className="ft-serif">Keep every lesson request moving.</h2>
          <p>Handle bookings for any coach right from the front desk.</p>
        </Narr>
        <Phone header="Lesson requests">
          {result ? (
            <ConfirmScreen title="Lesson accepted" body="Neha Bansal with Arjun Mehta, Fri 4:00 PM." />
          ) : (
            <ConfirmScreen title="Request declined" body="Neha Bansal has been notified." declined />
          )}
        </Phone>
      </section>
    );
  }

  return (
    <section className="ft-step ft-active">
      <Narr label="Lesson requests">
        <h2 className="ft-serif">Keep every lesson request moving.</h2>
        <p>Handle bookings for any coach right from the front desk.</p>
      </Narr>
      <Phone header="Lesson requests">
        <div className="ft-reqCard">
          <span className="ft-tag">Pending</span>
          <b>Neha Bansal · Lesson</b>
          <small>Arjun Mehta · Fri 4:00 PM</small>
          <div className="ft-reqActions">
            <button type="button" className="ft-btn ft-sm" onClick={() => { setResult(false); advance(); }}>Decline</button>
            <button type="button" className="ft-btn ft-sm ft-accent" onClick={() => { setResult(true); advance(); }}>Accept</button>
          </div>
        </div>
      </Phone>
    </section>
  );
}

// ─── Facility Step 5: Operations ─────────────────────────────────

function FacilityStep5({ advance }: { advance: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen(prev => prev === key ? null : key);
  return (
    <section className="ft-step ft-active">
      <Narr label="Operations">
        <h2 className="ft-serif">See the whole facility at a glance.</h2>
        <p>Keep the day-to-day work in one place.</p>
      </Narr>
      <Phone header="Operations" onContinue={advance} continueLabel="Continue to growth">
        <MCard icon="calendar" title="Tee sheet" small="Update the tee sheet in a few taps." reveal="Block 7:20 AM for group play in two taps. The tee sheet updates right away." open={open === 'teesheet'} onToggle={() => toggle('teesheet')} />
        <MCard icon="wallet" title="Pricing" small="Fill quieter tee times with smarter pricing." reveal="Set 11:00 AM at ₹2,900 when demand is quiet and give golfers a reason to book." open={open === 'pricing'} onToggle={() => toggle('pricing')} />
        <MCard icon="shield" title="Memberships" small="Stay on top of every membership." reveal="Track 212 active members and see the 14 renewals coming due." open={open === 'memberships'} onToggle={() => toggle('memberships')} />
        <MCard icon="chart" title="Analytics" small="See when your facility is busiest." reveal="Utilization is up 9% this month. See which hours are full and where you have room to grow." open={open === 'analytics'} onToggle={() => toggle('analytics')} />
      </Phone>
    </section>
  );
}

// ─── Facility Step 6: Growth ──────────────────────────────────────

function FacilityStep6({ advance }: { advance: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen(prev => prev === key ? null : key);
  return (
    <section className="ft-step ft-active">
      <Narr label="Growth">
        <h2 className="ft-serif">Find more revenue in the traffic you already have.</h2>
        <p>See the opportunities across your facility.</p>
      </Narr>
      <Phone header="Growth" onContinue={advance} continueLabel="End tour">
        <MCard icon="mail" title="Marketing" small="Bring past golfers back." reveal="340 lapsed golfers received a timely message, and 61 returned within a week." open={open === 'marketing'} onToggle={() => toggle('marketing')} />
        <MCard icon="cart" title="Pro shop &amp; F&amp;B" small="Make each round worth a little more." reveal="A simple checkout suggestion adds an average of ₹380 per round without extra work for your staff." open={open === 'proshop'} onToggle={() => toggle('proshop')} />
      </Phone>
    </section>
  );
}

// ─── Cover & completion screens ───────────────────────────────────

const HERO_TEXT = {
  golfer: { h1: 'Golf, without the runaround.', p: 'Find a course, book a round or a coach, and keep everything in one place.' },
  coach: { h1: 'Keep your coaching in one place.', p: 'Manage lessons, students and payments without the back-and-forth.' },
  facility: { h1: 'Keep your facility moving.', p: 'Manage golfers, coaches and daily operations from one place.' },
};

const COMPLETION_TEXT = {
  golfer: { h1: 'Your whole golf life, in one place.', p: 'Stay connected with your coach, course and golf history in one place.' },
  coach: { h1: 'Your coaching business, in one place.', p: 'Use student progress to build longer coaching relationships, not just one-off lessons.' },
  facility: { h1: 'Your desk, tee sheet and payments, together.', p: 'Use pricing and operations tools to make more of every available slot.' },
};

const TOTAL_STEPS: Record<Role, number> = { golfer: 9, coach: 7, facility: 8 };

// ─── Tour CSS (scoped to .fore-tour) ─────────────────────────────

const TOUR_CSS = `
.fore-tour {
  --ft-paper: #f7f6f0;
  --ft-surface: #ffffff;
  --ft-surface-2: #fbfbf7;
  --ft-ink: #171a12;
  --ft-ink-soft: #454a3c;
  --ft-muted: #797d6d;
  --ft-muted-2: #9a9d8d;
  --ft-line: #e5e3d7;
  --ft-line-soft: #eeece2;
  --ft-lime: #d8f24c;
  --ft-lime-deep: #8fae1c;
  --ft-lime-ink: #37430f;
  --ft-forest-2: #e3ecdf;
  --ft-forest-ink: #233522;
  --ft-amber-2: #f4ecd6;
  --ft-amber-deep: #8a6215;
  --ft-r-md: 14px;
  --ft-sh-md: 0 10px 30px -10px rgba(23,26,18,.18);
  --ft-sh-btn: 0 1px 2px rgba(23,26,18,.06), 0 8px 18px -10px rgba(23,26,18,.22);
  --ft-ease: cubic-bezier(.22,.9,.32,1);
  --ft-stage-h: 620px;
  font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.fore-tour .ft-serif {
  font-family: Manrope, sans-serif;
}

/* shell */
.fore-tour .ft-app {
  width: 100%;
  background: var(--ft-paper);
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(13,31,20,.18);
}
.fore-tour .ft-top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  border-bottom: 1px solid var(--ft-line-soft);
  background: var(--ft-paper);
}
.fore-tour .ft-windowBack {
  position: absolute;
  left: 16px;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px 5px 4px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ft-muted);
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
  transform: translateY(-50%);
}
.fore-tour .ft-windowBack:hover { background: var(--ft-line-soft); color: var(--ft-ink); }
.fore-tour .ft-dots {
  display: flex;
  align-items: center;
  gap: 7px;
}
.fore-tour .ft-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ft-line);
  border: 0;
  padding: 0;
  cursor: pointer;
  transition: background .25s, transform .25s;
}
.fore-tour .ft-dot.ft-done { background: var(--ft-muted-2); }
.fore-tour .ft-dot.ft-on { background: var(--ft-forest-ink); transform: scale(1.5); }

/* stage */
.fore-tour .ft-stage {
  position: relative;
  height: var(--ft-stage-h);
  overflow: hidden;
}
.fore-tour .ft-step {
  position: absolute;
  inset: 0;
  display: none;
  grid-template-columns: minmax(0,380px) minmax(0,460px);
  grid-template-rows: minmax(0,1fr);
  column-gap: 72px;
  justify-content: center;
  padding: 28px 56px;
}
.fore-tour .ft-step.ft-active { display: grid; animation: ft-stepin .3s ease-out; }
.fore-tour .ft-step.ft-solo {
  grid-template-columns: minmax(0,560px);
  align-items: center;
  justify-items: center;
  height: var(--ft-stage-h);
}

/* nav bar */
.fore-tour .ft-navBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 22px;
  border-top: 1px solid var(--ft-line-soft);
}
.fore-tour .ft-navBack {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ft-muted);
  padding: 10px 6px;
  border-radius: 9px;
  border: 0;
  background: none;
  cursor: pointer;
  transition: color .15s;
  font-family: inherit;
}
.fore-tour .ft-navBack:hover { color: var(--ft-ink); }
.fore-tour .ft-navBack:disabled { opacity: 0; pointer-events: none; }
.fore-tour .ft-navMid { font-size: 11.5px; font-weight: 700; color: var(--ft-muted-2); font-variant-numeric: tabular-nums; }
.fore-tour .ft-navNext { display: inline-flex; align-items: center; gap: 8px; }

/* copy */
.fore-tour .ft-narr { align-self: center; }
.fore-tour .ft-eyebrow {
  font-size: 11.5px; font-weight: 700; letter-spacing: .09em;
  text-transform: uppercase; color: var(--ft-muted); margin: 0 0 10px;
}
.fore-tour .ft-narr h2 {
  font-family: Manrope, sans-serif;
  font-weight: 700;
  font-size: clamp(26px,3.2vw,36px);
  letter-spacing: -.04em;
  line-height: 1.12;
  margin: 0 0 12px;
  color: var(--ft-ink);
}
.fore-tour .ft-narr p {
  font-size: 16px;
  color: var(--ft-ink-soft);
  line-height: 1.55;
  margin: 0;
  max-width: 34ch;
}

/* hero */
.fore-tour .ft-hero { text-align: center; }
.fore-tour .ft-hero h1 {
  font-family: Manrope, sans-serif;
  font-weight: 800;
  font-size: clamp(32px,5vw,50px);
  letter-spacing: -.04em;
  line-height: 1.06;
  margin: 0 0 16px;
  color: var(--ft-ink);
}
.fore-tour .ft-hero p {
  font-size: 16px;
  color: var(--ft-ink-soft);
  line-height: 1.55;
  max-width: 38ch;
  margin: 0 auto 28px;
}
.fore-tour .ft-heroBtns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.fore-tour .ft-completionPrimary { flex-basis: 100%; width: max-content; text-decoration: none; }
.fore-tour .ft-completionSecondary { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; width: 100%; margin-top: 18px; }

/* buttons */
.fore-tour .ft-btn {
  border: 1px solid var(--ft-line);
  background: var(--ft-surface);
  border-radius: 11px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ft-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color .15s, background .15s, transform .12s, box-shadow .2s;
  cursor: pointer;
  font-family: inherit;
}
.fore-tour .ft-btn:hover:not(:disabled) { border-color: #c9c6b6; box-shadow: var(--ft-sh-btn); transform: translateY(-1px); }
.fore-tour .ft-btn:active:not(:disabled) { transform: scale(.97); }
.fore-tour .ft-btn.ft-primary { background: var(--ft-lime); border-color: var(--ft-lime); color: var(--ft-lime-ink); box-shadow: var(--ft-sh-btn); }
.fore-tour .ft-btn.ft-primary:hover:not(:disabled) { background: #e2f66a; border-color: #e2f66a; }
.fore-tour .ft-btn.ft-accent { background: var(--ft-lime); border-color: var(--ft-lime); color: var(--ft-lime-ink); }
.fore-tour .ft-btn.ft-accent:hover:not(:disabled) { background: #e2f66a; border-color: #e2f66a; }
.fore-tour .ft-btn.ft-lg { padding: 14px 24px; font-size: 14.5px; border-radius: 13px; }
.fore-tour .ft-btn.ft-sm { padding: 8px 13px; font-size: 12.5px; border-radius: 9px; }
.fore-tour .ft-btn.ft-block { width: 100%; }
.fore-tour .ft-btn:disabled { opacity: .75; cursor: default; }

@keyframes ft-shine {
  0% { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
  8% { opacity: 1; }
  38% { opacity: 0; }
  42%, 100% { transform: translateX(280%) skewX(-20deg); opacity: 0; }
}
@keyframes ft-fadein { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
@keyframes ft-stepin { from{opacity:0} to{opacity:1} }
.fore-tour .ft-glow { position: relative; overflow: hidden; }
.fore-tour .ft-glow::before {
  content: '';
  position: absolute;
  top: -20%; left: 0;
  width: 40%; height: 140%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
  animation: ft-shine 3s ease-in-out infinite;
  pointer-events: none;
}
.fore-tour .ft-fadein { animation: ft-fadein .4s var(--ft-ease) both; }
.fore-tour .ft-confirm.ft-fadein { animation-duration: .65s; }

/* phone */
.fore-tour .ft-phone {
  align-self: stretch;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--ft-surface);
  border: 1px solid var(--ft-line);
  border-radius: 20px;
  box-shadow: 0 20px 45px -18px rgba(23,26,18,.24);
  overflow: hidden;
}
.fore-tour .ft-phoneHeader {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 11px 18px;
  border-bottom: 1px solid var(--ft-line-soft);
  background: var(--ft-surface);
}
.fore-tour .ft-phone-guide {
  margin: 0;
  color: var(--ft-ink);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .01em;
  line-height: 1.2;
}
.fore-tour .ft-phoneBack {
  position: absolute;
  left: 10px;
  top: 50%;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ft-muted);
  cursor: pointer;
  transform: translateY(-50%);
}
.fore-tour .ft-phoneBack:hover { background: var(--ft-line-soft); color: var(--ft-ink); }
.fore-tour .ft-phone-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px;
  display: flex;
  flex-direction: column;
}
.fore-tour .ft-phone-body > * { flex: none; }
.fore-tour .ft-phone-body::-webkit-scrollbar { width: 5px; }
.fore-tour .ft-phone-body::-webkit-scrollbar-thumb { background: var(--ft-line); border-radius: 99px; }
.fore-tour .ft-phone-footer {
  flex: none;
  padding: 12px 18px 18px;
  border-top: 1px solid var(--ft-line-soft);
  background: var(--ft-surface);
}

.fore-tour .ft-ico {
  width: 15px; height: 15px; flex: none;
  stroke: currentColor; fill: none;
  stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
}

/* chips */
.fore-tour .ft-chiplabel { font-size: 12px; font-weight: 700; color: var(--ft-muted); margin: 0 0 8px; }
.fore-tour .ft-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 14px; }
.fore-tour .ft-chips.ft-grid3 { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); }
.fore-tour .ft-chips.ft-grid3 .ft-chip, .fore-tour .ft-chips.ft-grid2 .ft-chip { text-align: center; padding-left: 4px; padding-right: 4px; white-space: nowrap; }
.fore-tour .ft-chips.ft-grid2 { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); }
.fore-tour .ft-chip {
  border: 1.5px solid var(--ft-line);
  background: var(--ft-surface);
  border-radius: 99px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ft-ink-soft);
  transition: border-color .15s, background .15s, color .15s;
  cursor: pointer;
  font-family: inherit;
}
.fore-tour .ft-chip:hover { border-color: #c9c6b6; }
.fore-tour .ft-chip.ft-selected { background: var(--ft-ink); border-color: var(--ft-ink); color: var(--ft-paper); }

/* search */
.fore-tour .ft-search {
  height: 42px;
  flex: none;
  border: 1px solid var(--ft-line);
  border-radius: 10px;
  padding: 0 12px;
  color: var(--ft-muted);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  background: var(--ft-surface-2);
}

/* course cards */
.fore-tour .ft-course {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  border: 1.5px solid var(--ft-line);
  border-radius: 12px;
  overflow: hidden;
  background: var(--ft-surface);
  margin-bottom: 8px;
  transition: border-color .18s, box-shadow .18s;
  cursor: pointer;
  font-family: inherit;
}
.fore-tour .ft-course:hover { border-color: #c9c6b6; }
.fore-tour .ft-course.ft-selected { border-color: var(--ft-lime-deep); box-shadow: 0 0 0 3px rgba(143,174,28,.16); }
.fore-tour .ft-course-img {
  width: 54px; flex: none; position: relative; align-self: stretch;
  padding: 0;
  background: linear-gradient(135deg,#a9c19c,#dfe9d8);
  border-radius: 10px 0 0 10px;
}
.fore-tour .ft-course-img.b { background: linear-gradient(135deg,#c7b98a,#ecdfb8); }
.fore-tour .ft-course-img.c { background: linear-gradient(135deg,#93a7b8,#d7e2ea); }
.fore-tour .ft-course-img.d { background: linear-gradient(135deg,#b7a3c7,#e6dcee); }
.fore-tour .ft-course-check {
  position: absolute; inset: 0; display: none;
  align-items: center; justify-content: center;
  color: var(--ft-lime-ink); background: rgba(216,242,76,.85);
}
.fore-tour .ft-course.ft-selected .ft-course-check { display: flex; }
.fore-tour .ft-course-body { flex: 1; padding: 6px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.fore-tour .ft-cname { font-size: 14px; font-weight: 700; color: var(--ft-ink); }
.fore-tour .ft-cmeta { font-size: 12px; color: var(--ft-muted); margin-top: 2px; }
.fore-tour .ft-cprice { font-size: 14px; font-weight: 700; white-space: nowrap; color: var(--ft-ink); }

/* rows */
.fore-tour .ft-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 2px; border-top: 1px solid var(--ft-line-soft);
}
.fore-tour .ft-row:first-child { border-top: 0; }
.fore-tour .ft-rchip {
  width: 30px; height: 30px; border-radius: 9px;
  background: var(--ft-forest-2); color: var(--ft-forest-ink);
  display: grid; place-items: center; flex: none;
}
.fore-tour .ft-row strong { display: block; font-size: 13.5px; font-weight: 600; color: var(--ft-ink); }
.fore-tour .ft-row small { display: block; font-size: 11.5px; color: var(--ft-muted); margin-top: 1px; }
.fore-tour .ft-row-side { margin-left: auto; text-align: right; flex: none; }
.fore-tour .ft-row-side b { font-size: 13px; color: var(--ft-ink); }
.fore-tour .ft-rowclick { cursor: pointer; border-radius: 10px; border-top: 0; padding: 10px; margin: 0 0 4px; border: 1.5px solid var(--ft-line-soft); transition: border-color .15s, background .15s; }
.fore-tour .ft-rowclick:hover { background: var(--ft-surface-2); }
.fore-tour .ft-rowclick.ft-selected { border-color: var(--ft-lime-deep); background: var(--ft-forest-2); }

/* divider / total */
.fore-tour .ft-divider { height: 1px; background: var(--ft-line-soft); margin: 12px 0; }
.fore-tour .ft-totalRow { display: flex; justify-content: space-between; align-items: baseline; margin: 0 0 14px; font-size: 13px; color: var(--ft-muted); }
.fore-tour .ft-totalRow b { font-family: Manrope, sans-serif; font-size: 22px; font-weight: 700; color: var(--ft-ink); }
.fore-tour .ft-callout {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 13px; margin: 0 0 12px;
  border: 1px solid #bfd77a; border-radius: 11px;
  background: var(--ft-forest-2); font-size: 13px; font-weight: 600; color: var(--ft-forest-ink);
}
.fore-tour .ft-callout b { color: var(--ft-lime-deep); }

/* confirmation */
.fore-tour .ft-confirm { margin: auto 0; text-align: center; padding: 0 6px; }
.fore-tour .ft-check {
  width: 50px; height: 50px; border-radius: 50%;
  background: var(--ft-lime); color: var(--ft-lime-ink);
  display: grid; place-items: center;
  margin: 0 auto 14px;
  animation: ft-pop .5s var(--ft-ease);
}
.fore-tour .ft-check .ft-ico { width: 22px; height: 22px; }
@keyframes ft-pop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
.fore-tour .ft-confirm.ft-declined .ft-check { background: var(--ft-line-soft); color: var(--ft-muted); }
.fore-tour .ft-confirm h3 { font-family: Manrope, sans-serif; font-weight: 700; font-size: 22px; margin: 0 0 6px; letter-spacing: -.3px; color: var(--ft-ink); }
.fore-tour .ft-confirm p { font-size: 13px; color: var(--ft-muted); line-height: 1.5; margin: 0 auto; max-width: 260px; }

/* coach cards */
.fore-tour .ft-coach { border: 1.5px solid var(--ft-line); border-radius: var(--ft-r-md); background: var(--ft-surface); margin-bottom: 8px; overflow: hidden; transition: border-color .18s; }
.fore-tour .ft-coach.ft-open { border-color: var(--ft-lime-deep); }
.fore-tour .ft-coachhead { display: flex; align-items: center; gap: 11px; padding: 10px 13px; width: 100%; text-align: left; border: 0; background: none; cursor: pointer; font-family: inherit; }
.fore-tour .ft-coachface { width: 34px; height: 34px; border-radius: 50%; background: var(--ft-forest-2); color: var(--ft-forest-ink); display: grid; place-items: center; font-size: 10.5px; font-weight: 800; flex: none; }
.fore-tour .ft-coachhead b { font-size: 13.5px; display: block; color: var(--ft-ink); }
.fore-tour .ft-coachhead small { font-size: 11.5px; color: var(--ft-muted); display: block; margin-top: 1px; }
.fore-tour .ft-cright { margin-left: auto; text-align: right; }
.fore-tour .ft-coach-detail { max-height: 0; overflow: hidden; transition: max-height .3s var(--ft-ease); }
.fore-tour .ft-coach.ft-open .ft-coach-detail { max-height: 200px; }
.fore-tour .ft-coach-detail-in { padding: 2px 13px 13px; }

/* options */
.fore-tour .ft-optionGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.fore-tour .ft-optionGrid.ft-stack { grid-template-columns: 1fr; }
.fore-tour .ft-option {
  display: block; border: 1.5px solid var(--ft-line); border-radius: 11px;
  padding: 11px 13px; background: var(--ft-surface); text-align: left; width: 100%;
  transition: border-color .15s, background .15s; cursor: pointer; font-family: inherit;
}
.fore-tour .ft-option:hover { border-color: #c9c6b6; }
.fore-tour .ft-option.ft-active { border-color: var(--ft-lime-deep); background: var(--ft-forest-2); }
.fore-tour .ft-option.ft-locked { cursor: default; }
.fore-tour .ft-option b { display: block; font-size: 13.5px; font-weight: 700; color: var(--ft-ink); }
.fore-tour .ft-option span { display: block; font-size: 12px; color: var(--ft-muted); margin-top: 2px; }
.fore-tour .ft-badge {
  display: inline-block; font-style: normal; font-size: 9px; font-weight: 800;
  color: var(--ft-lime-ink); background: var(--ft-lime);
  padding: 2px 6px; border-radius: 5px; margin-left: 6px; vertical-align: 1px;
}

/* toggles */
.fore-tour .ft-tswitch {
  width: 38px; height: 22px; border-radius: 99px;
  background: var(--ft-line); position: relative; flex: none;
  transition: background .2s; cursor: pointer;
}
.fore-tour .ft-tswitch i {
  position: absolute; top: 2px; left: 2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--ft-surface); transition: transform .2s var(--ft-ease);
  box-shadow: 0 1px 2px rgba(0,0,0,.2);
}
.fore-tour .ft-tswitch.ft-on { background: var(--ft-lime-deep); }
.fore-tour .ft-tswitch.ft-on i { transform: translateX(16px); }

/* day nav */
.fore-tour .ft-dayNav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.fore-tour .ft-dayNav strong { font-size: 13.5px; color: var(--ft-ink); }
.fore-tour .ft-dayNav button { width: 30px; height: 30px; border: 1px solid var(--ft-line); border-radius: 8px; font-size: 18px; line-height: 1; background: none; cursor: pointer; color: var(--ft-ink); }
.fore-tour .ft-dayNav button:disabled { opacity: .3; }

/* slots */
.fore-tour .ft-slotList { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
.fore-tour .ft-slotRow {
  width: 100%; min-height: 50px;
  display: grid; grid-template-columns: 72px minmax(0,1fr) auto;
  align-items: center; gap: 10px; padding: 8px 13px;
  border: 1.5px solid var(--ft-line); border-radius: 12px;
  background: var(--ft-surface-2); text-align: left;
  transition: border-color .15s, background .15s;
  cursor: pointer; border: 1.5px solid var(--ft-line); font-family: inherit;
}
.fore-tour button.ft-slotRow:hover:not(:disabled) { border-color: #c9c6b6; }
.fore-tour .ft-slotRow.ft-on { border-color: var(--ft-lime-deep); background: var(--ft-forest-2); }
.fore-tour .ft-slotRow.ft-lesson { background: var(--ft-surface); cursor: default; }
.fore-tour .ft-slotRow.ft-dim { opacity: .5; }
.fore-tour .ft-timeLabel { font-size: 12px; font-weight: 800; color: var(--ft-muted); white-space: nowrap; }
.fore-tour .ft-slotMain b { display: block; font-size: 13.5px; color: var(--ft-ink); }
.fore-tour .ft-slotMain small { display: block; font-size: 11.5px; color: var(--ft-muted); margin-top: 1px; }
.fore-tour .ft-pill { font-size: 10.5px; font-weight: 800; padding: 5px 9px; border-radius: 99px; background: var(--ft-forest-2); color: var(--ft-forest-ink); }

/* requests */
.fore-tour .ft-reqCard { border: 1.5px solid var(--ft-lime-deep); border-radius: var(--ft-r-md); background: var(--ft-forest-2); padding: 14px; }
.fore-tour .ft-tag { display: inline-block; font-size: 10.5px; padding: 4px 9px; border-radius: 99px; font-weight: 700; background: var(--ft-amber-2); color: var(--ft-amber-deep); margin-bottom: 8px; }
.fore-tour .ft-reqCard b { display: block; font-size: 14px; color: var(--ft-forest-ink); }
.fore-tour .ft-reqCard small { display: block; font-size: 12px; color: var(--ft-ink-soft); margin-top: 3px; }
.fore-tour .ft-reqActions { display: flex; gap: 8px; margin-top: 13px; }
.fore-tour .ft-reqActions .ft-btn { flex: 1; }

/* payments */
.fore-tour .ft-miniTabs { display: flex; gap: 6px; margin-bottom: 12px; }
.fore-tour .ft-miniChip {
  border: 1px solid var(--ft-line); background: var(--ft-surface); border-radius: 99px;
  padding: 7px 13px; font-size: 12px; font-weight: 700; color: var(--ft-ink-soft);
  cursor: pointer; font-family: inherit; transition: background .15s, color .15s;
}
.fore-tour .ft-miniChip.ft-on { background: var(--ft-ink); color: var(--ft-paper); border-color: var(--ft-ink); }
.fore-tour .ft-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.fore-tour .ft-metric { border: 1px solid var(--ft-line); border-radius: var(--ft-r-md); background: var(--ft-surface-2); padding: 12px 13px; }
.fore-tour .ft-metric small { display: block; font-size: 11px; color: var(--ft-muted); font-weight: 700; }
.fore-tour .ft-metric strong { display: block; font-family: Manrope, sans-serif; font-weight: 700; font-size: 22px; letter-spacing: -.3px; margin-top: 3px; color: var(--ft-ink); }
.fore-tour .ft-metric span { font-size: 11px; color: var(--ft-muted-2); }
.fore-tour .ft-metric span.ft-up { color: var(--ft-lime-deep); font-weight: 700; }

/* explore cards */
.fore-tour .ft-mcard {
  display: grid; grid-template-columns: 36px minmax(0,1fr) 22px;
  align-items: center; gap: 12px; width: 100%; text-align: left;
  padding: 12px 14px; margin-bottom: 8px;
  border: 1.5px solid var(--ft-line); border-radius: 12px;
  background: var(--ft-surface); transition: border-color .18s, box-shadow .18s;
  cursor: pointer; font-family: inherit;
}
.fore-tour .ft-mcard:hover { border-color: #c9c6b6; }
.fore-tour .ft-mcard.ft-open { border-color: var(--ft-lime-deep); }
.fore-tour .ft-mico { width: 36px; height: 36px; border-radius: 10px; background: var(--ft-forest-2); color: var(--ft-forest-ink); display: grid; place-items: center; }
.fore-tour .ft-mcard b { display: block; font-size: 14.5px; font-weight: 700; color: var(--ft-ink); }
.fore-tour .ft-mcard small { display: block; font-size: 12.5px; color: var(--ft-muted); line-height: 1.35; margin-top: 2px; }
.fore-tour .ft-reveal { display: none; margin-top: 7px; font-size: 12px; font-weight: 600; color: var(--ft-forest-ink); background: var(--ft-forest-2); padding: 6px 10px; border-radius: 8px; }
.fore-tour .ft-mcard.ft-open .ft-reveal { display: block; }
.fore-tour .ft-mplus {
  width: 22px; height: 22px; border-radius: 50%; background: var(--ft-line-soft);
  position: relative; transition: transform .25s var(--ft-ease);
}
.fore-tour .ft-mplus:before, .fore-tour .ft-mplus:after {
  content: ""; position: absolute; left: 6px; right: 6px; top: 10px;
  height: 2px; border-radius: 2px; background: var(--ft-muted);
}
.fore-tour .ft-mplus:after { transform: rotate(90deg); }
.fore-tour .ft-mcard.ft-open .ft-mplus { transform: rotate(45deg); }

/* gear */
.fore-tour .ft-fitCard {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; margin-bottom: 16px;
  border: 1.5px solid var(--ft-line); border-radius: 12px; background: var(--ft-forest-2);
}
.fore-tour .ft-fitCard b { display: block; font-size: 14px; color: var(--ft-ink); }
.fore-tour .ft-fitCard small { display: block; font-size: 12px; color: var(--ft-ink-soft); margin-top: 2px; }
.fore-tour .ft-equipmentList { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.fore-tour .ft-equipmentItem {
  display: flex; flex-direction: column; gap: 2px;
  padding: 11px 13px; border: 1.5px solid var(--ft-line); border-radius: 11px;
  background: var(--ft-surface-2); text-align: left;
  transition: border-color .15s, background .15s; cursor: pointer; font-family: inherit;
}
.fore-tour .ft-equipmentItem:hover { border-color: #c9c6b6; }
.fore-tour .ft-equipmentItem.ft-active { border-color: var(--ft-lime-deep); background: var(--ft-forest-2); }
.fore-tour .ft-equipmentItem span { font-size: 13px; font-weight: 700; color: var(--ft-ink); }
.fore-tour .ft-equipmentItem strong { font-size: 12.5px; color: var(--ft-muted); font-weight: 600; }
.fore-tour .ft-orderRow {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding-top: 14px; border-top: 1px solid var(--ft-line-soft);
  font-size: 13px; font-weight: 700; color: var(--ft-ink-soft);
}

/* tablet */
@media(max-width:860px) {
  .fore-tour { --ft-stage-h: 680px; }
  .fore-tour .ft-step {
    grid-template-columns: minmax(0,460px);
    grid-template-rows: auto minmax(0,1fr);
    row-gap: 22px;
    padding: 24px 28px;
    align-content: stretch;
  }
  .fore-tour .ft-step.ft-solo { grid-template-rows: auto; align-content: center; }
  .fore-tour .ft-narr { text-align: center; }
  .fore-tour .ft-narr p { margin: 0 auto; }
}

/* mobile */
@media(max-width:600px) {
  .fore-tour { --ft-stage-h: 640px; }
  .fore-tour .ft-step { padding: 14px 16px 12px; row-gap: 10px; }
  .fore-tour .ft-step.ft-solo { padding: 20px 16px; }
  .fore-tour .ft-narr { text-align: left; }
  .fore-tour .ft-narr p { margin: 0; font-size: 13.5px; line-height: 1.4; max-width: none; }
  .fore-tour .ft-narr h2 { font-size: 22px; margin: 0 0 5px; }
  .fore-tour .ft-phone { border-radius: 16px; }
  .fore-tour .ft-phoneHeader { padding: 9px 14px; }
  .fore-tour .ft-phone-body { padding: 14px; overflow: hidden; }
  .fore-tour .ft-navBar { padding: 7px 14px; }
  .fore-tour .ft-hero h1 { font-size: 28px; letter-spacing: -.8px; }
  .fore-tour .ft-hero p { font-size: 14.5px; margin-bottom: 22px; }
  .fore-tour .ft-chip { padding: 9px 12px; }
  .fore-tour .ft-slotRow { min-height: 46px; padding: 6px 12px; grid-template-columns: 62px minmax(0,1fr) auto; gap: 8px; }
  .fore-tour .ft-mcard { padding: 10px 12px; margin-bottom: 7px; }
  .fore-tour .ft-mcard small { font-size: 12px; }
  .fore-tour .ft-metric strong { font-size: 20px; }
}
`;

// ─── Main ProductDemo ─────────────────────────────────────────────

export default function ProductDemo() {
  const [role, setRole] = useState<Role>('golfer');
  const [stepIdx, setStepIdx] = useState(0);

  // Cross-step state
  const [selectedCourse, setSelectedCourse] = useState({ name: 'Delhi Golf Club', price: 2900 });
  const [pkgCoach, setPkgCoach] = useState<string>('meera');
  const [coachPrice, setCoachPrice] = useState(1800);

  const advance = useCallback(() => {
    setTimeout(() => setStepIdx((s) => s + 1), ADV);
  }, []);

  function switchRole(r: Role, start = false) {
    setRole(r);
    setStepIdx(start ? 1 : 0);
    setSelectedCourse({ name: 'Delhi Golf Club', price: 2900 });
    setPkgCoach('meera');
    setCoachPrice(1800);
  }

  return (
    <div className="product-demo">
      {/* Existing role switcher – kept exactly as before */}
      <div style={{ display: 'flex', gap: 4, padding: 5, background: '#e8e9e4', borderRadius: 28, width: '100%', marginBottom: 13 }}>
        {(['golfer', 'coach', 'facility'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => switchRole(r)}
            style={{
              flex: 1, border: 0,
              background: role === r ? '#11130f' : 'transparent',
              color: role === r ? '#fff' : '#737970',
              borderRadius: 22, padding: '13px 18px',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              transition: 'background .15s, color .15s',
            }}
          >
            {r === 'golfer' ? 'Golfers' : r === 'coach' ? 'Coaches' : 'Facilities'}
          </button>
        ))}
      </div>

      {/* Tour */}
      <style>{TOUR_CSS}</style>
      <div className="fore-tour">
        <div className="ft-app">
          {/* Stage */}
          <DemoBackContext.Provider value={() => setStepIdx((s) => Math.max(0, s - 1))}>
            <main className="ft-stage">
            {/* Cover */}
            {stepIdx === 0 && (
              <section className="ft-step ft-solo ft-active">
                <div className="ft-hero">
                  <h1 className="ft-serif">{HERO_TEXT[role].h1}</h1>
                  <p>{HERO_TEXT[role].p}</p>
                  <div className="ft-heroBtns">
                    <button className="ft-btn ft-primary ft-lg ft-glow" onClick={() => setStepIdx(1)}>
                      Take a tour
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── Golfer steps ── */}
            {role === 'golfer' && stepIdx === 1 && (
              <GolferStep1
                key="g1"
                onCourseSelect={(c) => setSelectedCourse(c)}
                advance={advance}
              />
            )}
            {role === 'golfer' && stepIdx === 2 && (
              <GolferStep2 key="g2" course={selectedCourse} advance={advance} />
            )}
            {role === 'golfer' && stepIdx === 3 && (
              <GolferStep3
                key="g3"
                onCoachSelect={(k) => setPkgCoach(k)}
                advance={advance}
              />
            )}
            {role === 'golfer' && stepIdx === 4 && (
              <GolferStep4 key="g4" coachKey={pkgCoach} advance={advance} />
            )}
            {role === 'golfer' && stepIdx === 5 && <GolferStep5 key="g5" advance={advance} />}
            {role === 'golfer' && stepIdx === 6 && <GolferStep6 key="g6" advance={advance} />}
            {role === 'golfer' && stepIdx === 7 && <GolferStep7 key="g7" advance={advance} />}

            {/* ── Coach steps ── */}
            {role === 'coach' && stepIdx === 1 && (
              <CoachStep1
                key="c1"
                coachPrice={coachPrice}
                onPriceChange={setCoachPrice}
                advance={advance}
              />
            )}
            {role === 'coach' && stepIdx === 2 && <CoachStep2 key="c2" advance={advance} />}
            {role === 'coach' && stepIdx === 3 && (
              <CoachStep3 key="c3" coachPrice={coachPrice} advance={advance} />
            )}
            {role === 'coach' && stepIdx === 4 && <CoachStep4 key="c4" advance={advance} />}
            {role === 'coach' && stepIdx === 5 && (
              <CoachStep5 key="c5" coachPrice={coachPrice} />
            )}

            {/* ── Facility steps ── */}
            {role === 'facility' && stepIdx === 1 && <FacilityStep1 key="f1" advance={advance} />}
            {role === 'facility' && stepIdx === 2 && <FacilityStep2 key="f2" advance={advance} />}
            {role === 'facility' && stepIdx === 3 && <FacilityStep3 key="f3" advance={advance} />}
            {role === 'facility' && stepIdx === 4 && <FacilityStep4 key="f4" advance={advance} />}
            {role === 'facility' && stepIdx === 5 && <FacilityStep5 key="f5" advance={advance} />}
            {role === 'facility' && stepIdx === 6 && <FacilityStep6 key="f6" advance={advance} />}

            {/* Completion screens */}
            {role === 'golfer' && stepIdx === 8 && (
              <section className="ft-step ft-solo ft-active">
                <div className="ft-hero">
                  <h1 className="ft-serif">{COMPLETION_TEXT.golfer.h1}</h1>
                  <p>{COMPLETION_TEXT.golfer.p}</p>
                  <div className="ft-heroBtns">
                    <Link className="ft-btn ft-primary ft-lg ft-completionPrimary" to="/golfers#join">Join as a golfer</Link>
                    <div className="ft-completionSecondary">
                      <button className="ft-btn ft-lg" onClick={() => switchRole('coach', true)}>See the coach demo</button>
                      <button className="ft-btn ft-lg" onClick={() => switchRole('facility', true)}>See the facility demo</button>
                      <button className="ft-btn ft-lg" onClick={() => switchRole('golfer', false)}>Restart</button>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {role === 'coach' && stepIdx === 6 && (
              <section className="ft-step ft-solo ft-active">
                <div className="ft-hero">
                  <h1 className="ft-serif">{COMPLETION_TEXT.coach.h1}</h1>
                  <p>{COMPLETION_TEXT.coach.p}</p>
                  <div className="ft-heroBtns">
                    <Link className="ft-btn ft-primary ft-lg ft-completionPrimary" to="/coaches#join">Join as a coach</Link>
                    <div className="ft-completionSecondary">
                      <button className="ft-btn ft-lg" onClick={() => switchRole('facility', true)}>See the facility demo</button>
                      <button className="ft-btn ft-lg" onClick={() => switchRole('golfer', true)}>See the golfer demo</button>
                      <button className="ft-btn ft-lg" onClick={() => switchRole('coach', false)}>Restart</button>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {role === 'facility' && stepIdx === 7 && (
              <section className="ft-step ft-solo ft-active">
                <div className="ft-hero">
                  <h1 className="ft-serif">{COMPLETION_TEXT.facility.h1}</h1>
                  <p>{COMPLETION_TEXT.facility.p}</p>
                  <div className="ft-heroBtns">
                    <Link className="ft-btn ft-primary ft-lg ft-completionPrimary" to="/facilities#join">Join as a facility</Link>
                    <div className="ft-completionSecondary">
                      <button className="ft-btn ft-lg" onClick={() => switchRole('golfer', true)}>See the golfer demo</button>
                      <button className="ft-btn ft-lg" onClick={() => switchRole('coach', true)}>See the coach demo</button>
                      <button className="ft-btn ft-lg" onClick={() => switchRole('facility', false)}>Restart</button>
                    </div>
                  </div>
                </div>
              </section>
            )}
            </main>
          </DemoBackContext.Provider>

        </div>
      </div>
    </div>
  );
}

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
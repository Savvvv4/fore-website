# ForeSports website

Next.js site for [foresports.in](https://www.foresports.in), deployed on Vercel. Form submissions are stored in Supabase.

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables) and in `.env.local` for local work:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

If Vercel won't save the anon key with `NEXT_PUBLIC_` (it may insist the key is a secret), use `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`) instead. The key can then use secret visibility; `next.config.ts` passes it to the site at build time. Never use the `service_role` or secret key here. Redeploy after changing either.

## Database setup

Run each file once in Supabase → SQL Editor:

1. `supabase-schema.sql` — waitlist forms
2. `supabase/coach-directory.sql` — coach directory, enquiries and the `coach-photos` storage bucket
3. `supabase/signup-flow-redesign.sql` — WhatsApp-keyed leads, international coach numbers and pending founding profiles. Run this after the first two files.

The base schema and redesign migration are safe to re-run. Run the coach-directory setup once before the redesign migration; do not rerun it afterward, because it approves pending profiles.

## Coach pages, sign-ups and Find a coach

| Page | What it does |
| --- | --- |
| `/coaches` | Coach landing page with the founding-profile reservation form. |
| `/coaches/teaching` | Shareable page for teaching pros. Its buttons pre-select the teaching-pro goal in the form on `/coaches#join`. |
| `/coaches/performance` | Shareable page for performance coaches. Its buttons pre-select the performance-coach goal in the form on `/coaches#join`. |
| `/coaches/join` | Two-step founding-profile reservation. `?type=teaching` or `?type=performance` pre-selects the goal. |
| `/coaches/teaching/join`, `/coaches/performance/join` | The same sign-up with the coach type already set. |
| `/coaches/directory` | Find a coach: every approved coach, with search and filters. Linked from the golfers page and the footer. Always shows live data. |
| `/coaches/directory/<slug>` | A coach's public profile with a message form. |

`/coach-profile` redirects to `/coaches`.

### How sign-ups are saved

Golfer, parent and facility records are stored in `signup_leads`, uniquely keyed by the E.164 WhatsApp number. Coach answers are stored there as structured details and mirrored to `coach_profiles` as a pending founding profile. Source page and UTM attribution are retained. If the profile mirror fails, the lead remains saved for team follow-up.

### Approving and verifying coaches

Founding profiles remain pending and private until the team verifies and approves them for launch.

1. Supabase → Table Editor → `coach_profiles`.
2. To mark a coach as verified, set `verified` to `true` once you've checked their qualifications. The badge shows on their card and profile the next time the page loads.
3. To take a coach down, set `status` to `hidden` or `rejected`.
4. Also check `waitlist_submissions` for rows with role `coach`: backup and repeat sign-ups land there.

`admin_notes` is private to your team.

### WhatsApp follow-up

The forms capture the details and consent needed for one confirmation message per sign-up. Automated outbound WhatsApp delivery is not enabled in this repository; it requires approved WhatsApp Business templates and a configured messaging provider. Template copy from the redesign:

- Golfer: Hi {{1}}, you’re on the Fore! waitlist. We’ll message you here the day we open in {{2}}.
- Parent: Hi {{1}}, you’re on the Fore! waitlist for your child. When we open in {{2}}, we’ll show you coaches who teach juniors aged {{3}}.
- Coach: Hi {{1}}, your Fore! founding profile is reserved. We’ll call you in the {{2}} to verify you and hear how you coach.
- Facility: Hi {{1}}, thanks for getting in touch about {{2}}. We’ll reach you within {{3}} to start the conversation.

### Enquiries

Golfer enquiries land in `coach_enquiries`, linked to the coach by `coach_id`. Forward them to the coach and set `status` to `forwarded` or `closed`.

### What visitors can and can't see

Visitors can submit sign-ups and enquiries, and read the public fields of approved coaches. They can never read email, phone, consent, notes, pending profiles or enquiries. Row-level security and column grants enforce this in `supabase/coach-directory.sql`.

Deployments: pushes to `main` trigger the production deployment on Vercel.

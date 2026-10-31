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
2. `supabase/coach-directory.sql` — coach sign-ups, the coach directory, enquiries and the `coach-photos` storage bucket

Both files are safe to run again.

## Coach pages, sign-ups and Find a coach

| Page | What it does |
| --- | --- |
| `/coaches` | Marketing page for every coach, linking to sign-up and to the two pages below. |
| `/coaches/teaching` | Shareable page for teaching pros. Its buttons go to `/coaches/teaching/join`. |
| `/coaches/performance` | Shareable page for performance coaches. Its buttons go to `/coaches/performance/join`. |
| `/coaches/join` | Two-step sign-up that asks which kind of coach you are, then a confirmation screen. `?type=teaching` or `?type=performance` pre-selects it. |
| `/coaches/teaching/join`, `/coaches/performance/join` | The same sign-up with the coach type already set. |
| `/coaches/directory` | Find a coach: every approved coach, with search and filters. Linked from the golfers page and the footer. Always shows live data. |
| `/coaches/directory/<slug>` | A coach's public profile with a message form. |

`/coach-profile` redirects to `/coaches`.

### How sign-ups are saved

The sign-up tries three places in turn, so a sign-up is only lost if Supabase is unreachable altogether (the coach then sees an error and their answers stay in the form):

1. `coach_profiles` with every field.
2. `coach_profiles` with the original columns, if `supabase/coach-directory.sql` hasn't been re-run yet. A performance coach's program details go at the top of their bio.
3. `waitlist_submissions` with name, email, phone and city, role `coach` and a `source` ending in `_backup`. A coach who signs up again with the same email is saved here with a source ending in `_repeat`.

`source` in `coach_profiles` is `teaching_signup` or `performance_signup`.

Re-run `supabase/coach-directory.sql` after pulling these changes. It adds the coach type columns, approves sign-ups automatically (including any still pending), and allows one sign-up per phone number. If two profiles already share a phone number, it skips that last rule and says so; reject or delete the extra row and run it again.

### Approving and verifying coaches

Sign-ups are approved automatically and appear in Find a coach as soon as they're saved.

1. Supabase → Table Editor → `coach_profiles`.
2. To mark a coach as verified, set `verified` to `true` once you've checked their qualifications. The badge shows on their card and profile the next time the page loads.
3. To take a coach down, set `status` to `hidden` or `rejected`.
4. Also check `waitlist_submissions` for rows with role `coach`: backup and repeat sign-ups land there.

`admin_notes` is private to your team.

### Enquiries

Golfer enquiries land in `coach_enquiries`, linked to the coach by `coach_id`. Forward them to the coach and set `status` to `forwarded` or `closed`.

### What visitors can and can't see

Visitors can submit sign-ups and enquiries, and read the public fields of approved coaches. They can never read email, phone, consent, notes, pending profiles or enquiries. Row-level security and column grants enforce this in `supabase/coach-directory.sql`.

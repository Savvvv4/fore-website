# ForeSports website

Next.js site for [foresports.in](https://www.foresports.in), deployed on Vercel. Form submissions are stored in Supabase.

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables) and in `.env.local` for local work:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Database setup

Run each file once in Supabase → SQL Editor:

1. `supabase-schema.sql` — waitlist forms
2. `supabase/coach-directory.sql` — coach sign-ups, the coach directory, enquiries and the `coach-photos` storage bucket

Both files are safe to run again.

## Coach sign-ups and the directory

| Page | What it does |
| --- | --- |
| `/coach-profile` | Five-step coach sign-up. Saves to `coach_profiles` with status `pending`. |
| `/coaches/directory` | Public listing of approved coaches, with search and filters. |
| `/coaches/directory/<slug>` | A coach's public profile with an enquiry form. |

### Approving a coach

1. Supabase → Table Editor → `coach_profiles`.
2. Review the row (filter `status` = `pending`).
3. Set `status` to `approved`. The coach appears on the site within about a minute.
4. Optional: set `verified` to `true` once you've checked their certifications. Their profile then shows a verified badge.

Use `rejected` or `hidden` to keep a profile off the site. `admin_notes` is private to your team.

### Enquiries

Golfer enquiries land in `coach_enquiries`, linked to the coach by `coach_id`. Forward them to the coach and set `status` to `forwarded` or `closed`.

### What visitors can and can't see

Visitors can submit sign-ups and enquiries, and read the public fields of approved coaches. They can never read email, phone, consent, notes, pending profiles or enquiries. Row-level security and column grants enforce this in `supabase/coach-directory.sql`.

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

## Coach funnels, sign-ups and the directory

There are two coach funnels, one per kind of coach:

| Page | What it does |
| --- | --- |
| `/coaches` | Chooser: Teaching Pros or Performance Coaches. |
| `/coaches/teaching` | Landing page for teaching pros (lessons to the public). |
| `/coaches/teaching/join` | Five-step sign-up with a live preview of the directory card. Saves to `coach_profiles` with `coach_type = 'teaching'`. |
| `/coaches/performance` | Landing page for performance coaches (squads, academies, elite players). |
| `/coaches/performance/join` | Five-step sign-up about the coach's program. Saves with `coach_type = 'performance'`. |
| `/coaches/directory` | Public listing of approved **teaching pros**, with search, filters and sorting. Filters are kept in the URL. |
| `/coaches/directory/<slug>` | A teaching pro's public profile with an enquiry form. |

`/coach-profile` redirects to `/coaches`. Performance coaches are never listed publicly; follow up with them to set up their squad.

After pulling these changes, re-run `supabase/coach-directory.sql` once. It adds `coach_type` and the new fields (languages, tools, program name and role, squad size, player groups, disciplines, priorities). Until then the site keeps working: sign-ups save the original fields, `source` records `teaching_signup` or `performance_signup`, and a performance coach's program details are added to the top of their bio.

### Approving a coach

1. Supabase → Table Editor → `coach_profiles`.
2. Review the row (filter `status` = `pending`). Check `coach_type`: only `teaching` profiles appear in the directory.
3. Set `status` to `approved`. The coach appears on the site within about a minute.
4. Optional: set `verified` to `true` once you've checked their certifications. Their profile then shows a verified badge.

Use `rejected` or `hidden` to keep a profile off the site. `admin_notes` is private to your team.

### Enquiries

Golfer enquiries land in `coach_enquiries`, linked to the coach by `coach_id`. Forward them to the coach and set `status` to `forwarded` or `closed`.

### What visitors can and can't see

Visitors can submit sign-ups and enquiries, and read the public fields of approved coaches. They can never read email, phone, consent, notes, pending profiles or enquiries. Row-level security and column grants enforce this in `supabase/coach-directory.sql`.

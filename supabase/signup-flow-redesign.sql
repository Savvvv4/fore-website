-- Fore! sign-up flow redesign — November 2026
-- Run after supabase-schema.sql and supabase/coach-directory.sql.
create table if not exists public.signup_leads (
 id uuid primary key default gen_random_uuid(),
 first_name text not null check (char_length(first_name) between 1 and 80),
 last_name text check (last_name is null or char_length(last_name) <= 80),
 email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
 whatsapp text not null unique check (whatsapp ~ '^\+[1-9][0-9]{6,14}$'),
 city text not null check (char_length(city) between 1 and 100),
 signup_type text not null check (signup_type in ('golfer','coach','facility')),
 details jsonb not null default '{}'::jsonb check (jsonb_typeof(details)='object'),
 source_page text not null, utm_source text, utm_medium text, utm_campaign text, utm_term text, utm_content text,
 consent boolean not null check (consent), created_at timestamptz not null default now()
);
create index if not exists signup_leads_created_at_idx on public.signup_leads(created_at desc);
create index if not exists signup_leads_type_idx on public.signup_leads(signup_type,created_at desc);
alter table public.signup_leads enable row level security;
drop policy if exists "Website can submit sign-up leads" on public.signup_leads;
create policy "Website can submit sign-up leads" on public.signup_leads for insert to anon,authenticated with check(consent=true);
revoke all on public.signup_leads from anon,authenticated;
grant insert(first_name,last_name,email,whatsapp,city,signup_type,details,source_page,utm_source,utm_medium,utm_campaign,utm_term,utm_content,consent) on public.signup_leads to anon,authenticated;

alter table public.coach_profiles drop constraint if exists coach_profiles_phone_check;
alter table public.coach_profiles drop constraint if exists coach_profiles_phone_e164_check;
alter table public.coach_profiles add constraint coach_profiles_phone_e164_check check(phone ~ '^\+[1-9][0-9]{6,14}$');
alter table public.coach_profiles add column if not exists coach_goal text;
alter table public.coach_profiles add column if not exists call_time text;
grant insert(coach_goal,call_time) on public.coach_profiles to anon,authenticated;

-- Reserved profiles stay private until the Fore team verifies them for launch.
create or replace function public.coach_profiles_before_insert()
returns trigger language plpgsql as $$
declare base text;
begin
 if current_user in ('anon','authenticated') then
  new.status := 'pending'; new.verified := false; new.founding_coach := true;
  new.admin_notes := null; new.approved_at := null; new.created_at := now(); new.slug := null;
 end if;
 new.email := lower(trim(new.email));
 if new.slug is null then
  base := lower(concat_ws('-',new.first_name,new.last_name,new.city));
  base := regexp_replace(base,'[^a-z0-9]+','-','g'); base := trim(both '-' from base);
  if base='' then base := 'coach'; end if;
  new.slug := left(base,60)||'-'||substr(md5(random()::text||clock_timestamp()::text),1,4);
 end if;
 new.updated_at := now(); return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- ForeSports coach sign-ups, public coach directory and enquiries
--
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again; it only creates what is missing and resets policies.
--
-- How it works
-- • /coaches/join (and /coaches/teaching/join, /coaches/performance/join) insert a row
--   into coach_profiles with status 'pending' and a coach_type of 'teaching' or 'performance'.
-- • Sign-ups are approved automatically and appear on /coaches/directory (Find a coach)
--   straight away. Set status to 'hidden' or 'rejected' to take one down.
-- • Each phone number can sign up once.
-- • Email, phone, consent and admin notes are never readable by visitors.
-- • Golfer enquiries from a coach's profile land in coach_enquiries.
-- • Profile photos go to the public 'coach-photos' storage bucket.
-- ─────────────────────────────────────────────────────────────────────

-- 1. Coach profiles ----------------------------------------------------

create table if not exists public.coach_profiles (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected', 'hidden')),
  verified        boolean not null default false,
  founding_coach  boolean not null default true,

  first_name      text not null check (char_length(first_name) between 1 and 60),
  last_name       text not null check (char_length(last_name) between 1 and 60),
  email           text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text not null check (phone ~ '^\+91[0-9]{10}$'),
  city            text not null check (char_length(city) between 1 and 80),
  venue           text check (char_length(venue) <= 120),
  years_coaching  integer not null check (years_coaching between 0 and 60),
  playing_level   text check (char_length(playing_level) <= 80),
  bio             text check (char_length(bio) <= 800),
  photo_path      text check (char_length(photo_path) <= 200),

  specialties     text[] not null default '{}' check (cardinality(specialties) between 1 and 20),
  certifications  text[] not null default '{}' check (cardinality(certifications) <= 20),
  packages        jsonb  not null default '[]'::jsonb
                  check (jsonb_typeof(packages) = 'array' and jsonb_array_length(packages) <= 6),
  formats         text[] not null default '{}' check (cardinality(formats) between 1 and 10),
  days            text[] not null default '{}' check (cardinality(days) <= 7),
  start_time      text check (start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  end_time        text check (end_time ~ '^[0-2][0-9]:[0-5][0-9]$'),

  heard_from      text check (char_length(heard_from) <= 80),
  consent         boolean not null check (consent),
  source          text not null default 'coach_signup' check (char_length(source) <= 40),
  admin_notes     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  approved_at     timestamptz
);

-- Added with the two coach funnels. Existing rows become teaching pros.
alter table public.coach_profiles add column if not exists coach_type text not null default 'teaching';
alter table public.coach_profiles add column if not exists languages text[] not null default '{}';
alter table public.coach_profiles add column if not exists tools text[] not null default '{}';
alter table public.coach_profiles add column if not exists program_name text;
alter table public.coach_profiles add column if not exists program_role text;
alter table public.coach_profiles add column if not exists squad_size integer;
alter table public.coach_profiles add column if not exists player_groups text[] not null default '{}';
alter table public.coach_profiles add column if not exists disciplines text[] not null default '{}';
alter table public.coach_profiles add column if not exists priorities text[] not null default '{}';

alter table public.coach_profiles drop constraint if exists coach_profiles_funnel_fields_check;
alter table public.coach_profiles add constraint coach_profiles_funnel_fields_check check (
  coach_type in ('teaching', 'performance')
  and cardinality(languages) <= 10
  and cardinality(tools) <= 20
  and char_length(coalesce(program_name, '')) <= 120
  and char_length(coalesce(program_role, '')) <= 80
  and (squad_size is null or squad_size between 0 and 2000)
  and cardinality(player_groups) <= 10
  and cardinality(disciplines) <= 10
  and cardinality(priorities) <= 10
);

create index if not exists coach_profiles_type_idx on public.coach_profiles (coach_type, status);

create unique index if not exists coach_profiles_email_key on public.coach_profiles (lower(email));

-- One sign-up per phone number. Skipped (with a notice) if duplicates already exist;
-- set the extra rows to 'rejected' or delete them, then run this file again.
do $$
begin
  if exists (select 1 from public.coach_profiles group by phone having count(*) > 1) then
    raise notice 'Some phone numbers have more than one coach profile. Remove the duplicates and run this file again to enforce one sign-up per phone.';
  else
    create unique index if not exists coach_profiles_phone_key on public.coach_profiles (phone);
  end if;
end $$;

-- Sign-ups waiting from before auto-approval go live too.
update public.coach_profiles set status = 'approved', approved_at = coalesce(approved_at, now()) where status = 'pending';
create index if not exists coach_profiles_status_idx on public.coach_profiles (status, approved_at desc);

-- Sign-ups from the website are approved straight away, start unverified, and get a URL slug.
create or replace function public.coach_profiles_before_insert()
returns trigger
language plpgsql
as $$
declare
  base text;
begin
  if current_user in ('anon', 'authenticated') then
    new.status := 'approved';
    new.verified := false;
    new.founding_coach := true;
    new.admin_notes := null;
    new.approved_at := now();
    new.created_at := now();
    new.slug := null;
  end if;

  new.email := lower(trim(new.email));

  if new.slug is null then
    base := lower(concat_ws('-', new.first_name, new.last_name, new.city));
    base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
    base := trim(both '-' from base);
    if base = '' then base := 'coach'; end if;
    new.slug := left(base, 60) || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 4);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.coach_profiles_before_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'approved' and old.status is distinct from 'approved' and new.approved_at is null then
    new.approved_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists coach_profiles_before_insert on public.coach_profiles;
create trigger coach_profiles_before_insert
  before insert on public.coach_profiles
  for each row execute function public.coach_profiles_before_insert();

drop trigger if exists coach_profiles_before_update on public.coach_profiles;
create trigger coach_profiles_before_update
  before update on public.coach_profiles
  for each row execute function public.coach_profiles_before_update();

alter table public.coach_profiles enable row level security;

drop policy if exists "Website can submit coach sign-ups" on public.coach_profiles;
create policy "Website can submit coach sign-ups"
  on public.coach_profiles for insert
  to anon, authenticated
  with check (consent);

drop policy if exists "Visitors can read approved coaches" on public.coach_profiles;
create policy "Visitors can read approved coaches"
  on public.coach_profiles for select
  to anon, authenticated
  using (status = 'approved');

-- Column-level access: visitors may write only the sign-up fields and read only the public ones.
revoke all on public.coach_profiles from anon, authenticated;

grant insert (
  first_name, last_name, email, phone, city, venue, years_coaching, playing_level, bio,
  photo_path, specialties, certifications, packages, formats, days, start_time, end_time,
  heard_from, consent, source, coach_type, languages, tools, program_name, program_role,
  squad_size, player_groups, disciplines, priorities
) on public.coach_profiles to anon, authenticated;

grant select (
  id, slug, verified, founding_coach, first_name, last_name, city, venue, years_coaching,
  playing_level, bio, photo_path, specialties, certifications, packages, formats, days,
  start_time, end_time, approved_at, coach_type, languages, tools, program_name,
  program_role, player_groups
) on public.coach_profiles to anon, authenticated;

-- 2. Enquiries from golfers --------------------------------------------

create table if not exists public.coach_enquiries (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references public.coach_profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  email       text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       text check (char_length(phone) <= 20),
  message     text not null check (char_length(message) between 1 and 1500),
  status      text not null default 'new' check (status in ('new', 'forwarded', 'closed')),
  created_at  timestamptz not null default now()
);

create index if not exists coach_enquiries_coach_idx on public.coach_enquiries (coach_id, created_at desc);

alter table public.coach_enquiries enable row level security;

-- The subquery runs as the visitor, so it only finds approved coaches.
drop policy if exists "Visitors can enquire about approved coaches" on public.coach_enquiries;
create policy "Visitors can enquire about approved coaches"
  on public.coach_enquiries for insert
  to anon, authenticated
  with check (exists (select 1 from public.coach_profiles c where c.id = coach_id));

revoke all on public.coach_enquiries from anon, authenticated;
grant insert (coach_id, name, email, phone, message) on public.coach_enquiries to anon, authenticated;

-- 3. Profile photos ------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coach-photos', 'coach-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Website can upload coach photos" on storage.objects;
create policy "Website can upload coach photos"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'coach-photos'
    and (storage.foldername(name))[1] = 'signups'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );

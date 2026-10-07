-- Run this once in Supabase: SQL Editor → New query → paste → Run.
-- Safe to run again.

create table if not exists public.dreams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 24),
  cg          text not null,            -- e.g. LE1, LE3, LE5, LE7
  dream       text not null check (char_length(dream) between 1 and 600),
  icon        text not null default 'hope',
  look        jsonb not null,            -- the pixel character's options (no photo)
  cheers      integer not null default 0, -- "me too" taps
  edit_hash   text not null,             -- lets each dreamer edit their own dream
  created_at  timestamptz not null default now()
);

-- If you ran an older version of this file, this adds the CG column.
alter table public.dreams add column if not exists cg text not null default '';

-- Counts AI selfie reads so a shared link can't run up your bill.
create table if not exists public.selfie_log (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now()
);

-- Adds one "me too" to a dream and returns the new total.
create or replace function public.cheer_dream(dream_id uuid)
returns integer language sql security definer set search_path = public as $$
  update public.dreams set cheers = cheers + 1 where id = dream_id returning cheers;
$$;
revoke execute on function public.cheer_dream(uuid) from public, anon, authenticated;
grant execute on function public.cheer_dream(uuid) to service_role;

-- Lock the tables: with RLS on and no policies, only the server
-- (secret key, kept in Vercel) can read or write them.
alter table public.dreams     enable row level security;
alter table public.selfie_log enable row level security;

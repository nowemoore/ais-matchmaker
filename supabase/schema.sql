-- ============================================================
-- Effective Matching – Supabase Schema
-- Run this in the Supabase SQL editor to set up your project.
-- ============================================================

-- ────────────────────────────────────────
-- 1. profiles  (public, readable by all authenticated users)
-- ────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read any profile (needed for matching)
create policy "profiles: anyone can read"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Users can only insert/update their own profile
create policy "profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────
-- 2. quiz_responses  (private per user)
-- ────────────────────────────────────────
-- Each row stores one completed quiz attempt with tag weights as a jsonb vector.
-- tag_vector example: { "ai_safety": 0.9, "mentorship": 0.4, "biorisk": 0.1, ... }
create table if not exists public.quiz_responses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  answers      jsonb not null,   -- raw question→answer map
  tag_vector   jsonb not null,   -- aggregated weighted tag scores
  completed_at timestamptz default now()
);

alter table public.quiz_responses enable row level security;

-- Users can only see their own responses
create policy "quiz_responses: owner can read"
  on public.quiz_responses for select
  using (auth.uid() = user_id);

create policy "quiz_responses: owner can insert"
  on public.quiz_responses for insert
  with check (auth.uid() = user_id);

create policy "quiz_responses: owner can update"
  on public.quiz_responses for update
  using (auth.uid() = user_id);

-- The match API (server-side with service_role key) needs to read all responses.
-- If you use a service_role key in the API route, RLS is bypassed.
-- Alternatively, create a security-definer function for matching (see below).


-- ────────────────────────────────────────
-- 3. Helper function: get_all_tag_vectors
--    Called by the /api/match route with the service role.
--    Returns every user's latest quiz tag_vector for cosine similarity.
-- ────────────────────────────────────────
create or replace function public.get_all_tag_vectors()
returns table (user_id uuid, tag_vector jsonb)
language sql security definer set search_path = public as $$
  select distinct on (user_id)
    user_id,
    tag_vector
  from public.quiz_responses
  order by user_id, completed_at desc;
$$;

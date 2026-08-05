-- ============================================================
-- JobVerse — Supabase database schema
-- Run this in the Supabase SQL Editor for project:
--   https://dzfpymaahnavhldjmsyw.supabase.co
-- Fully idempotent — safe to re-run any number of times.
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles table
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade not null primary key,
  name text,
  email text,
  role text not null default 'student' check (role in ('student', 'recruiter')),
  onboarded boolean not null default false,
  phone text,
  college text,
  avatar text,
  created_at timestamptz not null default now()
);

-- Migration for installs created before the onboarded column existed
alter table public.profiles add column if not exists onboarded boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "profiles_view_own" on public.profiles;
create policy "profiles_view_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can create their own profile row
-- (needed for client-side upsert fallback if the signup trigger is missing)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Users can update their own profile
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Recruiters may view the profiles of candidates who applied to their jobs
-- (needed so the recruiter dashboard / applicants list can show candidate name/college)
drop policy if exists "profiles_view_candidate" on public.profiles;
create policy "profiles_view_candidate"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.student_id = profiles.id
        and j.recruiter_id = auth.uid()
    )
  );

-- Auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sync profile email when the auth user's email changes
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_email_update();

-- ------------------------------------------------------------
-- 2. jobs table
-- ------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  company_logo text,
  location text not null,
  salary text,
  salary_min integer,
  salary_max integer,
  description text not null,
  skills jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  recruiter_id uuid references auth.users (id) on delete cascade,
  type text check (type in ('full-time', 'internship', 'part-time', 'contract')),
  category text,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

-- Any authenticated user can browse jobs
drop policy if exists "jobs_view_all" on public.jobs;
create policy "jobs_view_all"
  on public.jobs
  for select
  to authenticated
  using (true);

-- Jobs can be posted by a recruiter (owned by them) or as a community
-- listing with recruiter_id = null (used to seed the demo jobs).
drop policy if exists "jobs_insert" on public.jobs;
create policy "jobs_insert"
  on public.jobs
  for insert
  to authenticated
  with check (
    recruiter_id is null
    or (
      auth.uid() = recruiter_id
      and exists (select 1 from public.profiles where id = auth.uid() and role = 'recruiter')
    )
  );

-- Only the owner recruiter can update / delete
drop policy if exists "jobs_update_owner" on public.jobs;
create policy "jobs_update_owner"
  on public.jobs
  for update
  to authenticated
  using (auth.uid() = recruiter_id)
  with check (auth.uid() = recruiter_id);

drop policy if exists "jobs_delete_owner" on public.jobs;
create policy "jobs_delete_owner"
  on public.jobs
  for delete
  to authenticated
  using (auth.uid() = recruiter_id);

-- ------------------------------------------------------------
-- 3. resumes table
-- ------------------------------------------------------------
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users (id) on delete cascade not null,
  resume_type text not null check (resume_type in ('uploaded', 'ai_generated')),
  resume_url text,
  file_name text,
  content text,
  created_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

-- Students can view / insert / update / delete their own resumes
drop policy if exists "resumes_view_own" on public.resumes;
create policy "resumes_view_own"
  on public.resumes
  for select
  to authenticated
  using (auth.uid() = student_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own"
  on public.resumes
  for insert
  to authenticated
  with check (auth.uid() = student_id);

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own"
  on public.resumes
  for update
  to authenticated
  using (auth.uid() = student_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own"
  on public.resumes
  for delete
  to authenticated
  using (auth.uid() = student_id);

-- ------------------------------------------------------------
-- 4. applications table
-- ------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users (id) on delete cascade not null,
  job_id uuid references public.jobs (id) on delete cascade not null,
  resume_id uuid references public.resumes (id) on delete set null,
  status text not null default 'applied'
    check (status in ('applied', 'reviewing', 'interview', 'attended', 'accepted', 'rejected')),
  note text,
  interview_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, job_id)
);

-- Migrations for installs created before these columns existed
alter table public.applications add column if not exists note text;
alter table public.applications add column if not exists interview_at timestamptz;
alter table public.applications add column if not exists updated_at timestamptz not null default now();

-- Migration: allow the 'attended' status
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('applied', 'reviewing', 'interview', 'attended', 'accepted', 'rejected'));

alter table public.applications enable row level security;

-- Students see their own applications; recruiters see applications to their jobs
drop policy if exists "applications_view" on public.applications;
create policy "applications_view"
  on public.applications
  for select
  to authenticated
  using (
    auth.uid() = student_id
    or job_id in (select id from public.jobs where recruiter_id = auth.uid())
  );

-- Students apply with themselves as the applicant
drop policy if exists "applications_insert_student" on public.applications;
create policy "applications_insert_student"
  on public.applications
  for insert
  to authenticated
  with check (auth.uid() = student_id);

-- Recruiters (and students) can update the application they have access to
drop policy if exists "applications_update" on public.applications;
create policy "applications_update"
  on public.applications
  for update
  to authenticated
  using (
    auth.uid() = student_id
    or job_id in (select id from public.jobs where recruiter_id = auth.uid())
  )
  with check (
    auth.uid() = student_id
    or job_id in (select id from public.jobs where recruiter_id = auth.uid())
  );

-- ------------------------------------------------------------
-- 5. Storage: resumes bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

drop policy if exists "resumes_storage_all_own" on storage.objects;
create policy "resumes_storage_all_own"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

-- Recruiters may view resumes of students who applied to their jobs
drop policy if exists "resumes_view_applicant" on public.resumes;
create policy "resumes_view_applicant"
  on public.resumes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.student_id = resumes.student_id
        and j.recruiter_id = auth.uid()
    )
  );

-- Recruiters may view resumes stored in the resumes bucket for their applicants
drop policy if exists "resumes_storage_view_applicant" on storage.objects;
create policy "resumes_storage_view_applicant"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.student_id::text = (storage.foldername(name))[1]
        and j.recruiter_id = auth.uid()
    )
  );

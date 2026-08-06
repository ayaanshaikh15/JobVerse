-- JobVerse — Saved jobs persisted per student account
-- Run this in the Supabase SQL Editor for project:
--   https://dzfpymaahnavhldjmsyw.supabase.co
-- Fully idempotent — safe to re-run any number of times.

-- Saves are account-level (sync across devices), unlike the old
-- localStorage-only bookmarks.
create table if not exists public.saved_jobs (
  student_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, job_id)
);

alter table public.saved_jobs enable row level security;

-- Students can view their own saved jobs
drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own"
  on public.saved_jobs
  for select
  to authenticated
  using (auth.uid() = student_id);

-- Students save jobs as themselves
drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own"
  on public.saved_jobs
  for insert
  to authenticated
  with check (auth.uid() = student_id);

-- Students can unsave their own jobs
drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own"
  on public.saved_jobs
  for delete
  to authenticated
  using (auth.uid() = student_id);

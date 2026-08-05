-- JobVerse — Admin Panel
-- Run this in the Supabase SQL Editor for project:
--   https://dzfpymaahnavhldjmsyw.supabase.co
-- Fully idempotent — safe to re-run any number of times.

-- ------------------------------------------------------------
-- 1. profiles: recruiter approval status + website + admin role
-- ------------------------------------------------------------

-- Recruiter lifecycle: pending -> approved / rejected.
-- Every new recruiter starts as 'pending'; admins approve or reject them.
alter table public.profiles add column if not exists status text not null default 'pending'
  check (status in ('pending', 'approved', 'rejected'));

-- Recruiter website (shown in the admin panel)
alter table public.profiles add column if not exists website text;

-- Extend the role check to allow admins
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('student', 'recruiter', 'admin'));

-- Recruiters who existed before the approval system was introduced are
-- implicitly approved so nothing breaks.
update public.profiles set status = 'approved' where role = 'recruiter';

-- ------------------------------------------------------------
-- 2. is_admin() helper
-- security definer so the profiles query bypasses RLS (avoids recursion
-- inside the profiles RLS policies that reference it).
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ------------------------------------------------------------
-- 3. Admin RLS policies on profiles
-- ------------------------------------------------------------

-- Admins can view all profiles
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- Admins can update any profile (approve / reject recruiters)
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete any profile (delete a student account)
drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 4. Only APPROVED recruiters can post jobs
--    (community listings with recruiter_id = null stay allowed)
-- ------------------------------------------------------------
drop policy if exists "jobs_insert" on public.jobs;
create policy "jobs_insert"
  on public.jobs
  for insert
  to authenticated
  with check (
    recruiter_id is null
    or (
      auth.uid() = recruiter_id
      and exists (
        select 1 from public.profiles
        where id = auth.uid()
          and role = 'recruiter'
          and status = 'approved'
      )
    )
  );

-- Admins can delete any job
drop policy if exists "jobs_admin_delete" on public.jobs;
create policy "jobs_admin_delete"
  on public.jobs
  for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 5. Admin can view all applications
-- ------------------------------------------------------------
drop policy if exists "applications_admin_select" on public.applications;
create policy "applications_admin_select"
  on public.applications
  for select
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 6. Provisioning an admin
-- Run the following manually for the admin's email address:
--
--   insert into public.profiles (id, name, email, role, status, onboarded)
--   select id, split_part(email, '@', 1), email, 'admin', 'approved', true
--   from auth.users
--   where email = 'admin@example.com'
--   on conflict (id) do nothing;
-- ------------------------------------------------------------

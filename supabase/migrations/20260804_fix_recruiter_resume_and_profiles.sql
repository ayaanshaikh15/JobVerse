-- Fix: Allow recruiters to view student profiles for applicants
-- Run this in Supabase SQL Editor

-- 1. Recruiters can view profiles of students who applied to their jobs
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

-- 2. Recruiters can view resumes of students who applied to their jobs
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

-- 3. Recruiters can view resume files in storage for their applicants
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

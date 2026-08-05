-- JobVerse — Enforce one AI-generated resume per student
-- Run this in the Supabase SQL Editor for project:
--   https://dzfpymaahnavhldjmsyw.supabase.co
-- Fully idempotent — safe to re-run any number of times.

-- Blocks inserting a second ai_generated resume for the same student so the
-- AI Resume Builder can never be used more than once (server-side guarantee,
-- independent of any client-side checks).
create or replace function public.prevent_duplicate_ai_resume()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.resume_type = 'ai_generated'
    and exists (
      select 1
      from public.resumes
      where student_id = NEW.student_id
        and resume_type = 'ai_generated'
    )
  then
    raise exception 'You can only create one AI resume per account';
  end if;
  return NEW;
end;
$$;

drop trigger if exists prevent_duplicate_ai_resume on public.resumes;
create trigger prevent_duplicate_ai_resume
  before insert on public.resumes
  for each row execute procedure public.prevent_duplicate_ai_resume();

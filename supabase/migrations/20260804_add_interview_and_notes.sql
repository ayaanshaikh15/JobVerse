-- Add interview scheduling and recruiter notes to applications
-- Run this in Supabase SQL Editor

alter table public.applications add column if not exists note text;
alter table public.applications add column if not exists interview_at timestamptz;
alter table public.applications add column if not exists updated_at timestamptz not null default now();

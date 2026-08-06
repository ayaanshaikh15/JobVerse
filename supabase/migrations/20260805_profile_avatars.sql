-- JobVerse — Profile avatar uploads
-- Run this in the Supabase SQL Editor for project:
--   https://dzfpymaahnavhldjmsyw.supabase.co
-- Fully idempotent — safe to re-run any number of times.

-- Public avatars bucket; each user's files live under their own {user-id}/ folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Users can manage their own avatar files
drop policy if exists "avatars_storage_all_own" on storage.objects;
create policy "avatars_storage_all_own"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

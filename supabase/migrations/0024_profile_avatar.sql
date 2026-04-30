-- =========================================================
-- 0024_profile_avatar.sql
-- Profilbild fuer Mitarbeiter. Bilder leben im Storage-Bucket
-- 'avatars', in der DB nur der relative Pfad
-- (z.B. 'profile-id/timestamp.jpg').
-- =========================================================

alter table public.profiles
  add column if not exists avatar_path text;

-- =========================================================
-- Storage-Bucket "avatars" muss separat in der Supabase-Konsole
-- angelegt werden:
--
--   1. Dashboard -> Storage -> "New bucket"
--      Name: avatars
--      Public bucket: aktiviert
--
--   2. Storage -> Policies fuer Bucket "avatars":
--      INSERT/UPDATE/DELETE: bucket_id = 'avatars'
--                            AND auth.uid()::text = (storage.foldername(name))[1]
--      SELECT: bucket_id = 'avatars'
--      (oder fuer authenticated: bucket_id = 'avatars')
--
-- Beispiel-SQL fuer die Storage-Policies (Storage-Schema ist
-- bereits da, wir muessen die Policies nur ergaenzen):
-- =========================================================

drop policy if exists "avatars_own_write" on storage.objects;
create policy "avatars_own_write"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_authenticated_read" on storage.objects;
create policy "avatars_authenticated_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

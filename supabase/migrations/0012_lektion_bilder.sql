-- =============================================================
-- 0012_lektion_bilder.sql
-- Hero-Bilder für Module und Lektionen.
-- Bilder leben in Supabase Storage Bucket "lesson-images",
-- in der DB wird nur der relative Pfad gespeichert
-- (z.B. "module/UUID/1730000000.jpg").
-- =============================================================

alter table public.modules
  add column if not exists hero_image_path text;

alter table public.lessons
  add column if not exists hero_image_path text;

-- =============================================================
-- Storage-Bucket "lesson-images" muss zusaetzlich in der
-- Supabase-Konsole angelegt werden:
--
--   1. Supabase Dashboard -> Storage -> "New bucket"
--      Name: lesson-images
--      Public bucket: aktiviert (oder false + signed URLs)
--
--   2. Storage -> Policies für Bucket "lesson-images":
--      INSERT/UPDATE/DELETE: bucket_id = 'lesson-images'
--      AND public.is_admin()
--      SELECT: bucket_id = 'lesson-images' (alle authentifizierten)
--
-- Beispiel-SQL für die Storage-Policies (Storage-Schema ist
-- bereits da, wir müssen die Policies nur ergaenzen):
-- =============================================================

drop policy if exists "lesson_images_admin_write" on storage.objects;
create policy "lesson_images_admin_write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'lesson-images' and public.is_admin())
  with check (bucket_id = 'lesson-images' and public.is_admin());

drop policy if exists "lesson_images_authenticated_read" on storage.objects;
create policy "lesson_images_authenticated_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'lesson-images');

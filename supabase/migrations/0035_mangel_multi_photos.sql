-- =============================================================
-- 0035_mangel_multi_photos.sql
-- Maengel: photo_path (single) wird zu photo_paths text[] (multi).
-- Backfill bestehender Eintraege, danach alte Spalte entfernen.
-- =============================================================

alter table public.studio_issues
  add column if not exists photo_paths text[] not null default '{}';

-- Backfill: einzelnen Pfad in Array migrieren
update public.studio_issues
   set photo_paths = array[photo_path]
 where photo_path is not null
   and photo_path <> ''
   and (photo_paths is null or array_length(photo_paths, 1) is null);

alter table public.studio_issues drop column if exists photo_path;

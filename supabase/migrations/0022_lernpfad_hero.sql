-- =============================================================
-- 0022_lernpfad_hero.sql
-- Hero-Bild auch für Lernpfade (Module + Lektionen haben es seit
-- 0012). Bucket "lesson-images" wird wiederverwendet,
-- Pfad-Konvention: "path/UUID/timestamp.jpg".
-- =============================================================

alter table public.learning_paths
  add column if not exists hero_image_path text;

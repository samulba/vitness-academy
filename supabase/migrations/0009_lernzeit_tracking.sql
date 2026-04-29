-- =============================================================
-- 0009_lernzeit_tracking.sql
-- Erweitert user_lesson_progress um Zeit-Tracking, damit
-- Studioleitung sieht "Lara hat den Service-Pfad in 4 Tagen
-- geschafft" und Mitarbeiter-Dashboard "Heute aktiv" anzeigen
-- kann.
-- =============================================================

alter table public.user_lesson_progress
  add column if not exists started_at   timestamptz,
  add column if not exists last_seen_at timestamptz;

-- Index fuer "letzte Aktivitaet" Queries pro User
create index if not exists user_lesson_progress_user_lastseen_idx
  on public.user_lesson_progress (user_id, last_seen_at desc);

-- Backfill: bestehende abgeschlossene Lektionen kriegen
-- started_at = completed_at (kennen wir nicht besser).
update public.user_lesson_progress
set started_at = completed_at
where started_at is null and completed_at is not null;

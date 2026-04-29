-- =============================================================
-- 0021_mitarbeiter_archivieren.sql
-- Soft-Delete fuer Mitarbeiter: archived_at-Spalte. Login wird in
-- der App-Schicht (lib/auth.ts) abgefangen, RLS bleibt unveraendert.
-- =============================================================

alter table public.profiles
  add column if not exists archived_at timestamptz;

-- Index nur auf nicht-archivierte fuer schnelle Default-Filter.
create index if not exists profiles_active_idx
  on public.profiles (id)
  where archived_at is null;

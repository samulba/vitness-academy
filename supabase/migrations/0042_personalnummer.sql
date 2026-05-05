-- =============================================================
-- 0042_personalnummer.sql
--
-- Optional: Personalnummer pro Mitarbeiter:in. Wird im Lohn-CSV
-- ausgegeben, damit Buchhaltung den Datensatz dem richtigen
-- Mitarbeiter zuordnen kann.
-- =============================================================

alter table public.profiles
  add column if not exists personalnummer text;

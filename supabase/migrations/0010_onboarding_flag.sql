-- =============================================================
-- 0010_onboarding_flag.sql
-- Bei der ersten Anmeldung sieht der Mitarbeiter einen
-- 3-Slide-Walkthrough. Sobald er ihn abgeschlossen oder
-- uebersprungen hat, setzt das System onboarding_done = true
-- und der Wizard erscheint nicht mehr.
-- =============================================================

alter table public.profiles
  add column if not exists onboarding_done boolean not null default false;

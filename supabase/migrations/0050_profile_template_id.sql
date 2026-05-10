-- Migration 0050: profiles.template_id (Onboarding-Template-Verknuepfung)
-- ====================================================================
-- Bisher: beim Mitarbeiter-Anlegen wird ein Template ausgewählt, das
-- die Form mit Rolle + Lernpfaden vorfuellt. Aber die Auswahl wird
-- nicht gespeichert -> Template-spezifische Checklist-Items koennen
-- nicht zugeordnet werden, weil profiles keine Verbindung zum
-- Template hat.
--
-- Jetzt: profiles.template_id (nullable FK) speichert das aktive
-- Onboarding-Template. ladeChecklistFuerMitarbeiter filtert dann
-- "WHERE template_id IS NULL OR template_id = profile.template_id".
-- ====================================================================

alter table public.profiles
  add column if not exists template_id uuid
    references public.onboarding_templates(id) on delete set null;

create index if not exists profiles_template_id_idx
  on public.profiles (template_id)
  where template_id is not null;

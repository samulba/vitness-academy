-- =============================================================
-- 0044_profile_stammdaten.sql
--
-- Erweiterte Mitarbeiter-Stammdaten für die Verwaltung:
--   - geburtsdatum (für Reminder + Geburtstags-Widget im Admin)
--   - eintritt_am / austritt_am (Vertragsstart/Ende)
--   - vertragsart (Vollzeit/Teilzeit/Mini-Job/...)
--   - wochenstunden (numerisch, z.B. 38.5)
--   - tags (string[]: "Theke-Profi", "Personal Trainer", "Reha", ...)
--   - interne_notiz (Quick-Memo der Studioleitung, sichtbar nur Admin)
--
-- Echte Notizen-Threads (mehrere Einträge mit Autor + Zeitstempel)
-- kommen in Migration 0045 als eigene Tabelle.
-- =============================================================

alter table public.profiles
  add column if not exists geburtsdatum date,
  add column if not exists eintritt_am  date,
  add column if not exists austritt_am  date,
  add column if not exists vertragsart  text
    check (vertragsart is null or vertragsart in (
      'vollzeit','teilzeit','minijob','aushilfe','selbstaendig','praktikant','sonstiges'
    )),
  add column if not exists wochenstunden numeric(4,1),
  add column if not exists tags          text[] not null default '{}',
  add column if not exists interne_notiz text;

create index if not exists profiles_eintritt_idx
  on public.profiles (eintritt_am desc nulls last);

-- Geburtstag-Lookup ist tag/monat-basiert (Jahres-Zyklus). Index reicht
-- nicht für effiziente "in den nächsten 14 Tagen"-Queries -- wir
-- berechnen das im App-Layer für ~30 Mitarbeiter:innen, das ist OK.
create index if not exists profiles_geburtsdatum_idx
  on public.profiles (geburtsdatum)
  where geburtsdatum is not null;

create index if not exists profiles_tags_idx
  on public.profiles using gin (tags);

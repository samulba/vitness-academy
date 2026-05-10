-- ====================================================================
-- 0058 — Schichten: optionales Bereich-Feld für "Sonstiges"
-- ====================================================================
-- Ergaenzt eine freie Bereich-Beschreibung für Schichten ohne festen
-- Studio-Standort (z.B. "Meeting", "Homeoffice", "Schulung").
--
-- Logik im Form:
--   - Standort-Auswahl als Dropdown: alle eigenen Studios + "Sonstiges"
--   - Bei "Sonstiges": location_id = null, bereich = Freitext
--   - Bei Studio: location_id = UUID, bereich = null
-- ====================================================================

alter table public.shifts
  add column if not exists bereich text;

comment on column public.shifts.bereich is
  'Freitext-Beschreibung fuer Nicht-Studio-Schichten (z.B. Meeting, Homeoffice). '
  'Mutually exclusive mit location_id — entweder das eine oder das andere.';

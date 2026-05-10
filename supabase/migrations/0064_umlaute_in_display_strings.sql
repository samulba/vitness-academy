-- =========================================================
-- 0064_umlaute_in_display_strings.sql
--
-- DB-Seed-Texte enthalten an einigen Stellen ASCII-Umschreibungen
-- (Fuehrungskraft, für, über, ...). Konvention: in UI-Display-
-- Strings IMMER Umlaute schreiben. Diese Migration korrigiert
-- existierende Bestandsdaten.
-- =========================================================

-- roles.name + roles.beschreibung
update public.roles
   set name = 'Führungskraft'
 where id = '00000000-0000-0000-0000-000000000002'
   and name = 'Fuehrungskraft';

update public.roles
   set beschreibung = 'Standardrolle für Mitarbeiter im Studio.'
 where id = '00000000-0000-0000-0000-000000000001'
   and beschreibung = 'Standardrolle fuer Mitarbeiter im Studio.';

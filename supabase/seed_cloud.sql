-- Vitness Akademie -- Cloud-Seed
--
-- Dieses Skript NICHT lokal ausführen (lokal nutzt supabase/seed.sql).
-- Es ist für die Erstanwendung in einem Supabase-Cloud-Projekt gedacht.
--
-- Voraussetzungen, die du VORHER im Supabase-Dashboard erledigt hast:
--   1) Schema und RLS sind angewendet (Migrationen 0001_init.sql + 0002_rls.sql).
--   2) Drei Auth-User wurden im Dashboard angelegt (Authentication -> Users
--      -> "Add user" -> "Create new user", Passwort frei wählbar):
--        - mitarbeiter@example.com
--        - fuehrungskraft@example.com
--        - admin@example.com
--      Wichtig: Haken bei "Auto Confirm User" setzen, sonst können sie
--      sich nicht einloggen.
--
-- Was dieses Skript tut:
--   - legt einen Standort an
--   - setzt Rollen, Namen und Standort der drei Demo-Profile
--   - legt Lernpfad "Theke und Empfang" inkl. Module, Lektionen und
--     Inhalts-Blöcke an (UPSERT: bei erneuter Ausführung werden Texte
--     aktualisiert)
--   - weist den Lernpfad der Mitarbeiterin zu
--
-- Idempotent: kann mehrfach ausgeführt werden.

-- ----------------------------------------------------------
-- Standort
-- ----------------------------------------------------------
insert into public.locations (id, name)
values ('11111111-1111-1111-1111-111111111101', 'Studio Mitte')
on conflict (id) do update set name = excluded.name;

-- ----------------------------------------------------------
-- Rollen, Namen und Standort der drei Demo-Accounts setzen
-- (Profile wurden vom Trigger handle_new_user() bereits angelegt.)
-- Die full_name-Felder werden hier UEBERSCHRIEBEN, damit die Begrüßung
-- im Dashboard korrekt ist.
-- ----------------------------------------------------------
update public.profiles p
   set role        = 'mitarbeiter',
       full_name   = 'Lara Mitarbeiter',
       location_id = '11111111-1111-1111-1111-111111111101'
  from auth.users u
 where u.id = p.id
   and u.email = 'mitarbeiter@example.com';

update public.profiles p
   set role        = 'fuehrungskraft',
       full_name   = 'Tobias Teamlead',
       location_id = '11111111-1111-1111-1111-111111111101'
  from auth.users u
 where u.id = p.id
   and u.email = 'fuehrungskraft@example.com';

update public.profiles p
   set role        = 'admin',
       full_name   = 'Alex Admin',
       location_id = '11111111-1111-1111-1111-111111111101'
  from auth.users u
 where u.id = p.id
   and u.email = 'admin@example.com';

-- ----------------------------------------------------------
-- Lernpfad: "Theke und Empfang"
-- ----------------------------------------------------------
insert into public.learning_paths (id, title, description, status, sort_order, created_by)
select
  '33333333-3333-3333-3333-333333333301',
  'Theke und Empfang',
  'Lerne, wie du an der Theke professionell, freundlich und effizient arbeitest – vom Empfang bis zur Problemlösung.',
  'aktiv',
  1,
  u.id
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update
  set title       = excluded.title,
      description = excluded.description,
      status      = excluded.status,
      sort_order  = excluded.sort_order;

-- Module
insert into public.modules (id, learning_path_id, title, description, sort_order)
values
  ('44444444-4444-4444-4444-444444444401',
   '33333333-3333-3333-3333-333333333301',
   'Grundverhalten am Empfang',
   'Wie du Mitglieder begrüßt und einen guten ersten Eindruck schaffst.',
   1),
  ('44444444-4444-4444-4444-444444444402',
   '33333333-3333-3333-3333-333333333301',
   'Check-in und Check-out',
   'Ablauf, Sonderfälle und häufige Fehlerquellen.',
   2),
  ('44444444-4444-4444-4444-444444444403',
   '33333333-3333-3333-3333-333333333301',
   'Häufige Kundenfragen',
   'Standardantworten auf die Top 10 Fragen am Empfang.',
   3),
  ('44444444-4444-4444-4444-444444444404',
   '33333333-3333-3333-3333-333333333301',
   'Problemlösung an der Theke',
   'Beschwerden professionell aufnehmen und lösen.',
   4)
on conflict (id) do update
  set title       = excluded.title,
      description = excluded.description,
      sort_order  = excluded.sort_order;

-- Lektionen
insert into public.lessons (id, module_id, title, summary, sort_order)
values
  ('55555555-5555-5555-5555-555555555501',
   '44444444-4444-4444-4444-444444444401',
   'Begrüßung am Empfang',
   'Wie du Mitglieder aktiv und freundlich begrüßt.', 1),
  ('55555555-5555-5555-5555-555555555502',
   '44444444-4444-4444-4444-444444444401',
   'Körpersprache und Tonfall',
   'Worauf du in den ersten Sekunden achtest.', 2),
  ('55555555-5555-5555-5555-555555555503',
   '44444444-4444-4444-4444-444444444402',
   'Standard Check-in',
   'Schritt-für-Schritt-Ablauf des regulären Check-ins.', 1),
  ('55555555-5555-5555-5555-555555555504',
   '44444444-4444-4444-4444-444444444402',
   'Mitgliedskarte funktioniert nicht',
   'Was zu tun ist, wenn der Check-in scheitert.', 2),
  ('55555555-5555-5555-5555-555555555505',
   '44444444-4444-4444-4444-444444444403',
   'Top-Fragen und -Antworten',
   'Kurze, freundliche Standardantworten.', 1),
  ('55555555-5555-5555-5555-555555555506',
   '44444444-4444-4444-4444-444444444404',
   'Beschwerden professionell aufnehmen',
   'Mit Empathie und Struktur zur Lösung.', 1)
on conflict (id) do update
  set title      = excluded.title,
      summary    = excluded.summary,
      sort_order = excluded.sort_order;

-- Inhaltsblöcke für "Begrüßung am Empfang"
insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  ('66666666-6666-6666-6666-666666666601',
   '55555555-5555-5555-5555-555555555501',
   'text',
   '{"markdown":"## Warum die Begrüßung so wichtig ist\n\nJedes Mitglied wird **aktiv, freundlich und mit Blickkontakt** begrüßt. Ziel ist, dass sich jeder Kunde sofort willkommen fühlt.\n\nDie ersten 10 Sekunden entscheiden über das Erlebnis im Studio. Eine herzliche Begrüßung ist deine wichtigste Aufgabe an der Theke."}'::jsonb,
   1),
  ('66666666-6666-6666-6666-666666666602',
   '55555555-5555-5555-5555-555555555501',
   'checkliste',
   '{"items":["Blickkontakt aufnehmen, sobald das Mitglied im Eingangsbereich ist","Aktiv und mit Vornamen begrüßen, wenn möglich","Lächeln, auch wenn du gerade telefonierst","Kurze Pause am Bildschirm, dem Mitglied volle Aufmerksamkeit geben","Bei Störung freundlich um einen Moment bitten"]}'::jsonb,
   2),
  ('66666666-6666-6666-6666-666666666603',
   '55555555-5555-5555-5555-555555555501',
   'hinweis',
   '{"variant":"info","markdown":"**Tipp:** Auch wenn die Theke voll ist, lieber kurz mit einem Lächeln nicken als ignorieren. Das Mitglied weiß dann: ich werde gleich bedient."}'::jsonb,
   3)
on conflict (id) do update
  set block_type = excluded.block_type,
      content    = excluded.content,
      sort_order = excluded.sort_order;

-- Inhaltsblöcke für "Standard Check-in"
insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  ('66666666-6666-6666-6666-666666666604',
   '55555555-5555-5555-5555-555555555503',
   'text',
   '{"markdown":"## Ablauf Standard Check-in\n\n1. Mitglied begrüßen\n2. Mitgliedskarte einscannen\n3. Auf grünes Signal warten\n4. Freundlich verabschieden, Trainingserfolg wünschen"}'::jsonb,
   1),
  ('66666666-6666-6666-6666-666666666605',
   '55555555-5555-5555-5555-555555555503',
   'checkliste',
   '{"items":["Theke ist aufgeräumt und einsehbar","Scanner liegt griffbereit","Bildschirm zeigt Check-in-Maske"]}'::jsonb,
   2)
on conflict (id) do update
  set block_type = excluded.block_type,
      content    = excluded.content,
      sort_order = excluded.sort_order;

-- Lernpfad-Zuweisung an die Demo-Mitarbeiterin
insert into public.user_learning_path_assignments (user_id, learning_path_id, assigned_by)
select
  m.id,
  '33333333-3333-3333-3333-333333333301',
  a.id
from auth.users m
cross join auth.users a
where m.email = 'mitarbeiter@example.com'
  and a.email = 'admin@example.com'
on conflict (user_id, learning_path_id) do nothing;

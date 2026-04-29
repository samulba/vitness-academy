-- =============================================================
-- seed_kapitel_4.sql
-- Bringt die Lernpfad-Struktur auf die finalen 4 Kapitel:
--   01 Service          (vorher "Theke und Empfang", umbenannt)
--   02 Magicline        (NEU)
--   03 Rehabilitationssport  (NEU)
--   04 Trainer          (NEU)
--
-- Pro neuem Pfad wird ausserdem 1 Starter-Modul + 1 Placeholder-
-- Lektion angelegt, damit die UI-Counters realistisch sind.
-- Demo-Mitarbeiterin (mitarbeiter@example.com) bekommt alle drei
-- neuen Pfade automatisch zugewiesen.
--
-- Idempotent via on conflict do update -- das SQL kann
-- mehrfach ausgefuehrt werden ohne Schaden.
-- =============================================================

-- 1) Bestehenden Pfad umbenennen
update public.learning_paths
set
  title       = 'Service',
  description = 'Service am Mitglied — Empfang, Theke, Beratung. Wie wir Kund:innen begegnen, vom ersten Hallo bis zur Beschwerde.'
where id = '33333333-3333-3333-3333-333333333301';

-- 2) Drei neue Lernpfade
insert into public.learning_paths (id, title, description, status, sort_order)
values
  ('33333333-3333-3333-3333-333333333302',
   'Magicline',
   'Das Studio-System verstehen — Check-in, Mitgliederverwaltung, Beiträge, Auswertungen.',
   'aktiv', 2),
  ('33333333-3333-3333-3333-333333333303',
   'Rehabilitationssport',
   'Reha-Anfragen aufnehmen, Verordnungen, Ablauf der Therapie. Wann verweisen wir an wen?',
   'aktiv', 3),
  ('33333333-3333-3333-3333-333333333304',
   'Trainer',
   'Trainingsfläche, Geräteeinweisung, Sicherheit, Mitglieder professionell begleiten.',
   'aktiv', 4)
on conflict (id) do update
  set title       = excluded.title,
      description = excluded.description,
      sort_order  = excluded.sort_order,
      status      = excluded.status;

-- 3) Je ein Starter-Modul pro neuem Pfad
insert into public.modules (id, learning_path_id, title, description, sort_order)
values
  -- Magicline
  ('44444444-4444-4444-4444-444444444020',
   '33333333-3333-3333-3333-333333333302',
   'Magicline-Grundlagen',
   'Login, Navigation, Hauptbereiche — die Basics, mit denen alles andere funktioniert.',
   1),
  -- Reha
  ('44444444-4444-4444-4444-444444444030',
   '33333333-3333-3333-3333-333333333303',
   'Reha-Grundlagen',
   'Was ist Reha-Sport? Wer kommt zu uns? Was müssen wir wissen?',
   1),
  -- Trainer
  ('44444444-4444-4444-4444-444444444040',
   '33333333-3333-3333-3333-333333333304',
   'Trainings-Grundlagen',
   'Wie wir Mitglieder auf der Fläche professionell begleiten.',
   1)
on conflict (id) do update
  set title       = excluded.title,
      description = excluded.description,
      sort_order  = excluded.sort_order;

-- 4) Je eine Placeholder-Lektion pro Modul
insert into public.lessons (id, module_id, title, summary, sort_order)
values
  ('55555555-5555-5555-5555-555555555520',
   '44444444-4444-4444-4444-444444444020',
   'Willkommen in Magicline',
   'Erster Login, was du siehst, wo du klickst.',
   1),
  ('55555555-5555-5555-5555-555555555530',
   '44444444-4444-4444-4444-444444444030',
   'Was ist Reha-Sport?',
   'Definition, Zielgruppe, Abgrenzung zur Prävention.',
   1),
  ('55555555-5555-5555-5555-555555555540',
   '44444444-4444-4444-4444-444444444040',
   'Mitglied auf der Fläche begleiten',
   'Wann du ansprichst, wann du Raum lässt.',
   1)
on conflict (id) do update
  set title      = excluded.title,
      summary    = excluded.summary,
      sort_order = excluded.sort_order;

-- 5) Pro Lektion einen kleinen Markdown-Block, damit die Lektion nicht leer ist
insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  ('66666666-6666-6666-6666-666666666620',
   '55555555-5555-5555-5555-555555555520',
   'text',
   '{"markdown":"## Willkommen in Magicline\n\nIn diesem Pfad lernst du, wie du das Studio-System sicher bedienst — vom Check-in bis zur Beitragsverwaltung. Inhalte folgen Schritt für Schritt."}'::jsonb,
   1),
  ('66666666-6666-6666-6666-666666666630',
   '55555555-5555-5555-5555-555555555530',
   'text',
   '{"markdown":"## Reha-Sport bei Vitness\n\nReha-Sport ist Bewegungstraining für Menschen mit Verordnung. Hier lernst du, wie du Anfragen aufnimmst und wann du an unsere Therapeut:innen verweist."}'::jsonb,
   1),
  ('66666666-6666-6666-6666-666666666640',
   '55555555-5555-5555-5555-555555555540',
   'text',
   '{"markdown":"## Auf der Trainingsfläche\n\nUnsere Trainer:innen sind Ansprechpartner:innen für Sicherheit, Geräteeinweisung und Motivation. In diesem Pfad lernst du, wann und wie du aktiv wirst."}'::jsonb,
   1)
on conflict (id) do update
  set block_type = excluded.block_type,
      content    = excluded.content,
      sort_order = excluded.sort_order;

-- 6) Demo-Mitarbeiterin bekommt die drei neuen Pfade zugewiesen
insert into public.user_learning_path_assignments (user_id, learning_path_id, assigned_by)
select
  m.id,
  lp.id,
  a.id
from auth.users m
cross join (values
  ('33333333-3333-3333-3333-333333333302'::uuid),
  ('33333333-3333-3333-3333-333333333303'::uuid),
  ('33333333-3333-3333-3333-333333333304'::uuid)
) as lp(id)
cross join auth.users a
where m.email = 'mitarbeiter@example.com'
  and a.email = 'admin@example.com'
on conflict (user_id, learning_path_id) do nothing;

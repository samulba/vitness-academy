-- Vitness Academy -- Cloud-Seed: Praxisaufgaben
--
-- Voraussetzung:
--   - Migration 0004_praxis.sql wurde angewendet
--   - seed_cloud.sql wurde ausgefuehrt (Lernpfad + Profile vorhanden)
-- Idempotent.

-- ----------------------------------------------------------
-- Praxis-Aufgaben (Vorlagen)
-- ----------------------------------------------------------
insert into public.practical_tasks (id, title, description, learning_path_id, lesson_id, status, sort_order, created_by)
select
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  'Check-in eines Mitglieds selbstständig durchführen',
  'Du führst einen kompletten Check-in selbstständig und ohne Hilfe durch. Eine Führungskraft beobachtet und gibt frei.',
  '33333333-3333-3333-3333-333333333301',
  '55555555-5555-5555-5555-555555555503',
  'aktiv',
  1,
  u.id
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update set
  title            = excluded.title,
  description      = excluded.description,
  learning_path_id = excluded.learning_path_id,
  lesson_id        = excluded.lesson_id,
  status           = excluded.status,
  sort_order       = excluded.sort_order;

insert into public.practical_tasks (id, title, description, learning_path_id, lesson_id, status, sort_order, created_by)
select
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
  'Begrüßung am Empfang im Live-Betrieb',
  'Du begrüßt fünf Mitglieder hintereinander aktiv und freundlich. Eine Führungskraft beobachtet und gibt Feedback.',
  '33333333-3333-3333-3333-333333333301',
  '55555555-5555-5555-5555-555555555501',
  'aktiv',
  2,
  u.id
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update set
  title            = excluded.title,
  description      = excluded.description,
  learning_path_id = excluded.learning_path_id,
  lesson_id        = excluded.lesson_id,
  status           = excluded.status,
  sort_order       = excluded.sort_order;

insert into public.practical_tasks (id, title, description, learning_path_id, lesson_id, status, sort_order, created_by)
select
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
  'Beschwerde professionell aufnehmen und lösen',
  'Du nimmst eine Beschwerde eines Mitglieds entgegen, dokumentierst sie und schlägst eine Lösung vor. Eine Führungskraft prüft.',
  '33333333-3333-3333-3333-333333333301',
  '55555555-5555-5555-5555-555555555506',
  'aktiv',
  3,
  u.id
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update set
  title            = excluded.title,
  description      = excluded.description,
  learning_path_id = excluded.learning_path_id,
  lesson_id        = excluded.lesson_id,
  status           = excluded.status,
  sort_order       = excluded.sort_order;

-- ----------------------------------------------------------
-- Initial-Status fuer die Demo-Mitarbeiterin (alles "offen")
-- ----------------------------------------------------------
insert into public.user_practical_signoffs (user_id, task_id, status)
select m.id, t.id, 'offen'
from auth.users m
cross join public.practical_tasks t
where m.email = 'mitarbeiter@example.com'
  and t.id in (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03'
  )
on conflict (user_id, task_id) do nothing;

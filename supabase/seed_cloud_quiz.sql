-- Vitness Academy -- Cloud-Seed: Beispiel-Quiz
--
-- Voraussetzung:
--   - Migration 0003_quiz.sql wurde angewendet
--   - seed_cloud.sql wurde ausgefuehrt (legt den Lernpfad "Theke und Empfang" an)
--
-- Idempotent: kann mehrfach ausgefuehrt werden.

-- ----------------------------------------------------------
-- Quiz: gehoert zur Lektion "Begrüßung am Empfang"
-- ----------------------------------------------------------
insert into public.quizzes (id, title, description, passing_score, lesson_id, status, sort_order, created_by)
select
  '77777777-7777-7777-7777-777777777701',
  'Quiz: Begrüßung am Empfang',
  'Teste dein Wissen zur richtigen Begrüßung an der Theke. Du brauchst 80%, um zu bestehen.',
  80,
  '55555555-5555-5555-5555-555555555501',
  'aktiv',
  1,
  u.id
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update set
  title         = excluded.title,
  description   = excluded.description,
  passing_score = excluded.passing_score,
  lesson_id     = excluded.lesson_id,
  status        = excluded.status,
  sort_order    = excluded.sort_order;

-- ----------------------------------------------------------
-- Fragen
-- ----------------------------------------------------------
insert into public.quiz_questions (id, quiz_id, prompt, question_type, sort_order)
values
  ('88888888-8888-8888-8888-888888888801',
   '77777777-7777-7777-7777-777777777701',
   'Was ist bei der Begrüßung am Empfang besonders wichtig?',
   'single', 1),
  ('88888888-8888-8888-8888-888888888802',
   '77777777-7777-7777-7777-777777777701',
   'Welche Verhaltensweisen gehören zu einer guten Begrüßung? (mehrere Antworten möglich)',
   'multiple', 2),
  ('88888888-8888-8888-8888-888888888803',
   '77777777-7777-7777-7777-777777777701',
   'Du telefonierst gerade und ein Mitglied kommt herein. Was tust du?',
   'single', 3)
on conflict (id) do update set
  prompt        = excluded.prompt,
  question_type = excluded.question_type,
  sort_order    = excluded.sort_order;

-- ----------------------------------------------------------
-- Optionen Frage 1 (Single Choice)
-- ----------------------------------------------------------
insert into public.quiz_options (id, question_id, label, is_correct, sort_order)
values
  ('99999999-9999-9999-9999-999999999911',
   '88888888-8888-8888-8888-888888888801',
   'Blickkontakt und aktive Begrüßung', true, 1),
  ('99999999-9999-9999-9999-999999999912',
   '88888888-8888-8888-8888-888888888801',
   'Den Kunden ignorieren, wenn viel los ist', false, 2),
  ('99999999-9999-9999-9999-999999999913',
   '88888888-8888-8888-8888-888888888801',
   'Nur Stammkunden begrüßen', false, 3),
  ('99999999-9999-9999-9999-999999999914',
   '88888888-8888-8888-8888-888888888801',
   'Erst reagieren, wenn der Kunde etwas sagt', false, 4)
on conflict (id) do update set
  label      = excluded.label,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order;

-- ----------------------------------------------------------
-- Optionen Frage 2 (Multiple Choice)
-- ----------------------------------------------------------
insert into public.quiz_options (id, question_id, label, is_correct, sort_order)
values
  ('99999999-9999-9999-9999-999999999921',
   '88888888-8888-8888-8888-888888888802',
   'Lächeln und Blickkontakt aufnehmen', true, 1),
  ('99999999-9999-9999-9999-999999999922',
   '88888888-8888-8888-8888-888888888802',
   'Mitglied mit Vornamen ansprechen, wenn möglich', true, 2),
  ('99999999-9999-9999-9999-999999999923',
   '88888888-8888-8888-8888-888888888802',
   'Den Bildschirm im Auge behalten und nicht aufschauen', false, 3),
  ('99999999-9999-9999-9999-999999999924',
   '88888888-8888-8888-8888-888888888802',
   'Aktiv begrüßen, statt zu warten bis das Mitglied etwas sagt', true, 4)
on conflict (id) do update set
  label      = excluded.label,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order;

-- ----------------------------------------------------------
-- Optionen Frage 3 (Single Choice)
-- ----------------------------------------------------------
insert into public.quiz_options (id, question_id, label, is_correct, sort_order)
values
  ('99999999-9999-9999-9999-999999999931',
   '88888888-8888-8888-8888-888888888803',
   'Kurz mit einem Lächeln nicken und signalisieren: „Ich bin gleich für Sie da"', true, 1),
  ('99999999-9999-9999-9999-999999999932',
   '88888888-8888-8888-8888-888888888803',
   'Ignorieren, bis das Telefonat zu Ende ist', false, 2),
  ('99999999-9999-9999-9999-999999999933',
   '88888888-8888-8888-8888-888888888803',
   'Telefonat sofort abbrechen, ohne den Anrufer zu informieren', false, 3),
  ('99999999-9999-9999-9999-999999999934',
   '88888888-8888-8888-8888-888888888803',
   'Mit dem Telefon weitergehen und das Mitglied stehen lassen', false, 4)
on conflict (id) do update set
  label      = excluded.label,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order;

-- Vitness Akademie -- Seed-Daten für lokale Entwicklung
-- Wird automatisch von `supabase db reset` ausgeführt.
--
-- Demo-Accounts (alle Passwort: passwort123):
--   mitarbeiter@example.com    -> Rolle mitarbeiter
--   fuehrungskraft@example.com -> Rolle fuehrungskraft
--   admin@example.com          -> Rolle admin
--
-- Hinweis: wir benutzen feste UUIDs, damit das Re-Seeding deterministisch ist.

-- ----------------------------------------------------------
-- Standorte
-- ----------------------------------------------------------
insert into public.locations (id, name)
values
  ('11111111-1111-1111-1111-111111111101', 'Studio Mitte')
on conflict (id) do nothing;

-- ----------------------------------------------------------
-- Auth-User anlegen + Profile-Rolle setzen
-- ----------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  is_super_admin, is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222201',
    'authenticated', 'authenticated',
    'mitarbeiter@example.com',
    crypt('passwort123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Lara Mitarbeiter","role":"mitarbeiter"}'::jsonb,
    now(), now(),
    false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222202',
    'authenticated', 'authenticated',
    'fuehrungskraft@example.com',
    crypt('passwort123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Tobias Teamlead","role":"fuehrungskraft"}'::jsonb,
    now(), now(),
    false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222203',
    'authenticated', 'authenticated',
    'admin@example.com',
    crypt('passwort123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alex Admin","role":"admin"}'::jsonb,
    now(), now(),
    false, false
  )
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222201',
    '{"sub":"22222222-2222-2222-2222-222222222201","email":"mitarbeiter@example.com"}'::jsonb,
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222202',
    '{"sub":"22222222-2222-2222-2222-222222222202","email":"fuehrungskraft@example.com"}'::jsonb,
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222203', '22222222-2222-2222-2222-222222222203',
    '{"sub":"22222222-2222-2222-2222-222222222203","email":"admin@example.com"}'::jsonb,
    'email', now(), now(), now()
  )
on conflict do nothing;

-- Rollen am Profil korrigieren (Trigger setzt Default mitarbeiter)
update public.profiles
   set role = 'mitarbeiter',
       full_name = 'Lara Mitarbeiter',
       location_id = '11111111-1111-1111-1111-111111111101'
 where id = '22222222-2222-2222-2222-222222222201';

update public.profiles
   set role = 'fuehrungskraft',
       full_name = 'Tobias Teamlead',
       location_id = '11111111-1111-1111-1111-111111111101'
 where id = '22222222-2222-2222-2222-222222222202';

update public.profiles
   set role = 'admin',
       full_name = 'Alex Admin',
       location_id = '11111111-1111-1111-1111-111111111101'
 where id = '22222222-2222-2222-2222-222222222203';

-- ----------------------------------------------------------
-- Lernpfad: "Theke und Empfang"
-- ----------------------------------------------------------
insert into public.learning_paths (id, title, description, status, sort_order, created_by)
values (
  '33333333-3333-3333-3333-333333333301',
  'Theke und Empfang',
  'Lerne, wie du an der Theke professionell, freundlich und effizient arbeitest – vom Empfang bis zur Problemlösung.',
  'aktiv',
  1,
  '22222222-2222-2222-2222-222222222203'
)
on conflict (id) do update
  set title       = excluded.title,
      description = excluded.description;

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
      description = excluded.description;

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
      summary    = excluded.summary;

-- Inhaltsblöcke
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
   3),
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
  set content = excluded.content;

-- Lernpfad-Zuweisung an die Demo-Mitarbeiterin
insert into public.user_learning_path_assignments (user_id, learning_path_id, assigned_by)
values
  ('22222222-2222-2222-2222-222222222201',
   '33333333-3333-3333-3333-333333333301',
   '22222222-2222-2222-2222-222222222203')
on conflict (user_id, learning_path_id) do nothing;

-- ----------------------------------------------------------
-- Beispiel-Quiz zur Lektion "Begrüßung am Empfang"
-- ----------------------------------------------------------
insert into public.quizzes (id, title, description, passing_score, lesson_id, status, sort_order, created_by)
values (
  '77777777-7777-7777-7777-777777777701',
  'Quiz: Begrüßung am Empfang',
  'Teste dein Wissen zur richtigen Begrüßung an der Theke. Du brauchst 80%, um zu bestehen.',
  80,
  '55555555-5555-5555-5555-555555555501',
  'aktiv',
  1,
  '22222222-2222-2222-2222-222222222203'
)
on conflict (id) do update
  set title = excluded.title, description = excluded.description;

insert into public.quiz_questions (id, quiz_id, prompt, question_type, sort_order)
values
  ('88888888-8888-8888-8888-888888888801', '77777777-7777-7777-7777-777777777701',
   'Was ist bei der Begrüßung am Empfang besonders wichtig?', 'single', 1),
  ('88888888-8888-8888-8888-888888888802', '77777777-7777-7777-7777-777777777701',
   'Welche Verhaltensweisen gehören zu einer guten Begrüßung? (mehrere Antworten möglich)', 'multiple', 2),
  ('88888888-8888-8888-8888-888888888803', '77777777-7777-7777-7777-777777777701',
   'Du telefonierst gerade und ein Mitglied kommt herein. Was tust du?', 'single', 3)
on conflict (id) do update set prompt = excluded.prompt;

insert into public.quiz_options (id, question_id, label, is_correct, sort_order)
values
  ('99999999-9999-9999-9999-999999999911', '88888888-8888-8888-8888-888888888801', 'Blickkontakt und aktive Begrüßung', true, 1),
  ('99999999-9999-9999-9999-999999999912', '88888888-8888-8888-8888-888888888801', 'Den Kunden ignorieren, wenn viel los ist', false, 2),
  ('99999999-9999-9999-9999-999999999913', '88888888-8888-8888-8888-888888888801', 'Nur Stammkunden begrüßen', false, 3),
  ('99999999-9999-9999-9999-999999999914', '88888888-8888-8888-8888-888888888801', 'Erst reagieren, wenn der Kunde etwas sagt', false, 4),
  ('99999999-9999-9999-9999-999999999921', '88888888-8888-8888-8888-888888888802', 'Lächeln und Blickkontakt aufnehmen', true, 1),
  ('99999999-9999-9999-9999-999999999922', '88888888-8888-8888-8888-888888888802', 'Mitglied mit Vornamen ansprechen, wenn möglich', true, 2),
  ('99999999-9999-9999-9999-999999999923', '88888888-8888-8888-8888-888888888802', 'Den Bildschirm im Auge behalten und nicht aufschauen', false, 3),
  ('99999999-9999-9999-9999-999999999924', '88888888-8888-8888-8888-888888888802', 'Aktiv begrüßen, statt zu warten bis das Mitglied etwas sagt', true, 4),
  ('99999999-9999-9999-9999-999999999931', '88888888-8888-8888-8888-888888888803', 'Kurz mit einem Lächeln nicken und signalisieren: „Ich bin gleich für Sie da"', true, 1),
  ('99999999-9999-9999-9999-999999999932', '88888888-8888-8888-8888-888888888803', 'Ignorieren, bis das Telefonat zu Ende ist', false, 2),
  ('99999999-9999-9999-9999-999999999933', '88888888-8888-8888-8888-888888888803', 'Telefonat sofort abbrechen, ohne den Anrufer zu informieren', false, 3),
  ('99999999-9999-9999-9999-999999999934', '88888888-8888-8888-8888-888888888803', 'Mit dem Telefon weitergehen und das Mitglied stehen lassen', false, 4)
on conflict (id) do update set label = excluded.label, is_correct = excluded.is_correct;

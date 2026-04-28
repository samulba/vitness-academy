-- Vitness Akademie -- Seed-Daten fuer lokale Entwicklung
-- Wird automatisch von `supabase db reset` ausgefuehrt.
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
-- Wichtig: instance_id muss die Default-Instanz sein (00000000-...).
-- Das Passwort 'passwort123' wird per crypt() gehasht.

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

-- Identities sind fuer Email-Login erforderlich
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
  'Lerne, wie du an der Theke professionell, freundlich und effizient arbeitest -- vom Empfang bis zur Problemloesung.',
  'aktiv',
  1,
  '22222222-2222-2222-2222-222222222203'
)
on conflict (id) do nothing;

-- Module
insert into public.modules (id, learning_path_id, title, description, sort_order)
values
  ('44444444-4444-4444-4444-444444444401',
   '33333333-3333-3333-3333-333333333301',
   'Grundverhalten am Empfang',
   'Wie du Mitglieder begruesst und einen guten ersten Eindruck schaffst.',
   1),
  ('44444444-4444-4444-4444-444444444402',
   '33333333-3333-3333-3333-333333333301',
   'Check-in und Check-out',
   'Ablauf, Sonderfaelle und haeufige Fehlerquellen.',
   2),
  ('44444444-4444-4444-4444-444444444403',
   '33333333-3333-3333-3333-333333333301',
   'Haeufige Kundenfragen',
   'Standardantworten auf die Top 10 Fragen am Empfang.',
   3),
  ('44444444-4444-4444-4444-444444444404',
   '33333333-3333-3333-3333-333333333301',
   'Problemloesung an der Theke',
   'Beschwerden professionell aufnehmen und loesen.',
   4)
on conflict (id) do nothing;

-- Lektionen Modul 1
insert into public.lessons (id, module_id, title, summary, sort_order)
values
  ('55555555-5555-5555-5555-555555555501',
   '44444444-4444-4444-4444-444444444401',
   'Begruessung am Empfang',
   'Wie du Mitglieder aktiv und freundlich begruesst.',
   1),
  ('55555555-5555-5555-5555-555555555502',
   '44444444-4444-4444-4444-444444444401',
   'Koerpersprache und Tonfall',
   'Worauf du in den ersten Sekunden achtest.',
   2)
on conflict (id) do nothing;

-- Lektionen Modul 2
insert into public.lessons (id, module_id, title, summary, sort_order)
values
  ('55555555-5555-5555-5555-555555555503',
   '44444444-4444-4444-4444-444444444402',
   'Standard Check-in',
   'Schritt-fuer-Schritt Ablauf des regulaeren Check-ins.',
   1),
  ('55555555-5555-5555-5555-555555555504',
   '44444444-4444-4444-4444-444444444402',
   'Mitgliedskarte funktioniert nicht',
   'Was zu tun ist, wenn der Check-in scheitert.',
   2)
on conflict (id) do nothing;

-- Lektion Modul 3
insert into public.lessons (id, module_id, title, summary, sort_order)
values
  ('55555555-5555-5555-5555-555555555505',
   '44444444-4444-4444-4444-444444444403',
   'Top Fragen und Antworten',
   'Kurze, freundliche Standardantworten.',
   1)
on conflict (id) do nothing;

-- Lektion Modul 4
insert into public.lessons (id, module_id, title, summary, sort_order)
values
  ('55555555-5555-5555-5555-555555555506',
   '44444444-4444-4444-4444-444444444404',
   'Beschwerden professionell aufnehmen',
   'Mit Empathie und Struktur zur Loesung.',
   1)
on conflict (id) do nothing;

-- ----------------------------------------------------------
-- Inhaltsbloecke fuer "Begruessung am Empfang"
-- ----------------------------------------------------------
insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  ('66666666-6666-6666-6666-666666666601',
   '55555555-5555-5555-5555-555555555501',
   'text',
   '{"markdown":"## Warum die Begruessung so wichtig ist\n\nJedes Mitglied wird **aktiv, freundlich und mit Blickkontakt** begruesst. Ziel ist, dass sich jeder Kunde sofort willkommen fuehlt.\n\nDie ersten 10 Sekunden entscheiden ueber das Erlebnis im Studio. Eine herzliche Begruessung ist deine wichtigste Aufgabe an der Theke."}'::jsonb,
   1),
  ('66666666-6666-6666-6666-666666666602',
   '55555555-5555-5555-5555-555555555501',
   'checkliste',
   '{"items":["Blickkontakt aufnehmen, sobald das Mitglied im Eingangsbereich ist","Aktiv und mit Vornamen begruessen, wenn moeglich","Laecheln, auch wenn du gerade telefonierst","Kurze Pause am Bildschirm, dem Mitglied volle Aufmerksamkeit geben","Bei Stoerung freundlich um einen Moment bitten"]}'::jsonb,
   2),
  ('66666666-6666-6666-6666-666666666603',
   '55555555-5555-5555-5555-555555555501',
   'hinweis',
   '{"variant":"info","markdown":"**Tipp:** Auch wenn die Theke voll ist, lieber kurz mit einem Laecheln nicken als ignorieren. Das Mitglied weiss dann: ich werde gleich bedient."}'::jsonb,
   3)
on conflict (id) do nothing;

-- Beispiel-Inhalt fuer "Standard Check-in"
insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  ('66666666-6666-6666-6666-666666666604',
   '55555555-5555-5555-5555-555555555503',
   'text',
   '{"markdown":"## Ablauf Standard Check-in\n\n1. Mitglied begruessen\n2. Mitgliedskarte einscannen\n3. Auf gruenes Signal warten\n4. Freundlich verabschieden, Trainingserfolg wuenschen"}'::jsonb,
   1),
  ('66666666-6666-6666-6666-666666666605',
   '55555555-5555-5555-5555-555555555503',
   'checkliste',
   '{"items":["Theke ist aufgeraeumt und einsehbar","Scanner liegt griffbereit","Bildschirm zeigt Check-in-Maske"]}'::jsonb,
   2)
on conflict (id) do nothing;

-- ----------------------------------------------------------
-- Lernpfad-Zuweisung an die Demo-Mitarbeiterin
-- ----------------------------------------------------------
insert into public.user_learning_path_assignments (user_id, learning_path_id, assigned_by)
values
  ('22222222-2222-2222-2222-222222222201',
   '33333333-3333-3333-3333-333333333301',
   '22222222-2222-2222-2222-222222222203')
on conflict (user_id, learning_path_id) do nothing;

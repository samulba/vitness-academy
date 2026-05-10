-- =============================================================
-- 0030_standard_form_templates.sql
-- Standard-Antraege seeden, die in jedem Studio benoetigt werden:
--   - Krankmeldung
--   - Urlaubsantrag
--   - Schicht-Tausch (in 0033 archiviert)
--
-- Werden mit deterministischen UUIDs angelegt, ON CONFLICT DO NOTHING
-- damit Re-Run idempotent ist und Admin-Edits nicht überschrieben
-- werden.
-- =============================================================

insert into public.form_templates (
  id, slug, title, description, fields, status, created_at, updated_at
) values
(
  '00000000-0000-0000-0000-000000000101',
  'krankmeldung',
  'Krankmeldung',
  'Du fuehlst dich nicht fit? Hier kurz Bescheid sagen -- die Studioleitung kuemmert sich um die Schicht.',
  '[
    {"name":"von","label":"Krank ab","type":"date","required":true,"help":"Erster Krankheitstag"},
    {"name":"bis","label":"Voraussichtlich bis","type":"date","required":false,"help":"Wenn du es schon weisst -- sonst frei lassen"},
    {"name":"hinweis","label":"Hinweis (optional)","type":"textarea","required":false,"placeholder":"z.B. Krankenschein folgt per Post","help":"Schicht muss vertreten werden? Krankenschein kommt? Hier kurz schreiben."},
    {"name":"krankenschein","label":"Krankenschein folgt","type":"checkbox","required":false}
  ]'::jsonb,
  'aktiv',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000102',
  'urlaubsantrag',
  'Urlaubsantrag',
  'Urlaub beantragen. Bitte mit ausreichend Vorlauf, damit Schichten geplant werden koennen.',
  '[
    {"name":"von","label":"Urlaub von","type":"date","required":true},
    {"name":"bis","label":"Urlaub bis","type":"date","required":true},
    {"name":"art","label":"Art","type":"radio","required":true,"options":["Erholungsurlaub","Sonderurlaub","Unbezahlter Urlaub"]},
    {"name":"vertretung","label":"Vertretung","type":"text","required":false,"placeholder":"z.B. Lara hat zugesagt","help":"Wer uebernimmt deine Schichten? Wenn schon abgesprochen, gerne Namen nennen."},
    {"name":"begruendung","label":"Begruendung (optional)","type":"textarea","required":false}
  ]'::jsonb,
  'aktiv',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000103',
  'schicht-tausch',
  'Schicht-Tausch',
  'Du brauchst eine Vertretung fuer eine geplante Schicht? Hier eintragen -- Studioleitung sieht es im Inbox.',
  '[
    {"name":"datum","label":"Schicht am","type":"date","required":true},
    {"name":"zeit","label":"Schichtzeit","type":"text","required":true,"placeholder":"z.B. 18:00 - 22:00"},
    {"name":"grund","label":"Grund","type":"textarea","required":true,"help":"Kurz beschreiben warum du nicht kannst."},
    {"name":"vertretung","label":"Vertretung schon gefunden?","type":"text","required":false,"placeholder":"z.B. Tom uebernimmt","help":"Wenn ja, Namen eintragen -- sonst frei lassen, dann sucht Studioleitung."}
  ]'::jsonb,
  'archiviert',
  now(),
  now()
)
on conflict (id) do nothing;

-- =============================================================
-- 0054_umlaute_in_templates.sql
-- Standard-Form-Templates auf richtige Umlaute (ä/ö/ü/ß) statt
-- ASCII-Ersatzformen (ae/oe/ue/ss). Im Frontend werden die Strings
-- 1:1 angezeigt — wirkt auf Mitarbeiter:innen sonst billig.
--
-- UPDATE statt neue INSERTs damit existierende Submissions er-
-- halten bleiben.
-- =============================================================

-- Krankmeldung
update public.form_templates
set
  description = 'Du fühlst dich nicht fit? Hier kurz Bescheid sagen — die Studioleitung kümmert sich um die Schicht.',
  fields = '[
    {"name":"von","label":"Krank ab","type":"date","required":true,"help":"Erster Krankheitstag"},
    {"name":"bis","label":"Voraussichtlich bis","type":"date","required":false,"help":"Wenn du es schon weißt — sonst leer lassen"},
    {"name":"eau_digital","label":"Krankenschein liegt digital vor (eAU)","type":"checkbox","required":false,"help":"Praxis hat den Schein elektronisch an die Krankenkasse übermittelt — Studioleitung sieht ihn dort."},
    {"name":"krankenschein_foto","label":"Krankenschein hochladen (optional)","type":"file","required":false,"accept":"application/pdf,image/jpeg,image/png,image/webp","max_size_mb":5,"help":"Falls du einen Papier-Schein hast: einfach abfotografieren oder PDF hochladen."},
    {"name":"hinweis","label":"Hinweis (optional)","type":"textarea","required":false,"placeholder":"z.B. Schicht muss vertreten werden, Probleme bei der Genesung, …"}
  ]'::jsonb,
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000101'
  and slug = 'krankmeldung';

-- Urlaubsantrag
update public.form_templates
set
  description = 'Urlaub beantragen. Bitte mit ausreichend Vorlauf, damit Schichten geplant werden können.',
  fields = '[
    {"name":"von","label":"Urlaub von","type":"date","required":true},
    {"name":"bis","label":"Urlaub bis","type":"date","required":true},
    {"name":"art","label":"Art","type":"radio","required":true,
     "options":["Erholungsurlaub","Sonderurlaub","Unbezahlter Urlaub"]},
    {"name":"vertretungen_pro_tag","label":"Vertretung pro Tag",
     "type":"vertretungs_plan","required":false,
     "linked_dates":{"from":"von","to":"bis"},
     "help":"Pro Tag im Urlaubszeitraum eine Vertretung eintragen — leer lassen, falls noch nicht abgesprochen. Studioleitung sieht den Plan in der Inbox."},
    {"name":"begruendung","label":"Begründung (optional)","type":"textarea","required":false}
  ]'::jsonb,
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000102'
  and slug = 'urlaubsantrag';

-- Schicht-Tausch (auch wenn aktuell archiviert: Daten konsistent halten)
update public.form_templates
set
  description = 'Du brauchst eine Vertretung für eine geplante Schicht? Hier eintragen — Studioleitung sieht es im Inbox.',
  fields = '[
    {"name":"datum","label":"Schicht am","type":"date","required":true},
    {"name":"zeit","label":"Schichtzeit","type":"text","required":true,"placeholder":"z.B. 18:00 - 22:00"},
    {"name":"grund","label":"Grund","type":"textarea","required":true,"help":"Kurz beschreiben warum du nicht kannst."},
    {"name":"vertretung","label":"Vertretung schon gefunden?","type":"text","required":false,"placeholder":"z.B. Tom übernimmt","help":"Wenn ja, Namen eintragen — sonst leer lassen, dann sucht Studioleitung."}
  ]'::jsonb,
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000103'
  and slug = 'schicht-tausch';

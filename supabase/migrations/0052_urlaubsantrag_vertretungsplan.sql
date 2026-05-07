-- =============================================================
-- 0052_urlaubsantrag_vertretungsplan.sql
-- Urlaubsantrag-Template um Vertretungs-Plan erweitern.
--
-- Vorher: einzelnes Textfeld "vertretung" -- bei mehreren Tagen mit
-- unterschiedlichen Vertretungspersonen unbrauchbar.
--
-- Nachher: ein neues Field-Type "vertretungs_plan", verlinkt mit
-- den von/bis-Date-Feldern. Renderer generiert client-side eine
-- Reihe pro Kalendertag im Range, jede Reihe ein freies Textfeld
-- fuer die Vertretung. Daten landen als Array of {tag, person}
-- im jsonb data.
--
-- Existierende Submissions bleiben unangetastet (UPDATE auf
-- Template-Definition, nicht auf Submission-Daten).
-- =============================================================

update public.form_templates
set
  fields = '[
    {"name":"von","label":"Urlaub von","type":"date","required":true},
    {"name":"bis","label":"Urlaub bis","type":"date","required":true},
    {"name":"art","label":"Art","type":"radio","required":true,
     "options":["Erholungsurlaub","Sonderurlaub","Unbezahlter Urlaub"]},
    {"name":"vertretungen_pro_tag","label":"Vertretung pro Tag",
     "type":"vertretungs_plan","required":false,
     "linked_dates":{"from":"von","to":"bis"},
     "help":"Pro Tag im Urlaubszeitraum eine Vertretung eintragen — leer lassen, falls noch nicht abgesprochen. Studioleitung sieht den Plan in der Inbox."},
    {"name":"begruendung","label":"Begruendung (optional)","type":"textarea","required":false}
  ]'::jsonb,
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000102'
  and slug = 'urlaubsantrag';

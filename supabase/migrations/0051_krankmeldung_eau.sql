-- =============================================================
-- 0051_krankmeldung_eau.sql
-- Krankmeldung-Template modernisieren:
--  - "Krankenschein folgt" Checkbox war veraltet (Faxgeraet-Aera).
--  - Seit 2023 gibt's in DE die elektronische Arbeitsunfaehigkeits-
--    bescheinigung (eAU). Mitarbeiter:innen markieren das, oder
--    laden alternativ ein Foto/PDF des Scheins direkt hoch.
--
-- Update via UPDATE (nicht INSERT) damit existierende Submissions
-- erhalten bleiben. Der Admin kann das Template danach im UI
-- weiter anpassen ohne Migration.
-- =============================================================

update public.form_templates
set
  description = 'Du fuehlst dich nicht fit? Hier kurz Bescheid sagen — die Studioleitung kuemmert sich um die Schicht.',
  fields = '[
    {"name":"von","label":"Krank ab","type":"date","required":true,"help":"Erster Krankheitstag"},
    {"name":"bis","label":"Voraussichtlich bis","type":"date","required":false,"help":"Wenn du es schon weisst — sonst frei lassen"},
    {"name":"eau_digital","label":"Krankenschein liegt digital vor (eAU)","type":"checkbox","required":false,"help":"Praxis hat den Schein elektronisch an die Krankenkasse uebermittelt — Studioleitung sieht ihn dort."},
    {"name":"krankenschein_foto","label":"Krankenschein hochladen (optional)","type":"file","required":false,"accept":"application/pdf,image/jpeg,image/png,image/webp","max_size_mb":5,"help":"Falls du einen Papier-Schein hast: einfach abfotografieren oder PDF hochladen."},
    {"name":"hinweis","label":"Hinweis (optional)","type":"textarea","required":false,"placeholder":"z.B. Schicht muss vertreten werden, Probleme bei der Genesung, …"}
  ]'::jsonb,
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000101'
  and slug = 'krankmeldung';

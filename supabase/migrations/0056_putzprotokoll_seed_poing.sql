-- =============================================================
-- 0056_putzprotokoll_seed_poing.sql
-- Default-Putzprotokoll-Template fuer JEDE existierende Location.
-- Sections sind die 4 Bereiche aus dem Vitness-Poing Papier-Protokoll
-- (Empfangsbereich, Trainingsbereiche, Umkleide, Sanitaer+Sauna).
-- Studioleitung kann pro Standort die Aufgaben spaeter anpassen.
--
-- Idempotent via ON CONFLICT DO NOTHING (cleaning_protocol_templates
-- hat unique-Constraint auf location_id).
-- =============================================================

-- Template pro Location anlegen (oder skippen wenn vorhanden)
insert into public.cleaning_protocol_templates (location_id, active)
  select id, true
  from public.locations
  on conflict (location_id) do nothing;

-- Sections seeden — nur fuer Templates die noch KEINE Sections haben.
-- (Verhindert doppeltes Seeding bei Re-Run.)
do $$
declare
  v_tpl record;
begin
  for v_tpl in
    select t.id as tpl_id
    from public.cleaning_protocol_templates t
    left join public.cleaning_protocol_sections s on s.template_id = t.id
    where s.id is null
    group by t.id
  loop
    insert into public.cleaning_protocol_sections (template_id, titel, aufgaben, sort_order)
    values
      (v_tpl.tpl_id,
       'Empfangsbereich / Laufwege / Büros',
       '[
         "Papier- & Abfallbehälter entleeren, ggf. auswischen, Tüten erneuern",
         "Boden staubsaugen",
         "Boden nass wischen",
         "Fensterbretter & Feuerlöscher feucht/nass abwischen",
         "Büro: Papierkörbe leeren, Böden saugen + wischen"
       ]'::jsonb,
       1),
      (v_tpl.tpl_id,
       'Trainingsbereiche (1. & 2. Stock) / Kursräume',
       '[
         "Papier- & Abfallbehälter entleeren, ggf. auswischen, Tüten erneuern",
         "Boden staubsaugen",
         "Boden (nebelfeucht) wischen",
         "Türen feucht/nass reinigen + nachwischen",
         "Fensterbretter & Feuerlöscher feucht/nass abwischen"
       ]'::jsonb,
       2),
      (v_tpl.tpl_id,
       'Umkleide Damen & Herren',
       '[
         "Papier- & Abfallbehälter entleeren, ggf. auswischen, Tüten erneuern",
         "Boden staubsaugen",
         "Boden nass wischen",
         "Türen feucht/nass reinigen + nachwischen",
         "Schränke: Griffspuren & Schmutz entfernen"
       ]'::jsonb,
       3),
      (v_tpl.tpl_id,
       'Sanitärbereich & Sauna (inkl. Ruheraum & Duschen)',
       '[
         "Papier- & Abfallbehälter entleeren, ggf. auswischen, Tüten erneuern",
         "Boden staubsaugen + nass wischen",
         "Waschbecken reinigen + Kalk entfernen",
         "WC & Urinal gründlich reinigen",
         "Spritzbereich & Schmutzroste reinigen",
         "Spiegel, Armaturen & Spender reinigen / entkalken",
         "Türen feucht / nass reinigen",
         "WC-Bürsten mit Halterung reinigen"
       ]'::jsonb,
       4);
  end loop;
end;
$$;

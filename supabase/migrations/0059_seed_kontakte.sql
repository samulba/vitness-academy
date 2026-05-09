-- =============================================================
-- 0059_seed_kontakte.sql
-- Initialer Seed der Studio-Kontaktliste (aus Notion exportiert).
--
-- Inhalt: ~48 Kontakte (interne Mitarbeiter + externe Partner).
-- Standort-Zuordnung via Name-Lookup mit Fallback:
--   1. exakter Match auf 'Poing' / 'Feldkirchen'
--   2. ILIKE-Match auf '%poing%' / '%feldkirch%' (fuer 'V-itness
--      Poing', 'Studio Feldkirchen' etc.)
--   3. wenn nichts gefunden: NOTICE + location_id bleibt NULL
--      (Kontakt erscheint dann unter beiden Studios) -- besser als
--      die Migration komplett scheitern zu lassen.
--
-- Telefon-Notation: [G]/[P]-Prefixes wurden gestrippt und in
-- notes uebernommen ('Geschaeftlich' / 'Privat').
-- Fehlende fuehrende 0en bei Mobilnummern wurden ergaenzt.
--
-- IDEMPOTENT: Dedupe per (lower(email)) + per
-- (lower(first_name||last_name)). Beim erneuten Lauf werden
-- vorhandene Kontakte nicht doppelt eingefuegt.
-- =============================================================

DO $$
DECLARE
  poing_id      uuid;
  feldkirch_id  uuid;
BEGIN
  -- Stufe 1: exakter Match
  SELECT id INTO poing_id     FROM public.locations WHERE name = 'Poing'       LIMIT 1;
  SELECT id INTO feldkirch_id FROM public.locations WHERE name = 'Feldkirchen' LIMIT 1;

  -- Stufe 2: ILIKE-Fallback (handelt 'V-itness Poing', 'Studio Poing' etc.)
  IF poing_id IS NULL THEN
    SELECT id INTO poing_id FROM public.locations WHERE name ILIKE '%poing%' LIMIT 1;
  END IF;
  IF feldkirch_id IS NULL THEN
    SELECT id INTO feldkirch_id FROM public.locations WHERE name ILIKE '%feldkirch%' LIMIT 1;
  END IF;

  -- Stufe 3: nicht gefunden -> NOTICE, weiter mit NULL
  IF poing_id IS NULL THEN
    RAISE NOTICE 'Standort "Poing" nicht in public.locations gefunden -- Poing-spezifische Kontakte bekommen location_id = NULL und erscheinen unter beiden Studios';
  END IF;
  IF feldkirch_id IS NULL THEN
    RAISE NOTICE 'Standort "Feldkirchen" nicht in public.locations gefunden -- Feldkirchen-spezifische Kontakte bekommen location_id = NULL und erscheinen unter beiden Studios';
  END IF;

  -- Optionaler Reset: Test-Eintraege Georg Pickl + Rafael Schmidbauer
  -- weg, falls sie schon manuell als Test angelegt wurden. Damit das
  -- Seed sauber sitzt. Auskommentieren wenn du sie behalten willst.
  DELETE FROM public.studio_contacts
   WHERE (lower(coalesce(first_name,'')) = 'georg' AND lower(coalesce(last_name,'')) = 'pickl')
      OR (lower(coalesce(first_name,'')) = 'rafael' AND lower(coalesce(last_name,'')) = 'schmidbauer');

  -- Daten-Zeilen einmal in eine Temp-Tabelle, dann sauberer Insert.
  CREATE TEMP TABLE tmp_kontakte (
    location_id  uuid,
    first_name   text,
    last_name    text,
    role_tags    text[],
    phone        text,
    email        text,
    notes        text
  ) ON COMMIT DROP;

  INSERT INTO tmp_kontakte (location_id, first_name, last_name, role_tags, phone, email, notes) VALUES
    -- ---------------- Geschaeftsleitung & Verwaltung ----------------
    (NULL,         'Georg',       'Pickl',         ARRAY['Geschaeftsleitung'],            '0175-1602080',     'georg.pickl@vitness-poing.de',     'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         'Markus',      'Decker',        ARRAY['Geschaeftsleitung'],            '0179-7888366',     'markus.decker@vitness-poing.de',   'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         'Ann-Kathrin', 'Pickl',         ARRAY['Verwaltung'],                   NULL,               'verwaltung@vitness-poing.de',      NULL),
    (poing_id,     'Marco',       'Degel',         ARRAY['Service Leitung'],              '0172-6223371',     'marcodegel@gmail.com',             'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         'Christine',   'Zeidler',       ARRAY['Kursleitung'],                  '0160-8431486',     'christine.zeidler@gmx.de',         'Privat - nur intern, nicht an Kunden weitergeben'),

    -- ---------------- Reha / Physio --------------------------------
    (feldkirch_id, 'Julia',       'Mudrich',       ARRAY['Physiotherapeut'],              '0176-61293369',    'physio@vitness-feldkirchen.de',    'Geschaeftlich - darf an Kunden weitergegeben werden'),
    (NULL,         'Francoise',   'Georges',       ARRAY['Reha'],                         '0151-56560715',    'reha@vitness-poing.de',            'Geschaeftlich - darf an Kunden weitergegeben werden'),

    -- ---------------- V-itness Team (intern) -----------------------
    (NULL,         'Rafael',      'Schmidbauer',   ARRAY['Service','Trainer','Vertrieb'], '0179-6148853',     'rafaelschmidb1@web.de',            NULL),
    (NULL,         'Andreas',     'Linke',         ARRAY['Trainer'],                      '0176-63756298',    'A.Linke2@web.de',                  NULL),
    (NULL,         'Dominic',     'Dachs',         ARRAY['Service','Trainer','Vertrieb'], '0162-7713913',     'dominicdachs@gmx.de',              NULL),
    (NULL,         'Manuel',      'Maunas',        ARRAY['Service','Vertrieb'],           '015783512541',     'maunasmanuel@gmail.com',           NULL),
    (NULL,         'Simon',       'Vilim',         ARRAY['Service','Trainer'],            '017620443842',     NULL,                               NULL),
    (NULL,         'Tamina',      'Sengersdorf',   ARRAY['Service','Trainer'],            '017624195061',     'tamina.sengersdorf@gmx.de',        NULL),
    (NULL,         'Markus',      'Rohrbach',      ARRAY['Service'],                      '0176-34385559',    'markus.rohrbach2508@gmail.com',    NULL),
    (NULL,         'Elias',       'Nabizada',      ARRAY['Service'],                      '0176-76643078',    'elias.nabizada@gmx.de',            NULL),
    (NULL,         'Oleg',        'Klostermann',   ARRAY['Service'],                      '0171-8866644',     'olegklostermann@aol.com',          NULL),
    (NULL,         'Linda',       'Wulz',          ARRAY['Service'],                      '0178-5607927',     'baby29122004@gmx.de',              NULL),
    (NULL,         'Antonio',     'Kramer',        ARRAY['Service'],                      '0151-41648498',    NULL,                               NULL),
    (NULL,         'Charlize',    'Emmelmann',     ARRAY['Service'],                      '0179-5252543',     'charlize.emmelmann@icloud.com',    NULL),
    (NULL,         'Jeron',       'Vieider',       ARRAY['Service'],                      '01626238860',      'viejer13@gmail.com',               NULL),
    (NULL,         'Maximilian',  'Behrend',       ARRAY['Service'],                      '01605858704',      'maximilian.behrend@icloud.com',    'Spitzname Maxi'),
    (NULL,         'Marlon',      'Wallies',       ARRAY['Service'],                      '015126518757',     'walliesmarlon@gmail.com',          NULL),
    (NULL,         'Nahuel',      'Schott Sánchez',ARRAY['Service'],                      '015209143206',     'nahuel.szschott@gmail.com',        NULL),
    (NULL,         'Luca',        'Bellio',        ARRAY['Service'],                      '01719794382',      'lucasalvatorebellio@gmail.com',    NULL),
    (NULL,         'Leon',        'Rushiti',       ARRAY['Service'],                      '01795714883',      'Leon.rushiti@icloud.com',          NULL),
    (NULL,         'Patrik',      'Migas',         ARRAY['Service'],                      '01794263702',      'p.migas08@gmail.com',              NULL),
    (NULL,         'Karoline',    'Özdemir',       ARRAY['Service'],                      '015228907716',     'Karoline.Oezdemir2016@gmail.com',  NULL),
    (NULL,         'Mishale',     'Helmis',        ARRAY['Service'],                      '015203913986',     'mishale.helmis@gmx.de',            NULL),
    (NULL,         'Leander',     'Zukic',         ARRAY['Service'],                      '017672360571',     'leanderzukic@gmail.com',           NULL),
    (NULL,         'Hanna',       'Sabaskic',      ARRAY['Service'],                      '015259302218',     'hannasabaskic@gmail.com',          NULL),
    (NULL,         'Samuel',      'Liba',          ARRAY['Vertrieb','Social Media Manager'],'0176 31335327',  'samuel.liba@o2mail.de',            NULL),
    (NULL,         'Rupert',      'Lohner',        ARRAY['Marketing-Manager'],            NULL,               NULL,                               NULL),

    -- ---------------- Externe Partner (beide Standorte) ------------
    (NULL,         'Doru',        NULL,            ARRAY['Hausmeister'],                  '0162-7063222',     NULL,                               'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         NULL,          'HRB Service GmbH',ARRAY['Hausmeister'],                '016090921098',     NULL,                               'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         NULL,          'Getränkeanlage (kostenfrei)',ARRAY['Getränke Anlage'], '0711-489760',      NULL,                               'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         NULL,          'Getränkeanlage Notdienst',ARRAY['Getränke Anlage'],    '0800-7632269',     NULL,                               'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         NULL,          'Magicline Hotline',ARRAY['Magicline'],                 '040-4293240',      NULL,                               'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         'Philip',      'Scholz',        ARRAY['IT-Support'],                   '089-80911506-0',   'service@emnetworks.de',            'IT Technik emNetworks. Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         NULL,          'Möstel',        ARRAY['Sani-Bereich'],                 '0171 4300 928',    NULL,                               'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         'Danku',       'Marinkovic',    ARRAY['Putzfirma','Reinigungspersonal'],'0178 916 4770',   'slobodandankumarinkovic@gmail.com', 'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         'Tomislav',    'Arbanas',       ARRAY['Maler'],                        '0176-21655581',    'mail@malermeister-arbanas.de',     'Privat - nur intern, nicht an Kunden weitergeben'),
    (NULL,         NULL,          'CWS Hygiene GmbH',ARRAY['CWS'],                        '0800-0002299',     NULL,                               'Geschaeftlich - darf an Kunden weitergegeben werden. Kundennummer 30067649'),
    (NULL,         NULL,          'allwartung GmbH',ARRAY['Wartung'],                     '089/63893089-0',   'm.kreczy@allwartung.de',           'Privat - nur intern, nicht an Kunden weitergeben'),

    -- ---------------- Externe Partner (nur Feldkirchen) ------------
    (feldkirch_id, 'Danny',       'Lenk',          ARRAY['Hausverwaltung'],               '089-55166-107',    'Danny.Lenk@notare-bayern-pfalz.de','Privat - nur intern, nicht an Kunden weitergeben'),
    (feldkirch_id, 'Andi',        'Linke',         ARRAY['Training & Gerätewartung'],     NULL,               NULL,                               NULL),
    (feldkirch_id, NULL,          'Woulu Sauna TED MANTAI',ARRAY['Sauna Technik'],        '089-4549100',      'info@wolu.de',                     'Privat - nur intern, nicht an Kunden weitergeben'),

    -- ---------------- Externe Partner (nur Poing) ------------------
    (poing_id,     'Tanja',       'Diemann',       ARRAY['Training & Gerätewartung'],     NULL,               'tanjadiemann@vitness-poing.de',    NULL),
    (poing_id,     NULL,          'Klafs',         ARRAY['Sauna Technik'],                '0791-501374',      NULL,                               'Privat - nur intern, nicht an Kunden weitergeben');

  -- Idempotenter Insert: nur einfuegen, wenn (lower(email)) noch nicht
  -- existiert ODER (wenn email NULL) der Name-Combo noch nicht existiert.
  INSERT INTO public.studio_contacts (location_id, first_name, last_name, role_tags, phone, email, notes)
  SELECT t.location_id, t.first_name, t.last_name, t.role_tags, t.phone, t.email, t.notes
    FROM tmp_kontakte t
   WHERE NOT EXISTS (
           SELECT 1 FROM public.studio_contacts sc
            WHERE t.email IS NOT NULL
              AND sc.email IS NOT NULL
              AND lower(sc.email) = lower(t.email)
         )
     AND NOT EXISTS (
           SELECT 1 FROM public.studio_contacts sc
            WHERE t.email IS NULL
              AND lower(coalesce(sc.first_name,'') || ' ' || coalesce(sc.last_name,''))
                = lower(coalesce(t.first_name,'') || ' ' || coalesce(t.last_name,''))
         );
END $$;

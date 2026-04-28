-- Vitness Akademie -- Cloud-Seed: Wissensdatenbank
--
-- Voraussetzung:
--   - Migration 0005_wissen.sql wurde angewendet
-- Idempotent.

-- ----------------------------------------------------------
-- Kategorien
-- ----------------------------------------------------------
insert into public.knowledge_categories (id, name, slug, description, sort_order)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
   'Magicline', 'magicline',
   'Häufige Vorgänge im Magicline-System.', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
   'Theke', 'theke',
   'Standardabläufe an der Theke und am Empfang.', 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
   'Reha', 'reha',
   'Aufnahme und Begleitung von Reha-Anfragen.', 3),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
   'Kundenservice', 'kundenservice',
   'Kommunikation, Beschwerden und schwierige Situationen.', 4),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
   'Notfälle', 'notfaelle',
   'Was tun, wenn etwas Ernstes passiert.', 5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06',
   'Technikprobleme', 'technik',
   'Schnelle Hilfe bei Geräten, Schließanlage und IT.', 6)
on conflict (id) do update set
  name        = excluded.name,
  slug        = excluded.slug,
  description = excluded.description,
  sort_order  = excluded.sort_order;

-- ----------------------------------------------------------
-- Artikel
-- ----------------------------------------------------------
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'Was tun, wenn die Mitgliedskarte nicht funktioniert?',
  'mitgliedskarte-funktioniert-nicht',
  'Schritt-für-Schritt-Anleitung, wenn der Check-in scheitert.',
  '## Mitgliedskarte funktioniert nicht – was jetzt?

Bleib freundlich und gib dem Mitglied das Gefühl, dass du dich kümmerst.

### 1. Prüfen, ob die Karte sauber gelesen wurde
- Karte langsam erneut über den Scanner ziehen
- Sicherstellen, dass die Magnetstreifen-Seite korrekt liegt

### 2. Mitglied im Magicline suchen
- Nach **Vor- und Nachnamen** suchen
- Geburtsdatum als zweites Kriterium nehmen, wenn der Name häufig ist
- Manuellen Check-in vornehmen

### 3. Karte erneuern, wenn defekt
- Vermerk im Kundenkonto setzen
- Neue Karte ausgeben und Magnetstreifen prüfen

### Wichtig
Niemals ein Mitglied einfach abweisen. Im Zweifel kurz die Schichtleitung holen.',
  'aktiv', 1, u.id
from auth.users u where u.email = 'admin@example.com'
on conflict (id) do update set
  category_id = excluded.category_id,
  title       = excluded.title,
  slug        = excluded.slug,
  summary     = excluded.summary,
  body        = excluded.body,
  status      = excluded.status;

insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc02',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
  'Wie nehme ich eine Reha-Anfrage auf?',
  'reha-anfrage-aufnehmen',
  'Standardablauf für die telefonische Aufnahme einer Reha-Anfrage.',
  '## Reha-Anfrage telefonisch aufnehmen

### Pflichtfelder erfragen
- Vor- und Nachname
- Geburtsdatum
- Telefonnummer für Rückruf
- Krankenkasse + Versichertennummer
- Behandelnder Arzt
- Vorliegende Verordnung (T-Rezept) ja/nein

### Termin vereinbaren
- Erstgespräch in der Reha mit Reha-Trainer:in vereinbaren
- Mitglied auf nötige Unterlagen zum Erstgespräch hinweisen

### Im Magicline dokumentieren
- Notiz im Kundenkonto: **„Reha-Anfrage am [Datum] – Erstgespräch am [Datum]"**
- Reha-Status im System hinterlegen

### Worauf du achtest
Empathisch zuhören. Reha-Mitglieder kommen oft mit gesundheitlichen Sorgen – nimm dir Zeit.',
  'aktiv', 2, u.id
from auth.users u where u.email = 'admin@example.com'
on conflict (id) do update set
  category_id = excluded.category_id,
  title       = excluded.title,
  slug        = excluded.slug,
  summary     = excluded.summary,
  body        = excluded.body,
  status      = excluded.status;

insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc03',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'Wie finde ich einen Vertrag in Magicline?',
  'vertrag-in-magicline-finden',
  'Schnelle Suche nach Verträgen über Name, Vertragsnummer oder Telefonnummer.',
  '## Vertrag in Magicline finden

### Schnellsuche oben rechts
- Such-Icon (Lupe) klicken
- Suche funktioniert mit:
  - Vor- und Nachname
  - Vertrags- oder Mitgliedsnummer
  - Telefonnummer
  - E-Mail-Adresse

### Wenn nichts gefunden wird
- Schreibweise prüfen (z.B. **„Müller"** vs. **„Mueller"**)
- Geburtsdatum als zweites Kriterium nutzen
- Im Zweifel die Schichtleitung dazuholen

### Tipp
Du musst nicht das ganze Wort eingeben – Magicline findet auch Teiltreffer.',
  'aktiv', 1, u.id
from auth.users u where u.email = 'admin@example.com'
on conflict (id) do update set
  category_id = excluded.category_id,
  title       = excluded.title,
  slug        = excluded.slug,
  summary     = excluded.summary,
  body        = excluded.body,
  status      = excluded.status;

insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc04',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
  'Was sage ich bei einer Beschwerde?',
  'beschwerde-leitfaden',
  'Drei Schritte: Zuhören, Lösung anbieten, dokumentieren.',
  '## Beschwerden professionell lösen

### 1. Zuhören
- Aussprechen lassen, nicht unterbrechen
- Mit kurzen Bestätigungen signalisieren: „Ich höre Ihnen zu."
- Auf keinen Fall in Verteidigungshaltung gehen

### 2. Verständnis zeigen
- **„Ich verstehe, dass Sie das ärgert."**
- Eigene Schuld oder Schuldzuweisungen vermeiden
- Sachlich beim Thema bleiben

### 3. Lösung anbieten
- Konkretes Angebot: „Ich kümmere mich darum, dass …"
- Wenn du nicht selbst entscheiden kannst: kurz die Schichtleitung dazuholen
- Niemals leere Versprechen geben

### 4. Dokumentieren
- Beschwerde im Magicline beim Mitglied vermerken
- Datum, Name, Inhalt, vereinbarte Lösung notieren

### Wichtig
Ein gut gelöstes Beschwerdegespräch macht Mitglieder oft loyaler als zuvor.',
  'aktiv', 1, u.id
from auth.users u where u.email = 'admin@example.com'
on conflict (id) do update set
  category_id = excluded.category_id,
  title       = excluded.title,
  slug        = excluded.slug,
  summary     = excluded.summary,
  body        = excluded.body,
  status      = excluded.status;

insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc05',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'Wie läuft ein Probetraining ab?',
  'probetraining-ablauf',
  'Vom Empfang bis zur Anschlussvereinbarung.',
  '## Ablauf Probetraining

### Empfang
- Aktiv begrüßen, Namen erfragen
- Kurze Tour durch das Studio anbieten
- Probetrainings-Formular ausfüllen

### Trainingsfläche
- Trainer:in vorstellen
- Gerätekreis erklären, Cardio kurz zeigen
- 30-45 Minuten begleitetes Training

### Abschluss
- **Beratungsgespräch** mit dem Trainer/Berater
- Vorteile und passenden Tarif zeigen
- Konkretes Angebot für den Vertragsabschluss

### Tipp
Frag immer nach dem Erlebnis: „Wie hat es Ihnen gefallen?" – das öffnet das Gespräch.',
  'aktiv', 2, u.id
from auth.users u where u.email = 'admin@example.com'
on conflict (id) do update set
  category_id = excluded.category_id,
  title       = excluded.title,
  slug        = excluded.slug,
  summary     = excluded.summary,
  body        = excluded.body,
  status      = excluded.status;

insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc06',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
  'Notfall im Studio – was ist zu tun?',
  'notfall-im-studio',
  'Erste Schritte bei medizinischen Notfällen.',
  '## Im Notfall

### Sofort
1. **Ruhe bewahren** und das Mitglied ansprechen
2. **112 anrufen** – nicht zögern
3. Stelle absichern, andere Mitglieder beruhigen

### Bei Bewusstlosigkeit
- Stabile Seitenlage
- Atmung kontrollieren
- Bei Atemstillstand: Herz-Lungen-Wiederbelebung beginnen
- AED holen lassen (Standort: Empfang)

### Nach dem Notfall
- Vorfall **schriftlich dokumentieren**
- Schichtleitung und Studioleitung sofort informieren
- Bei Bedarf Polizei oder Versicherung einbeziehen

### Wichtig
Helfen ist Pflicht. Niemand erwartet von dir medizinisches Fachwissen – aber **Hinschauen, 112 anrufen, Erste Hilfe** sind das Minimum.',
  'aktiv', 1, u.id
from auth.users u where u.email = 'admin@example.com'
on conflict (id) do update set
  category_id = excluded.category_id,
  title       = excluded.title,
  slug        = excluded.slug,
  summary     = excluded.summary,
  body        = excluded.body,
  status      = excluded.status;

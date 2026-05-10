-- =========================================================
-- seed_handbuch_zu_wissen.sql  (auto-generated)
-- Quelle: handbuch/*.md
-- Kategorien: 6 | Artikel: 71
-- 
-- ACHTUNG: Loescht alle bestehenden knowledge_articles + 
-- knowledge_categories und legt sie aus den Notion-MD frisch an.
-- Beim Re-Run gehen Admin-UI-Änderungen an diesen Artikeln
-- verloren. Nicht regelmäßig laufen lassen -- nach Initial-
-- Import wird alles über das Admin-UI gepflegt.
-- =========================================================

begin;

-- 1) Bestehende Inhalte löschen
delete from public.knowledge_articles;
delete from public.knowledge_categories;

-- 2) Kategorien
insert into public.knowledge_categories (id, name, slug, description, sort_order) values
  ('6465412b-afa4-5adc-b733-6af8a564849c', 'Magicline', 'magicline', 'Häufige Vorgänge im Magicline-System.', 0),
  ('dd921f9c-e59a-5c37-96cf-2016317b7660', 'Theke und Service', 'theke', 'Standardabläufe an der Theke und am Empfang.', 1),
  ('4fb80be6-93c0-5502-8de6-21be2286e169', 'Reha', 'reha', 'Aufnahme und Begleitung von Reha-Anfragen.', 2),
  ('be346e69-cd41-51ee-852e-d28aa12631e9', 'Präventionskurse', 'praevention', 'FeelFit, Yummy und §20 SGB V.', 3),
  ('ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'Trainer', 'trainer', 'Trainingsqualität, Methodik, Standards.', 4),
  ('4b3d0650-216d-52a8-8285-da0d2b1fb37d', 'Kursplan', 'kursplan', 'Kurse, Termine und Kursinformationen.', 5);

-- 3) Artikel
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('5a321579-0b8e-50af-b791-b0b451f91604', '6465412b-afa4-5adc-b733-6af8a564849c', 'Überblick über die Software – Funktionen und Vorteile', 'magicline-01-was-ist-magicline-01-ueberblick-funktionen-vorteile-md', 'Magicline ist dein digitales Allround-Tool, das dir den Arbeitsalltag im Fitnessstudio erheblich erleichtert. Es unterstützt dich dabei, effizienter mit deinen Mitgliedern zu kommunizieren, Termine stressfrei zu organ…', $body$# Überblick über die Software – Funktionen und Vorteile

Magicline ist dein digitales Allround-Tool, das dir den Arbeitsalltag im Fitnessstudio erheblich erleichtert. Es unterstützt dich dabei, effizienter mit deinen Mitgliedern zu kommunizieren, Termine stressfrei zu organisieren und Herausforderungen schnell zu meistern.

## Wichtige Funktionen, die du kennen solltest

1. **Mitgliederverwaltung** – Alle Infos zu Mitgliedern wie Name, Verträge oder Zahlungen findest du zentral in Magicline. Damit kannst du schnell auf Fragen reagieren oder Daten anpassen.
2. **Termin- und Kursverwaltung** – In Magicline siehst du alle gebuchten Kurse, Personal-Trainings und freie Plätze. Du kannst Mitglieder einbuchen, umbuchen oder abmelden.
3. **Check-in-Systeme** – Mitglieder checken sich über unser Chip-Band ein. Wenn ein Check-in abgelehnt wird (z. B. wegen offener Zahlungen oder abgelaufenen Verträgen), zeigt dir das System die Ursache an.
4. **Kommunikation** – Du kannst direkt Nachrichten an Mitglieder senden, z. B. Erinnerungen an Termine oder Infos zu Studioangeboten.
5. **Zahlungsübersicht** – Du kannst den Zahlungsstatus der Mitglieder einsehen. Falls Zahlungen fehlen, kannst du Mitglieder freundlich darauf hinweisen oder eine Lösung anbieten.
6. **Verkauf** – Artikel an unsere Mitglieder verkaufen und entsprechend über Lastschrift oder EC-Zahlung abbuchen.

## Vorteile für dich

1. **Schneller arbeiten:** Viele manuelle Aufgaben, wie Kursbuchungen oder die Verwaltung von Mitgliederdaten, sind einfach und schnell erledigt.
2. **Bessere Betreuung der Mitglieder:** Du hast immer alle Infos parat und kannst Fragen schnell beantworten.
3. **Einfache Bedienung:** Magicline ist übersichtlich und leicht zu verstehen. Nach kurzer Einarbeitung kannst du die wichtigsten Funktionen sicher nutzen.
4. **Probleme frühzeitig erkennen:** Warnmeldungen helfen dir, mögliche Schwierigkeiten schnell zu lösen, bevor sie größer werden.

## Was du auf jeden Fall wissen solltest

- Magicline ist dafür da, dir die Arbeit zu erleichtern. Je besser du dich damit auskennst, desto entspannter wird dein Arbeitsalltag.
- Es ist wichtig, Daten im System immer aktuell zu halten, damit alles reibungslos funktioniert.
$body$, 'aktiv', 10000);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('f56a422e-79e7-538e-9ead-5d7a557cb5b1', '6465412b-afa4-5adc-b733-6af8a564849c', 'Zugang und Anmeldung bei Magicline', 'magicline-01-was-ist-magicline-02-zugang-und-anmeldung-md', '', $body$# Zugang und Anmeldung bei Magicline

## Einfache Anmeldung bei Magicline

Der Zugriff auf Magicline ist unkompliziert und schnell, sodass du direkt mit deiner Arbeit starten kannst. Normalerweise ist Magicline an der Theke bereits geöffnet, sodass du dich einfach einloggen kannst. Falls dies einmal nicht der Fall sein sollte, kannst du dich mit den folgenden Schritten problemlos anmelden:

## Schritt 1: Magicline-Website aufrufen

- Öffne einen Browser deiner Wahl (z. B. Chrome oder Edge) und gib in die Adresszeile die folgende URL ein: **www.magicline.com**. Drücke anschließend die Eingabetaste, um die Website zu laden.

## Schritt 2: Zum Login-Bereich navigieren

- Sobald die Startseite geladen ist, klicke oben links auf den Button **„Login"**.
- Danach im ausgewählten Bereich **„v-itness"** rein schreiben.
- Klicke auf **„Weiter"**, um zum Anmeldeformular zu gelangen.

## Schritt 3: Anmeldedaten eingeben

- Gib deine persönlichen **Anmeldedaten** ein. Diese bestehen in der Regel aus deinem Benutzernamen (Vorname und Nachname) und deinem Passwort.
- Achte darauf, dass die Daten korrekt sind, und drücke anschließend auf **„Anmelden"**.
- Wähle in der angezeigten Liste das **jeweilige Studio** aus, in dem du dich gerade befindest oder für das du arbeiten möchtest.
- Nach erfolgreicher Eingabe solltest du direkt im **Magicline Dashboard** landen, von wo aus du Zugriff auf alle relevanten Funktionen hast.
- Dein Passwort kannst du rechts oben auf deinem Profil ändern.

## Hinweis

- Sollte dein Login nicht funktionieren, überprüfe die Eingabe deiner Anmeldedaten und stelle sicher, dass die Feststelltaste (Caps Lock) auf deiner Tastatur deaktiviert ist.
- Falls du deine Zugangsdaten vergessen hast, wende dich bitte an deine Studioleitung, um Unterstützung zu erhalten.
$body$, 'aktiv', 10001);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('f857baa8-9fb1-5a0b-b304-d7c202ef43e7', '6465412b-afa4-5adc-b733-6af8a564849c', 'Dashboard', 'magicline-02-navigation-01-dashboard-md', '', $body$# Dashboard

## Das Magicline Dashboard

Der Dashboard-Bereich ist übersichtlich gestaltet und dient als Startpunkt für deinen Arbeitsalltag. Auch wenn du diesen Bereich nicht so häufig nutzen wirst, bietet er dir eine schnelle Übersicht über einige wichtige Informationen.

## Der Dashboard-Bereich ist in drei Abschnitte unterteilt

### Check-In Auslastung
Hier bekommst du einen schnellen Überblick über die **durchschnittliche tägliche Auslastung** deines Studios. Diese zeigt dir, wie viele Menschen im Durchschnitt an einem typischen Tag eingecheckt sind. (Die aktuelle Check-In-Auslastung findest du direkt im Check-In-Bereich, nicht im Dashboard.)

### Termine
In diesem Bereich findest du eine **kurze Übersicht über anstehende Termine**. Du siehst auf einen Blick, welche Termine im Laufe des Tages geplant sind und zu welcher Uhrzeit sie stattfinden.

(Dies ist nur eine kompakte Übersicht. In einem späteren Kapitel gehen wir genauer auf die Terminverwaltung ein, damit du sie optimal nutzen kannst.)

### Geburtstage
Im dritten Abschnitt werden dir die **anstehenden Geburtstage der Mitglieder** angezeigt. Dies ist eine tolle Möglichkeit, den persönlichen Kontakt zu stärken und Mitglieder mit einer kleinen Geste zu überraschen.
$body$, 'aktiv', 10002);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('e8f9812c-3c9d-59c8-a644-a360d2b14f52', '6465412b-afa4-5adc-b733-6af8a564849c', 'Check-In', 'magicline-02-navigation-02-check-in-md', '', $body$# Check-In

## Der Check-In Bereich

Der Check-In Bereich ist ein zentraler Abschnitt in Magicline, den du gut kennen und sicher bedienen solltest. Hier findest du alle relevanten Informationen zu den ein- und ausgecheckten Mitgliedern und kannst verschiedene Aktionen durchführen.

## Funktionen im Check-In Bereich

### 1. Aktuell eingecheckte Mitglieder
- Im Check-In Bereich siehst du eine Liste aller Mitglieder, die aktuell im Studio sind.
- Du kannst einsehen, wann sich ein Mitglied eingecheckt hat und wie lange es bereits im Studio ist.

### 2. Ausgecheckte Mitglieder
- Neben den aktuell anwesenden Mitgliedern kannst du auch sehen, wer sich bereits ausgecheckt hat und wie lange das her ist.

### 3. Zusätzliche Informationen anzeigen
- Im Check-In Bereich kannst du einstellen, welche Informationen du zu den Mitgliedern sehen möchtest, z. B. welchen Vertrag sie haben oder ob sie sich für einen Kurs angemeldet haben.
- Diese Einstellungen sind optional, können dir aber helfen, einen besseren Überblick zu behalten.

### 4. Detaillierte Mitgliederinformationen
- Wenn du genauere Infos zu einem Mitglied benötigst, kannst du auf den Namen oder das Profilbild des Mitglieds klicken.
- Ein Info-Fenster öffnet sich auf der rechten Seite, in dem du Details wie den Kontostand, Guthaben und andere Informationen einsehen kannst.
- Mehr dazu erfährst du im Kapitel „Mitglieder".

### 5. Mitgliedersuche und manuelles Einchecken
- Du kannst gezielt nach Mitgliedern suchen, sie manuell einchecken oder direkt zur Kasse weiterleiten.

### 6. Check-In Statistiken
- Im Hintergrund des Check-In Bereichs werden dir die durchschnittlichen Check-Ins angezeigt.
- In der Mitte siehst du die aktuelle Anzahl der Mitglieder, die gerade im Studio trainieren.

### 7. Aggregator-Mitglieder hinzufügen
- Über den Button oben rechts kannst du Aggregator-Mitglieder hinzufügen. Diese Funktion wird im Kapitel „Aggregator Mitglieder" ausführlich erklärt.

---

Mit diesen Funktionen bietet dir der Check-In Bereich eine zentrale Übersicht und zahlreiche Möglichkeiten, um den Mitgliederverkehr im Studio zu managen und deinen Arbeitsalltag zu erleichtern.
$body$, 'aktiv', 10003);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('b5273bd2-049c-577b-bea3-5b755a6bfc6e', '6465412b-afa4-5adc-b733-6af8a564849c', 'Mitglieder', 'magicline-02-navigation-03-mitglieder-md', '', $body$# Mitglieder

## Mitgliederverwaltung

Der Bereich **Mitglieder** bietet dir eine zentrale Übersicht über alle relevanten Informationen zu den einzelnen Mitgliedern. Hier kannst du Mitglieder gezielt suchen, ihre Details einsehen und entsprechende Aktionen durchführen.

## Schritte zur Nutzung des Mitgliederbereichs

### 1. Mitglied suchen und auswählen
- Nutze die Suchfunktion, um das gewünschte Mitglied zu finden.
- Klicke auf das Mitglied, um dessen vollständige Informationen aufzurufen.

### 2. Navigation im Mitgliederbereich
Nach dem Öffnen eines Mitgliedsprofils findest du im Bereich **Übersicht** sechs zentrale Kategorien:
1. Allgemeine Informationen
2. Kontostand
3. Kommunikation
4. Offene Aufgaben
5. Ruhezeiten und Zugangsbeschränkungen
6. Aktivität

### Detaillierte Informationen zu den Kategorien

#### Allgemeine Informationen
- Zeigt den aktuellen Status des Mitglieds:
  - Aktives Mitglied
  - Ehemaliges Mitglied (z. B. nach Vertragsende)
- Enthält die Kontaktdaten des Mitglieds, wie Adresse, E-Mail und Telefonnummer.
  - Wichtig: Achte darauf, dass diese Informationen stets vollständig und korrekt sind. Nur so kannst du Mitglieder im Falle von Kursabsagen oder anderen Benachrichtigungen problemlos kontaktieren.
- Gibt an, ob die Mitgliedskarte (Armband) verbunden ist. Falls nicht, kannst du sie direkt im System hinzufügen.

#### Kontostand
- Zeigt den finanziellen Status des Mitglieds an:
  - Ausgeglichen: Alles in Ordnung.
  - Offener Betrag: Informiere das Mitglied über den offenen Betrag und biete an, diesen direkt an der Theke auszugleichen.

#### Kommunikation
- Dokumentiert alle bisherigen und geplanten Termine des Mitglieds.
- Du kannst einsehen, welche Termine bestätigt oder abgesagt wurden.

#### Offene Aufgaben
- Listet anstehende Aufgaben für das Mitglied auf.
- Hier kannst du prüfen, ob noch Aufgaben offen sind oder bereits erledigt wurden.

#### Ruhezeiten und Zugangsbeschränkungen
- Zeigt an, ob das Mitglied aktuell in einer Ruhezeit ist.
- Du kannst außerdem überprüfen, ob Zugangsbeschränkungen bestehen, beispielsweise aufgrund von Vertragsbedingungen oder Sonderregelungen.

#### Aktivität
- Bietet eine Übersicht über die Anwesenheit des Mitglieds:
  - **Check-In-Historie:** Zeigt die letzten Check-Ins an.
  - **Besuchsstatistik:** Zeigt, wie oft das Mitglied wöchentlich, monatlich und jährlich das Studio besucht hat.

## Hinweis

Durch die sorgfältige Pflege der Daten im Mitgliederbereich stellst du sicher, dass die Kommunikation reibungslos funktioniert und Mitglieder optimal betreut werden können. Nutze diesen Bereich, um den Überblick zu behalten und professionell zu handeln.
$body$, 'aktiv', 10004);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('e9421d46-f777-50c0-b032-2802270c110d', '6465412b-afa4-5adc-b733-6af8a564849c', 'Termine', 'magicline-02-navigation-04-termine-md', '', $body$# Termine

## Terminverwaltung

Der Bereich Termine ermöglicht dir eine klare Übersicht und effiziente Verwaltung aller anstehenden und geplanten Termine. Hier kannst du sowohl Termine einsehen als auch neue hinzufügen oder absagen.

## Funktionen und Navigation im Terminbereich

### Tag auswählen
Links oben kannst du den gewünschten Tag auswählen, um die Termine für diesen spezifischen Tag anzuzeigen oder zu planen.

### Mitarbeiterübersicht
- Alle Mitarbeiter, die am gewählten Tag verfügbar sind, werden übersichtlich dargestellt.
- Du siehst die Termine, die jedem Mitarbeiter bereits zugewiesen wurden. (Falls es bei dir bei den Terminen anders ausschaut, musst du oben rechts, links neben dem Standort, **Personal** auswählen.)

### Kurse des Tages
- Neben den Mitarbeiterterminen werden auch die Kurse angezeigt, die am jeweiligen Tag stattfinden.
- So hast du eine vollständige Übersicht über alle geplanten Aktivitäten im Studio.

### Standort wechseln
- Falls erforderlich, kannst du über die Option **oben rechts** den Standort auf **Feldkirchen bzw. Poing** wechseln.
- Dadurch erhältst du Zugriff auf die Terminplanung und Kursübersicht des anderen Standorts.

### Neue Termine eintragen
- Um einen neuen Termin zu erstellen:
  - Klicke auf das freie Feld des entsprechenden Mitarbeiters, dem der Termin zugewiesen werden soll.
  - Gib die Details des Termins ein und speichere die Eingabe.
  - Die verschiedenen Terminarten und deren Kategorien werden ausführlich im Kurs **„Service / Theke"** behandelt. Bei Unklarheiten kannst du dort nachsehen.

## Automatisierte Kommunikation

Wenn ein Kurs oder ein Termin für ein Mitglied über das Magicline-System gebucht oder storniert wird, erhält das Mitglied automatisch eine E-Mail, die es über diese Änderung informiert. Dies setzt voraus, dass die E-Mail-Adresse des Mitglieds im Benutzerkonto hinterlegt ist.

## Hinweis

Der Terminbereich ist ein zentrales Werkzeug, um die Verfügbarkeit von Mitarbeitern, Kurse und Termine effizient zu planen und zu organisieren. Nutze die Funktionen, um den Überblick zu behalten und eine reibungslose Koordination zu gewährleisten.
$body$, 'aktiv', 10005);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('9a47d21c-8d8d-5435-bef9-8f81bbe2a01b', '6465412b-afa4-5adc-b733-6af8a564849c', 'Kurse', 'magicline-02-navigation-05-kurse-md', '', $body$# Kurse

## Kursübersicht

Der Bereich "Kurse" bietet dir eine zentrale Übersicht über alle angebotenen Kurse und deren Details.

Du kannst einsehen, wie viele und welche Mitglieder sich für einen Kurs angemeldet haben, wer der Kursleiter ist und um welche Uhrzeit dieser stattfindet.

Wenn sich Mitglieder für einen bestimmten Kurs anmelden möchten, kannst du dies auch hier tun, indem du einfach auf den entsprechenden Kurs gehst und das Mitglied hinzufügst.
$body$, 'aktiv', 10006);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('530c5933-8989-5c51-9661-75fe7de2a3af', '6465412b-afa4-5adc-b733-6af8a564849c', 'Analytics', 'magicline-02-navigation-06-analytics-md', 'Der Bereich "Analytics" bietet dir einen schnellen Überblick über die wichtigsten Kennzahlen des ausgewählten Studios. Du wirst ihn in deinem Arbeitsalltag so gut wie gar nicht brauchen, es schadet jedoch nicht, ihn e…', $body$# Analytics

Der Bereich "Analytics" bietet dir einen schnellen Überblick über die wichtigsten Kennzahlen des ausgewählten Studios. Du wirst ihn in deinem Arbeitsalltag so gut wie gar nicht brauchen, es schadet jedoch nicht, ihn einmal kurz zu besprechen.

## Navigation im Analytics-Bereich

Nach Auswahl eines Studios werden folgende zentrale Kategorien angezeigt:
- Allgemeine Informationen
- Anzahl Check-Ins
- Mitgliederliste – Check-Ins
- Auslastung

### Allgemeine Informationen
Hier siehst du, wie viele Mitglieder sich gestern, im aktuellen Monat, im letzten Monat, im Vorjahresmonat und im „Year-to-date" eingecheckt haben.

### Mitgliederliste – Check-Ins
Hier kann man die Check-Ins vom Vortag nochmal anschauen.

### Auslastung
Hier wird die durchschnittliche Auslastung der Wochentage grafisch angezeigt.
$body$, 'aktiv', 10007);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('81fabb1e-d633-5fea-a2ec-e83bf45b0a3d', '6465412b-afa4-5adc-b733-6af8a564849c', 'Verkauf', 'magicline-02-navigation-07-verkauf-md', 'Der Bereich "Verkauf" ermöglicht die einfache Abwicklung von Käufen für Mitglieder direkt an der Theke. Hier findest du alle angebotenen Produkte und Dienstleistungen übersichtlich dargestellt und nach Kategorien geor…', $body$# Verkauf

Der Bereich "Verkauf" ermöglicht die einfache Abwicklung von Käufen für Mitglieder direkt an der Theke. Hier findest du alle angebotenen Produkte und Dienstleistungen übersichtlich dargestellt und nach Kategorien geordnet.

## Schritte zur Nutzung des Verkaufsbereichs

### 1. Artikel oder Dienstleistung auswählen
- Nutze die Kategorien im Header, um schneller zum gewünschten Produkt oder zur Dienstleistung zu navigieren.
- Wähle den gewünschten Artikel aus, um ihn zum Verkauf hinzuzufügen.
- Hinweis: Eine detaillierte Übersicht über das Angebot findest du im Service-/Theken-Kurs.

### 2. Mitglied zuordnen
- Suche das Mitglied auf der rechten Seite, um den Kauf zuzuweisen.
- Falls das Mitglied nicht direkt sichtbar ist, nutze das Filter-Icon, um die Liste zu sortieren (z. B. „Nur Mitglieder" ausschalten).
- Sobald das Mitglied gefunden wurde, einfach anklicken.

### 3. Verkauf abschließen
- Klicke unten rechts auf „Jetzt Verkaufen", um den Kauf abzuschließen.
- Wähle die gewünschte Zahlungsmethode aus:
  - Kartenzahlung (mit unserem Kartenlesegerät)
  - Lastschrifteinzug
- Hinweis: Barzahlung wird nicht angeboten.

## Hinweis

Der Verkaufsbereich erleichtert dir die Verwaltung von Transaktionen und sorgt für einen reibungslosen Ablauf an der Theke. Achte darauf, dass Mitgliedsdaten korrekt zugeordnet sind und immer die richtige Zahlungsmethode gewählt wird. **Kunden bzw. Mitglieder sollten möglichst niemals auf später zahlen**, da sich sonst schnell offene Forderungen ansammeln. Andernfalls bleiben häufig Rückstände über sehr lange Zeit bestehen – teils sogar noch nach Jahren – und verursachen unnötigen Verwaltungsaufwand.
$body$, 'aktiv', 10008);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('00a86eca-3184-5adc-84e6-681cb8ce47dd', '6465412b-afa4-5adc-b733-6af8a564849c', 'Hilfe und Support', 'magicline-02-navigation-08-hilfe-und-support-md', 'Der Bereich "Hilfe und Support" bietet schnelle Lösungen und Unterstützung bei Problemen mit Magicline oder anderen Funktionen. Hier findest du hilfreiche Anleitungen, Antworten auf häufig gestellte Fragen und Kontakt…', $body$# Hilfe und Support

Der Bereich "Hilfe und Support" bietet schnelle Lösungen und Unterstützung bei Problemen mit Magicline oder anderen Funktionen. Hier findest du hilfreiche Anleitungen, Antworten auf häufig gestellte Fragen und Kontaktmöglichkeiten für weiterführende Hilfe.
$body$, 'aktiv', 10009);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('4163a2ac-f7ea-575c-b6a8-59669a9677bf', '6465412b-afa4-5adc-b733-6af8a564849c', 'Wellpass, Urban Sports Club & Wellhub – Grundlagen', 'magicline-03-wellpass-urbansports-wellhub-01-grundlagen-md', 'Wellpass, Urban Sports Club und Wellhub sind Plattformen, die Menschen Zugang zu einem breiten Spektrum an Fitness-, Sport- und Wellnessangeboten bieten. Sie ermöglichen es, flexibel und unabhängig von einem bestimmte…', $body$# Wellpass, Urban Sports Club & Wellhub – Grundlagen

Wellpass, Urban Sports Club und Wellhub sind Plattformen, die Menschen Zugang zu einem breiten Spektrum an Fitness-, Sport- und Wellnessangeboten bieten. Sie ermöglichen es, flexibel und unabhängig von einem bestimmten Fitnessstudio aus einer Vielzahl von Partnerangeboten zu wählen.

## Unterschiede zwischen den Plattformen

- **Wellpass:** Konzentriert sich auf Firmenfitness und ermöglicht Angestellten Zugang zu einer breiten Auswahl an Sport- und Wellnessangeboten.
- **Urban Sports Club:** Bietet neben Firmenfitness auch Mitgliedschaften für Einzelpersonen an und umfasst ein vielfältiges Angebot, das von Yoga über Krafttraining bis hin zu Wellness reicht.
- **Wellhub:** Ist ausschließlich auf Firmenfitness spezialisiert.
$body$, 'aktiv', 10010);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('0e3a37d8-0b2b-5719-bd26-ee6ce4660c1c', '6465412b-afa4-5adc-b733-6af8a564849c', 'Wellpass Mitglieder', 'magicline-03-wellpass-urbansports-wellhub-02-wellpass-mitglieder-md', '', $body$# Wellpass Mitglieder

## Schritte zum Umgang mit Wellpass-Mitgliedern

## Wellpass Anmeldung

Wellpass-Mitglieder checken sich bei ihrer Ankunft mithilfe ihres QR-Codes an der Theke ein. Nach der erfolgreichen Anmeldung zeigen sie die Bestätigung in ihrer App vor.

### Ablauf am Empfang
Nach der Bestätigung erhalten die Mitglieder ein Tagesgastband, das für den Zugang zu den Umkleiden und Geräten benötigt wird. Dieses Band wird im Austausch gegen ein Pfand, wie beispielsweise einen Schlüssel oder die Krankenversicherungskarte, ausgegeben.

## Wellpass Mitglied Band zuweisen

Wellpass-Mitglieder haben die Möglichkeit, zusätzlich einen V-itness-Chip zu erwerben. Dieser Chip speichert ihre persönlichen Daten und ermöglicht den Zugang zu unserem E-Gym-Programm sowie zum Flexx-Circle. Der Chip kann direkt an der Theke für 5 EUR gekauft werden – ohne Kaution.

**Wichtig:** Der Erwerb des V-itness-Chips berechtigt nicht automatisch zur Nutzung des E-Gym-Programms. Dieses muss separat erworben werden mit einem Start-Paket (Bronze, Silber oder Gold).

**Besonderheit:** Wellpass-Mitglieder können das **„WELLPASS klein" Startpaket** erwerben, das eine vollständige Studioführung, die Erstellung eines individuellen Trainingsplans sowie eine Anamnese beinhaltet. Im Gegensatz zu den regulären Startpaketen Bronze, Silber und Gold ist das „WELLPASS klein" Paket eine Besonderheit, die speziell für Wellpass-Mitglieder angeboten wird. Wichtig zu beachten ist, dass der Zugriff auf E-Gym und Flexx im „WELLPASS klein" Paket nicht enthalten ist.

### Schritte zur Registrierung und CHIP-Zuweisung

**Aggregator-Mitglied hinzufügen**
- Öffne den Bereich **Check-In** in Magicline und klicke oben rechts auf **Aggregator Mitglied hinzufügen**.
- Wähle bei Aggregator die Option **EGYM Wellpass** aus.
- Fordere die Verifizierungs-TAN des Mitglieds an. Diese findet das Mitglied in der Wellpass-App unter **Einstellungen**.
- Gib die Verifizierungs-ID ein und drücke auf **VALIDIEREN**.
- Der Vor- und Nachname des Mitglieds wird automatisch ausgefüllt – eine manuelle Eingabe ist nicht erforderlich.

**Persönliche Informationen ergänzen**
- Vervollständige die Daten des Mitglieds, wie:
  - Adresse
  - Telefonnummer
  - E-Mail-Adresse (Achte darauf, dass die E-Mail-Adresse exakt mit der in der Wellpass-App hinterlegten übereinstimmt.)

**Fitness-Band zuweisen**
- Drücke erneut auf **Weiter** und weise das Fitness-Band dem Mitglied zu.

**Automatische Anmeldung mit dem Fitness-Band**
Ab dem Moment, in dem das Fitness-Band verknüpft ist, entfällt der QR-Code-Check-In. Das Mitglied wird bei jedem Besuch automatisch im System registriert, sobald es sich am Terminal an der Theke mit dem Band eincheckt.

## Hinweis

Dieser Ablauf sorgt dafür, dass Wellpass-Mitglieder schnell und einfach auf alle Bereiche deines Studios zugreifen können. Stelle sicher, dass die Daten vollständig und korrekt hinterlegt sind, um reibungslose Abläufe zu garantieren.
$body$, 'aktiv', 10011);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('856a039d-fa0e-5282-b089-d15166460790', '6465412b-afa4-5adc-b733-6af8a564849c', 'Urban Sports Mitglieder', 'magicline-03-wellpass-urbansports-wellhub-03-urban-sports-mitglieder-md', '', $body$# Urban Sports Mitglieder

## Urban Sports Anmeldung

Urban Sports Mitglieder checken sich an der Theke mithilfe ihres QR-Codes ein. Im Gegensatz zu Wellpass-Mitgliedern gibt es dabei einen wichtigen Unterschied: Nach dem Einchecken werden Urban Sports Mitglieder automatisch als Interessenten im Magicline-System hinterlegt.

### Ablauf am Empfang

Nach dem Check-in mit dem QR-Code erhalten die Mitglieder ein Tagesgastband gegen ein Pfand. Alternativ können sie – ebenso wie Wellpass-Mitglieder – ein eigenes Band direkt an der Theke erwerben. Während Wellpass-Mitglieder als Aggregatoren angelegt werden, wird bei Urban Sports nach dem Check-in automatisch ein Interessent im Magicline-System erstellt. Dieser kann anschließend in Magicline gefunden und direkt einem Account zugeordnet werden, ähnlich wie bei regulären Mitgliedern.

### Eigene Bänder

Ein eigenes Band ist besonders praktisch für Mitglieder, die regelmäßig bei uns trainieren und nicht nur sporadisch oder auf der Durchreise sind.

**Wichtig:** Urban Sports Mitglieder mit einem eigenen Band müssen vor dem Check-in an der Theke immer zuerst ihren QR-Code mit dem Handy scannen. Ohne diesen Schritt ist ein Check-in mit dem eigenen Band nicht möglich. Um den E-Gym oder Flexx Circle zu nutzen, ist zusätzlich der Kauf eines Startpakets (Bronze, Silber oder Gold) erforderlich.
$body$, 'aktiv', 10012);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('b322d385-3c5f-5da3-9abd-5870999a0ae0', '6465412b-afa4-5adc-b733-6af8a564849c', 'Wellhub Mitglieder', 'magicline-03-wellpass-urbansports-wellhub-04-wellhub-mitglieder-md', '', $body$# Wellhub Mitglieder

## Wellhub Anmeldung

Bei Wellhub-Mitgliedern funktioniert der Check-in anders als bei Urban Sports oder Wellpass. Sie können sich direkt über ihr Handy ohne QR-Code einscannen und mit dem Training beginnen.

### Ablauf am Empfang
Nachdem Wellhub-Mitglieder an der Theke vorgezeigt haben, dass sie sich über ihr Handy angemeldet haben, erhalten sie im Austausch gegen ein Pfand ein Tagesgastband.

**Wichtig:** Wellhub verfügt über keine Schnittstelle zu Magicline. Das bedeutet, dass Wellhub-Mitglieder nicht automatisch als Interessenten in Magicline hinterlegt werden können und somit im System nicht sichtbar sind.

### Zusätzliche Hinweise für Bänder

Falls ein Wellhub-Mitglied ein eigenes Band (z. B. für E-Gym oder Flexx Circle) benötigt, muss es zuerst ein Startpaket (Bronze, Silber oder Gold) erwerben. Anschließend müssen die Mitglieder manuell als Interessenten im System hinterlegt werden.

Dieses persönliche Band kann ausschließlich für E-Gym und Flexx Circle genutzt werden – nicht jedoch für den Check-in oder die Nutzung der Spinde. Für diese Funktionen benötigen Wellhub-Mitglieder weiterhin ein Tagesgastband und müssen sich zusätzlich jedes Mal manuell mit ihrem Handy einchecken.
$body$, 'aktiv', 10013);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('4aaf8828-9be4-5050-ae56-cbe8c1790672', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Einführung in die Aufgaben als Service-Mitarbeiter', 'theke-01-grundlagen-01-einführung-aufgaben-service-mitarbeiter-md', '', $body$# Einführung in die Aufgaben als Service-Mitarbeiter

## Deine Rolle und Aufgaben im Überblick

Als Service-Mitarbeiter bist du der zentrale Kontaktpunkt für Mitglieder und Gäste. Deine Hauptaufgabe ist es, dafür zu sorgen, dass sich alle im Fitnessstudio willkommen und gut betreut fühlen. Dabei repräsentierst du das Studio mit deinem Auftreten und deiner Professionalität.

Du begrüßt die Mitglieder mit einem freundlichen Lächeln und stehst als erste Anlaufstelle für Fragen und Anliegen zur Verfügung. Zusätzlich bist du verantwortlich für die Pflege des Empfangsbereichs, die Beratung zu Produkten und Dienstleistungen sowie die Organisation von Terminen. Deine Kommunikation mit dem Team sorgt für einen reibungslosen Ablauf.

## Ankunftszeiten und Vorbereitung

Pünktlichkeit und eine gute Vorbereitung sind entscheidend, um deinen Arbeitstag stressfrei und strukturiert zu beginnen. Rechtzeitiges Erscheinen zeigt Verlässlichkeit und Respekt gegenüber Kunden und Kollegen. Es ermöglicht dir außerdem, dich mit dem Teammitglied, das vor dir gearbeitet hat, auszutauschen und alle wichtigen Informationen zu übernehmen.

Vor Schichtbeginn solltest du mindestens 5–10 Minuten vorher eintreffen, um dich optimal vorzubereiten. Kontrolliere den Empfangsbereich sowie die Umkleiden und öffentlichen Bereiche auf Sauberkeit und Ordnung. Führe den Clubcheck durch und stelle sicher, dass alle Materialien wie Mitgliedsbänder, Supplements oder Informationsblätter griffbereit sind. Ein gepflegtes Erscheinungsbild und saubere Arbeitskleidung gehören ebenfalls zu einer professionellen Vorbereitung.

## Rezeptionstätigkeiten im Detail

Die Rezeption ist das Herzstück des Studios, wo du den ersten und letzten Kontakt zu den Mitgliedern hast. Deine Aufgaben umfassen dabei:

**Mitgliederumgang:** Dein professioneller und herzlicher Umgang prägt das Erlebnis der Mitglieder. Begrüße sie freundlich und sorge dafür, dass sie sich gut aufgehoben fühlen.

**Check-in und Check-out:** Überprüfe die Mitgliedskarten oder Armbänder der Kunden und stelle sicher, dass nur berechtigte Personen das Studio betreten. Deine Aufmerksamkeit trägt wesentlich zur Ordnung bei.

**Telefon und E-Mails:** Bearbeite Anrufe und E-Mails kompetent und freundlich. Dazu gehören Terminvereinbarungen, Rückfragen oder Anliegen von Mitgliedern. Eine zeitnahe und klare Kommunikation ist dabei unerlässlich.

**Beratung und Verkauf:** Informiere Mitglieder über die Angebote des Studios, wie Kurse, Personal Training oder spezielle Messungen. Unterstütze sie bei der Auswahl von Produkten wie Getränken, Snacks oder Fitnesszubehör und hilf, ihre Entscheidungen zu erleichtern. Bei Interesse an einer Mitgliedschaft solltest du einen Termin bei einem Berater vereinbaren.

**Terminverwaltung:** Koordiniere Buchungen für Personal Training, Kurse oder andere Dienstleistungen. Halte den Terminkalender stets aktuell, um Änderungen oder Anpassungen rechtzeitig vorzunehmen.

**Ansprechpartner für Anliegen:** Höre aktiv zu, wenn Mitglieder mit Feedback, Fragen oder Beschwerden auf dich zukommen. Wo möglich, löse die Anliegen sofort, oder leite komplexere Themen an die zuständige Person weiter.

## Die Bedeutung deiner Aufgaben

Deine Arbeit an der Rezeption ist entscheidend für den Erfolg des Studios. Als Gesicht des Studios prägst du den ersten Eindruck, den Mitglieder mitnehmen. Deine Freundlichkeit und Kompetenz schaffen Vertrauen und steigern die Zufriedenheit der Kunden.

Mit klarer Organisation, strukturierten Abläufen und deinem Engagement sorgst du dafür, dass alles reibungslos funktioniert. Deine Rolle ist zentral für die Kundenbindung, denn zufriedene Mitglieder kommen gerne wieder und empfehlen das Studio weiter. Mit deiner Professionalität machst du die Rezeption zu einem Ort, an dem sich alle gut aufgehoben fühlen.
$body$, 'aktiv', 20000);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('cd2bf7be-25c5-5eec-94e4-fa50707ba46e', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Ziele und Standards des Studios', 'theke-01-grundlagen-02-ziele-und-standards-md', '', $body$# Ziele und Standards des Studios

## Ziele

Als Service-Mitarbeiter repräsentierst du das Fitnessstudio und trägst aktiv dazu bei, seine Mission umzusetzen:

- **Kundenzufriedenheit steigern:** V-itness strebt an, jedem Mitglied ein positives und motivierendes Umfeld zu bieten.
- **Gesundheit und Fitness fördern:** Ziel ist es, Menschen zu einem gesünderen und aktiveren Lebensstil zu verhelfen.
- **Professionalität gewährleisten:** Das Studio steht für qualitativ hochwertige Dienstleistungen und eine professionelle Betreuung.
- **Gemeinschaft aufbauen:** Das Fitnessstudio soll ein Ort sein, an dem Mitglieder sich wohlfühlen und Teil einer Community werden.

## Standards des Studios

Damit diese Ziele erreicht werden, gibt es feste Standards, die im Alltag eingehalten werden müssen. Dazu gehören:

- **Freundlichkeit und Respekt:** Jeder Kunde, egal ob Anfänger oder langjähriges Mitglied, wird mit Respekt und Wertschätzung behandelt.
- **Sauberkeit und Hygiene:** Das Studio legt großen Wert auf einen sauberen und hygienischen Zustand aller Bereiche – vom Empfang über die Trainingsflächen bis zu den Umkleiden.
- **Kompetenz und Zuverlässigkeit:** Jeder Mitarbeiter sollte über die angebotenen Produkte, Dienstleistungen und Prozesse Bescheid wissen, um Kundenfragen kompetent beantworten zu können.
- **Einheitliches Auftreten:** Arbeitskleidung und Verhalten sollten die Professionalität und Werte des Studios widerspiegeln.

## Wie du die Ziele und Standards in deiner Arbeit umsetzt

- **Informiere dich regelmäßig:** Bleibe auf dem Laufenden über Neuerungen, Aktionen oder spezifische Angebote des Studios. Hierbei hilft dir der Wichtig-Ordner.
- **Kommuniziere klar:** Stelle sicher, dass du die Werte und Vorteile des Studios klar und positiv an Kunden weitergibst.
- **Setze Prioritäten:** Handle stets im Interesse der Studioziele – sei es bei der Kundenberatung, dem Verkauf von Zusatzprodukten oder dem Umgang mit Beschwerden.
- **Infos oder Beschwerden:** Nimm diese durch aktives Zuhören in Ruhe auf und zeige Verständnis. Wenn du das Problem des Mitglieds nicht direkt lösen kannst, so nimm die Beschwerde schriftlich per E-Mail auf und sende diese Mail an die entsprechende Stelle. Beispielsweise ist das der Reha-Bereich, die Studioleitung oder die Verwaltung.

---

Indem du die Ziele und Standards des Studios verinnerlichst und in deiner täglichen Arbeit umsetzt, leistest du einen wertvollen Beitrag zum Erfolg des Unternehmens. Du bist nicht nur ein Service-Mitarbeiter, sondern auch ein Botschafter, der die Vision des Studios nach außen trägt.
$body$, 'aktiv', 20001);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('bf7bc8a4-3341-5aac-a986-2797b45d72c2', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'VIP Ticket Umgang & Terminvereinbarung', 'theke-01-grundlagen-03-vip-ticket-umgang-md', '', $body$# VIP Ticket Umgang & Terminvereinbarung

## VIP TICKET – Regelwerk & Handhabung

**Was ist das VIP Ticket?**

Das **VIP Ticket** ist ein exklusiver Vorteil, den **bestehende Mitglieder** erhalten können. Es wird entweder als Dankeschön für die Teilnahme an einer Umfrage oder beim Kauf eines **Startpakets (SP)** vergeben. Dieses Ticket dürfen Mitglieder „**gezielt"** **an Freunde, Familie, Bekannte oder Arbeitskollegen verschenken** – als Einladung zu **4 Wochen kostenlosem Training bei Vitness**. „Gezielt" soll heißen, dass die Mitglieder, die das VIP-Ticket verschenken, 4–6 Wochen gratis nach Ablauf der Neumitgliedschaft (52 oder 104 Wochen) erhalten.

## Damit das VIP Ticket fair und korrekt eingesetzt wird, gelten folgende verbindliche Regeln

### Nur 1 Ticket pro Person
- Jede Person darf **maximal 1 VIP Ticket innerhalb von 2 Jahren** einlösen.
- Hat jemand **in den letzten 2 Jahren** bereits ein Vitness-Abo gehabt, **darf kein VIP Ticket eingelöst werden.**
- Ausnahme: Wenn die letzte Mitgliedschaft **mehr als 2 Jahre** her ist – **dann ist die Einlösung erlaubt.**

### Keine Einlösung durch Wellpass oder Urban Sports Mitglieder
- Personen mit einer aktiven oder pausierten **Wellpass- oder Urban Sports-Mitgliedschaft** dürfen **KEIN VIP Ticket** nutzen!

### Strikte Einhaltung
- **Auf gar keinen Fall** darf jemand **mehr als ein** VIP Ticket einlösen.
- Bitte **immer im System prüfen**, ob es bereits eine aktive oder vergangene Mitgliedschaft gibt.

## Wie trägt man ein VIP Ticket richtig ein?

**Ziel:**

Das VIP Ticket ist **kein nettes Extra**, sondern ein **gezieltes Werkzeug zur internen Mitgliedergewinnung**! Wir möchten grundsätzlich Mitglieder in unseren beiden Studios sehen, die zu uns reinpassen. Das gelingt am besten mit den Mitgliedern, die uns weiterempfehlen.

Es gibt Interessierten die Chance, Vitness **unverbindlich kennenzulernen** – mit dem Ziel, dass **sie sich während der 4 Wochen oder** danach **für eine Mitgliedschaft entscheiden**.

Damit das gelingt, ist es wichtig, dass die VIP-Mitglieder von Anfang an **wie echte Mitglieder behandelt und korrekt erfasst werden**.

## So legst du ein VIP-Mitglied richtig an

Wenn ein VIP Ticket eingelöst wird, MUSS das Mitglied **vollständig im System angelegt werden** – **genauso wie jedes zahlende Mitglied**. Bitte folgende Informationen **lückenlos erfassen**:
- Vor- und Nachname
- Adresse (Straße, PLZ, Ort)
- Geschlecht
- Geburtsdatum
- Telefonnummer
- E-Mail-Adresse
- Interne Notiz: „VIP TICKET" + Name des Empfehlers

### Warum das wichtig ist
Nur wenn wir **alle Kontaktdaten** haben, können wir die Person im Anschluss **gezielt ansprechen**, betreuen – und letztlich für eine Mitgliedschaft begeistern. Das ist der **Kern des VIP-Ticket-Konzepts**!

## Wichtig: Vorher immer prüfen!

Bevor du jemanden als VIP-Mitglied einträgst, **immer zuerst prüfen:**

1. **Besteht schon ein Datensatz?**
   - Nicht doppelt anlegen! Doppelte Profile führen zu Chaos und falschen Infos.
   - Bei Namensähnlichkeiten genau hinschauen (z. B. Schreibweise, E-Mail vergleichen).
2. **Mitgliedschaft in der Vergangenheit?**
   - Hatte die Person **in den letzten 2 Jahren einen Vertrag**? → **Kein VIP Ticket einlösbar!**
   - Hatte sie schon mal ein **VIP Ticket**? (innerhalb 2 Jahre) → **Ebenfalls nicht erlaubt!**
3. **Ist die Person bei Wellpass oder Urban Sports?**
   - Wenn ja → **kein VIP Ticket zulässig!**

### Warum das wichtig ist
Das VIP Ticket soll **neue Leute zu Vitness bringen** – keine bestehenden oder ehemaligen Mitglieder, die das System umgehen wollen.

## Hinweis für den Umgang

- VIP Ticket-Mitglieder sind **gleichwertig zu normalen Mitgliedern zu behandeln.**
- Die Daten sind für **Marketing, Betreuung & Vertragsgespräche** extrem wichtig.
- Ziel ist es, dass diese Person **am Ende der 4 Wochen** sagt: *„Ich will bleiben!"*
- Im Zweifel lieber kurz die Studioleitung oder ein erfahrenes Teammitglied fragen.

## VIP Ticket Starttermin

Beim Umgang mit VIP Ticket-Interessenten gibt es **zwei typische Fälle** – je nachdem, **ob sie anrufen oder spontan im Studio erscheinen.** In beiden Fällen ist das Ziel: **Beraten → Begeistern → Mitglied gewinnen!**

### Fall 1: Die Person ruft an (Telefonischer Erstkontakt)

**So läuft's ab:**

1. **Terminvereinbarung am Telefon** → Vereinbare direkt **zwei aufeinanderfolgende Termine:**
   - **Beratungstermin (mit einem Berater)**
   - **Trainertermin direkt im Anschluss**
2. **Warum doppelt?**
   - Damit die Person beim ersten Besuch **perfekt betreut** wird.
   - Ziel: **Vorabvertrag abschließen** + direkt ins Training starten.
3. **Mitglied wird direkt angelegt**
   - Da die Person am gebuchten Tag erscheint und **gleich starten kann**, legst du sie **direkt im System an**, inkl. aller Daten (siehe Erfassungs-Regeln oben).

### Fall 2: Die Person kommt spontan ins Studio

Hier gibt's **zwei Varianten**, je nach Wunsch der Person:

#### Variante A: Termin wird vereinbart
**Wichtig:** Noch **nicht im System anlegen**, da das VIP Ticket **ab dem Anlegetag** läuft!

**Vorgehen:**
- Beratertermin + Trainertermin **hintereinander buchen**
- Nur **einen Kalendereintrag machen & Interessenten anlegen** (noch kein VIP Ticket anlegen!).
- Am Tag des Termins wird **dann das VIP Ticket bei dem Interessenten aktiviert.**

#### Variante B: Die Person möchte sofort starten
**Vorgehen:**
- Lege die Person **komplett im System an** (mit allen Daten, wie bei regulären Mitgliedern)
- Vereinbare zusätzlich einen **Beratungs- und Trainertermin.**
- Sie darf ab sofort trainieren.

## Wichtige Hinweise für beide Fälle

- Der **Beratungstermin ist Pflicht** – idealerweise gleich mit dem Trainertermin kombiniert.
- Das VIP Ticket ist ein **Vertriebsinstrument** – es lebt davon, dass wir **aktiv beraten, begleiten und überzeugen!**
- Immer darauf achten, dass die **vier Wochen sinnvoll genutzt werden** – also **nicht zu früh im System anlegen!** (Start des VIP-Zeitraums)
- Je **besser und professioneller** der Einstieg, desto höher die Chance auf eine **langfristige Mitgliedschaft**.
$body$, 'aktiv', 20002);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('7e76f3c9-6ebb-5da9-baf4-5a5ca9ebc3c1', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Clubchecks', 'theke-02-taegliche-arbeitsablaeufe-01-clubchecks-md', '', $body$# Clubchecks

## Clubcheck

Der **ClubCheck** ist eine der wichtigsten Aufgaben im täglichen Studioalltag. Durch diese regelmäßigen Kontrollgänge sorgst du dafür, dass das Studio jederzeit ordentlich, sauber und einladend ist. Ein gut gepflegtes Studio hinterlässt bei den Kunden einen positiven Eindruck und trägt maßgeblich zur Kundenzufriedenheit bei.

## Was ist der ClubCheck?

Beim ClubCheck gehst du einmal pro Stunde durch das gesamte Studio und kontrollierst, ob alles in Ordnung ist. Ziel ist es, Probleme frühzeitig zu erkennen und zu beheben, bevor sie auffallen. Deine Aufmerksamkeit und Sorgfalt sorgen dafür, dass sich die Mitglieder rundum wohlfühlen.

## Ablauf eines ClubChecks

### 1. Vorbereitung
Bevor du losgehst, stelle sicher, dass du alle notwendigen Utensilien dabei hast, z. B.:
- Telefon (falls jemand anruft und keiner an der Theke steht)
- Theken-Band (damit die Mitglieder dich anfunken können und somit nicht zu lange auf dich warten müssen)
- Ersatzrollen für Toilettenpapier

### 2. Kontrollpunkte
Gehe Schritt für Schritt durch alle Bereiche des Studios und überprüfe folgende Punkte:

- **Empfangsbereich:** Ist der Empfang aufgeräumt? Sind Prospekte, Flyer und andere Materialien ordentlich ausgelegt? Gibt es Unreinheiten auf der Theke oder dem Boden? Ist die Getränkeanlage sauber?
- **Trainingsflächen:** Liegen alle Hanteln und Matten an ihrem Platz? Gibt es Müll, der entsorgt werden muss?
- **Umkleiden:** Ist genug Seife in den Spendern? Gibt es ausreichend Toilettenpapier? Sind die CWS-Rollen ausreichend? Sind Mülleimer geleert und die Böden sauber?
- **Saunabereich:** Ist die Sauna angeschaltet und sauber? Gibt es noch genügend Aufguss? Ist der Ruheraum sauber?

**Wichtig:** Vergiss nicht, auch nach den Mitgliedern in den jeweiligen Bereichen zu sehen und dich über ihr Wohlbefinden zu erkundigen. Nach jedem Clubcheck sollst du auch unbedingt deine Unterschrift hinterlassen, so signalisieren wir den Mitgliedern, dass wir regelmäßig für Sauberkeit und Ordnung im Studio sorgen!

### Kleine Probleme direkt lösen
Wenn etwas auffällt, das du sofort beheben kannst (z. B. eine kleine Verschmutzung oder fehlende Seife), kümmere dich direkt darum.

### Größere Probleme dokumentieren und melden
Falls ein größeres Problem auftritt (z. B. defekte Geräte oder etwas, das du nicht selbst lösen kannst), notiere es und informiere den zuständigen Kollegen oder die Leitung umgehend.

## Tipps

- **Sei systematisch:** Folge immer der gleichen Reihenfolge, um keinen Bereich zu vergessen. Ein strukturierter Ablauf spart Zeit und sorgt für Effizienz.
- **Nutze deine Augen und Nase:** Achte nicht nur auf sichtbare Probleme, sondern auch auf Gerüche, die auf Reinigungsbedarf hinweisen könnten.
- **Bleib freundlich:** Wenn du während des ClubChecks Kunden begegnest, grüße freundlich und biete bei Bedarf Hilfe an.
$body$, 'aktiv', 20003);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('fd125a92-b6b5-5b94-ab66-e3bc54fdfaed', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Check-In & Check-Out', 'theke-02-taegliche-arbeitsablaeufe-02-check-in-check-out-md', 'Der Check-in und Check-out sind die ersten und letzten Berührungspunkte, die ein Mitglied mit dem Studio hat.', $body$# Check-In & Check-Out

Der Check-in und Check-out sind die ersten und letzten Berührungspunkte, die ein Mitglied mit dem Studio hat.

## Ziele des Check-in und Check-out

- Sicherstellen, dass nur autorisierte Mitglieder Zugang zum Studio haben.
- Mitgliedern einen schnellen und unkomplizierten Ablauf bieten.
- Offene Fragen, Zahlungen oder Anliegen direkt klären.

**Wichtig:** Besonders bei Mitgliedern von Wellpass, Urban Sports und Wellhub ist es entscheidend, darauf zu achten, dass sie sich korrekt einchecken. Stelle sicher, dass der Check-in ordnungsgemäß abgeschlossen ist, um mögliche Unstimmigkeiten zu vermeiden.

## Ablauf des Check-in

- Begrüße das Mitglied freundlich mit einem Lächeln.
- Das Mitglied checkt sich eigenständig ein, indem es seine Karte oder sein Armband am dafür vorgesehenen Scanner hält.
- Überprüfe am System, ob die Anmeldung erfolgreich war.

## Besondere Situationen

Es kann vorkommen, dass der Check-in eines Mitglieds nicht funktioniert. In solchen Fällen ist es wichtig, ruhig und freundlich zu bleiben und folgende Schritte zu beachten:

### Schritt 1: Mitglied bitten, den Check-in erneut zu versuchen
Manchmal handelt es sich um einen temporären Fehler, der durch einen erneuten Versuch behoben werden kann. Bitte das Mitglied, seine Karte oder sein Band nochmals zu scannen.

### Schritt 2: Überprüfung in Magicline
Wenn der Check-in auch beim zweiten Versuch nicht funktioniert, suche das Mitglied in Magicline und prüfe sein Profil, um die Ursache zu ermitteln. Häufige Gründe für Check-in-Probleme können sein:

- **Das Mitglied ist im Mahnlauf:** Mitglieder, die offene Beträge haben, müssen diese erst ausgleichen, bevor sie wieder trainieren können. Informiere das Mitglied freundlich über den aktuellen Status. Die Bezahlung sollte direkt über den Verkauf abgewickelt werden. Wenn sich die Mitglieder genauer informieren möchten, können sie eine E-Mail an die Verwaltung senden.
- **Das Mitglied ist außerhalb der erlaubten Tarifzeiten:** Einige Tarife erlauben das Training nur zu bestimmten Zeiten. Wenn das Mitglied außerhalb dieser Zeiten einchecken möchte, erkläre die Tarifbedingungen.
- **Das V-itness Band wurde nicht richtig zugewiesen:** Überprüfe in Magicline, ob das Band korrekt mit dem Profil des Mitglieds verknüpft ist. Falls nicht, solltest du dies direkt erledigen und das Band dem Mitglied zuweisen.
- **Das Mitglied hat das Band vergessen:** Checke das Mitglied manuell über die Suchfunktion im Bereich „Check-In" in Magicline ein und überprüfe so, ob eine laufende Mitgliedschaft besteht. Händige dem Mitglied anschließend ein Tagesband aus. Dafür musst du einen Pfand wie bspw. eine Krankenversicherungskarte entgegennehmen.

## Wichtig: Kommunikation mit dem Mitglied

Bleibe während des gesamten Prozesses freundlich und lösungsorientiert. Erkläre dem Mitglied verständlich, was das Problem ist und welche Schritte unternommen werden, um es zu lösen. Damit zeigst du Professionalität und sorgst dafür, dass das Mitglied sich gut betreut fühlt.
$body$, 'aktiv', 20004);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('6fee85fc-e8c5-54a1-ac18-c287dcf94a5d', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Telefon & E-Mails', 'theke-02-taegliche-arbeitsablaeufe-03-telefon-und-e-mails-md', 'Der Umgang mit Telefon und E-Mails ist ein wichtiger Bestandteil deiner Arbeit an der Rezeption. Als zentraler Ansprechpartner repräsentierst du das Studio und sorgst dafür, dass Anfragen schnell, freundlich und profe…', $body$# Telefon & E-Mails

Der Umgang mit Telefon und E-Mails ist ein wichtiger Bestandteil deiner Arbeit an der Rezeption. Als zentraler Ansprechpartner repräsentierst du das Studio und sorgst dafür, dass Anfragen schnell, freundlich und professionell bearbeitet werden.

## Telefonkommunikation

Das Telefon ist oft der erste Kontaktpunkt für potenzielle Mitglieder, Partner oder bestehende Mitglieder. Eine professionelle und freundliche Gesprächsführung ist entscheidend.

### Vorgehensweise

- **Anruf entgegennehmen:**
  - Melde dich mit dem Namen des Studios und deinem eigenen Namen (z. B. „Herzlich willkommen bei V-itness in XYZ, mein Name ist Max Mustermann, wie kann ich Ihnen helfen?").
  - Bleibe freundlich und aufmerksam, auch wenn es stressig ist.
- **Anliegen klären:**
  - Höre aktiv zu und notiere dir, worum es geht.
  - Beantworte Fragen präzise und höflich. Wenn du die Antwort nicht weißt, biete an, das Anliegen weiterzuleiten oder zurückzurufen.
- **Termine koordinieren:**
  - Für Anfragen zu Terminen (z. B. Personal Training oder Probetraining), überprüfe direkt den Kalender und biete verfügbare Zeiten an.
  - Bestätige die Termine am Ende des Gesprächs klar und notiere sie in Magicline.
- **Abschließen des Gesprächs:**
  - Bedanke dich und verabschiede dich freundlich (z. B. „Vielen Dank für Ihren Anruf, ich wünsche Ihnen noch einen schönen Tag!").

### Besondere Hinweise

- Bei Beschwerden: Bleibe ruhig, höre zu und dokumentiere das Anliegen. Versichere dem Anrufer, dass sich das Team darum kümmert.
- Weiterleitungen: Falls ein Kollege zuständig ist, informiere ihn über die Details.

## E-Mails

E-Mails sind ein wesentlicher Bestandteil der Studioverwaltung, z. B. für Kundenanfragen, Buchungen oder interne Kommunikation. Achte auf eine professionelle und klare Ausdrucksweise.

### 1. E-Mails regelmäßig prüfen
- Kontrolliere das E-Mail-Postfach mehrmals täglich, um sicherzustellen, dass keine wichtigen Nachrichten übersehen werden.
- Bearbeitete E-Mails von der Theke bitte mit einem **grünen Haken** versehen, damit die Verwaltung den Bearbeitungsstatus erkennen kann.

### 2. Strukturierte Antworten
- Beginne mit einer höflichen Begrüßung (z. B. „Sehr geehrter Herr Müller, …").
- Gehe klar und direkt auf die Anfrage ein. Nutze Absätze, um die Antwort übersichtlich zu gestalten.
- Schließe mit einem freundlichen Abschiedsgruß (z. B. „Mit freundlichen Grüßen, Ihr V-itness Team").
- **Zusätzlich:** Der Mitarbeiter, der die E-Mail bearbeitet hat, sollte seinen Namen unter die Antwort setzen, damit bei Rückfragen direkt der richtige Ansprechpartner ersichtlich ist.

### 3. Anfragen bearbeiten
- **Terminbuchungen:** Prüfe den Kalender und bestätige den gewünschten Termin oder biete Alternativen an.
- **Beschwerden:** Bedanke dich für das Feedback, erkläre mögliche Lösungen und leite die Details intern weiter.

### 4. Verwaltungsrelevante E-Mails ablegen
In beiden Filialen gibt es ein Unterpostfach **„Verwaltung"**. Hier sollen folgende Mails abgelegt werden (durch einfaches „Reinziehen"):
1. **Kündigungen**, die per Mail eingehen
2. **Atteste & Ruhezeitenanfragen**
3. **Fragen zu bestehenden Verträgen oder Umstellungen**
4. **Anfragen zu Beiträgen, Mahnungen und Zahlungen**
5. **Kontoänderungen oder SEPA-Mandate von Mitgliedern** (nur die Verwaltung nimmt Kontoänderungen in Magicline vor!)
6. **Anfragen und Bitten zu Dokumenten** (z. B. Mitgliedsverträge versenden)
7. **Anfragen zur Laufzeit oder Kündigung von Verträgen**

### 5. Weiterleitungen
- Falls die Anfrage an eine andere Abteilung oder Person weitergeleitet werden muss, formuliere eine kurze Zusammenfassung und leite die E-Mail entsprechend weiter.
- Informiere den Kunden darüber, wer sich um sein Anliegen kümmern wird.

### 6. Umgang mit Papier-Dokumenten
- **Kündigungen oder Atteste**, die vor Ort abgegeben werden, müssen mit **Eingangsdatum, Stempel und Unterschrift des Mitarbeiters** versehen werden.
- Danach bitte einscannen und per E-Mail an die jeweilige Verwaltungsstelle senden:
  - **Feldkirchen:** verwaltung@vitness-feldkirchen.de (Stephanie Riederle)
  - **Poing:** verwaltung@vitness-poing.de (Ann-Kathrin Pickl)
- Das Originaldokument wird im Studio in das Fach **„Kündigungen und Atteste"** gelegt und von Georg ins Büro gebracht.

### 7. Mitgliederanfragen vor Ort
- Falls Mitglieder Fragen zu verwaltungsrelevanten Themen haben, bitte an die Verwaltung verweisen oder eine E-Mail im Namen des Mitglieds mit dessen Anliegen an die Verwaltung senden.
- **Wichtig:** Die E-Mail-Adresse der Verwaltung darf dem Mitglied mitgeteilt werden, da diese nicht im Internet auffindbar ist.

### 8. Rückgabe von Bändern
- **Kautionsrückgabeformular verwenden!**
- Regeln zur Kautionsrückerstattung beachten:
  - Bei **klassischen Verträgen** bleibt das Band im Besitz des Mitglieds, **keine Kautionsrückerstattung!**
  - Andere Vertragsarten bitte prüfen und die richtige Vorgehensweise beachten.

## Tipps

- **Freundlichkeit und Geduld:** Egal wie stressig es ist – ein höflicher und professioneller Ton ist immer entscheidend.
- **Klarheit und Effizienz:** Beantworte Anfragen zügig und präzise, um unnötige Rückfragen zu vermeiden.
- **Zeitmanagement:** Plane feste Zeiten für die Bearbeitung von E-Mails ein, um den Überblick zu behalten.
- **Dokumentation:** Notiere wichtige Telefonate und E-Mails in Magicline oder dem internen System, um eine lückenlose Kommunikation sicherzustellen.

---

Mit einer professionellen Telefon- und E-Mail-Kommunikation hinterlässt du einen positiven Eindruck und trägst wesentlich zur Kundenzufriedenheit sowie zur Organisation des Studios bei.
$body$, 'aktiv', 20005);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('c1c1c329-a51c-559d-ae0a-08a044c20cd8', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Beratung und Verkauf', 'theke-02-taegliche-arbeitsablaeufe-04-beratung-und-verkauf-md', '', $body$# Beratung und Verkauf

## Verkauf

Die Beratung und der Verkauf sind zentrale Aufgaben an der Rezeption. Als Service-Mitarbeiter bist du die erste Anlaufstelle, um Mitglieder und Interessenten bei Fragen zu unterstützen und passende Produkte oder Dienstleistungen zu empfehlen.

> Dabei ist es wichtig, deine Rolle klar abzugrenzen: Du gibst grundlegende Informationen und leitest Interessenten bei Bedarf an die zuständigen Berater weiter.

## Ziele der Beratung und des Verkaufs

- **Kundenzufriedenheit steigern:** Mitglieder sollen sich gut informiert und betreut fühlen.
- **Bedürfnisse erkennen:** Verstehe die Anliegen der Mitglieder, um sie an die richtigen Ansprechpartner zu vermitteln.
- **Vertrauen aufbauen:** Eine kompetente und ehrliche Beratung schafft eine langfristige Bindung.
- **Umsatz fördern:** Du unterstützt den Verkauf von Zusatzprodukten und hilfst, Termine für ausführliche Beratungsgespräche zu koordinieren.

## Deine Aufgaben in der Beratung

- **Grundlegende Informationen geben:**
  - Beantworte Fragen zu den Tarifen, Dienstleistungen oder Angeboten des Studios klar und verständlich.
  - Beschränke dich auf eine allgemeine Übersicht, ohne in tiefergehende Details zu gehen.
- **Interesse erkennen:**
  - Wenn ein Mitglied intensiveres Interesse an einer Tarifänderung, einem neuen Vertrag oder anderen Dienstleistungen zeigt, notiere die Details.
  - Biete an, einen Termin bei einem Berater zu vereinbaren, der sich um die spezifischen Anliegen kümmern kann.
  - Beispiel: „Ich gebe Ihnen gerne einen Überblick über unsere Tarife. Für eine genaue Beratung vereinbare ich für Sie einen Termin mit einem unserer Berater."
- **Weiterleitung an Berater:**
  - Koordiniere direkt einen Termin im System oder informiere den Berater über das Anliegen.
  - Gib dem Mitglied eine Bestätigung des Termins und erkläre, wie der nächste Schritt abläuft.

## Verkauf von Zusatzprodukten

1. **Produkte im Empfangsbereich:**
   - Stelle Getränke, Snacks und Zubehör wie Shakes oder Proteinriegel aktiv vor, wenn es sich anbietet.
   - Betone den Nutzen dieser Produkte, z. B. „Dieser Shake unterstützt optimal die Regeneration nach dem Training."
2. **Gezielte Empfehlungen:**
   - Nutze die Gelegenheit, Mitglieder auf Aktionen, Rabatte oder neue Angebote hinzuweisen.
   - Beispiel: „Wir haben gerade ein Sonderangebot auf unsere Getränkepakete – das könnte für Sie interessant sein."

## Tipps für eine erfolgreiche Beratung und Verkauf

- **Nur grundlegende Infos geben:** Gib keine umfassenden Tarifberatungen, sondern leite interessierte Mitglieder an die Berater weiter.
- **Aktives Zuhören:** Zeige Verständnis für die Wünsche und Fragen der Mitglieder und biete gezielte Lösungen an.
- **Positive Sprache:** Betone den Mehrwert der Angebote, um Begeisterung zu wecken.
- **Kooperation mit Beratern:** Halte engen Kontakt mit den Beratern, um nahtlos zu kommunizieren und Termine effizient zu organisieren.
- **Vertrauen schaffen:** Dränge nicht zum Kauf, sondern stelle die Bedürfnisse der Mitglieder in den Vordergrund.

## Abschluss und Nachbereitung

- **Terminvereinbarung:** Stelle sicher, dass Interessenten einen Termin bei einem Berater erhalten, wenn sie tiefergehendes Interesse zeigen. Notiere die Anfrage präzise und leite sie an den Berater weiter.
- **Dokumentation:** Erfasse Verkäufe und vereinbarte Termine direkt im System, um einen reibungslosen Ablauf zu gewährleisten.
- **Nachverfolgen:** Informiere die Berater über spezielle Anliegen, die im Gespräch erwähnt wurden, damit sie optimal vorbereitet sind.

---

Mit diesem klaren Vorgehen stellst du sicher, dass Mitglieder eine professionelle und kompetente Beratung erhalten. Indem du grundlegende Informationen gibst und tiefergehende Anfragen an die Berater weiterleitest, schaffst du Vertrauen und stärkst die Qualität des Services.
$body$, 'aktiv', 20006);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('dc4517ea-c21b-5724-9c66-e812a077e136', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Termine', 'theke-02-taegliche-arbeitsablaeufe-05-termine-md', '', $body$# Termine

## Termin-Kategorien und Leistungen

Die Terminverwaltung wird in vier Kategorien unterteilt, die je nach Terminart und Mitgliedsanfrage ausgewählt werden. Jede Kategorie umfasst spezifische Leistungen, die für dich relevant sind.

## Die 4 Kategorien

1. Kategorie: Analyse
2. Kategorie: Fitness
3. Kategorie: Sonstiges
4. Kategorie: Vertrieb

---

# Analyse

In dieser Kategorie ist die **InBody Messung** für dich relevant. Diese Messung wird genutzt, wenn ein Mitglied seine Körperwerte überprüfen lassen möchte.

## InBody Messung

Nach Abschluss ihrer Mitgliedschaft erhält jedes Mitglied zwei kostenlose InBody-Messungen, um ihre Körperwerte analysieren zu lassen. Sobald diese beiden Gratis-Messungen genutzt wurden, besteht die Möglichkeit, eine weitere Messung für 19 EUR zu erwerben. Alternativ können Mitglieder eine Lifetime-Flatrate für 50 EUR kaufen, die ihnen unbegrenzte InBody-Messungen ermöglicht. Für externe Personen, die keine Mitgliedschaft abgeschlossen haben, bieten wir ebenfalls die Möglichkeit, eine Einzelmessung durchzuführen. Der Preis hierfür beträgt 39 EUR.

---

# Fitness

Die Kategorie **Fitness** umfasst verschiedene Leistungen, die Mitglieder für ihren Trainingsstart, die Weiterentwicklung oder zur individuellen Betreuung nutzen können.

## 1. Starttermin (1ST)
Beim Starttermin (1ST) geht es darum, neue Mitglieder willkommen zu heißen und sie mit dem Studio vertraut zu machen. Der Trainer zeigt den Mitgliedern die verschiedenen Bereiche des Studios, erklärt die Nutzung der Geräte und beantwortet alle offenen Fragen. Ziel des Termins ist es, dem Mitglied einen Überblick zu verschaffen und sicherzustellen, dass es sich im Studio gut orientieren und wohlfühlen kann.

Während dieses Termins wird auch der **E-Gym Circle** individuell auf das Mitglied eingestellt und dessen Nutzung ausführlich erklärt. Der **Flexx Circle** wird in diesem Termin jedoch noch nicht behandelt. Ein Trainingsplan wird ebenfalls noch nicht erstellt – der Fokus liegt auf der Einführung und Klärung erster Fragen, damit das Mitglied sicher und motiviert starten kann.

## 2. Re-Test (2TT)
Ein Re-Test dient dazu, den Fortschritt eines Mitglieds zu überprüfen. Dies kann eine erneute Analyse oder eine Überprüfung des aktuellen Trainingsplans sein. Der Trainer bespricht die Ergebnisse und gibt Empfehlungen für Anpassungen.

## 3. Trainingsplan (TP)
Dieser Termin umfasst die Erstellung oder Aktualisierung eines individuellen Trainingsplans, basierend auf den Zielen des Mitglieds. Hier wird sichergestellt, dass das Training effektiv bleibt und Fortschritte erzielt werden.

## 4. Service (SER)
Unter Service fallen kleine Anpassungen oder Hilfestellungen, wie das Nachjustieren eines Trainingsplans, kurze Fragen zur Technik oder Feedback zum bisherigen Training.

## 5. EGYM Plus (EGP)
Ein Einführungstermin für die Nutzung der EGYM Plus Geräte. Hier wird dem Mitglied erklärt, wie die Geräte funktionieren, wie sie effektiv genutzt werden können, und es wird ein persönliches Profil erstellt.

## 6. EGYM-Wellpass-Starttermin (EGY)
Dieser Termin ist speziell für Wellpass-Mitglieder, die EGYM-Geräte nutzen möchten. Der Trainer gibt eine grundlegende Einführung und unterstützt bei der ersten Nutzung.

## 7. Flexx Einweisung (FLX)
Die Flexx Einweisung umfasst die Einführung in das Flexx-Cirkeltraining, das auf Mobilität und Flexibilität abzielt. Der Trainer zeigt, wie die Geräte funktionieren und welche Übungen für das Mitglied geeignet sind.

## 8. Fläche / Floor (FLR)
Dieser Termin ist für allgemeine Fragen oder Anweisungen auf der Trainingsfläche. Der Trainer ist ansprechbar, um technische Anleitungen zu geben oder Mitglieder zu motivieren.

## 9. Flächenbetreuung Trainer (FLT)
Eine intensivere Betreuung auf der Trainingsfläche, bei der der Trainer proaktiv auf Mitglieder zugeht, Korrekturen gibt und spezifische Hilfestellungen leistet.

## 10. Personal-Training (PT)
Ein exklusiver Termin für ein persönliches Training. Der Trainer arbeitet 1:1 mit dem Mitglied, um gezielt auf dessen Ziele einzugehen. Dieser Service ist in der Regel kostenpflichtig.

## 11. Probetraining (PBT)
Ein kostenloses Training für potenzielle neue Mitglieder, bei dem sie das Studio und die Geräte kennenlernen können. Der Trainer begleitet sie dabei und gibt erste Einblicke in das Training.

## 12. V.I.P Ticket Starttermin
Ein V.I.P Startticket-Termin ist ein Starttermin für Mitglieder, die ein V.I.P-Ticket als Geschenk erhalten haben. Dieser Termin entspricht inhaltlich einem normalen Starttermin, bei dem das Mitglied das Studio kennenlernen kann, der E-Gym Zirkel individuell eingestellt und erklärt wird, sowie offene Fragen beantwortet werden. Der Flexx Zirkel wird in diesem Termin nicht behandelt.

## 13. V.I.P Training (VIP)
Ein speziell auf V.I.P-Mitglieder zugeschnittenes Training. Hier werden oft zusätzliche Services angeboten, und der Fokus liegt auf maximaler Individualität und Komfort.

---

# Sonstiges

In der Kategorie **Sonstiges** gibt es für Service-Mitarbeiter drei relevante Leistungen: **Meeting**, **Pause** und **Putzen**. Diese dienen der internen Organisation und ermöglichen eine reibungslose Zusammenarbeit im Team.

## 1. Meeting
Unter Meetings fallen vor allem Besprechungen zwischen Mitarbeitern. Hierbei kann es sich um kurze Abstimmungen, interne Schulungen oder regelmäßige Team-Meetings handeln. Wenn ein Meeting geplant ist, wird es in dieser Kategorie eingetragen, sodass der Termin für alle sichtbar bleibt.

**Wichtig:** Achte darauf, dass während eines Meetings immer jemand an der Theke bleibt, um die Betreuung der Mitglieder sicherzustellen.

## 2. Pause (PA)
Service-Mitarbeiter, die länger als sechs Stunden arbeiten, haben Anspruch auf eine Pause. Diese kann selbstständig in die Kategorie „Sonstiges" eingetragen werden.

**Wichtig:**
- **Verfügbarkeit sicherstellen:** Stelle vor dem Eintragen deiner Pause sicher, dass immer mindestens ein Mitarbeiter an der Theke bleibt.

## 3. Putzen
Die Reinigung des Studios ist in der Regel im Voraus geplant und als feste Termine eingetragen. In Ausnahmefällen, wenn zusätzliche Reinigungsarbeiten nötig sind (z. B. nach einem unerwarteten Vorfall), kannst du diesen Termin hier eintragen.

**Wichtig:** Falls eine spontane Reinigung erforderlich ist, sprich dich mit dem Team ab und trage den Termin anschließend ein, um die Dokumentation vollständig zu halten.

---

# Vertrieb

Die Kategorie **Vertrieb** umfasst drei Leistungen, die speziell für die Beratung und Betreuung von Interessenten sowie Mitgliedern konzipiert sind.

## 1. Beratungsgespräch (BGS)
Ein Beratungsgespräch (BGS) richtet sich an Interessenten, die am Studio und seinen Leistungen interessiert sind.

In diesem Gespräch werden die Studiovorzüge, Tarife und Angebote detailliert erklärt, offene Fragen beantwortet und die Bedürfnisse des Interessenten erfasst. Ziel ist es, eine vertrauensvolle Atmosphäre zu schaffen und die Vorteile einer Mitgliedschaft im Studio hervorzuheben.

## 2. Mitgliedergespräch
Das Mitgliedergespräch ist für bestehende Mitglieder vorgesehen, die spezifische Anliegen oder Fragen zu ihrer Mitgliedschaft haben. Dies kann z. B. bei Tarifänderungen, Vertragsverlängerungen oder zusätzlichen Services der Fall sein. Der Fokus liegt darauf, das Mitglied bestmöglich zu beraten und sicherzustellen, dass es langfristig zufrieden bleibt.

## 3. V.I.P Ticket Endtermin
Dieser Termin ist speziell für Interessenten oder Mitglieder vorgesehen, deren V.I.P-Ticket abgelaufen ist und die an einer dauerhaften Mitgliedschaft interessiert sind.

Im Gespräch werden die Studiovorteile und Mitgliedschaftsoptionen erläutert, wobei der Fokus darauf liegt, den Interessenten von den langfristigen Vorzügen einer Mitgliedschaft zu überzeugen. Gleichzeitig dient dieser Termin dazu, Fragen zu klären und individuell auf die Bedürfnisse des Interessenten einzugehen.

---

## Deine Verantwortung bei der Terminverwaltung

Als Service-Mitarbeiter spielst du eine wichtige Rolle in der Terminverwaltung. Deine Aufgaben umfassen:

- **Korrekte Terminbuchung:** Stelle sicher, dass Termine immer in der passenden Kategorie eingetragen werden, mit allen nötigen Details.
- **Kommunikation mit Mitgliedern:** Informiere Mitglieder und Interessenten klar über den Zweck und Ablauf ihrer Termine.
- **Verfügbarkeit sicherstellen:** Achte darauf, dass alle Bereiche des Studios während der Termine abgedeckt sind (z. B. Thekendienst während Pausen oder Meetings).
- **Flexibilität bei spontanen Änderungen:** Sei bereit, Termine anzupassen oder neue Termine einzutragen, falls dies erforderlich ist.
$body$, 'aktiv', 20007);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('072caa82-1897-51ab-88aa-ab0349d1e8eb', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Termine buchen', 'theke-02-taegliche-arbeitsablaeufe-06-termine-buchen-md', '', $body$# Termine buchen

## Termine richtig buchen

### Schritt 1: Den Termin im Kalender finden
Um einen Termin zu buchen, öffne zunächst „Termine" in Magicline. Wähle den Tag aus, an dem der Termin stattfinden soll. Suche anschließend den freien Bereich im Zeitplan des entsprechenden Trainers, Beraters oder Mitarbeiters, der die Leistung durchführen soll. Sobald du den gewünschten Slot gefunden hast, klicke darauf, um das Termin-Fenster zu öffnen.

### Schritt 2: Leistung und Kategorie auswählen
Im geöffneten Termin-Feld ist es wichtig, als Erstes die **Kategorie** auszuwählen. Die Kategorie bestimmt die Art des Termins und legt die Grundlage dafür, wie der Termin systematisch im System hinterlegt wird. Beispielsweise könnte es sich um ein Probetraining, ein Beratungsgespräch oder eine andere spezifische Dienstleistung handeln.

Sobald die Kategorie festgelegt ist, wählst du die passende **Leistung** aus, die innerhalb dieser Kategorie erbracht werden soll. Die Leistung beschreibt die genaue Aktivität, die im Rahmen des Termins durchgeführt wird. Es ist wichtig, die Leistung korrekt zuzuordnen, damit alle Beteiligten – vom Mitarbeiter bis zum Mitglied oder Interessenten – genau wissen, worum es bei dem Termin geht.

### Schritt 3: Das Mitglied oder den Interessenten auswählen

**Für bestehende Mitglieder:**
Verwende die Suchfunktion, um das Mitglied im System zu finden und auszuwählen. Dadurch werden alle relevanten Daten wie Name, Telefonnummer und Mitgliedsnummer automatisch hinterlegt.

**Für Interessenten, die noch nicht im System erfasst sind:**
Interessenten, die das Studio noch nicht als Mitglieder registriert haben, können nicht direkt im System ausgewählt werden. In diesem Fall musst du die wichtigsten Informationen manuell in die **Beschreibung** des Termins eintragen. Dazu gehören:
- Der vollständige Name des Interessenten
- Eine gültige Telefonnummer

Diese Informationen sind unverzichtbar, damit wir den Interessenten bei eventuellen Änderungen oder Absagen erreichen können. Schreibe die Daten klar und übersichtlich in die Beschreibung, damit alle Kollegen schnell darauf zugreifen können.

### Schritt 4: Ressourcen und Mitarbeiter zuweisen
Nun ist es wichtig, die **Ressourcen** und den zuständigen **Mitarbeiter** auszuwählen. Hierbei handelt es sich um die Person, die den Termin durchführen wird – sei es ein Trainer, ein Berater oder ein Servicemitarbeiter.

Gehe dabei wie folgt vor:
1. Wähle die **Ressource Mitarbeiter** im Dropdown-Menü.
2. Suche anschließend den jeweiligen Mitarbeiter, der an diesem Tag verfügbar und zuständig ist.
3. Wähle diesen Mitarbeiter aus, um sicherzustellen, dass der Termin in seinem Kalender korrekt hinterlegt ist.

Es ist entscheidend, den Termin immer dem richtigen Mitarbeiter zuzuordnen, damit keine Verwirrung entsteht und die Person sich optimal vorbereiten kann.

### Schritt 5: Überprüfen und Speichern
Bevor du den Termin abschließt, überprüfe alle eingetragenen Informationen sorgfältig:
- Datum und Uhrzeit: Stimmen sie mit der Anfrage überein?
- Leistung und Kategorie: Sind sie korrekt gewählt?
- Mitglied oder Interessent: Sind die Daten vollständig eingetragen?
- Mitarbeiter: Ist der richtige Kollege zugewiesen?

Wenn alle Daten stimmen, speichere den Termin im System. Der Termin wird nun im Kalender des entsprechenden Mitarbeiters angezeigt, und alle Beteiligten haben Zugriff auf die relevanten Informationen.
$body$, 'aktiv', 20008);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('89361217-3c76-50da-a9e2-211088a919c2', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Alle Dienstleistungen, die wir an der Theke verkaufen', 'theke-02-taegliche-arbeitsablaeufe-07-alle-dienstleistungen-md', 'Wir haben 9 Kategorien, in die wir die Dienstleistungen unterteilen.', $body$# Alle Dienstleistungen, die wir an der Theke verkaufen

Wir haben 9 Kategorien, in die wir die Dienstleistungen unterteilen.

## Kleidung & Merchandise

- Damen Bekleidung
  - Damen Hose
  - Damen Longsleeve
  - Damen Tops
  - Damen T-Shirts
- Merchandise
  - Handtuch V-itness
  - Rucksack V-itness
  - Trinkflasche (Edelstahl)
  - Trinkflasche (Plastik)

## Dienstleistung

- Körperanalyse Messung
  - Einzelmessung Mitglieder
  - Einzelmessung Extern
  - Lifetime Flatrate Mitglieder
- Probetraining
  - OHNE Trainer
  - OHNE Trainer ermäßigt
  - MIT Trainer & Beratung
- Startpaket
  - Urban Sports Club
  - Wellpass klein (ohne EGym)
  - Wellpass groß (mit EGym)
  - Wellhub (ehemals Gympass)
  - Silber
  - Gold
  - Gold reduziert (Feelfit)
  - Silber reduziert (Feelfit)
  - Bronze
- Trainingsplan
- Präventionskurse
- Gutschein
  - 10 Euro
  - 25 Euro
  - 50 Euro
  - 75 Euro
  - 100 Euro

## Sportnahrung

- SUN Mini Meal
  - 1 Sun Taler
  - 40 Sun Taler (= 1 Packung)
- Kaffee
  - Cappuccino groß
  - Cappuccino klein
  - Kaffee schwarz groß
  - Kaffee schwarz klein
  - Espresso
  - Espresso doppio
- Getränke
  - Proteinflasche 0,5
  - Nocco Bcaa
  - L-Carnitine Water
  - Pro 80 Shake (selbst gemacht)
  - Magnesium
  - L-Carnitine 2000
  - Tee
  - Bier (Alkoholfrei)
- Protein Beutel & Dosen
  - Pro 80 500g
  - Whey Protein 600g
- Riegel
  - Oatsnack
  - Fitness Riegel
  - Crispy Riegel
  - Müsli Riegel
  - Low sugar

## Transponder

- V-itness Armband
  - ohne Kaution (weil verloren)
  - mit Kaution (10er Karte, etc.)
- Chip (für Wellpass & Urban Sports)

## Tagestickets

- Karten
  - 1 mal
  - 1 mal ermäßigt
  - 10 mal
  - 10 mal ermäßigt
- Personal Training Karten
  - 5 mal
  - 10 mal
  - 1 mal

## Verzehrguthaben

- 10 Euro
- 25 Euro
- 50 Euro
- 100 Euro
$body$, 'aktiv', 20009);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('59767aa2-e008-535a-8e3f-dea508b0093b', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Verkaufen', 'theke-02-taegliche-arbeitsablaeufe-08-verkaufen-md', '', $body$# Verkaufen

## Der Verkaufsprozess Schritt für Schritt

### Mitgliedersuche
Bevor du mit dem Verkauf beginnst, musst du sicherstellen, dass du das richtige Mitglied im System auswählst. Dafür gehst du in Magicline auf den Bereich „Verkauf". Oben rechts findest du das Suchfeld, in dem du den Namen des Mitglieds eingeben kannst.

Wenn das Mitglied auf Anhieb nicht angezeigt wird, könnte dies an aktiven Filtern liegen. Rechts neben dem Suchfeld findest du ein Filter-Icon. Hier kannst du verschiedene Einstellungen anpassen, zum Beispiel:
- **„Nur Mitglieder":** Deaktiviere diesen Filter, wenn auch Gäste angezeigt werden sollen.
- **„Eingecheckt":** Wenn das Mitglied nicht eingecheckt ist, wird es bei aktivem Filter nicht angezeigt.
- **„Alle Standorte":** Stelle sicher, dass der richtige Standort ausgewählt ist, oder wähle „Alle Standorte", um die Suche zu erweitern.

Wenn du das Mitglied gefunden hast, klickst du einfach auf den Namen.

### Warum die richtige Mitgliedsauswahl so wichtig ist
In Magicline wird alles, was verkauft wird, direkt mit dem Konto des Mitglieds verknüpft. Das betrifft nicht nur Dienstleistungen wie Tagestickets oder 10er-Karten, sondern auch Guthaben oder offene Rechnungen. Wenn du versehentlich das falsche Mitglied auswählst, kann dies zu Problemen führen, weil alle Buchungen, Zahlungen oder Guthaben auf dem falschen Konto landen. Daher gilt immer: Nimm dir die Zeit, das richtige Mitglied zu suchen und auszuwählen.

### Die Auswahl der Dienstleistung oder des Produkts
Nachdem du das Mitglied ausgewählt hast, kannst du aus den angebotenen Dienstleistungen oder Produkten wählen.

### Die Bezahlmethoden
Wenn du die Dienstleistung oder das Produkt ausgewählt hast, klickst du auf **„Jetzt verkaufen"**. Magicline zeigt dir anschließend vier verschiedene Bezahloptionen an, aus denen du wählen kannst. Hier ist es wichtig, die jeweiligen Besonderheiten zu kennen.

1. **Barzahlung** – **Diese Option wird bei uns nicht genutzt!** Wir akzeptieren keine Barzahlungen. Sollte ein Mitglied bar bezahlen wollen, weise es freundlich auf die alternativen Zahlungsmethoden hin.
2. **Kartenzahlung** – Wähle diese Option, wenn das Mitglied mit Karte zahlen möchte. Nach der Auswahl gibst du den Betrag in das Kartenlesegerät ein. Sobald die Zahlung abgeschlossen ist, druckst du den Beleg aus. Eine Kopie des Belegs wird sicher in der Kasse gelagert, während du dem Mitglied bei Bedarf ebenfalls eine Kopie aushändigen kannst.
3. **Lastschriftverfahren** – Bei dieser Option wird der Betrag direkt vom Konto des Mitglieds abgebucht. Du musst die Zahlung lediglich bestätigen, alles andere erledigt Magicline automatisch.
4. **Später zahlen** – Diese Option ermöglicht es dem Mitglied, die Zahlung später auszugleichen. Der offene Betrag wird auf dem Konto des Mitglieds vorgemerkt. Es ist wichtig, dass das Mitglied darüber informiert ist, dass die Zahlung innerhalb der nächsten Tage erfolgen muss.
$body$, 'aktiv', 20010);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('7a735c85-c2a6-5629-beb6-6c91915ec66c', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Walk-In', 'theke-02-taegliche-arbeitsablaeufe-09-walk-in-md', '', $body$# Walk-In

## Was ist ein Walk-In?

Ein Walk-in ist ein potenzielles Mitglied, das spontan und unangemeldet unser Studio besucht. Oftmals handelt es sich dabei um Menschen, die sich aktiv für Fitness interessieren und bereits den ersten Schritt gemacht haben, uns persönlich aufzusuchen. Diese spontane Entscheidung zeigt oft echtes Interesse, weshalb Walk-ins eine wertvolle Chance darstellen, neue Mitglieder zu gewinnen.

Dein Ziel als Service-Mitarbeiter ist es, den Walk-in willkommen zu heißen, eine positive Erfahrung zu schaffen und ihn idealerweise direkt zu einem Termin oder Probetraining zu führen. Mit der richtigen Ansprache und einem professionellen Auftreten kannst du aus einem spontanen Besuch eine langfristige Bindung schaffen.

## Der erste Eindruck zählt

Der erste Eindruck ist entscheidend – und das innerhalb der ersten 60 Sekunden. Stelle sicher, dass du den Walk-in herzlich begrüßt, ihn mit einem Lächeln ansprichst und direkt signalisiert, dass er willkommen ist. Deine Körpersprache spielt dabei eine große Rolle: Halte Augenkontakt, strahle Offenheit aus und zeige durch deine Haltung, dass du für ihn da bist. Eine mögliche Begrüßung könnte sein: „Herzlich willkommen in unserem Studio! Wie kann ich dir heute helfen?"

Es ist wichtig, dass du von Anfang an eine angenehme Atmosphäre schaffst. Der Walk-in soll sich wohlfühlen und das Gefühl haben, dass er genau am richtigen Ort ist. Vermeide es, den Eindruck von Hektik oder Desinteresse zu vermitteln – selbst wenn der Empfangsbereich gerade gut besucht ist. Nimm dir bewusst die Zeit für den Walk-in, denn er könnte dein nächstes zufriedenes Mitglied werden.

## Interesse wecken und Vertrauen aufbauen

Nachdem du den Walk-in begrüßt hast, solltest du herausfinden, was der Grund seines Besuchs ist. Frage freundlich und offen, ob er sich spontan informieren möchte, eine Studioführung wünscht oder vielleicht schon Interesse an einem Probetraining hat. Diese kleine Bedürfnisanalyse hilft dir, individuell auf den Besucher einzugehen.

Eine kurze Studioführung bietet eine hervorragende Möglichkeit, Interesse zu wecken und das Studio in seiner besten Form zu präsentieren. Zeige die verschiedenen Bereiche wie den E-Gym Circle, den Freihantelbereich und die Kursräume. Nutze die Gelegenheit, um nicht nur die Räumlichkeiten zu zeigen, sondern auch die Vorteile und Besonderheiten des Studios hervorzuheben. Du könntest zum Beispiel sagen: „Hier haben wir unsere modernen Cardio-Geräte, die du jederzeit nutzen kannst, und im nächsten Bereich findest du alles für ein effektives Krafttraining. Besonders beliebt sind unsere Kurse, die dir Abwechslung und Motivation bieten."

Während der Tour ist es wichtig, den Mehrwert des Studios auf die individuellen Bedürfnisse des Walk-ins zu beziehen. Hat er erwähnt, dass er abnehmen möchte? Dann hebe die Betreuung durch Trainer hervor. Sucht er nach Entspannung? Dann präsentiere den Wellnessbereich. Zeige, dass du ihn ernst nimmst und sein Ziel unterstützen möchtest.

## Was gilt es zu vermeiden?

Es gibt einige Fehler, die du unbedingt vermeiden solltest. Walk-ins sollten niemals das Gefühl haben, ignoriert zu werden. Selbst wenn du beschäftigt bist, ist es besser, kurz freundlich zu signalisieren, dass du gleich für sie da bist, als sie warten zu lassen. Ebenso solltest du darauf achten, keinen übermäßigen Verkaufsdruck auszuüben. Der Fokus liegt darauf, den Walk-in von der Qualität des Studios zu überzeugen – nicht darauf, ihn zu einer schnellen Entscheidung zu drängen.

Ein weiterer wichtiger Punkt ist Organisation. Chaotische oder unklare Abläufe wirken unprofessionell und könnten den Walk-in verunsichern. Sei vorbereitet, halte den Empfangsbereich ordentlich und sorge dafür, dass alle benötigten Materialien griffbereit sind.

## Terminieren und Probetraining anbieten

Am Ende der Studioführung sollte dein Ziel klar sein: Den Walk-in an einen geschulten Berater weiterzuleiten und dafür einen passenden Termin zu vereinbaren.

> Es ist wichtig, dass du als Service-Mitarbeiter keine umfassende Beratung durchführst.

Deine Aufgabe ist es, einen positiven ersten Eindruck zu hinterlassen, alle wichtigen Informationen über das Studio klar und verständlich zu vermitteln und dafür zu sorgen, dass sich der Walk-in gut aufgehoben fühlt. Der detaillierte Beratungsprozess sollte jedoch immer den dafür geschulten Mitarbeitern vorbehalten bleiben, um eine professionelle und individuelle Betreuung zu gewährleisten.

Nachdem du dem Walk-in einen allgemeinen Überblick gegeben hast, leite den nächsten Schritt mit einem klaren Angebot ein: „Damit wir dir alles in Ruhe erklären und gemeinsam dein Training optimal planen können, vereinbaren wir am besten direkt einen Termin mit einem unserer Berater. Wann würde dir das passen?" Der Termin sollte idealerweise zeitnah stattfinden, am besten noch am selben oder am nächsten Tag.

Sobald der Walk-in zustimmt, trage den Termin in den Kalender ein und stelle sicher, dass alle relevanten Informationen aufgenommen werden. Erfasse seinen Namen, Telefonnummer und seine E-Mail-Adresse. Notiere auch alle wichtigen Details, die während des Gesprächs angesprochen wurden, wie seine Ziele, Interessen oder spezifischen Fragen. Diese Informationen helfen dem Berater, sich optimal auf das Gespräch vorzubereiten und direkt auf die Bedürfnisse des Walk-ins einzugehen.

Falls der Walk-in sich nicht sofort festlegen möchte, biete ihm freundlich an, den Termin flexibel nachzuholen: „Du kannst jederzeit einen Termin vereinbaren, wenn es für dich passt. Ich lasse dir gerne alle Infos da." So bleibt die Tür für eine spätere Kontaktaufnahme offen, ohne Druck aufzubauen.

Deine Aufgabe ist es, den Übergang zum Berater so reibungslos wie möglich zu gestalten und dem Walk-in das Gefühl zu geben, bestens betreut zu werden – vom ersten Moment bis zur professionellen Beratung.
$body$, 'aktiv', 20011);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('e8d3506b-1b9d-5a9b-8189-fcedc7a6a8e7', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Interessenten-Anrufen', 'theke-02-taegliche-arbeitsablaeufe-10-interessenten-anrufen-md', '', $body$# Interessenten-Anrufen

## Der Interessenten-Anruf

Ein Interessenten-Anruf ist eine großartige Gelegenheit, potenzielle Mitglieder für das Studio zu gewinnen. Menschen, die das Studio telefonisch kontaktieren, zeigen bereits Interesse und möchten mehr über die Leistungen erfahren. Wie du den Anruf führst, kann entscheidend dafür sein, ob sie den nächsten Schritt machen – etwa einen Termin vereinbaren oder ein Probetraining besuchen. Deine Aufgabe ist es, den Anrufer freundlich und professionell zu betreuen, ihm die wichtigsten Informationen zu geben und ihn gezielt an einen Berater oder Trainer zu übergeben.

## Der erste Eindruck: Begrüßung und Gesprächseinstieg

Wie bei einem Walk-in zählt auch hier der erste Eindruck. Dein Ziel ist es, von Anfang an eine positive Atmosphäre zu schaffen. Hebe direkt beim Annehmen des Anrufs hervor, dass der Anrufer willkommen ist. Eine professionelle Begrüßung könnte lauten:

„Herzlich willkommen bei V-itness, mein Name ist [dein Name]. Wie kann ich dir weiterhelfen?"

Sei aufmerksam und höre aktiv zu, was der Anrufer möchte. Möchte er sich allgemein informieren, einen Termin vereinbaren oder hat er bereits konkrete Fragen? Notiere dir wichtige Punkte, während er spricht, und zeige Interesse an seinen Anliegen.

## Überblick statt Beratung

Im Gespräch ist es wichtig, dem Interessenten einen klaren und strukturierten Überblick über das Studio zu geben, ohne direkt in eine umfassende Beratung zu gehen. Deine Aufgabe ist es, die wichtigsten Vorteile und Angebote des Studios zu präsentieren – wie die Ausstattung, Kurse, Öffnungszeiten und mögliche Probetrainings.

Beispiel: „In unserem Studio bieten wir dir moderne Trainingsgeräte, ein umfangreiches Kursangebot und persönliche Betreuung durch unsere qualifizierten Trainer. Du kannst gerne bei einem Probetraining alles selbst ausprobieren."

Hebe die Highlights hervor, ohne zu viele Details zu nennen. Ziel ist es, Interesse zu wecken und gleichzeitig darauf hinzuarbeiten, den Interessenten an einen Berater weiterzuleiten, der dann im Detail auf seine individuellen Bedürfnisse eingehen kann.

## Übergang zu einem Berater und Terminvereinbarung

Deine Rolle als Service-Mitarbeiter besteht darin, den Interessenten optimal an einen geschulten Berater zu übergeben, der die persönliche Betreuung übernimmt. Erkläre ihm freundlich den nächsten Schritt:

„Um dir alles genau zu zeigen und gemeinsam einen Plan zu erstellen, vereinbaren wir am besten einen Termin mit einem unserer Berater. So können wir uns ganz auf deine Wünsche und Ziele konzentrieren. Wann würde es dir passen?"

Es ist wichtig, flexibel auf die Zeitwünsche des Interessenten einzugehen und den Termin möglichst zeitnah zu legen – idealerweise innerhalb der nächsten 1–2 Tage. Dies hält das Interesse hoch und erleichtert den Einstieg ins Training.

Wenn der Interessent zustimmt, trage den Termin direkt in den Kalender ein und notiere alle relevanten Daten: Name, Telefonnummer und E-Mail-Adresse. Ebenso wichtig ist es, die im Gespräch genannten Informationen wie Ziele, Erwartungen oder Fragen festzuhalten, damit der Berater optimal vorbereitet ist.

Falls der Interessent keinen festen Termin vereinbaren möchte, biete ihm höflich an, sich später wieder zu melden:

„Kein Problem, du kannst jederzeit anrufen oder direkt vorbeikommen, wenn du bereit bist. Ich lasse dir gerne unsere Kontaktdaten und Öffnungszeiten da."

## Professionelles Nachfassen und Übergabe

Die Übergabe der Daten an den Berater muss strukturiert und vollständig erfolgen. Sorge dafür, dass alle Informationen, die du im Gespräch gesammelt hast, dokumentiert und an den Berater weitergeleitet werden. Dadurch erleichterst du dem Berater die Vorbereitung und sorgst für einen reibungslosen Übergang.

Auch hier gilt: Deine Aufgabe ist es, das Fundament zu legen – der Berater übernimmt die detaillierte Beratung und Betreuung. Durch diese klare Rollenverteilung wird sichergestellt, dass der Interessent die bestmögliche Erfahrung macht.

## Wichtige Tipps für den Anruf

- **Freundlichkeit bewahren:** Egal wie beschäftigt du bist, zeige dem Anrufer, dass er dir wichtig ist.
- **Struktur einhalten:** Begrüßung, Bedarfsermittlung, Informationen geben, Übergang zum Berater, Terminierung.
- **Keinen Verkaufsdruck ausüben:** Konzentriere dich darauf, den Interessenten zu informieren und für das Studio zu begeistern.

## Fehler, die vermieden werden sollten

- Den Anrufer mit zu vielen Details überfordern oder direkt eine umfassende Beratung durchführen.
- Informationen vergessen oder unorganisiert wirken.
- Einen festen Termin aufzudrängen, ohne auf die Wünsche des Anrufers einzugehen.
$body$, 'aktiv', 20012);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('8540da1d-6002-591b-9b47-f1c44afce652', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Probetraining', 'theke-02-taegliche-arbeitsablaeufe-11-probetraining-md', '', $body$# Probetraining

## Das Ziel eines Probetrainings

Ein Probetraining ist die erste Möglichkeit, potenzielle Mitglieder von unserem Studio zu überzeugen. Dein Ziel ist es, dem Interessenten ein positives Erlebnis zu bieten, indem du freundlich, kompetent und lösungsorientiert auf dessen Wünsche eingehst. Eine klare Kommunikation und eine strukturierte Vorgehensweise sind dabei der Schlüssel.

## Erste Kontaktaufnahme

### Telefonisch
Wenn ein Interessent anruft, um ein Probetraining zu vereinbaren, begrüße ihn freundlich und stelle dich vor:

„Hallo, herzlich willkommen im V-itness. Mein Name ist [dein Name]. Wie kann ich dir helfen?"

Oft wird die Frage direkt sein: „Ich möchte ein Probetraining machen. Wie funktioniert das?"

Daraufhin erklärst du, dass wir zwei Möglichkeiten anbieten:
- **Ein Probetraining mit einem unserer Trainer**, bei dem eine Einführung ins Studio und die Geräte erfolgt.
- **Ein freies Probetraining ohne Trainer**, bei dem der Interessent selbstständig trainieren kann.

### An der Theke
Wenn ein Interessent persönlich nach einem Probetraining fragt, gehst du genauso vor. Lächle, stelle dich freundlich vor und erkläre die beiden Optionen.

## Die Unterschiede zwischen den Optionen erklären

### 1. Probetraining mit Trainer
- Geeignet für Interessenten, die neu im Fitnessbereich sind oder Unterstützung wünschen.
- Ein Trainer erklärt die Geräte und erstellt bei Bedarf eine kurze Einführung in den Trainingsplan.
- **Terminvereinbarung ist erforderlich**, da ein Trainer eingeplant werden muss.

### 2. Probetraining ohne Trainer
- Für erfahrene Interessenten, die selbstständig trainieren möchten.
- **Mindestalter:** 18 Jahre.
- Kein Termin notwendig, allerdings ist eine vorherige Anmeldung sinnvoll, damit wir das Probetraining im System hinterlegen können.

## Das Probetraining im System hinterlegen

Egal ob telefonisch oder an der Theke, sobald sich der Interessent für eine Option entschieden hat, geht es darum, das Probetraining im System zu erfassen. Dabei gehst du wie folgt vor:

1. **Name und Kontaktdaten aufnehmen:** Frage nach dem vollständigen Namen, der Telefonnummer und, falls möglich, der E-Mail-Adresse. So können wir den Interessenten erreichen, falls der Termin verschoben werden muss.
2. **Termin vereinbaren:**
   - Für ein Training mit Trainer: Finde einen freien Termin, der sowohl für den Trainer als auch den Interessenten passt.
   - Für ein Training ohne Trainer: Informiere den Interessenten, wann er vorbeikommen kann. (Hier reicht oft ein Hinweis auf unsere regulären Öffnungszeiten.)
3. **Alter überprüfen (bei Training ohne Trainer):** Stelle sicher, dass der Interessent mindestens 18 Jahre alt ist. Wenn er jünger ist, erkläre freundlich, dass das Training ohne Trainer leider nicht möglich ist. Biete in diesem Fall ein Training mit Trainer an.
4. **Eintrag im System:** Hinterlege das Probetraining im System (z. B. Magicline), damit alles dokumentiert ist und bei der Ankunft des Interessenten keine Verwirrung entsteht.

## Häufige Fragen und Antworten

1. **„Ist das Probetraining kostenlos?"** Ja, das erste Probetraining ist bei uns kostenlos.
2. **„Wie lange dauert ein Probetraining?"** Das kommt darauf an, wie lange du trainieren möchtest. Plane etwa 60–90 Minuten ein.
3. **„Kann ich einfach vorbeikommen?"**
   - Mit Trainer: Nein, hier musst du vorher einen Termin vereinbaren.
   - Ohne Trainer: Ja, aber du solltest dich vorher anmelden, damit wir alles vorbereiten können.
4. **„Kann ich jemanden mitbringen?"** Ja, das ist möglich. Bitte gib uns Bescheid, damit wir auch die Daten deines Trainingspartners notieren können.
$body$, 'aktiv', 20013);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('09029f02-173a-503a-9ec8-73894e768134', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Bänder zuweisen', 'theke-02-taegliche-arbeitsablaeufe-12-baender-zuweisen-md', '', $body$# Bänder zuweisen

## Bänder richtig zuweisen

### Schritt 1: Mitglied auswählen und Zugangskarte prüfen
Um ein Band zuzuweisen, öffne das Profil des jeweiligen Mitglieds im System. Direkt im ersten Kästchen siehst du den Bereich **„Zugangskarte"**.

- **Falls noch keine Karte hinzugefügt wurde:** Hier steht „Keine Zugangskarte". In diesem Fall kannst du direkt mit dem Hinzufügen beginnen.
- **Falls eine Karte bereits vorhanden ist:** Es kann sein, dass das Mitglied seine Karte verloren hat und eine neue benötigt. Bevor du eine neue Karte hinzufügst, musst du die alte entfernen. Klicke dazu auf die drei Punkte neben der bestehenden Zugangskarte und wähle **„Zugangskarte löschen"**.

### Schritt 2: Neue Zugangskarte hinzufügen
Sobald die alte Karte gelöscht ist oder noch keine Karte vorhanden war, kannst du eine neue Karte hinzufügen:

1. Klicke auf **„Neue Zugangskarte hinzufügen"**.
2. Wähle den **Standort** aus. Dies stellt sicher, dass die Karte für die richtige Anlage registriert wird.
3. Drücke auf **„Einlesen"**, um die Karte zu aktivieren.

### Schritt 3: Band auf das Lesegerät legen
Nach dem Einlesen musst du das Band mit dem Lesegerät verknüpfen:

1. Wähle bei **„Gerät wählen"** das **„GAT WRITER 6000F"** aus.
2. Lege das Band auf das Lesegerät.
3. Warte auf den **Signalton**, der bestätigt, dass die Karte erfolgreich hinzugefügt wurde.

### Schritt 4: Funktion überprüfen
Nachdem das Band zugewiesen wurde, solltest du es kurz ausprobieren, um sicherzustellen, dass alles einwandfrei funktioniert. Teste es an einem Zugangspunkt, um sicherzugehen, dass der Mitgliedszugang korrekt aktiviert wurde.
$body$, 'aktiv', 20014);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('a901265a-5787-5099-b764-a953cb173948', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Interessent anlegen', 'theke-02-taegliche-arbeitsablaeufe-13-interessent-anlegen-md', '', $body$# Interessent anlegen

## Was sind Interessenten?

Interessenten sind Personen, die sich für unser Studio interessieren, aber noch keine Mitglieder sind. Das können potenzielle Neukunden sein, die ein Probetraining absolvieren möchten, oder Personen, die noch überlegen, sich anzumelden. Sie sind ein wichtiger Teil unserer Arbeit, denn aus Interessenten können Mitglieder werden – und der erste Eindruck zählt. Daher ist es wichtig, ihre Daten vollständig und korrekt zu erfassen.

## Interessenten anlegen in Magicline

### Schritt 1: Mitgliederbereich öffnen
Um einen Interessenten anzulegen, gehst du in Magicline auf den Bereich „Mitglieder". Oben rechts findest du die Schaltfläche **„Interessent anlegen"**. Klicke darauf, um den Anmeldevorgang zu starten.

### Schritt 2: Wichtige Informationen ausfüllen

Beim Anlegen eines Interessenten wirst du durch verschiedene Abschnitte geführt. Hier ist es wichtig, sorgfältig und vollständig zu arbeiten:

#### 1. Vor- und Nachname ausfüllen
Trage zuerst den vollständigen Vor- und Nachnamen des Interessenten ein.

**Tipp:** Überprüfe die Schreibweise, damit es später keine Missverständnisse gibt.

#### 2. Persönliche Daten
Fülle die persönlichen Daten des Interessenten aus, wie:
- **Geburtsdatum:** Wichtig, um sicherzustellen, dass der Interessent unsere Altersvorgaben erfüllt.
- **Geschlecht:** Wird für interne Zuordnungen benötigt, z. B. bei der Trainerzuweisung.

#### 3. Kontaktdaten
Dieser Schritt ist besonders wichtig! Erfasse alle Kontaktmöglichkeiten, damit wir den Interessenten erreichen können:
- **E-Mail-Adresse:** Für Terminbestätigungen oder weitere Informationen.
- **Telefonnummer:** Essenziell, um den Interessenten bei kurzfristigen Änderungen oder Absagen informieren zu können.

Achte darauf, dass diese Daten korrekt sind. Wenn nötig, wiederhole die Angaben laut, um sicherzugehen, dass nichts falsch eingetragen wurde.

#### 4. Foto aufnehmen
Ein Foto des Interessenten ist aus zwei Gründen wichtig:
- Es hilft uns, den Interessenten eindeutig zuzuordnen.
- Sollte der Interessent ein Band erhalten, können wir sicherstellen, dass es an die richtige Person ausgegeben wird.

Das Foto sollte direkt beim Anlegen aufgenommen werden. Stelle sicher, dass es gut erkennbar und aktuell ist.

---

Sorgfältigkeit ist hier das A und O. Mit vollständigen und korrekten Daten stellen wir sicher, dass der Interessent bestens betreut wird – und möglicherweise bald ein Mitglied bei uns wird.
$body$, 'aktiv', 20015);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('19a5510e-ea33-5067-a499-b3a432755b74', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Reinigungsprotokoll', 'theke-02-taegliche-arbeitsablaeufe-14-reinigungsprotokoll-md', '', $body$# Reinigungsprotokoll

## Wann und wie wird das Reinigungsprotokoll durchgeführt?

Das Reinigungsprotokoll wird **von der Frühschicht** durchgeführt und muss zwischen **6:00 Uhr und spätestens 10:00 Uhr** abgeschlossen sein. Ziel ist es, das gesamte Studio gründlich zu kontrollieren und sicherzustellen, dass alle Bereiche sauber sind.

## Schritt-für-Schritt-Anleitung

### 1. Studio gründlich kontrollieren
Gehe durch das gesamte Studio und überprüfe systematisch jeden Bereich. Achte dabei besonders auf folgende Punkte:

- **Trainingsfläche:** Sind die Geräte sauber? Gibt es sichtbaren Staub oder Schweißrückstände?
- **Umkleidekabinen:** Sind die Böden, Bänke und Schränke sauber? Wurden alle Mülleimer geleert?
- **Sanitäranlagen:** Wurde gründlich gereinigt? Achte besonders auf Waschbecken, Spiegel, Toiletten und Duschen.
- **Thekenbereich:** Sind alle Flächen sauber? Ist der Müll geleert?
- **Bodenflächen:** Gibt es Stellen, die offensichtlich nicht gewischt wurden?
- **Sonstige Bereiche:** Kontrolliere auch Fensterbänke, Spiegel und andere Oberflächen auf Sauberkeit.

Nimm dir Zeit für jeden Bereich und stelle sicher, dass nichts übersehen wird.

### 2. Mängel dokumentieren
Wenn du unsaubere oder schlecht gereinigte Stellen findest, halte diese auf dem **Reinigungsprotokoll** fest. Gehe dabei wie folgt vor:

- Schreibe präzise auf, **was nicht gereinigt wurde** oder **wo noch Schmutz zu sehen ist**. Zum Beispiel:
  - „Boden in Umkleidekabine Damen nicht gewischt."
  - „Staub auf dem Gerät XYZ auf der Trainingsfläche."
- Markiere auffällige Stellen so genau wie möglich, damit die Reinigungskräfte gezielt nachbessern können.

### 3. Fotos machen
Mit dem **iPad** machst du zu jedem festgestellten Mangel ein Foto. Achte darauf, dass das Problem klar erkennbar ist. Mache möglichst gut beleuchtete und scharfe Bilder, damit keine Missverständnisse entstehen.

### 4. Abschlussdokumentation
Nachdem du das gesamte Studio kontrolliert und die Mängel dokumentiert hast, gehst du wie folgt vor:

1. **Foto des ausgefüllten Protokolls machen:** Fotografiere das Reinigungsprotokoll mit den notierten Mängeln.
2. **E-Mail vorbereiten:** Öffne die E-Mail-App auf dem iPad und adressiere die Nachricht an:
   - Georg: **georg.pickl@vitness-poing.de**
   - Markus: **markus.decker@vitness-poing.de**
   - Die Putzfirma: **info@aktiv24gmbh.de**
3. **E-Mail-Inhalt:**
   - Betreff: **„Reinigungsprotokoll [Datum]"**
   - Text: Eine kurze Zusammenfassung, z. B.: „Guten Morgen, anbei das Reinigungsprotokoll vom heutigen Tag. Bitte beachten Sie die Anmerkungen und die beigefügten Fotos. Vielen Dank und einen schönen Tag!"
4. **Anhänge hinzufügen:** Lade alle Fotos der festgestellten Mängel und das Foto des Protokolls in die E-Mail hoch.
5. **E-Mail absenden:** Sende die Nachricht ab und überprüfe, ob sie erfolgreich verschickt wurde.

**Wichtig:** Nimm dir ausreichend Zeit, um alle Bereiche gründlich zu prüfen. Eine oberflächliche Kontrolle kann dazu führen, dass Mängel übersehen werden.
$body$, 'aktiv', 20016);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('72a4b6fe-162e-5c5b-8f87-59287c2fa280', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Bestandscheck', 'theke-02-taegliche-arbeitsablaeufe-15-bestandscheck-md', '', $body$# Bestandscheck

## Der richtige Umgang mit dem Bestand

Der Bestandscheck sollte Teil deines täglichen Arbeitsrhythmus sein. Gehe mit offenen Augen durch das Studio und schau genau hin: Sind die Regale mit Verbrauchsmaterialien gut gefüllt? Gibt es Bereiche, in denen etwas knapp wird?

Wichtige Punkte, die du im Blick behalten solltest:
- **Reinigungsmaterialien:** Sind ausreichend Putzmittel, Desinfektionsmittel und Papierrollen vorhanden?
- **Getränke und Snacks:** Ist das Angebot im Kühlschrank vollständig?
- **Handtücher und Verbrauchsgegenstände:** Sind genügend Handtücher und andere Utensilien für Mitglieder verfügbar?

## Handeln, bevor es knapp wird

Sobald dir auffällt, dass etwas langsam leer wird, informiere die zuständige Person. Mache dies am besten sofort, um sicherzustellen, dass rechtzeitig nachbestellt wird und keine Engpässe entstehen. Es ist besser, frühzeitig Bescheid zu geben, als zu riskieren, dass etwas komplett fehlt.
$body$, 'aktiv', 20017);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('f303258e-2828-5a1d-9f7f-880ae82e3961', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Putzplan an der Theke', 'theke-02-taegliche-arbeitsablaeufe-16-putzplan-md', '', $body$# Putzplan an der Theke

## Den Putzplan verstehen und nutzen

Der Putzplan ist so gestaltet, dass alle anstehenden Reinigungsaufgaben klar verteilt und terminiert sind. Bevor du deine Schicht beginnst, solltest du den Plan gründlich prüfen. So weißt du genau, welche Aufgaben für deine Schicht vorgesehen sind.

Sobald du weißt, was für deinen Zeitraum vorgesehen ist, plane deine Zeit entsprechend, um alle Aufgaben zu erledigen.

## Schichtübernahme und Verantwortung

Wenn du eine Schicht von einem Kollegen übernimmst, kann es sein, dass noch Aufgaben aus der vorherigen Schicht offen sind. Kontrolliere in diesem Fall den Putzplan und sprich gegebenenfalls mit dem Kollegen, um sicherzustellen, dass alles Notwendige übernommen wird. Übernimm diese offenen Aufgaben gewissenhaft, damit keine Bereiche vernachlässigt werden.

Beispiel: Wenn in der Schicht vor dir das Putzen nicht erledigt wurde, übernimmst du diese Aufgabe zusätzlich zu deinen eigenen Pflichten. Achte darauf, den Putzplan entsprechend zu aktualisieren, falls eine Aufgabe bereits erledigt wurde.
$body$, 'aktiv', 20018);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('c9dd7e7d-3b74-56a3-a453-eb090851d8ad', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Musikmanagement im Studio', 'theke-02-taegliche-arbeitsablaeufe-17-musikmanagement-md', '', $body$# Musikmanagement im Studio

## Musik im Studio: Grundlegendes

Während der gesamten Öffnungszeit sollte im Studio Musik laufen, um für eine angenehme Atmosphäre zu sorgen. Wichtig ist dabei, dass nur Musik verwendet wird, für die das Studio eine Lizenz besitzt. Das betrifft sowohl gespeicherte Musik auf dem PC als auch Musik, die von Plattformen wie YouTube abgespielt wird. Der falsche Einsatz von urheberrechtlich geschützter Musik kann zu hohen Strafen und rechtlichen Problemen führen.

## Gespeicherte Musik vom PC

Eine sichere und einfache Möglichkeit ist die Verwendung der Musik, die bereits auf dem PC gespeichert ist. Diese Songs wurden vom Studio lizenziert und können bedenkenlos abgespielt werden.

### Vorteile
- Rechtlich unproblematisch.
- Einfach zu bedienen, da die Wiedergabeliste bereits vorhanden ist.
- Perfekt für den dauerhaften Einsatz.

### Anleitung
1. Öffne den Musikplayer auf dem PC.
2. Wähle die vorab gespeicherte Wiedergabeliste aus.
3. Lasse die Musik im Hintergrund laufen – sie ist so eingestellt, dass sie den gesamten Tag über für Abwechslung sorgt.

## YouTube für Musik – Rechtliche Vorsicht

YouTube bietet eine große Auswahl an Musik, die oft für mehr Abwechslung sorgt. Allerdings dürfen hier **nur GEMA-freie bzw. lizenzfreie „No Copyright"-Songs** abgespielt werden. Viele Lieder auf YouTube sind urheberrechtlich geschützt und dürfen nur mit einer entsprechenden Lizenz öffentlich genutzt werden. Ein Verstoß kann ernste rechtliche Konsequenzen für das Studio haben.

### Worauf du achten musst
- **Keine regulären Songs abspielen:** Lieder bekannter Künstler oder Bands (z. B. aus den Charts) sind fast immer urheberrechtlich geschützt.
- **Nur GEMA-freie bzw. „No Copyright"-Musik verwenden:** Diese Musik ist ausdrücklich für die Nutzung ohne Lizenz freigegeben.

### Anleitung
1. Suche auf YouTube nach „No Copyright Music" oder „GEMA-freie Musik".
2. Achte darauf, dass der Titel oder die Beschreibung des Videos ausdrücklich angibt, dass es sich um lizenzfreie Musik handelt.
3. Erstelle eine Playlist aus diesen Songs, um eine nahtlose Wiedergabe zu gewährleisten.
4. Lasse die Playlist laufen und überprüfe gelegentlich, dass keine Werbung oder ungeeignete Inhalte abgespielt werden.

## Warum ist die Einhaltung der Regeln so wichtig?

Die öffentliche Nutzung von Musik unterliegt strengen rechtlichen Vorgaben. Werden urheberrechtlich geschützte Songs ohne die entsprechende Lizenz abgespielt, kann das Studio mit hohen Strafen belegt werden. Neben den finanziellen Konsequenzen schadet dies auch dem Ruf des Studios. Daher ist es unerlässlich, dass alle Mitarbeiter die Musikauswahl gewissenhaft und rechtssicher gestalten.
$body$, 'aktiv', 20019);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('bacb1791-ef9c-52b9-825d-828c0b87b858', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Wäschemanagement im Studio', 'theke-02-taegliche-arbeitsablaeufe-18-waeschemanagement-md', '', $body$# Wäschemanagement im Studio

## Der richtige Umgang mit der Wäsche

Ein effektives Wäschemanagement bedeutet, dass du regelmäßig kontrollierst, wie viele saubere Handtücher verfügbar sind. Nimm dir Zeit, um den Bestand an den Ausgabestellen im Auge zu behalten, und prüfe, ob die Anzahl ausreicht.

Wenn du siehst, dass Handtücher zur Neige gehen, stelle sicher, dass:

1. **Schmutzige Handtücher rechtzeitig gewaschen werden:** Kontrolliere, ob sich im Wäschekorb oder an den Sammelstellen viele benutzte Handtücher angesammelt haben. Falls ja, bring sie direkt zur Waschmaschine.
2. **Der Trockner genutzt wird:** Sobald eine Waschladung fertig ist, überprüfe, ob sie in den Trockner gelegt werden muss. Saubere Handtücher sollten möglichst zügig wieder verfügbar sein.
3. **Gefaltete Handtücher bereitgestellt werden:** Achte darauf, dass frisch gewaschene und getrocknete Handtücher ordentlich gefaltet und an den vorgesehenen Stellen ausgelegt werden.

## Regelmäßige Checks

Plane regelmäßige Checks ein, um sicherzustellen, dass der Wäschezyklus ununterbrochen funktioniert. Es ist wichtig, nicht erst zu reagieren, wenn Handtücher fehlen, sondern frühzeitig zu handeln.

Beispiel:
- Schau bei deinem Rundgang durchs Studio kurz in die Sammelstelle für schmutzige Handtücher.
- Kontrolliere, ob die Waschmaschine läuft oder ob sie befüllt werden muss.
- Prüfe, ob der Trockner fertig ist und die sauberen Handtücher einsatzbereit sind.
$body$, 'aktiv', 20020);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('b34b0873-5834-5c76-82ab-9e33f62a200e', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Spülmaschinenmanagement', 'theke-02-taegliche-arbeitsablaeufe-19-spuelmaschine-md', '', $body$# Spülmaschinenmanagement

## Der richtige Umgang mit der Spülmaschine

Um einen reibungslosen Ablauf zu gewährleisten, ist es wichtig, die Spülmaschine in den täglichen Arbeitsrhythmus zu integrieren. Achte darauf, dass:

1. **Die Spülmaschine regelmäßig befüllt wird:** Sammle benutzte Tassen, Gläser oder andere Gegenstände im Studio und bringe sie direkt zur Spülmaschine. Vermeide es, dass sich Geschirr stapelt.
2. **Die Spülmaschine gestartet wird:** Sobald die Spülmaschine ausreichend gefüllt ist, starte sie rechtzeitig. Prüfe, ob ausreichend Spülmittel oder Tabs vorhanden sind und ergänze diese bei Bedarf.
3. **Sauberes Geschirr zügig ausgeräumt wird:** Leere die Spülmaschine direkt, sobald der Spülgang abgeschlossen ist. Saubere Utensilien sollten wieder an ihren vorgesehenen Platz geräumt werden, damit sie jederzeit griffbereit sind.

## Regelmäßige Checks

Kontrolliere im Laufe des Tages immer wieder die Spülmaschine:
- Ist sie bereits voll und bereit, gestartet zu werden?
- Läuft gerade ein Spülgang, und wann ist er fertig?
- Sind genügend Tabs oder Spülmittel vorrätig?

Es ist wichtig, auch hier vorausschauend zu handeln, damit sich weder schmutziges Geschirr ansammelt noch saubere Utensilien fehlen.
$body$, 'aktiv', 20021);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('0e275b97-8adc-5e8c-a855-466c3b75b725', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Kühlschrank auffüllen', 'theke-02-taegliche-arbeitsablaeufe-20-kuehlschrank-md', '', $body$# Kühlschrank auffüllen

## Der richtige Umgang mit dem Kühlschrank

Damit der Kühlschrank immer ordentlich und ansprechend aussieht, beachte die folgenden Schritte:

1. **Regelmäßige Kontrolle:** Schau während deines Schichtverlaufs immer wieder in den Kühlschrank. Prüfe, ob Produkte knapp werden oder ob etwas bereits ausgegangen ist.
2. **Auffüllen nach Bedarf:** Wenn du feststellst, dass bestimmte Artikel fehlen oder fast leer sind, fülle sie sofort aus dem Lager nach. Achte dabei darauf, die älteren Produkte nach vorne zu stellen, damit sie zuerst genutzt werden (First-in-First-out-Prinzip).
3. **Ordnung und Sauberkeit:** Stelle sicher, dass die Produkte ordentlich einsortiert sind und der Kühlschrank sauber bleibt. Falls etwas ausgelaufen ist, wische es direkt weg.

## Vorausschauendes Handeln

Ein gut gefüllter Kühlschrank bedeutet nicht nur, dass die Mitglieder ihre gewünschten Produkte vorfinden, sondern auch, dass du Engpässe frühzeitig erkennst. Halte immer im Blick:

- Gibt es genug Vorrat im Lager, um den Kühlschrank aufzufüllen?
- Ist es notwendig, eine Bestellung für bestimmte Produkte auszulösen?

Wenn dir auffällt, dass etwas knapp wird, informiere die zuständige Person, damit rechtzeitig Nachschub organisiert werden kann.
$body$, 'aktiv', 20022);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('c1175d83-60bc-56f4-9eae-f52e4f71cd41', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Bänder Kodieren', 'theke-02-taegliche-arbeitsablaeufe-21-baender-kodieren-md', '', $body$# Bänder Kodieren

## So kodierst du das V-itness Band richtig

### Schritt 1
Gehe an den Rechner und suche nach dem Programm **„GAT CODING"**.

Dieses Programm wird für die Kodierung der Trainingsbänder verwendet. Sobald du es gefunden hast, öffne es per Doppelklick.

### Schritt 2: Kodierung starten
Nachdem sich das Programm geöffnet hat, klickst du auf **„Start"**.

Damit wird der Kodierprozess vorbereitet und das System ist bereit, Bänder zu beschreiben.

### Schritt 3: Richtiges Template auswählen
Im nächsten Schritt wählst du das **mittlere Template mit dem Namen „MIFARE"** aus.

Insgesamt gibt es **zwei verschiedene Templates** – achte darauf, dass du wirklich das **mittlere** auswählst (mit dem Zahnrad-Symbol).

### Schritt 4: Bändchen kodieren
Halte jetzt das erste Trainingsbändchen an das Lesegerät (meistens ist es ein kleines Gerät direkt neben dem Bildschirm).

Das System erkennt das Band automatisch und schreibt die nötigen Daten darauf.

Du kannst diesen Vorgang beliebig oft wiederholen – also so viele Bänder kodieren, wie du gerade brauchst.

### Schritt 5: Kodierung beenden
Wenn du alle gewünschten Bänder kodiert hast, klicke auf **„Stop"**, um den Vorgang abzuschließen.

Das Programm beendet damit die Kodiersitzung und du kannst es anschließend schließen.
$body$, 'aktiv', 20023);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('70fe09f9-59fb-583c-816e-4b295d8bf511', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Grundlagen des Kundenservice', 'theke-03-kundenservice-01-grundlagen-md', '', $body$# Grundlagen des Kundenservice

## Kundenservice

Im Servicebereich und an der Theke bist du oft der erste Kontaktpunkt für unsere Mitglieder und Gäste. Deine Kommunikation und dein Verhalten haben einen großen Einfluss auf die Wahrnehmung des Studios und die Zufriedenheit der Kunden. In diesem Kapitel lernst du, wie du professionellen Kundenservice leistest, effektiv kommunizierst und in herausfordernden Situationen souverän bleibst. Kundenservice bedeutet nicht nur, Probleme zu lösen, sondern auch ein angenehmes und unterstützendes Umfeld zu schaffen, das Vertrauen und langfristige Beziehungen fördert.

## Grundlagen des Kundenservice

Ein exzellenter Kundenservice ist das Herzstück unserer Arbeit und bildet die Grundlage für Vertrauen, Bindung und Zufriedenheit. Jede Interaktion mit einem Kunden ist eine Möglichkeit, einen positiven Eindruck zu hinterlassen und die Marke zu stärken. Zufriedene Kunden kommen nicht nur gerne wieder, sondern empfehlen das Studio auch weiter, was langfristig für Wachstum und Erfolg sorgt.

Dabei spielen Freundlichkeit, Geduld, Empathie, Professionalität und Flexibilität eine entscheidende Rolle. Ein Lächeln öffnet Türen, während Geduld und Einfühlungsvermögen dabei helfen, auch komplexe Anliegen zu lösen. Professionalität zeigt sich in sachlichem und respektvollem Verhalten, während Flexibilität notwendig ist, um individuelle Kundenbedürfnisse zu erkennen und darauf einzugehen.

Frage dich immer, wie du selbst in der Situation behandelt werden möchtest, und passe dein Handeln entsprechend an. Damit trägst du nicht nur zu einem positiven Kundenerlebnis bei, sondern auch zu einer langfristigen Bindung, die das Studio nachhaltig stärkt.
$body$, 'aktiv', 20024);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('7cc6cf72-dd49-50e4-8f4c-0cda765783b7', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Kommunikation mit Kunden', 'theke-03-kundenservice-02-kommunikation-md', '', $body$# Kommunikation mit Kunden

## Kommunikation

Die Kommunikation mit Kunden ist einer der wichtigsten Aspekte im Kundenservice und kann maßgeblich die Zufriedenheit und Bindung beeinflussen. Dabei ist sowohl die verbale als auch die nonverbale Kommunikation entscheidend, um professionell und vertrauenswürdig aufzutreten.

## Verbale Kommunikation

Die Begrüßung eines Kunden ist der erste Schritt zu einer gelungenen Kommunikation. Achte darauf, jeden Kunden freundlich und möglichst persönlich zu begrüßen. Wenn du den Namen des Kunden kennst, benutze ihn; das schafft sofort eine persönliche Verbindung. Zum Beispiel: „Guten Tag, Herr Müller! Schön, Sie wiederzusehen!".

Eine klare und respektvolle Sprache hilft, Missverständnisse zu vermeiden. Anstatt beispielsweise zu sagen: „Das geht nicht", könntest du sagen: „Ich prüfe, wie wir das möglich machen können." Diese positive Formulierung zeigt Lösungsorientierung.

Aktives Zuhören ist ebenfalls eine Schlüsselkompetenz. Während der Kunde spricht, solltest du ihm deine volle Aufmerksamkeit schenken. Zeige Interesse, indem du das Gehörte paraphrasierst, etwa mit: „Habe ich richtig verstanden, dass Sie Unterstützung bei der Nutzung des Laufbands benötigen?" Das gibt dem Kunden das Gefühl, ernst genommen zu werden.

## Nonverbale Kommunikation

Neben der gesprochenen Sprache spielt auch die Körpersprache eine große Rolle. Halte Augenkontakt, um Aufmerksamkeit und Interesse zu signalisieren, und achte darauf, dass deine Haltung offen und einladend wirkt. Verschlossene Gesten, wie verschränkte Arme oder abgewandte Blicke, können Desinteresse vermitteln. Stell dir vor, ein Kunde fragt nach einem Produkt und du siehst währenddessen auf dein Handy – das würde unprofessionell wirken und den Kunden verärgern.

Ein leichtes Nicken oder ein Lächeln während des Gesprächs unterstreicht deine Aufmerksamkeit und schafft eine positive Atmosphäre. Ebenso wichtig ist es, auf einen festen Stand oder Sitz zu achten, der Ruhe und Sicherheit ausstrahlt.

## Professionelles Telefonverhalten

Auch am Telefon ist ein professionelles Auftreten unerlässlich. Begrüße den Anrufer, indem du dich mit Namen und Studio vorstellst, etwa: „Guten Tag, hier spricht Anna von V-itness, wie kann ich Ihnen helfen?" Eine klare, freundliche Stimme und ein angemessenes Sprechtempo sorgen dafür, dass der Kunde sich gut aufgehoben fühlt.

Notiere dir während des Gesprächs wichtige Informationen und bestätige sie kurz, um sicherzugehen, dass keine Missverständnisse entstehen. Zum Beispiel: „Habe ich das richtig verstanden? Sie möchten einen Termin für ein Probetraining am Freitag um 18 Uhr vereinbaren?" Abschließend bedanke dich für das Gespräch, auch wenn es schwierig war, und verabschiede dich höflich: „Vielen Dank für Ihren Anruf, Herr Schmidt! Ich wünsche Ihnen einen schönen Tag."
$body$, 'aktiv', 20025);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('238cfbc1-acaf-52c1-865f-6881bb518b54', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Umgang mit schwierigen Situationen', 'theke-03-kundenservice-03-schwierige-situationen-md', '', $body$# Umgang mit schwierigen Situationen

## Beschwerden professionell behandeln

Der Umgang mit Beschwerden ist ein zentraler Bestandteil eines professionellen Kundenservices. Wenn ein Kunde eine Beschwerde äußert, ist es entscheidend, ihm aufmerksam zuzuhören und Verständnis zu zeigen, auch wenn die Situation emotional wird. Lass den Kunden ausreden und signalisiere durch eine offene Haltung und verbale Bestätigung wie „Ich verstehe, dass Sie enttäuscht sind" dein Mitgefühl. Dies schafft die Grundlage für eine konstruktive Lösung.

Eine aufrichtige Entschuldigung ist oft der erste Schritt, um die Wogen zu glätten, selbst wenn der Fehler nicht direkt bei dir liegt. Zum Beispiel: „Es tut mir sehr leid, dass Sie diese Erfahrung gemacht haben. Lassen Sie uns das gemeinsam klären." Danach solltest du proaktiv eine Lösung anbieten. Frage den Kunden, welche Lösung für ihn am besten wäre, oder schlage realistische Alternativen vor. Zum Beispiel: „Wir können Ihnen entweder eine Rückerstattung anbieten oder einen Gutschein für Ihren nächsten Besuch. Was wäre Ihnen lieber?"

Das Nachfassen ist genauso wichtig wie die eigentliche Problemlösung. Rufe den Kunden an oder spreche ihn bei seinem nächsten Besuch an, um sicherzustellen, dass er zufrieden ist und das Problem vollständig gelöst wurde. Dadurch vermittelst du, dass dir seine Zufriedenheit wirklich am Herzen liegt. Gleichzeitig solltest du Beschwerden und ihre Lösungen dokumentieren. Diese Aufzeichnungen helfen, wiederkehrende Probleme zu erkennen und zukünftige Verbesserungen vorzunehmen.

## Umgang mit schwierigen Kunden

Manchmal triffst du auf Kunden, die emotional oder unhöflich reagieren. In solchen Momenten ist es wichtig, ruhig und professionell zu bleiben. Atme tief durch und konzentriere dich darauf, die Situation zu entschärfen. Vermeide es, auf Provokationen einzugehen, und richte deinen Fokus darauf, die Anliegen des Kunden sachlich zu behandeln. Zum Beispiel: „Ich verstehe, dass Sie verärgert sind. Lassen Sie uns gemeinsam eine Lösung finden."

Wenn ein Kunde Grenzen überschreitet, sei es durch beleidigendes Verhalten oder laute Aggression, ist es wichtig, höflich, aber bestimmt klare Grenzen zu setzen. Eine Möglichkeit wäre: „Ich möchte Ihnen gerne helfen, aber ich bitte Sie, respektvoll zu bleiben." Sollte sich die Situation nicht entspannen, informiere deinen Vorgesetzten und übergebe den Fall. So stellst du sicher, dass du weiterhin professionell agierst.

Nach solchen Begegnungen kann es hilfreich sein, die Situation mit einem Kollegen oder Vorgesetzten zu reflektieren. Überlege, was gut lief und welche Strategien du in Zukunft verbessern könntest. Diese Reflexion trägt dazu bei, dich auf ähnliche Herausforderungen besser vorzubereiten und kontinuierlich dazuzulernen.
$body$, 'aktiv', 20026);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('74d568a7-ea4f-545f-bb98-28fbc724953d', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Tipps für eine optimale Kundenbindung', 'theke-03-kundenservice-04-kundenbindung-md', '', $body$# Tipps für eine optimale Kundenbindung

## Optimale Kundenbindung

Kundenbindung ist ein entscheidender Faktor für den langfristigen Erfolg eines Fitnessstudios. Kleine Gesten und ein individueller Service können dafür sorgen, dass sich Mitglieder willkommen und wertgeschätzt fühlen.

## Kleine Gesten, große Wirkung

Der persönliche Kontakt zu den Kunden macht den Unterschied. Merke dir beispielsweise die Namen von Stammkunden und begrüße sie beim nächsten Besuch namentlich. Ein einfaches: „Guten Morgen, Frau Schmidt! Wie läuft Ihr Training?" kann einen positiven Eindruck hinterlassen und zeigt, dass du dich für den Kunden interessierst. Zeige echtes Interesse an ihren Fortschritten oder an ihrem Wohlbefinden, zum Beispiel mit Fragen wie: „Wie läuft es mit Ihrem neuen Trainingsplan?" oder „Fühlen Sie sich wohl bei uns?"

Zusätzlich können kleine Aufmerksamkeiten viel bewirken. Ein kostenloser Proteinshake nach einem intensiven Training oder eine persönliche Geburtstagskarte sind Beispiele dafür, wie du Kunden zeigen kannst, dass sie geschätzt werden. Solche Gesten bleiben im Gedächtnis und stärken die Bindung.

Besondere Anlässe, wie Geburtstage, sollten nicht übersehen werden. Überrasche Mitglieder mit einem kleinen Geschenk oder einer Gratulation, um eine persönliche Note hinzuzufügen. Dies vermittelt, dass dir die Kunden auch als Menschen wichtig sind, nicht nur als Studiomitglieder.

## Individuelle Bedürfnisse erkennen

Jeder Kunde hat unterschiedliche Ziele und Bedürfnisse, und es ist wichtig, darauf einzugehen. Stelle gezielte Fragen, um die Wünsche und Erwartungen besser zu verstehen. Ein Beispiel: „Was ist Ihr Hauptziel beim Training? Möchten Sie Muskelaufbau, abnehmen oder Ihre Ausdauer verbessern?" Diese Informationen helfen dir, den Kunden gezielt zu beraten.

Anhand dieser Erkenntnisse kannst du individuelle Empfehlungen geben, sei es zu passenden Produkten, wie Nahrungsergänzungsmitteln, oder zu speziellen Trainingsprogrammen. Wenn ein Mitglied nach Proteinprodukten fragt, könntest du beispielsweise sagen: „Ich empfehle Ihnen unser Whey-Protein mit Vanillegeschmack. Es ist perfekt für den Muskelaufbau nach dem Training." Solche Empfehlungen wirken kompetent und zeigen, dass du dich auskennst.

## Zusammenfassung

Ein exzellenter Kundenservice ist weit mehr als das Bearbeiten von Anliegen. Es erfordert Empathie, eine klare Kommunikation und die Fähigkeit, auf individuelle Bedürfnisse einzugehen. In diesem Kapitel hast du gelernt, wie du durch freundliche Begrüßung, aufmerksames Zuhören und gezielte Lösungen Vertrauen aufbaust und Kundenzufriedenheit sicherstellst.

Das Eingehen auf Beschwerden und schwierige Situationen ist dabei genauso wichtig wie das Erkennen von persönlichen Bedürfnissen. Kleine Gesten, wie ein persönliches Gespräch oder eine Aufmerksamkeit zum Geburtstag, können dabei den Unterschied machen und die Bindung stärken. Ebenso entscheidend ist deine Fähigkeit, ruhig und souverän mit emotionalen oder herausfordernden Kunden umzugehen und eine Lösung zu finden, die den Kunden überzeugt.

Indem du diese Prinzipien anwendest, trägst du aktiv dazu bei, das Studio zu einem Ort zu machen, an dem sich Mitglieder wohl und wertgeschätzt fühlen. Dein Engagement und deine Professionalität schaffen nicht nur zufriedene Kunden, sondern auch die Grundlage für langfristigen Erfolg.
$body$, 'aktiv', 20027);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('4857e92a-d087-54ab-8c68-f46e1745e28b', 'dd921f9c-e59a-5c37-96cf-2016317b7660', 'Rechtliche Grundlagen', 'theke-04-rechtliche-aspekte-01-rechtliche-grundlagen-md', '', $body$# Rechtliche Grundlagen

## Datenschutz und Vertraulichkeit

Ein zentraler Aspekt im Umgang mit Kundendaten ist der Datenschutz. Die DSGVO (Datenschutz-Grundverordnung) regelt den Umgang mit personenbezogenen Daten und verlangt, dass diese sicher und vertraulich behandelt werden.

> Als Mitarbeiter bist du verpflichtet, keine Informationen über Mitglieder an unbefugte Dritte weiterzugeben.

Dazu gehören Kontaktdaten, Gesundheitsinformationen oder finanzielle Details.

Ein praktisches Beispiel: Wenn ein Mitglied telefonisch nach der Mitgliedschaft einer anderen Person fragt, darfst du keine Auskunft geben, auch wenn die Anfrage freundlich formuliert ist. Deine Antwort sollte lauten: „Aus Datenschutzgründen darf ich Ihnen dazu leider keine Informationen geben."

## Haftung und Sicherheit

Haftungsfragen spielen im Fitnessstudio eine wichtige Rolle. Kunden unterschreiben in der Regel eine Haftungsausschlusserklärung, die das Studio vor Schäden schützt, die durch unsachgemäße Nutzung der Geräte entstehen. Dennoch bleibt das Studio verpflichtet, für sichere Bedingungen zu sorgen. Als Mitarbeiter liegt es in deiner Verantwortung, defekte Geräte umgehend zu melden und dafür zu sorgen, dass sie nicht weiter genutzt werden.

Beispiel: Entdeckst du ein beschädigtes Kabel an einem Trainingsgerät, musst du es sofort kennzeichnen, den Bereich absichern und den Schaden melden. Dies verhindert Unfälle und zeigt, dass das Studio seiner Sorgfaltspflicht nachkommt.

## Erste-Hilfe-Pflichten

Im Notfall ist schnelles und korrektes Handeln entscheidend. Jeder Mitarbeiter sollte eine Grundausbildung in Erster Hilfe haben, um Verletzungen oder plötzliche Erkrankungen angemessen zu behandeln.

Ein Beispiel: Wenn ein Mitglied über Schmerzen in der Brust klagt, ist es deine Aufgabe, Ruhe zu bewahren, die Person in eine bequeme Position zu bringen und sofort den Notruf zu verständigen. Dein Handeln kann entscheidend sein, bis professionelle Hilfe eintrifft.

**Wichtige Hinweise für den Alltag:**
- **Idealerweise ist immer ein Trainer anwesend**, der in solchen Situationen unterstützen kann. Trainer sind geschult und wissen, wie sie schnell und sicher reagieren können.
- **Am Abend oder in den frühen Morgenstunden** kann es jedoch vorkommen, dass du allein im Studio bist. Deshalb ist es besonders wichtig, dass du in der Lage bist, die **Basics der Ersten Hilfe** auszuführen.
$body$, 'aktiv', 20028);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('4d79eb0d-8a24-5c5b-8d62-1e9b0112b11f', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Ziel und Zweck des Programms', 'reha-01-grundlagen-01-ziel-und-zweck-md', '', $body$# Ziel und Zweck des Programms

## Was ist Rehabilitationssport?

Das Reha-Programm richtet sich an Gruppen von 5 bis maximal 15 in Poing und 20 in Feldkirchen Teilnehmern und bietet eine sichere und effektive Möglichkeit, gezielt an der körperlichen Fitness und Lebensqualität zu arbeiten. Es wurde speziell für Menschen entwickelt, die nach Verletzungen, Operationen oder mit gesundheitlichen Einschränkungen wieder Kraft und Beweglichkeit aufbauen möchten.

Im Rahmen dieses Programms schaffen angeleitete Übungen die Grundlage, um die Regeneration zu unterstützen, Beschwerden zu lindern und langfristig die körperliche Belastbarkeit zu steigern. Durch die Kombination aus professioneller Anleitung und gemeinschaftlichem Training bietet das Reha-Programm den Teilnehmern eine motivierende und unterstützende Umgebung, um ihre Gesundheitsziele zu erreichen.

## Wesentliche Ziele des Programms

- **Verbesserung der Beweglichkeit:** Übungen zur Mobilisation und Dehnung helfen dabei, eingeschränkte Bewegungsradien zu erweitern.
- **Stärkung der Muskulatur:** Gezielt ausgewählte Übungen kräftigen die Muskulatur und fördern die Stabilität von Gelenken.
- **Förderung der Koordination und Balance:** Das Training verbessert das Körperbewusstsein und reduziert das Risiko von Stürzen oder Fehlbelastungen.
- **Gemeinschaftliches Training:** Die Gruppendynamik motiviert die Teilnehmer, regelmäßig zu trainieren und sich gegenseitig zu unterstützen.
- **Langfristige Prävention:** Durch regelmäßige Übungen wird das Risiko für erneute Beschwerden oder Verletzungen reduziert.

---

Die Kurse finden in einem speziell ausgestatteten Raum statt, der den Teilnehmern ein sicheres und effektives Training unter der Anleitung eines erfahrenen Reha-Trainers ermöglicht. Der Schwerpunkt liegt auf funktionellen, leicht umsetzbaren Übungen, die sowohl auf die Bedürfnisse der gesamten Gruppe abgestimmt sind als auch individuell auf die Anliegen einzelner Teilnehmer eingehen.

Das Programm kombiniert professionelle Betreuung, die motivierende Wirkung der Gruppendynamik und gezielte Bewegungsübungen, um die Teilnehmer auf ihrem Weg zu mehr Gesundheit und Wohlbefinden zu unterstützen. Ziel ist es, ein sicheres und motivierendes Umfeld zu schaffen, in dem alle aktiv an ihrer Genesung, Prävention und der Erhaltung ihres Gesundheitszustands arbeiten können.
$body$, 'aktiv', 30000);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('6be399df-88f9-52ab-9a17-ec083fa81c8a', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Abgrenzung zwischen Reha-Programm und regulärem Training', 'reha-01-grundlagen-02-abgrenzung-reha-vs-regulaeres-training-md', '', $body$# Abgrenzung zwischen Reha-Programm und regulärem Training

## Was dürfen Reha-Mitglieder?

Reha-Mitglieder dürfen ausschließlich an den speziell organisierten Reha-Kursen teilnehmen. Diese Kurse sind gezielt auf die gesundheitlichen Bedürfnisse der Teilnehmer abgestimmt und finden in einem klar definierten Rahmen statt. Eigenständiges Training auf der regulären Trainingsfläche ist Reha-Mitgliedern ohne weitere Mitgliedschaft jedoch nicht gestattet.

Für Reha-Mitglieder, die zusätzlich zur Reha auch regulär trainieren möchten, gibt es die **Reha Premium-Mitgliedschaft**. Diese ermöglicht den uneingeschränkten Zugang zur regulären Trainingsfläche und die Nutzung aller Studioeinrichtungen. Ohne diese Mitgliedschaft bleibt das eigenständige Training außerhalb der Reha-Kurse nicht erlaubt.

Die Reha Premium-Mitgliedschaft ist nur für die Dauer der gültigen Verordnung nutzbar.

---

Reha-Mitglieder bedürfen einer besonderen Behandlung, da sie oft älter sind, gesundheitliche Einschränkungen haben oder schwerhörig sein können. Diese individuellen Bedürfnisse sollten im Umgang stets berücksichtigt werden, um eine angenehme und förderliche Atmosphäre zu schaffen.
$body$, 'aktiv', 30001);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('1c028064-de5b-5347-b18f-24e1b9a430a6', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Rechtliche Grundlagen und Anforderungen', 'reha-01-grundlagen-03-rechtliche-grundlagen-md', '', $body$# Rechtliche Grundlagen und Anforderungen

## Rechtliche Grundlagen

- **Ärztliche Verordnung:** Die Teilnahme am Reha-Programm setzt eine gültige Verordnung durch einen Arzt voraus. Diese Verordnung enthält die genauen Maßnahmen, die für den Teilnehmer umzusetzen sind.
  → nur bei gesetzlicher Krankenkasse notwendig, nicht bei der Deutschen Rentenversicherung
- **Krankenkasse (gesetzlich):** Vor Beginn der Reha müssen die Maßnahmen von der Krankenkasse genehmigt werden. Ohne diese Genehmigung ist eine Teilnahme nicht möglich.
  Außer bei:
  - AOK
  - manche BKK (in diesem Fall bitte Rücksprache mit einer für Reha zuständigen Person halten)
  - IKK (in diesem Fall bitte Rücksprache mit einer für Reha zuständigen Person halten)
- **Betreuungspflicht:** Während des Reha-Programms müssen die Teilnehmer von qualifizierten Trainern betreut werden, die sicherstellen, dass die vorgegebenen Maßnahmen eingehalten werden.
- **Abgrenzung vom regulären Training:** Reha-Kurse dürfen nicht mit regulärem Training verwechselt werden. Eigenständiges Training auf der Trainingsfläche ist Reha-Mitgliedern ohne zusätzliche Mitgliedschaft nicht gestattet.

## Wichtige Hinweise für Mitarbeiter

- **Reha-Mitglieder sind keine regulären Mitglieder.** Sie haben keinen Zugang zur regulären Trainingsfläche, den Duschen und dem Sauna-Bereich, außer sie erwerben eine Reha Premium-Mitgliedschaft.
- **Dokumentation ist essenziell:** Jede Einheit muss lückenlos mit einer lesbaren Unterschrift dokumentiert werden, um den Anforderungen der Krankenkassen gerecht zu werden. **Eine Abrechnung der Einheiten geht nur, wenn diese dokumentiert werden, sonst bekommen wir kein Geld** (Kreuz reicht nicht!)
$body$, 'aktiv', 30002);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('fb3ff9f0-0c5c-57f7-8bb5-c6215e1c9834', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Aktueller Kontakt für REHA', 'reha-01-grundlagen-04-aktueller-kontakt-md', '', $body$# Aktueller Kontakt für REHA

## Kontaktinformationen

- **Telefonnummer:** 01515 6560715
- **E-Mail-Adresse:** [reha@vitness-poing.de](mailto:reha@vitness-poing.de)
  *(Diese E-Mail-Adresse gilt auch für das Studio in Feldkirchen.)*

## Wichtige Hinweise

- **Private Handynummer nicht weitergeben!** Die private Telefonnummer der Reha-Verantwortlichen darf nicht an Teilnehmer oder andere Personen weitergeleitet werden.

## Erreichbarkeit

- **Montag & Mittwoch:** Von **09:00 bis 16:00 Uhr** erreichbar.
- **Außerhalb dieser Zeiten:** Anfragen per E-Mail senden.
$body$, 'aktiv', 30003);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('bd6ca89f-3c7e-59f8-a9ae-ddaa94f2592f', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Erstkontakt und Anmeldung für Reha-Sport', 'reha-02-ablauf-01-erstkontakt-und-anmeldung-md', '', $body$# Erstkontakt und Anmeldung für Reha-Sport

## Angebot

Im Studio wird ausschließlich **Reha-Orthopädie** angeboten.

## Ablauf bei der ersten Anfrage

1. **Reha-Antrag ausfüllen**
   - Jeder neue Teilnehmer muss einen **Reha-Antrag** ausfüllen.
   - Dies kann:
     - **Vor Ort** im Studio geschehen.
     - **Telefonisch** erfolgen – in diesem Fall füllt der Mitarbeiter den Antrag für den Teilnehmer aus.
2. **Wichtige Angaben im Reha-Antrag**
   - Beim Feld **„Name der Krankenkasse"**:
     - Unbedingt nachfragen, ob die Verordnung **vom Arzt** oder von der **Deutschen Rentenversicherung (DRV)** stammt.
     - Dies ist wichtig, da die Zuständigkeit und Priorität je nach ausstellender Stelle variiert.
3. **Information über Wartezeiten**
   - Die **Wartezeit** auf einen freien Platz kann je nach **Kurspräferenzen** der Teilnehmer variieren.
   - Teilnehmer sollten darauf hingewiesen werden, dass ihre Präferenz (z. B. Wochentag, Uhrzeit) die Dauer der Wartezeit beeinflussen kann.
$body$, 'aktiv', 30004);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('aafdb6ce-f623-56e6-80ea-72ca63cd737c', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Teilgenommen – aber die VO ist abgelaufen', 'reha-02-ablauf-02-vo-abgelaufen-md', '', $body$# Teilgenommen – aber die VO ist abgelaufen

## Wiederaufnahme nach Ablauf der Verordnung

### Regelungen für Teilnehmer mit abgelaufener Verordnung
1. **Erneute Teilnahme erfordert neue Verordnung** – Teilnehmer, deren Verordnung abgelaufen ist, benötigen eine **neue Verordnung**, um erneut am Reha-Sport teilnehmen zu können.
2. **Privat Versicherte** – Privat Versicherte müssen in diesem Fall die **Kosten erneut übernehmen**.

### Sonderfall: Verlängerung der Verordnung
- Wenn die Verordnung abgelaufen ist, der Teilnehmer jedoch seine **Stunden nicht vollständig genutzt** hat, kann unter bestimmten Umständen eine **Verlängerung** bei der Krankenkasse beantragt werden.
- Die Verlängerung erfolgt in Absprache mit der Krankenkasse oder der Deutschen Rentenversicherung.
$body$, 'aktiv', 30005);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('18fcdbdb-1369-5dbe-8342-c63758057fe1', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Umgang mit Verordnungen', 'reha-02-ablauf-03-umgang-mit-verordnungen-md', '', $body$# Umgang mit Verordnungen

## Umgang

1. **Erstes Mal**
   - Beim ersten Kontakt mit einer neuen Verordnung:
     - **Kopie der Verordnung behalten.**
     - Das **Original bleibt beim Teilnehmer.**
2. **Neue Verordnung / Wiederaufnahme**
   - Teilnehmer, die bereits in der Vergangenheit bei uns waren und nun eine **neue Verordnung** haben:
     - **Original behalten** und eine **Kopie an den Teilnehmer** aushändigen.
3. **Platzzuweisung**
   - Sobald ein Teilnehmer einen Platz in einem Kurs zugewiesen bekommt:
     - **Original der Verordnung mitbringen** und im Studio abgeben.
     - Falls gewünscht, kann der Teilnehmer eine **Kopie der Verordnung** behalten.
$body$, 'aktiv', 30006);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('f4ce0d4f-89b0-5943-8c02-6a8bb4e1a767', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Krankenkasse Verordnungen', 'reha-03-verordnungen-01-krankenkasse-md', '', $body$# Krankenkasse Verordnungen

### Teilnahmefrequenz und Dauer
- **Maximale Teilnahme:** Gesetzlich Versicherte dürfen bis zu **50 Mal innerhalb von 1,5 Jahren** (18 Monate) am Reha-Sport teilnehmen.
- **Frequenz:** Die Teilnahme ist im Moment auf **einmal pro Woche** beschränkt.

### Kostenübernahme durch die Krankenkasse
Für die Teilnahme ist eine **Kostenübernahmenerklärung** durch die Krankenkasse notwendig. Diese muss ausgefüllt und genehmigt werden, bevor der Teilnehmer starten kann.

**Ausnahmen:**
- **AOK:** Keine Kostenübernahmenerklärung notwendig, die Teilnahme wird direkt geregelt.
- **BKK:** Hier sollte vorab Rücksprache gehalten werden, ob eine Kostenübernahmenerklärung notwendig ist.
- **IKK:** Gleiches Verfahren wie bei der BKK – Klärung notwendig, ob eine Genehmigung der Krankenkasse erforderlich ist.
$body$, 'aktiv', 30007);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('d1aba2b9-4838-55b9-9f21-c3ae458ec4f8', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Privat-Versicherte Teilnehmer', 'reha-03-verordnungen-02-privat-versicherte-md', '', $body$# Privat-Versicherte Teilnehmer

## Wichtige Regelungen und Abläufe

### 1. Verordnung nicht zwingend erforderlich
Privat versicherte Teilnehmer benötigen nicht unbedingt eine ärztliche Verordnung, um am Reha-Sport teilzunehmen. Dennoch sollten sie dazu ermutigt werden, eine Verordnung einzuholen, da dies eventuell für ihre private Krankenkasse von Vorteil sein könnte.

### 2. Vorauszahlung
Privat Versicherte müssen im Moment **350 EUR im Voraus** bezahlen, sofern sie einen Platz im Kurs zugewiesen bekommen.

### 3. Reha-Antrag ausfüllen
Auch privat Versicherte müssen einen **Reha-Antrag** ausfüllen. Dieser ist erforderlich, um die Teilnahme formal zu dokumentieren und sicherzustellen, dass alle benötigten Informationen vorliegen.

### 4. SEPA-Lastschriftmandat
- **Das SEPA-Lastschriftmandat ist Pflicht.**
- Die Thekenmitarbeiter sind dafür verantwortlich, dass der Teilnehmer das **Reha-SEPA-Lastschriftmandat** korrekt ausfüllt.

**Tipp:** Das Mandat kann entweder vor Ort ausgefüllt werden oder per E-Mail an den Teilnehmer gesendet werden.

## Teilnahmebedingungen

Privat Versicherte dürfen **für maximal 12 Monate** am Reha-Sport teilnehmen. Die Teilnahme ist auf **einmal pro Woche** beschränkt.

## Option für gesetzlich Versicherte ohne Genehmigung (Selbstzahler)

Wenn gesetzlich Versicherte am Reha-Sport teilnehmen möchten, jedoch **keine Genehmigung durch die Krankenkasse** erhalten, besteht die Möglichkeit, die Kosten selbst zu tragen. In diesem Fall gelten dieselben Bedingungen wie für privat Versicherte:
- **Vorauszahlung von 350 EUR**
- **Maximal einmal pro Woche Teilnahme für 12 Monate**
$body$, 'aktiv', 30008);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('94570940-98f8-502b-ab21-df5c3e0d429d', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Deutsche Rentenversicherung', 'reha-03-verordnungen-03-deutsche-renten-versicherung-md', '', $body$# Deutsche Rentenversicherung

## Teilnahmedauer und Frequenz

- Teilnehmer, die über die Deutsche Rentenversicherung (DRV) am Reha-Sport teilnehmen, können diesen für **maximal 6 Monate** nutzen.
- Während dieser Zeit sind **26 Einheiten** vorgesehen, die in der Regel mit einer Frequenz von **1 Mal pro Woche** absolviert werden.

## Voraussetzungen für die Teilnahme am Reha-Sport über die Deutsche Rentenversicherung

1. **Reha-Berechtigung** – Die Teilnahme am Reha-Sport über die Deutsche Rentenversicherung ist nur möglich, wenn die Person zuvor in einer **Reha-Klinik** war.
2. **Frist zur Aufnahme des Reha-Sports**
   - Nach der Entlassung aus der Reha-Klinik (Aufenthaltsdauer: **3-4 Wochen**) muss der Reha-Sport innerhalb von **3 Monaten** begonnen werden.
   - **Wichtig:** Wird diese Frist nicht eingehalten, verliert die Verordnung ihre Gültigkeit.

## Priorität der Verordnung

Die Verordnung der Deutschen Rentenversicherung hat die **höchste Priorität**, da sie in der Regel auf ärztliche Empfehlungen nach einer stationären Rehabilitation basiert.

## Anschluss-Heil-Behandlung (AHB)

Die Anschluss-Heil-Behandlung ist ein spezielles Angebot der Deutschen Rentenversicherung und richtet sich an Personen, die:
- Eine **schwere Operation** hatten (z. B. Herz- oder Gelenkoperationen).
- An einer **schweren Erkrankung** leiden (z. B. Krebs, Schlaganfall).

In diesem Fall erfolgt die AHB direkt im Anschluss an den Klinikaufenthalt in einer Reha-Klinik.

## Wichtige Hinweise für die Thekenmitarbeiter

- **Prüfe die Verordnung der DRV sorgfältig** und stelle sicher, dass die 3-Monats-Frist eingehalten wird.
- **Priorisiere die DRV-Teilnehmer**, da ihre Verordnung die höchste Dringlichkeit besitzt.
- **Erkläre die Frist und die Bedeutung des Reha-Sports**, damit Teilnehmer wissen, wie wichtig ein zeitnaher Beginn ist.
$body$, 'aktiv', 30009);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('615efda6-ba03-502f-853d-8cd879c73165', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Tagesliste-Teilnehmer', 'reha-04-reha-fit-programm-01-tagesliste-teilnehmer-md', 'Wenn die Reha-Teilnehmer ins Studio kommen und sich für ihren Reha-Kurs anmelden möchten, kannst du im Reha-Fit-Programm ganz einfach oben links auf das Symbol mit der Uhr klicken. Dadurch gelangst du direkt zur Tages…', $body$# Tagesliste-Teilnehmer

Wenn die Reha-Teilnehmer ins Studio kommen und sich für ihren Reha-Kurs anmelden möchten, kannst du im Reha-Fit-Programm ganz einfach oben links auf das Symbol mit der Uhr klicken. Dadurch gelangst du direkt zur Tagesliste. Dort gibt es ein paar wichtige Punkte, auf die du immer achten solltest:

## Grüner Haken prüfen

- Überprüfe, ob bei allen Teilnehmern ein grüner Haken vorhanden ist.
- **Wichtig:** Ohne Unterschrift gibt es kein Geld! Bei einem gelben Ausrufezeichen prüfe, ob die Unterschrift fehlt, und kläre dies mit dem Teilnehmer.

## Rote Markierung bei Teilnehmern

- Teilnehmer mit einer roten Markierung (z. B. R(4)) haben fast alle Einheiten aufgebraucht.
- **Ab R(5):** Teilnehmer informieren, dass die Verordnung bald abläuft.

## Nachfragen bei auslaufender Verordnung

- Frage den Teilnehmer, ob er eine neue Verordnung holen möchte oder nicht mehr am Reha-Sport teilnehmen wird.
- **Wichtig:** Schreibe eine Bemerkung für die Reha-Mitarbeiter, damit sie wissen, ob der Platz frei wird oder der Teilnehmer bleibt.
$body$, 'aktiv', 30010);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('1d6b2314-bc15-5508-ac1c-dccd02b36c10', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Krankenkasse funktioniert nicht – Unterschrift nachholen', 'reha-04-reha-fit-programm-02-krankenkasse-funktioniert-nicht-md', '', $body$# Krankenkasse funktioniert nicht – Unterschrift nachholen

## Hintergrund

Wenn die Krankenkassenkarte eines Reha-Teilnehmers beim Kursbesuch nicht funktioniert, ist es wichtig, trotzdem alle notwendigen Informationen zu dokumentieren und die Unterschrift nachträglich einzuholen. (Keine Unterschrift = kein Geld.)

## Kursbesuch dokumentieren, wenn die Karte nicht funktioniert

1. **Karte erneut einstecken** – Der Teilnehmer steckt seine Krankenkassenkarte in das Lesegerät.
2. **Bei Fehler:**
   - **Bemerkung hinzufügen:** Schreibe eine Bemerkung, in der du dokumentierst:
     - **Name der Krankenkasse**
     - **Mitgliedsnummer**
     - **Versichertennummer**
   - **Kopie der Karte:** Fertige bei Bedarf eine Kopie der Vorderseite der Krankenkassenkarte an, um alle relevanten Daten zu sichern.

## Unterschrift nachholen

1. **Navigiere zur Kundenübersicht**
   - Gehe zu **Navigation → Kunden → Kundenübersicht**.
   - Suche den **Teilnehmer**, bei dem die Unterschrift nachgeholt werden muss.
2. **Rezeptverlauf öffnen** – Klicke auf **„Rezept"** und öffne den **Rezeptverlauf**.
3. **Teilnahme hinzufügen** – Wähle die Option **„Teilnahme hinzufügen"** und speichere die Eintragung.
4. **Unterschrift nachholen**
   - Doppelklicke auf das Symbol **(–)** bei der entsprechenden Teilnahme.
   - Der Teilnehmer wird aufgefordert, auf dem Unterschrift-Gerät zu unterschreiben.
5. **Unterschrift bestätigen**
   - Der Teilnehmer muss auf dem Gerät **„OK"** drücken, um die Unterschrift zu bestätigen.
   - Nach erfolgreicher Unterschrift wird das **(–)** zu einem **grünen Haken**.
6. **Speichern** – Speichere alle Änderungen, um die Teilnahme und Unterschrift korrekt zu dokumentieren.
$body$, 'aktiv', 30011);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('8f1fd433-5e16-5e3e-93f3-cecd130347e5', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Verwaltung und Aktualisierung von Kontaktdaten', 'reha-04-reha-fit-programm-03-verwaltung-kontaktdaten-md', '', $body$# Verwaltung und Aktualisierung von Kontaktdaten

## Zuständigkeiten

- **Keine Änderungen an persönlichen Informationen:** Als Service-/Thekenmitarbeiter bist du **nicht berechtigt**, sensible persönliche Daten wie Krankenkassendetails der Teilnehmer zu ändern. Diese Aufgaben sind ausschließlich den **Reha-Verantwortlichen** vorbehalten.
- **Deine Aufgabe:** Du darfst lediglich **Kontaktdaten** wie **E-Mail-Adresse** oder **Telefonnummer** aktualisieren oder ergänzen, um die Arbeit der Reha-Mitarbeiter zu erleichtern.

## Ablauf: Aktualisierung von Kontaktdaten

### 1. Unter Navigation: Kunde → Kundenübersicht
- Wähle den Punkt **„Kunde"** und anschließend **„Kundenübersicht"**, um alle vorhandenen Teilnehmer anzuzeigen.
- **Teilnehmer suchen und auswählen**
  - Gib den Namen oder andere Informationen des Teilnehmers in die Suchleiste ein.
  - Klicke auf den entsprechenden Teilnehmer, um die Detailansicht zu öffnen.

## Kontaktdaten aktualisieren oder hinzufügen

1. **Icon für „Neuen Kontaktdateneintrag" auswählen**
   - Unten links findest du ein **Icon in Form eines weißen Blattes Papier**.
   - Klicke auf das Icon, um einen **neuen Kontaktdateneintrag** zu erstellen.
2. **Kontaktdaten auswählen und ausfüllen**
   - **Kontaktart:** Wähle entweder **„Telefon"**, **„E-Mail"** oder **„Mobil"** als Kontaktart aus dem Dropdown-Menü aus.
   - **Daten eintragen:** Trage die neue Telefonnummer oder E-Mail-Adresse ein.
3. **Änderungen speichern** – Überprüfe die Eingaben sorgfältig und bestätige die Änderungen, indem du auf **„Speichern"** klickst.
$body$, 'aktiv', 30012);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('dfd6b5d1-e85f-5db5-9204-1f8fed0a5908', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Krankenkassenkarte einlesen', 'reha-04-reha-fit-programm-04-krankenkassenkarte-einlesen-md', '', $body$# Krankenkassenkarte einlesen

## Hintergrund

Manchmal kann es passieren, dass ein Teilnehmer, der sich für den Reha-Sport angemeldet hat und nun seinen ersten Kurs besucht, Probleme mit seiner Krankenkassenkarte hat. In diesem Fall muss die Karte manuell eingelesen werden. Hier ist der genaue Ablauf:

## Schritt-für-Schritt-Anleitung

1. **Kundenübersicht öffnen** – Navigiere zu **„Kundenübersicht"** und wähle den entsprechenden **Kunden** aus.
2. **Einstellungen öffnen** – Klicke oben rechts auf das Reha-Fit-**Symbol** und wähle **„Einstellungen"** aus.
3. **Kartenleser konfigurieren**
   - Gehe zum Bereich **„Kartenleser"**.
   - Setze die Einstellungen auf:
     - **CIK:** Nein
     - **KVK:** Ja
4. **Karte einlesen**
   - Stecke die Karte in den Kartenleser ein und wähle **„Übernehmen"**.
   - Schließe das Fenster und klicke auf **„Speichern"**.

## KVK-Daten übernehmen

1. **Zum Kunden wechseln** – Gehe zurück zum **Kundenprofil**.
2. **KVK-Daten auslesen**
   - Wähle die Option **„KVK-Daten auslesen"**.
   - Bestätige mit **„KVK-Daten übernehmen"**.
3. **Änderungen speichern** – Klicke erneut auf **„Speichern"**, um die Änderungen zu sichern.

→ Kontrolliere nochmal, ob im Reiter KVK-Daten alle Informationen ausgefüllt sind.

## Kartenleser zurücksetzen

1. **Einstellungen erneut öffnen** – Gehe wieder zu **Einstellungen → Kartenleser**.
2. **Kartenleser konfigurieren**
   - Setze die Einstellungen nun auf:
     - **CIK:** Ja
     - **KVK:** Nein
3. **Speichern** – Speichere die Änderungen und schließe das Fenster.

## Karte final einstecken und Unterschrift einholen

1. **Karte erneut einstecken** – Stecke die Karte in den Leser.
2. **Unterschrift einholen** – Lass den Teilnehmer die erforderliche Unterschrift leisten.

## Hinweise

- **Probleme bei der Karte:** Wenn es weiterhin Schwierigkeiten gibt, informiere die Reha-Verantwortlichen oder prüfe, ob die Karte defekt ist.
- **Dokumentation:** Stelle sicher, dass alle Daten korrekt übernommen wurden, um eine reibungslose Abwicklung mit der Krankenkasse zu gewährleisten.
$body$, 'aktiv', 30013);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('54a780ef-4fa7-5561-94d4-83c238fa6278', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Reha-Kurs absagen', 'reha-04-reha-fit-programm-05-reha-kurs-absagen-md', '', $body$# Reha-Kurs absagen

## Schritt-für-Schritt-Anleitung

### 1. Navigation
- Kursverwaltung → Kursanwesenheit
- Wähle den **jeweiligen Kurs** aus, der abgesagt werden muss.
- Suche die entsprechende **Kalenderwoche (KW)**, in der der Kurs ausfällt.
- Klicke auf **„Drucken"** und wähle die Option **„TN-Liste mit Kontaktdaten"** aus.
- Wähle oben rechts im Druckdialog die Option **„Microsoft Print to PDF"**.
- Speichere die Datei im **„Reha-Absagen"-Ordner** auf dem **Team-Server**.

### Teilnehmer informieren

1. **Telefonisch Kontakt aufnehmen** – Gehe die erstellte Teilnehmerliste durch und rufe **alle Teilnehmer an**, um sie über die Absage zu informieren.
2. **Status in der Datei vermerken**
   - Öffne die PDF-Datei und notiere für jeden Teilnehmer:
     - **Informiert:** Ja/Nein

### Optionen, wenn Teilnehmer nicht erreicht werden

Falls ein Teilnehmer nicht erreichbar ist:
- Schreibe eine **E-Mail** mit den Absageinformationen an die jeweilige E-Mail-Adresse des Teilnehmers.
- Vermerke dies ebenfalls in der Datei (z. B. „E-Mail gesendet").

## Wichtige Hinweise

- Stelle sicher, dass **alle Teilnehmer rechtzeitig informiert** werden, um Unannehmlichkeiten zu vermeiden.
- Notiere in der Datei **jeden Kontaktversuch** (z. B. „Telefonisch erreicht", „Mailbox", „E-Mail gesendet").
- Der **Reha-Absagen-Ordner** dient zur Dokumentation, falls Rückfragen auftreten.
$body$, 'aktiv', 30014);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('7b6c1883-f04e-5344-b276-38a9b9c231c0', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Teilnehmer meldet sich ab', 'reha-04-reha-fit-programm-06-teilnehmer-meldet-sich-ab-md', '', $body$# Teilnehmer meldet sich ab

## Grundsatz

Wir gehen davon aus, dass die Teilnehmer zu ihrem Kurs erscheinen. **Wenn ein Teilnehmer nicht kommen kann, muss er sich aktiv abmelden.**

## Abmeldung eines Teilnehmers

1. **Kursanwesenheit öffnen**
   - Navigiere im System zum Bereich **„Kursanwesenheit"**.
   - Wähle den **jeweiligen Kurs & die jeweilige KW**, für den der Teilnehmer sich abgemeldet hat.
2. **Teilnehmer markieren**
   - Suche in der Liste den entsprechenden Teilnehmer.
   - Setze einen **Haken** bei dem Namen der Person, um ihn auszuwählen.
3. **Bearbeiten**
   - Klicke auf das **Stift-Symbol**, um die Details für die Anwesenheit zu bearbeiten.
   - **„Hat sich entschuldigt gemeldet" auswählen**
   - **Hinweis:** Es ist nicht zwingend erforderlich, einen Grund für die Abmeldung einzutragen.
4. **Speichern**
   - Bestätige die Änderung, indem du auf **„OK"** klickst und anschließend **„Speichern"**.
$body$, 'aktiv', 30015);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('cc510af1-2474-5411-b29f-5586eb8e1f86', '4fb80be6-93c0-5502-8de6-21be2286e169', 'Bemerkungen bei Teilnehmern schreiben', 'reha-04-reha-fit-programm-07-bemerkungen-schreiben-md', '1. Kundenübersicht öffnen – Gehe in die Kundenübersicht und suche den entsprechenden Teilnehmer. 2. Neue Bemerkung hinzufügen – Klicke mit der rechten Maustaste auf den Teilnehmer und wähle „Neue Bemerkung" aus. 3. Be…', $body$# Bemerkungen bei Teilnehmern schreiben

1. **Kundenübersicht öffnen** – Gehe in die Kundenübersicht und suche den entsprechenden Teilnehmer.
2. **Neue Bemerkung hinzufügen** – Klicke mit der rechten Maustaste auf den Teilnehmer und wähle **„Neue Bemerkung"** aus.
3. **Bemerkung verfassen**
   - Schreibe die Bemerkung klar und präzise.
   - **Wichtig:** Kein Haken bei **„Erledigt"** oder **„Interne Aufgabe"** setzen.
4. **Speichern** – Schließe den Vorgang ab, indem du die Bemerkung speicherst.

So stellst du sicher, dass die Bemerkungen korrekt und übersichtlich für alle Reha-Mitarbeiter verfügbar sind.
$body$, 'aktiv', 30016);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('20ec47fd-1567-5e5a-9445-f6f6a2f192c5', 'be346e69-cd41-51ee-852e-d28aa12631e9', 'Präventionskurse Grundlagen', 'praevention-01-grundlagen-md', '', $body$# Präventionskurse Grundlagen

## Was sind Präventionskurse nach § 20 SGB V?

- **Definition** – Präventionskurse sind zeitlich begrenzte Gesundheitsprogramme, die das gesundheitsorientierte Verhalten der Teilnehmenden stärken (z. B. Bewegung, Ernährung, Stressmanagement). Rechtliche Grundlage: § 20 SGB V (Primäre Prävention und Gesundheitsförderung).
- **Qualitätssicherung** – Für die Anerkennung durch alle gesetzlichen Krankenkassen müssen Kurse das Prüfsiegel *Deutscher Standard Prävention* der Zentralen Prüfstelle Prävention (ZPP) erhalten.
- **Handlungsfelder** – Bewegung & Ernährung
  - **FeelFit**: Handlungsfeld *Bewegung*
  - **Yummy**: Handlungsfeld *Ernährung*

## Wie funktionieren diese Kurse organisatorisch?

| Merkmal | Typischer Standard |
|---|---|
| **Format** | Online-Kurs |
| **Dauer** | 8 Einheiten à 20–45 Min., verteilt auf ca. 8–12 Wochen |
| **Gebühr** | 149 € pro Kurs (gültig für unser Studio V-itness) |
| **Erstattung** | Gesetzliche Krankenkassen erstatten 60–100 % (bis zu 150 €) nach Vorlage der Teilnahmebescheinigung; maximal zwei Präventionskurse pro Kalenderjahr |
| **Private Kassen** | Erstattungsfähigkeit variiert – Teilnehmende müssen vorab anfragen |

## Warum funktionieren Präventionskurse so gut?

1. **Evidenzbasiert** – Inhalte entsprechen den Kriterien des Leitfadens Prävention des GKV-Spitzenverbandes.
2. **Verhaltensänderung** – Regelmäßige Termine, kleine Lernaufgaben und feste Gruppe fördern nachhaltige Gewohnheitsbildung.
3. **Gruppendynamik** – Gemeinsames Lernen steigert Motivation und Verbindlichkeit.
4. **Qualifizierte Leitung** – Nur Fachkräfte mit anerkannten Grund- und Zusatzqualifikationen dürfen Kurse leiten / schreiben.
5. **Finanzieller Anreiz** – Hohe Kostenerstattung senkt Einstiegshürden.

## Rolle unseres Studios

- Bereitstellung der zertifizierten Kurskonzepte **FeelFit** (Bewegung) und **Yummy** (Ernährung).
- Unterstützung der Teilnehmenden bei Fragen zur Kostenerstattung.

## Kurz-Teaser zu FeelFit & Yummy

| Kurs | Kurzbeschreibung | Handlungsfeld |
|---|---|---|
| **FeelFit** | Ganzkörper-Fitnesskurs mit Schwerpunkt Kraft- und Stabilisationstraining für Alltag und Rücken. | Bewegung |
| **Yummy** | Ernährungsprogramm mit praxisnahen Modulen zu ausgewogener Kost, Portionierung, Einkaufs- und Kochstrategien. | Ernährung |
$body$, 'aktiv', 40000);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('35826ad1-1fcc-5ee7-aecd-cd9854f4c37b', 'be346e69-cd41-51ee-852e-d28aa12631e9', 'FeelFit Grundlagen', 'praevention-02-feelfit-grundlagen-md', '', $body$# FeelFit Grundlagen

## Kursaufbau

- **Dauer & Umfang:** 8 aufeinanderfolgende Module (jeweils 8 Wochen), je etwa 30–45 Minuten.
- **Flexibles Lernen:** Nach Registrierung stehen die Inhalte **12 Wochen** lang zur Verfügung; jede neue Einheit schaltet sich automatisch **eine Woche** nach der vorherigen frei.
- **Didaktik:** Jede Einheit kombiniert Theorie-Video und ein Quiz, das vor dem Weiterklicken bestanden werden muss.

## Modulinhalte

| Nummer | Modulinhalte |
|---|---|
| 1 | Muskeln, Sehnen & Kraft |
| 2 | Motivation & Gewohnheiten |
| 3 | Knochen & Belastbarkeit |
| 4 | Gelenke & Beweglichkeit |
| 5 | Faszien |
| 6 | Herz-Kreislauf |
| 7 | Nervensystem & Stress |
| 8 | Immunsystem & Stoffwechsel |

## Ablauf für Teilnehmende

1. **Zugangscode** vom Studio erhalten und online registrieren.
2. Wöchentlich eine Einheit absolvieren (Video → Quiz).
3. Digitales **Teilnahmezertifikat** herunterladen und zusammen mit der Rechnung bei der Krankenkasse einreichen.
4. Kostenerstattung erfolgt üblicherweise **innerhalb von 4–7 Werktagen**.

## Aufgaben für Studio-Mitarbeitende

- Zugangscodes ausgeben.
- In die Provisionsliste eintragen.
$body$, 'aktiv', 40001);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('54a7d52f-e916-5e9c-9b76-9aea304425b0', 'be346e69-cd41-51ee-852e-d28aa12631e9', 'Yummy Grundlagen', 'praevention-03-yummy-grundlagen-md', '', $body$# Yummy Grundlagen

## Überblick

- **Format:** Live-Online-Kurs mit acht aufeinanderfolgenden Lektionen
- **Umfang:** pro Lektion etwa 45 Minuten Video-Coaching plus Quiz
- **Zugang:** ab Registrierung zwölf Wochen Zugriff; jede neue Lektion wird eine Woche nach Abschluss der vorherigen freigeschaltet
- **Begleitmaterial:** gedrucktes Yummy-Buch mit Rezeptbaukasten
- **Ziel:** ausgewogene, pflanzenbetonte Ernährung etablieren, Gewichtsmanagement unterstützen, Mangelernährung vorbeugen
- **Gebühr & Erstattung:** 149 €; nach vollständig absolviertem Kurs erstatten die meisten gesetzlichen Krankenkassen 75–100 % (zwei Präventionskurse pro Kalenderjahr möglich)

## Modulplan

| Nr. | Theorie-Impuls | Praxis-Schwerpunkt |
|---|---|---|
| 1 | Vielseitig essen | Ernährungsbasics & Alltagsplanung |
| 2 | Obst & Gemüse | Portionsgrößen, Zubereitungstipps |
| 3 | Pflanzliche Proteine | Proteinquellen kombinieren |
| 4 | Vollkorn & Ballaststoffe | Getreidealternativen, Sättigung |
| 5 | Zucker & Salz | Zuckerfallen erkennen, smart würzen |
| 6 | Fette | Wertvolle Fette auswählen, Mengen steuern |
| 7 | Achtsamkeit beim Essen | Hunger-/Sättigungssignale, Ess-Rhythmus |
| 8 | Nachhaltigkeit | Saisonkalender, regionale Produkte |

## Ablauf für Teilnehmende

1. Zugangscode vom Studio erhalten und online registrieren.
2. Wöchentlich eine Lektion (Videos → Quiz) bearbeiten; Reihenfolge ist verbindlich.
3. Innerhalb von zwölf Wochen alle acht Lektionen abschließen (**100% Teilnahme**).
4. Teilnahmebescheinigung und Rechnung herunterladen.
5. Beides bei der Krankenkasse einreichen; Erstattung erfolgt meist innerhalb weniger Werktage.
$body$, 'aktiv', 40002);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('32d7a6cf-129f-5d0f-be1e-748cc026ab3e', 'be346e69-cd41-51ee-852e-d28aa12631e9', 'Dokumente richtig ausfüllen', 'praevention-04-dokumente-richtig-ausfuellen-md', '', $body$# Dokumente richtig ausfüllen

## Yummy / FeelFit Dokument ausfüllen

### 1. Passendes Formular öffnen & ausfüllen
Auf dem iPad findest du beide PDFs:
- **Yummy – Nutzungsbedingungen**
- **FeelFit – Anmeldung + Nutzungsbedingungen**

Wenn der Interessent beide Kurse bucht, fülle auch beide Formulare aus.

### 2. Datei korrekt speichern
Benenne das ausgefüllte PDF exakt so:
`Vorname Nachname – Yummy.pdf` bzw. `Vorname Nachname – FeelFit.pdf`.

### 3. E-Mail versenden
Empfänger:
- **verwaltung@vitness-poing.de** (mit extra Screenshot nochmal, da die Dokumente bei der Ann-Kathrin meistens nicht richtig ankommen)
- den jeweiligen Interessenten (CC)

### Anhänge im Notion-Original
- Yummy_Nutzungsbedingungen.pdf
- Feelfit_Anmeldung_Nutzungsbedingungen.pdf
- Krankenzuschuss.pdf

## Notion-Eintrag anlegen

- Navigiere in Notion zu **Formulare einreichen → Provisionsliste**.
- Trage den Abschluss vollständig ein, damit deine Provision erfasst wird.
$body$, 'aktiv', 40003);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('b1be5eb4-b2df-5122-9e98-f1a2dd4dfc24', 'ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'Umsatz & Unternehmensziele', 'trainer-01-umsatz-unternehmensziele-md', 'Die wirtschaftlichen Ziele des Studios hängen eng mit einer aktiven, strukturierten Vertriebsarbeit sowie einer hohen Trainingsqualität zusammen. Damit das gesamte Trainerteam dazu beitragen kann, den Umsatz nachhalti…', $body$# Umsatz & Unternehmensziele

Die wirtschaftlichen Ziele des Studios hängen eng mit einer aktiven, strukturierten Vertriebsarbeit sowie einer hohen Trainingsqualität zusammen. Damit das gesamte Trainerteam dazu beitragen kann, den Umsatz nachhaltig zu steigern und gleichzeitig die Bindung unserer Mitglieder zu erhöhen, gelten folgende Schwerpunkte.

---

## Aktives und systematisches Verkaufen der Präventionskurse (§20 SGB V)

Unsere Präventionskurse sind ein zentraler Baustein im Geschäftsmodell. Sie dienen nicht nur der Gesundheit unserer Mitglieder, sondern sind auch ein bedeutender Umsatztreiber.

Alle Trainer sollen daher aktiv und selbstbewusst auf die Kurse hinweisen, deren Nutzen erklären und Mitglieder gezielt dafür gewinnen. Es geht um ein **strukturiertes, kontinuierliches Ansprechen**, nicht nur um gelegentliche Hinweise.

---

## Egym-Fokus für Wellpass- und UrbanSports-Mitglieder

Viele Mitglieder nutzen unser Studio über Wellpass oder Urban Sports. Diese Zielgruppe ist oft weniger gebunden.

Durch eine gezielte Nutzung der Egym-Geräte und insbesondere durch die Kombination mit **Präventionstarifen** können wir ihre Bindung deutlich erhöhen.

Die Trainer sollen aktiv erklären, wie Egym funktioniert, welchen Mehrwert die regelmäßige Nutzung bringt und wie ein Umstieg auf präventionsorientierte Angebote zusätzliche Vorteile schafft.

---

## Zentrale Ziele dieser Maßnahmen

Durch das Zusammenspiel aus professionellem Verkauf, qualitätsorientiertem Training und konsequenter Betreuung sollen wir drei Hauptziele erreichen:

1. **Umsatzsteigerung** – Durch Präventionskurse, gezielte Tarifberatung und eine bessere Aktivierung der Bestandsmitglieder.
2. **Steigerung der Trainingsqualität** – Je klarer und strukturierter die Trainingsbetreuung erfolgt, desto besser die Ergebnisse der Mitglieder — und desto stärker die Weiterempfehlung.
3. **Erhöhung der Kundenbindung** – Mitglieder, die Erfolge sehen, sich gut betreut fühlen und passende Angebote nutzen, bleiben länger und trainieren regelmäßiger.
$body$, 'aktiv', 50000);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('56329193-b014-5adf-8ffe-dbaf3a528ec1', 'ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'Trainingsqualität & Methodik', 'trainer-02-trainingsqualitaet-methodik-md', 'Eine hohe Trainingsqualität ist einer der wichtigsten Faktoren für zufriedene Mitglieder, nachhaltige Erfolge und langfristige Kundenbindung. Damit alle Trainer einheitlich, professionell und wirksam arbeiten, gelten…', $body$# Trainingsqualität & Methodik

Eine hohe Trainingsqualität ist einer der wichtigsten Faktoren für zufriedene Mitglieder, nachhaltige Erfolge und langfristige Kundenbindung. Damit alle Trainer einheitlich, professionell und wirksam arbeiten, gelten folgende Grundsätze und Erwartungen.

---

## Regelmäßiges Erklären, Zeigen und Einstellen von Trainingsmethoden und Programmen

Viele Mitglieder wissen nicht automatisch, wie ein Training optimal aufgebaut ist oder wie sie Geräte richtig nutzen. Der Trainer hat die Aufgabe, aktiv auf die Mitglieder zuzugehen, Trainingsmethoden verständlich zu erklären und Übungen bei Bedarf vorzuführen.

Auch bereits eingestellte Trainingsprogramme müssen regelmäßig überprüft und angepasst werden. Dadurch stellen wir sicher, dass die Mitglieder weder unter- noch überfordert sind und kontinuierlich Fortschritte machen.

---

## Konsequenter Einsatz von BioAge (Hub + App)

BioAge ist ein starkes Instrument, um Trainingserfolge sichtbar zu machen. Durch regelmäßige Messungen am Hub und die Einbindung der App können wir Mitgliedern ihre Entwicklung transparent zeigen — ein wichtiger Motivationsfaktor.

Trainer sollen aktiv darauf achten, BioAge in ihren Terminabläufen einzubauen und den Mitgliedern verständlich zu erklären, **warum** diese Messungen wichtig sind und wie sie helfen, das Training sinnvoll zu steuern.

---

## Präsente und konsequente Flächenbetreuung als Qualitätsmerkmal

Die Qualität auf der Trainingsfläche entscheidet maßgeblich darüber, wie professionell unser Studio wahrgenommen wird.

Das bedeutet:
- Trainer sind **sichtbar**, **ansprechbar** und **aktiv**.
- Sie warten nicht auf Fragen, sondern gehen proaktiv auf Mitglieder zu.
- Sie beobachten Technik, korrigieren freundlich und kompetent und sorgen dafür, dass jedes Mitglied sich gut aufgehoben fühlt.

---

Diese Art der Betreuung ist kein „Nice-to-have", sondern **ein fester Bestandteil unserer Qualitätsstrategie**.
$body$, 'aktiv', 50001);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('821bdd64-6372-5963-9e42-f4ef9be2c696', 'ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'Standardisierter Terminprozess für Neukunden', 'trainer-03-standardisierter-terminprozess-md', 'Ein einheitlicher Prozess für alle Neukunden ist entscheidend, um eine gleichbleibend hohe Betreuungsqualität sicherzustellen. Jeder Trainer soll nach dem gleichen Ablauf arbeiten, damit neue Mitglieder strukturiert a…', $body$# Standardisierter Terminprozess für Neukunden

Ein einheitlicher Prozess für alle Neukunden ist entscheidend, um eine gleichbleibend hohe Betreuungsqualität sicherzustellen. Jeder Trainer soll nach dem gleichen Ablauf arbeiten, damit neue Mitglieder strukturiert an das Training herangeführt werden und von Anfang an professionelle Unterstützung erhalten.

---

## Verbindliche Termin-Reihenfolge für alle Neukunden

### 1. Probetraining
Das Probetraining ist der Einstiegspunkt. Hier sollen Interessenten das Studio, die Trainingsmöglichkeiten und die Trainerkompetenz direkt erleben. Der Fokus liegt auf einer positiven Erfahrung, klaren Ergebnissen und einer überzeugenden Präsentation unseres Angebots.

### 2. Beratung
Direkt im Anschluss an das Probetraining findet die Beratung statt.

Ziel: Bedürfnisse klären, geeigneten Tarif empfehlen und dem Interessenten zeigen, warum unser Konzept langfristige Ergebnisse ermöglicht.

Durch die enge Verzahnung von Probetraining und Beratung entsteht ein professioneller, verbindlicher Prozess ohne lange Wartezeiten oder Unsicherheiten.

### 3. Starttermin
Nach Abschluss der Beratung erfolgt die Planung des Starttermins. Dieser Termin ist der offizielle Beginn des Trainings und dient der ersten umfassenden Betreuung (u. a. Anamnese, Messungen, Geräteeinstellungen).

Wichtig: Der Starttermin ist ein **Einzeltermin**, damit der Trainer sich komplett auf die neue Person konzentrieren kann.

### 4. Zweiter Trainingstermin
Hier wird das Training vertieft. Weitere Messungen, Korrekturen und individuelle Anpassungen sorgen dafür, dass das neue Mitglied die Grundlagen sicher beherrscht und gut in den Trainingsalltag findet.

### 5. Trainingsplan (ca. 10–12 Wochen)
Im dritten Schritt der Betreuung wird ein strukturierter Trainingsplan erstellt, der sich an Zielen, Beschwerden und der Trainingshistorie orientiert. Ein Plan über 10–12 Wochen bietet genügend Zeit für sichtbare Fortschritte, ohne das Training zu überladen.

---

## Weitere Regeln für den Ablauf

### Probetrainingstermine werden durch Blocker geschützt
Blocker stellen sicher, dass im Anschluss an das Probetraining immer eine direkte Beratung möglich ist. Dadurch vermeiden wir lange Wartezeiten und verhindern, dass der Verkaufsprozess ins Stocken gerät.

### Nur Einzeltermine (Ausnahme beim Probetraining)
Grundsätzlich werden alle Termine einzeln durchgeführt, damit die Qualität der Betreuung hoch bleibt.

Einzige Ausnahme: Probetraining kann mit maximal zwei Personen stattfinden, wenn beide gemeinsam kommen. Mehr ist nicht zulässig.

### Keine Doppeltermine beim Starttermin
Der Starttermin erfordert volle Aufmerksamkeit. Doppel- oder Gruppentermine sind nicht erlaubt, da sie die Qualität beeinträchtigen würden.
$body$, 'aktiv', 50002);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('8359dbbf-7766-508b-9576-16c13a900164', 'ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'Trainer-Stärken & Verantwortlichkeiten', 'trainer-04-trainer-staerken-verantwortlichkeiten-md', 'Ein professionelles Studio lebt von einem starken Team, in dem jeder Trainer seine individuellen Fähigkeiten einbringt und klare Verantwortungsbereiche übernimmt. Um die Zusammenarbeit zu stärken und die Qualität weit…', $body$# Trainer-Stärken & Verantwortlichkeiten

Ein professionelles Studio lebt von einem starken Team, in dem jeder Trainer seine individuellen Fähigkeiten einbringt und klare Verantwortungsbereiche übernimmt. Um die Zusammenarbeit zu stärken und die Qualität weiter zu verbessern, sollen die Trainer sich aktiv mit ihren eigenen Stärken, Schwächen und Rollen im Team auseinandersetzen.

---

## Vorbereitung für das nächste Meeting

Alle Trainer sollen sich im Vorfeld mit folgenden Punkten beschäftigen und diese reflektiert vorbereiten:

### Persönliche Stärken und Schwächen
Jeder Trainer soll offen einschätzen, wo seine besonderen Kompetenzen liegen und in welchen Bereichen noch Entwicklungspotenzial besteht.

Ziel ist es, diese Einschätzung nicht als Kritik, sondern als Chance zur Verbesserung zu verstehen. Nur wenn wir unsere Stärken kennen und gezielt nutzen, kann das Team insgesamt besser funktionieren.

### Eigene Verantwortungsbereiche
Trainer sollen sich bewusst machen, welche Aufgaben sie bereits übernehmen, wo sie Verantwortung tragen und welche Bereiche sie zukünftig stärker ausfüllen möchten.

Dies schafft Klarheit, Transparenz und sorgt dafür, dass wichtige Aufgaben zuverlässig erledigt werden.

---

## Aktuelle Verantwortungsbereiche im Team

Um Struktur in den laufenden Betrieb zu bringen, gibt es bereits definierte Zuständigkeiten:

- **Wartung der Geräte:** Tanja & Andi
- **Bestellungen:** Tanja
- **Wünsche & Anregungen der Mitglieder sammeln:** Marco
- **Verbesserungsvorschläge dokumentieren:** Tanja, Marco & zusätzlich in Notion
- **Beispiel für einen Verantwortungsbereich:** Simon übernimmt die Verantwortung für den **Putzplan** sowie die **Eintragungen der Tageskraft**.

Diese Verantwortlichkeiten können sich über die Zeit weiterentwickeln, sind aber aktuell verbindlich und sollten von allen Trainern respektiert und unterstützt werden.

---

## Aktiver Beitrag zur Studioentwicklung

Ein wichtiger Punkt: Trainer sollen das Studio **aktiv weiterempfehlen** – sowohl im persönlichen Umfeld als auch im direkten Gespräch mit Mitgliedern.

**Der Gedanke dahinter:** Nur wer selbst überzeugt ist, kann authentisch beraten und erfolgreich verkaufen.

Ein Trainer, der hinter dem Konzept steht, vermittelt automatisch mehr Begeisterung, Sicherheit und Professionalität.
$body$, 'aktiv', 50003);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('8d56837d-56bc-540e-9ad5-970b82b53fad', 'ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'VIP Start – Standardisierung', 'trainer-05-vip-start-standardisierung-md', 'Damit neue Mitglieder vom ersten Tag an ein hochwertiges, einheitliches und professionelles Betreuungserlebnis erhalten, ist ein klar definierter VIP-Startprozess notwendig. Dieser Prozess soll sicherstellen, dass jed…', $body$# VIP Start – Standardisierung

Damit neue Mitglieder vom ersten Tag an ein hochwertiges, einheitliches und professionelles Betreuungserlebnis erhalten, ist ein klar definierter VIP-Startprozess notwendig. Dieser Prozess soll sicherstellen, dass jeder Trainer nach denselben Standards arbeitet und alle Neukunden den gleichen hohen Qualitätslevel erleben.

---

## Einheitliche Erwartungen und Mindeststandards

### Egym unten muss vollständig eingestellt werden
Für einen professionellen Trainingsstart ist es unerlässlich, dass der Egym-Zirkel im unteren Bereich vollständig eingestellt wird.

Ein unvollständig eingestellter Zirkel vermittelt nicht nur einen unstrukturierten Eindruck, sondern lässt auch Zweifel an unserer Kompetenz entstehen.

Mitglieder müssen spüren, dass wir von Anfang an präzise, gründlich und durchdacht arbeiten.

### 4 Wochen „nur 5 Geräte" wirkt unprofessionell
Die bisherige Praxis, Mitglieder für mehrere Wochen nur an wenigen Geräten trainieren zu lassen, führt schnell zu Unzufriedenheit und wirkt nicht hochwertig.

Neumitglieder wollen ein umfassendes Training erleben, das auf ihre Ziele abgestimmt ist – nicht nur einen Teilbereich.

Deshalb muss jeder VIP-Start so gestaltet sein, dass er ein vollständiges, nachvollziehbares und zielorientiertes Trainingsprogramm beinhaltet.

### Egym oben nur einstellen, wenn es sinnvoll begründet ist
Der obere Egym-Zirkel soll **nicht** standardmäßig bei jedem neuen Mitglied komplett eingestellt werden.

Er kommt zum Einsatz, wenn:
- das Trainingsziel es erfordert,
- sportlicher Hintergrund oder Erfahrung vorhanden sind oder
- medizinische / funktionelle Gründe dafürsprechen.

Ausnahmen sind ausdrücklich erlaubt – sie sollen aber sinnvoll begründet und nachvollziehbar kommuniziert sein.

### Psychologische & verkaufstechnische Argumentation einheitlich kommunizieren
Damit Mitglieder ein stimmiges Gesamterlebnis haben, müssen alle Trainer dieselben Kernargumente nutzen.

Dazu gehören:
- Warum starten wir so?
- Warum diese Reihenfolge?
- Warum nicht alles auf einmal einstellen?
- Warum ist eine schrittweise Einführung sinnvoll?

Eine einheitliche Kommunikation schafft Vertrauen, Professionalität und wirkt deutlich souveräner.

### Offene Frage: Gehört Flexx standardmäßig dazu?
Es besteht noch Klärungsbedarf, ob der Flexx-Zirkel künftig zum festen Bestandteil des VIP-Starts gehören soll.

Sobald hierzu eine finale Entscheidung getroffen wurde, wird der Standard entsprechend ergänzt und aktualisiert.

---

## Ziel des VIP-Standards

Alle oben beschriebenen Regeln verfolgen ein gemeinsames Ziel:

**Ein klar definierter, strukturierter und hochwertiger VIP-Start für jeden neuen Kunden – unabhängig davon, welcher Trainer die Betreuung übernimmt.**

Nur wenn der Ablauf einheitlich ist, können wir sicherstellen, dass unsere Qualität jederzeit nachvollziehbar, überprüfbar und reproduzierbar bleibt.
$body$, 'aktiv', 50004);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('0148bfc8-04c5-54c9-b8a1-61bd8aedc671', 'ea955f37-7ca2-5742-a7d9-4b3da8949a26', 'Starttermin', 'trainer-06-starttermin-md', 'Der Starttermin bildet den offiziellen Einstieg ins Training und muss ab sofort folgende Schritte beinhalten:', $body$# Starttermin

Der Starttermin bildet den offiziellen Einstieg ins Training und muss ab sofort folgende Schritte beinhalten:

## 1. Vollständige Anamnese
Eine gründliche Anamnese ist Pflicht. Sie umfasst u. a.:
- Gesundheitszustand
- Beschwerden
- Ziele
- Trainingserfahrung
- individuelle Einschränkungen
- relevante Lebensstilfaktoren

Diese Informationen bilden die Grundlage für alle kommenden Trainingsentscheidungen.

## 2. Inbody-Messung
Eine Körperanalyse mit Inbody ist fester Bestandteil des Starttermins.

Sie dient zur Feststellung des Ausgangsniveaus und ermöglicht es, Fortschritte später klar sichtbar zu machen.

Für Mitglieder ist dies oft ein starker Motivationsfaktor – deshalb ist die Messung zwingend durchzuführen.

## 3. Egym-Einstellung (eingeschränkt)
Die Egym-Geräte werden ebenfalls am Starttermin eingestellt.

Wichtig: Nicht der komplette obere und untere Zirkel wird eingestellt, da dies den Rahmen sprengen würde.

Es wird nur das eingestellt, was für den Start wirklich notwendig und sinnvoll ist.

Durch diese Fokussierung bleibt der Termin effizient und trotzdem professionell.

### Ziel des Starttermins
Ein klar strukturiertes, vollständiges und qualitativ hochwertiges Ersttraining, das alle relevanten Grundlagen legt, ohne den Kunden zu überfordern.

---

## Zweiter Termin – Vertiefung und Ergänzung

Der zweite Termin dient dazu, das Training zu erweitern, zu strukturieren und das Mitglied besser an die Geräte und Methoden heranzuführen.

### 1. Hub- / Flexx-Messungen
Je nach Trainingsziel und körperlicher Verfassung werden am zweiten Termin Messungen am Hub durchgeführt und, falls sinnvoll, Flexx-Messungen ergänzt.

Diese Daten helfen, funktionelle Dysbalancen zu erkennen und gezielt zu bearbeiten.

### 2. Einführung in den Flexx-Zirkel
Der Flexx-Zirkel wird systematisch vorgestellt.

Ziel ist, dem Mitglied ein besseres Verständnis für Beweglichkeit, Körperhaltung und funktionelles Training zu vermitteln.

Die Übungen unterstützen oft auch das Egym-Training und verbessern die Trainingsergebnisse insgesamt.

---

## Dritter Termin – Erstellung des Trainingsplans

Im dritten Termin erhält das Mitglied seinen persönlichen Trainingsplan. Dieser ist verbindlich und auf ca. **10 bis 12 Wochen** ausgelegt.

### 1. Individueller Trainingsplan
Der Plan soll:
- klar strukturiert
- realistisch
- zielgerichtet
- und für das Mitglied nachvollziehbar sein.

### 2. Ergänzung durch Zirkeltraining (wenn ausreichend)
In vielen Fällen ist es nicht notwendig, das Training zu überfrachten.

Wenn das Egym- und Flexx-Training bereits eine solide Basis bildet, kann eine Ergänzung über einfache zusätzliche Übungen vollkommen ausreichen.

Weniger ist hier oft mehr.

### 3. Vertiefte Anamnese
Auch beim dritten Termin werden erneut Fragen gestellt, um das Training weiter zu präzisieren:
- Wie fühlt sich das Training bisher an?
- Haben sich Beschwerden verändert?
- Wie gut wurde der Startprozess verstanden?
- Gibt es Anpassungsbedarf?

Diese weiterführende Anamnese hilft, falsche Belastungen früh zu erkennen und Fehler im Training zu vermeiden.

---

## Anamnese – Pflicht bei jedem Termin

Ein besonders wichtiger Beschluss:

**Bei jedem einzelnen Termin muss eine Anamnese durchgeführt werden.**

Dies gilt ausdrücklich für:
- Egym Plus
- Flexx
- Starttermin
- Zweiter Termin
- Trainingsplan
- alle weiteren Folgetermine

Die Anamnese ist das Fundament einer sicheren und qualitativ hochwertigen Betreuung. Sie verhindert Fehlbelastungen, dient der Dokumentation und stellt sicher, dass jeder Trainer jederzeit versteht, mit wem er arbeitet.

---

## Übergeordnetes Ziel

Alle beschriebenen Schritte verfolgen ein gemeinsames Ziel:

**Fehlbetreuung verhindern und die Qualität dauerhaft sichern.**

Durch klare Standards, verlässliche Strukturen und konsequente Umsetzung kann jedes Mitglied sicher sein, eine professionelle, nachvollziehbare und hochwertige Betreuung zu erhalten – unabhängig davon, welcher Trainer den Termin durchführt.
$body$, 'aktiv', 50005);
insert into public.knowledge_articles (id, category_id, title, slug, summary, body, status, sort_order)
values ('8b4e8d75-015a-5d28-9a38-1f8e8e40ed03', '4b3d0650-216d-52a8-8285-da0d2b1fb37d', 'Kursplan / Kursinformationen', 'kursplan-00-kursplan-komplett-md', '', $body$# Kursplan / Kursinformationen

## Kraft & Workout

### Boostar®
Boostar® ist ein intensiver, abwechslungsreicher Cardio-Mix, der athletische Bewegungen mit unterschiedlichen Ausdauer- und Conditioning-Protokollen verbindet. Das Training setzt starke Reize für das Herz-Kreislauf-System, bleibt durch fließende Wechsel besonders kurzweilig und führt häufig in ein motivierendes „Runner's High". Ideal für alle, die ihre Ausdauer effektiv steigern und viel Energie verbrennen möchten.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐☆☆☆
- **Ausdauer:** ⭐⭐⭐⭐⭐
- **Koordination/Beweglichkeit:** ⭐⭐☆☆☆

---

### Balance Swing
Balance Swing kombiniert dynamische Bewegungen auf dem Minitrampolin mit gezielten Übungen für Balance, Tiefenmuskulatur und Koordination. Durch den weichen Untergrund werden die Gelenke geschont, während gleichzeitig Kraft und Ausdauer verbessert werden. Ein effektives, energiegeladenes Training mit hohem Spaßfaktor.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐☆☆
- **Ausdauer:** ⭐⭐⭐⭐☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐☆

---

### Bauchexpress
Bauchexpress ist ein intensives Core-Workout, das sich vollständig auf die Kräftigung und Definition der Bauch- und Rumpfmuskulatur konzentriert. Mit einer Kombination aus klassischen und dynamischen Übungen sorgt der Kurs für eine starke Körpermitte, verbessert die Stabilität und setzt gezielte Trainingsreize für sichtbare Ergebnisse.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐⭐
- **Ausdauer:** ⭐☆☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐☆☆☆

---

### Bodystyling / Faszien
Bodystyling/Faszien kombiniert ein dynamisches Warm-up mit einem abwechslungsreichen Krafttraining unter Einsatz des eigenen Körpergewichts und verschiedener Geräte. Der Kurs kräftigt die gesamte Muskulatur, verbessert die Körperform und steigert gleichzeitig die allgemeine Kondition. Durch die faszialen Anteile wird zudem die Beweglichkeit unterstützt und das Körpergefühl verbessert.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐☆
- **Ausdauer:** ⭐⭐☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐☆☆

---

### Bauch Beine Po (BBP)
BauchBeinePo ist ein klassisches Ganzkörper-Kräftigungsprogramm, das die Bereiche Bauch, Beine und Po gezielt formt und stärkt. Durch die Kombination aus isolierten Übungen und dynamischen Elementen wird die Muskulatur intensiv aktiviert, während gleichzeitig die allgemeine Fitness verbessert wird. Ein effektives Training, um Kraft aufzubauen und den Körper sichtbar zu straffen.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐☆
- **Ausdauer:** ⭐⭐☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐☆☆☆

---

### Full Body HIIT
Full Body HIIT ist ein intensives Intervalltraining, das durch wechselnde Übungen mit dem eigenen Körpergewicht oder Kurzhanteln den gesamten Körper fordert. Die Einheit kombiniert Kraft-, Ausdauer- und Koordinationsreize zu einem kompakten und effektiven Workout, das sowohl Einsteigern als auch Fortgeschrittenen eine leistungsstarke Trainingsoption bietet.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐☆
- **Ausdauer:** ⭐⭐⭐⭐☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐☆☆

---

### Hot Iron® 1
Hot Iron® 1 ist ein kraftorientiertes Langhantel-Workout, das Einsteiger wie Fortgeschrittene durch klar strukturierte Trainingsabläufe an das effektive Kraftausdauertraining heranführt. Mit Übungen wie Squats, Deadlifts und Schulterdrücken werden alle großen Muskelgruppen intensiv beansprucht, wodurch sowohl Kraft als auch Ausdauer spürbar verbessert werden. Ein motivierendes Ganzkörpertraining, das den Stoffwechsel ankurbelt und eine solide Grundlage für weiteres Langhanteltraining schafft.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐⭐
- **Ausdauer:** ⭐⭐⭐☆☆
- **Koordination/Beweglichkeit:** ⭐⭐☆☆☆

---

### Hot Iron® 2
Hot Iron® 2 ist ein intensives Langhanteltraining, das mit komplexeren Übungen und höheren Belastungsstufen deutlich anspruchsvoller als die Einstiegsstufe ist. Der Kurs fordert alle großen Muskelgruppen, steigert Kraft und Kraftausdauer und verbessert zugleich Koordination und Stabilität. Ein energiegeladenes Programm für alle, die ihre Leistungsfähigkeit ausbauen, ihre Muskulatur definieren und eine spürbare körperliche Herausforderung suchen.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐⭐
- **Ausdauer:** ⭐⭐⭐⭐☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐☆☆

---

### Hot Iron® Cross
Hot Iron® Cross ist ein intensives Kraft-Intervall-Training, das Langhantelübungen mit Bodyweight-Elementen kombiniert und sowohl Einsteiger als auch Fortgeschrittene an ihre Leistungsgrenzen bringt. Der Fokus liegt auf Kraftausdauer, Körperstraffung und einer deutlichen Steigerung des Stoffwechsels durch kurze, effektive Übungskombinationen mit geringerer Wiederholungszahl. Ein dynamisches Workout, das Kraft, Geschwindigkeit und Gesamtfitness spürbar verbessert.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐⭐
- **Ausdauer:** ⭐⭐⭐⭐☆
- **Koordination/Beweglichkeit:** ⭐⭐☆☆☆

---

### Power BBP (Bauch Beine Po)
Power BBP ist ein intensives Ganzkörper-Workout, das den Fokus auf die Kräftigung und Straffung von Bauch, Beinen und Po legt. Durch eine Kombination aus Bodyweight-Übungen, Step-Elementen und gezieltem Krafttraining werden Muskulatur und Kondition gleichermaßen gefordert. Ein dynamisches Format, das Kraft aufbaut, die Ausdauer steigert und den Körper sichtbar formt.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐☆
- **Ausdauer:** ⭐⭐⭐☆☆
- **Koordination/Beweglichkeit:** ⭐⭐☆☆☆

---

### TRX
TRX ist ein funktionelles Ganzkörpertraining mit dem Suspension-System, bei dem das eigene Körpergewicht als Widerstand genutzt wird. Durch instabile Trainingsbedingungen werden sowohl große Muskelgruppen als auch die tief liegende Stützmuskulatur intensiv aktiviert, was Kraft, Stabilität und Haltung nachhaltig verbessert. Gleichzeitig fördert das Training Ausdauer, Koordination und Beweglichkeit und bietet nahezu unbegrenzte Übungsvarianten für alle Leistungsstufen.

**Hauptkategorie:** Kraft & Workout

**Bewertung**
- **Kraft:** ⭐⭐⭐⭐⭐
- **Ausdauer:** ⭐⭐⭐☆☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐☆

---

## Body & Mind

### CIRCL Mobility™️
CIRCL Mobility™️ ist ein mobilisierendes und entspannendes Training, das durch fließende Bewegungen Gelenke, Muskeln und Faszien gezielt dehnt und aktiviert. Der Kurs verbessert Flexibilität, Bewegungsqualität und Körperhaltung und hilft dabei, Verspannungen zu lösen sowie die Regeneration zu unterstützen. Ideal als Ausgleich zu intensiven Workouts oder als eigenständige Einheit für mehr Geschmeidigkeit und Körperbewusstsein.

**Hauptkategorie:** Body & Mind

**Bewertung**
- **Kraft:** ⭐☆☆☆☆
- **Ausdauer:** ⭐☆☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐⭐

---

### Rückenfit
Rückenfit ist ein gezielt ausgerichtetes Training zur Kräftigung und Mobilisation der Rücken-, Bauch- und gesamten Rumpfmuskulatur. Der Kurs fördert eine gesunde Körperhaltung, steigert die Beweglichkeit der Wirbelsäule und hilft, Verspannungen zu lösen sowie Rückenbeschwerden vorzubeugen. Ideal als ausgleichendes Training für alle, die ihre Rückengesundheit unterstützen und langfristig stärken möchten.

**Hauptkategorie:** Body & Mind

**Bewertung**
- **Kraft:** ⭐⭐⭐☆☆
- **Ausdauer:** ⭐☆☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐☆

---

### WS & Stretch
WS & Stretch kombiniert gezielte Wirbelsäulenmobilisation mit wohltuenden Dehnübungen für den gesamten Körper. Der Kurs löst Verspannungen, verbessert die Beweglichkeit der Wirbelsäule und fördert eine aufrechte, gesunde Haltung. Durch sanfte, fließende Bewegungen entsteht ein ausgleichendes Training, das Flexibilität, Körperbewusstsein und allgemeines Wohlbefinden steigert.

**Hauptkategorie:** Body & Mind

**Bewertung**
- **Kraft:** ⭐⭐☆☆☆
- **Ausdauer:** ⭐☆☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐⭐

---

### Yoga
Yoga ist ein ganzheitliches Training, das Körper, Geist und Atmung in Einklang bringt. Durch fließende Bewegungen, Haltungen und bewusste Atemtechniken verbessert der Kurs Beweglichkeit, Kraft in der Körpermitte, Balance und innere Ruhe. Ein ausgleichendes Format, das Verspannungen löst, Stress reduziert und die Körperhaltung nachhaltig stärkt.

**Hauptkategorie:** Body & Mind

**Bewertung**
- **Kraft:** ⭐⭐☆☆☆
- **Ausdauer:** ⭐☆☆☆☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐⭐

---

## Cycling & Ausdauer

### Cycle-Coach by Color®
Cycle-Coach by Color® ist ein intensives Indoor-Cycling-Workout, das durch farbcodierte Intensitätszonen ein präzises und motivierendes Training ermöglicht. Dynamische Intervallsequenzen, individuell anpassbare Widerstände und mitreißende Musik fördern Ausdauer, Beinkraft und eine stabile Körperhaltung. Ein energiegeladenes Format, das sowohl Einsteiger als auch erfahrene Trainierende an ihre persönlichen Leistungsgrenzen führt.

**Hauptkategorie:** Cycling & Ausdauer

**Bewertung**
- **Kraft:** ⭐⭐☆☆☆
- **Ausdauer:** ⭐⭐⭐⭐⭐
- **Koordination/Beweglichkeit:** ⭐☆☆☆☆

---

### Easy Cycle Coach by Color®
Easy Cycle Coach by Color® ist ein einsteigerfreundliches Indoor-Cycling-Format, das ein sanftes, aber dennoch wirkungsvolles Ausdauertraining bietet. Durch farbcodierte Intensitätszonen lässt sich das Training individuell steuern, sodass jeder im eigenen Tempo Kondition aufbauen, Kalorien verbrennen und die Beinmuskulatur stärken kann. Unterstützt durch motivierende Musik entsteht ein leicht zugängliches Workout, das ohne Leistungsdruck auskommt.

**Hauptkategorie:** Cycling & Ausdauer

**Bewertung**
- **Kraft:** ⭐⭐☆☆☆
- **Ausdauer:** ⭐⭐⭐☆☆
- **Koordination/Beweglichkeit:** ⭐☆☆☆☆

---

## Choreo & Tanz

### Easy Power Step
Easy Power Step verbindet einfache Step-Bewegungen mit einem vielseitigen Ganzkörpertraining, das Ausdauer, Kraft und Koordination gleichermaßen fördert. Durch rhythmische Abläufe zur Musik werden Kondition und Gleichgewicht verbessert, während gleichzeitig ein effektiver Fettverbrennungseffekt entsteht. Ein motivierendes Workout für alle, die ein leicht bis mittel anspruchsvolles Training mit Spaßfaktor suchen.

**Hauptkategorie:** Choreo & Tanz

**Bewertung**
- **Kraft:** ⭐⭐⭐☆☆
- **Ausdauer:** ⭐⭐⭐⭐☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐☆

---

### Zumba
Zumba ist ein energiegeladenes Dance-Workout, das lateinamerikanische Rhythmen und einfache Choreografien zu einem mitreißenden Ganzkörpertraining verbindet. Der Kurs verbessert die Ausdauer, fördert Koordination und Bewegungsfreude und verbrennt dabei effektiv Kalorien. Ideal für alle, die Spaß an Musik und Bewegung haben und ein motivierendes Cardio-Workout suchen.

**Hauptkategorie:** Choreo & Tanz

**Bewertung**
- **Kraft:** ⭐⭐☆☆☆
- **Ausdauer:** ⭐⭐⭐⭐☆
- **Koordination/Beweglichkeit:** ⭐⭐⭐⭐☆
$body$, 'aktiv', 60000);

commit;

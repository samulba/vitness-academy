-- =============================================================
-- seed_interaktive_demo_phase2.sql
-- Drei Phase-2 Demo-Bloecke fuer die Lektion
-- "Standard Check-in" (lesson 55555555-...-503).
--
-- Sortier-Aufgabe + Szenario + Schritt-fuer-Schritt-Walkthrough.
-- Idempotent via on conflict do update.
--
-- Voraussetzung: Migration 0006_interaktive_bloecke.sql ist
-- bereits in der DB.
-- =============================================================

insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  -- Sortier-Aufgabe: Reihenfolge des Check-ins
  ('66666666-6666-6666-6666-66666666660d',
   '55555555-5555-5555-5555-555555555503',
   'sortieren',
   '{
      "aufgabe": "Bringe die Schritte des Standard-Check-ins in die richtige Reihenfolge.",
      "schritte_korrekt": [
        "Mitglied freundlich begrüßen und Augenkontakt aufnehmen",
        "Mitgliedskarte oder QR-Code einscannen",
        "Auf grünes Signal am System warten",
        "Trainingserfolg wünschen und verabschieden"
      ]
    }'::jsonb,
   3),

  -- Szenario: Mitglied vergisst Karte
  ('66666666-6666-6666-6666-66666666660e',
   '55555555-5555-5555-5555-555555555503',
   'szenario',
   '{
      "situation_markdown": "Ein langjähriges Mitglied steht an der Theke. Du kennst es vom Sehen. Es sagt: _„Ich hab heute meine Karte zu Hause vergessen, kann ich trotzdem rein?“_\n\nWas machst du?",
      "optionen": [
        {
          "text": "Verweise höflich darauf, ohne Karte sei kein Zutritt möglich",
          "korrekt": false,
          "feedback_markdown": "**Zu hart.** Wir kennen das Mitglied — Service geht vor Bürokratie. Eine Identifikation über Name + Geburtsdatum ist der bessere Weg."
        },
        {
          "text": "Identifiziere das Mitglied im System über Name + Geburtsdatum und buche manuell ein",
          "korrekt": true,
          "feedback_markdown": "**Genau richtig.** So bleibt die Erfassung sauber, das Mitglied fühlt sich willkommen, und du bringst es freundlich daran erinnern, die Karte beim nächsten Mal mitzubringen."
        },
        {
          "text": "Lass das Mitglied einfach ohne Erfassung durch — kennt eh jeder",
          "korrekt": false,
          "feedback_markdown": "**Bitte nicht.** Ohne Erfassung haben wir keine Trainingsstatistik und im Notfall keine Anwesenheitsliste. Außerdem: vor anderen Mitgliedern wirkt das willkürlich."
        }
      ]
    }'::jsonb,
   4),

  -- Schritt-fuer-Schritt: Was tun wenn Karte nicht funktioniert
  ('66666666-6666-6666-6666-66666666660f',
   '55555555-5555-5555-5555-555555555503',
   'schritte',
   '{
      "titel": "Karte funktioniert nicht — so gehst du vor",
      "schritte": [
        {
          "titel": "Ruhig bleiben und kurz erklären",
          "body_markdown": "Sag dem Mitglied freundlich: _„Einen Moment, ich check das schnell für dich.“_ Niemals genervt schauen — das Mitglied kann nichts dafür.",
          "hinweis": "Ton der Stimme ist wichtiger als die Worte selbst."
        },
        {
          "titel": "Karte nochmal sauber einscannen",
          "body_markdown": "Manchmal liegt es nur an der Position. Karte mittig auf den Scanner halten, kurz warten, dann nochmal versuchen.",
          "hinweis": null
        },
        {
          "titel": "Im System nach dem Mitglied suchen",
          "body_markdown": "Falls der Scan zweimal fehlschlägt: über **Suche** im Magicline nach Nachname + Geburtsdatum. Account-Status prüfen — ist der Beitrag aktuell?",
          "hinweis": "Bei abgelaufenem Beitrag: nicht abweisen, sondern an Studioleitung verweisen."
        },
        {
          "titel": "Manuell einbuchen und Notiz hinterlassen",
          "body_markdown": "Wenn der Account in Ordnung ist, manuell einbuchen. Eine kurze Notiz im System, dass die Karte heute nicht funktioniert hat — falls es öfter passiert, ist das ein Hinweis auf eine kaputte Karte.",
          "hinweis": "Bei wiederholten Problemen: neue Karte ausgeben, alte sperren."
        }
      ]
    }'::jsonb,
   5)
on conflict (id) do update
  set block_type = excluded.block_type,
      content    = excluded.content,
      sort_order = excluded.sort_order;

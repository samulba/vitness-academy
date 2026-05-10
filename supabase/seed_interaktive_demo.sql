-- =============================================================
-- seed_interaktive_demo.sql
-- Drei interaktive Demo-Bloecke für die Lektion
-- "Begrüßung am Empfang" (lesson 55555555-...-501).
-- Idempotent via on conflict do update.
--
-- Vor dem Ausfuehren: Migration 0006_interaktive_bloecke.sql
-- muss bereits in der DB sein, sonst greift der CHECK-Constraint.
-- =============================================================

insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order)
values
  -- Aufdeck-Karte: provoziert Nachdenken vor der Antwort
  ('66666666-6666-6666-6666-66666666660a',
   '55555555-5555-5555-5555-555555555501',
   'aufdeck_karte',
   '{
      "frage": "Du stehst an der Theke, das Mitglied kommt rein — was sind die ersten drei Dinge, die du machst?",
      "antwort_markdown": "1. **Blickkontakt** aufnehmen, sobald das Mitglied im Eingangsbereich ist\n2. **Aktiv begrüßen** — möglichst mit Vornamen, falls bekannt\n3. **Lächeln** und kurz vom Bildschirm hochsehen\n\n_Diese drei Sekunden entscheiden über das Erlebnis._"
    }'::jsonb,
   4),

  -- Inline-Quiz: Multiple Choice mit Feedback
  ('66666666-6666-6666-6666-66666666660b',
   '55555555-5555-5555-5555-555555555501',
   'inline_quiz',
   '{
      "typ": "multiple",
      "frage": "Welche Verhaltensweisen gehören zu einer guten Begrüßung? (mehrere Antworten möglich)",
      "optionen": [
        {
          "text": "Lächeln und Blickkontakt aufnehmen",
          "korrekt": true,
          "erklaerung": "Genau — Blickkontakt + Lächeln zeigt, dass du das Mitglied wahrnimmst."
        },
        {
          "text": "Erst die laufende Aufgabe abschließen, dann grüßen",
          "korrekt": false,
          "erklaerung": "Falsch. Lieber kurz unterbrechen — das Mitglied steht im Mittelpunkt."
        },
        {
          "text": "Mit Vornamen begrüßen, wenn du ihn kennst",
          "korrekt": true,
          "erklaerung": "Top — persönliche Ansprache schafft sofort Bindung."
        },
        {
          "text": "Bei Telefonat einfach durchwinken",
          "korrekt": false,
          "erklaerung": "Nicht okay. Lieber kurz Pause machen oder nicken — Mitglied muss wissen, dass es bemerkt wurde."
        }
      ]
    }'::jsonb,
   5),

  -- Akkordeon: typische Sonderfälle
  ('66666666-6666-6666-6666-66666666660c',
   '55555555-5555-5555-5555-555555555501',
   'akkordeon',
   '{
      "einleitung": "Ein paar Situationen, in denen die Standard-Begrüßung angepasst werden muss:",
      "items": [
        {
          "frage": "Mitglied kommt sichtbar gestresst rein",
          "antwort_markdown": "**Empathisch reagieren.** Statt Smalltalk: kurzer freundlicher Gruß, Aufmerksamkeit zurückhalten, dem Mitglied Raum geben. Erst wenn es selbst signalisiert, dass es sprechen möchte, in den Dialog gehen."
        },
        {
          "frage": "Du bist gerade in einem Verkaufsgespräch",
          "antwort_markdown": "**Nicken + Lächeln.** Kurz Augenkontakt herstellen, klar zu erkennen geben „ich sehe dich“. Niemals wegschauen oder ignorieren — das Mitglied weiß dann: gleich bin ich dran."
        },
        {
          "frage": "Mehrere Mitglieder kommen gleichzeitig",
          "antwort_markdown": "**Reihenfolge benennen.** Alle einzeln ansprechen: „Hallo, ich bin gleich für Sie da“ zur zweiten Person. Niemand fühlt sich übergangen. Stresslevel im Studio bleibt niedrig."
        }
      ]
    }'::jsonb,
   6)
on conflict (id) do update
  set block_type = excluded.block_type,
      content    = excluded.content,
      sort_order = excluded.sort_order;

-- =============================================================
-- 0006_interaktive_bloecke.sql
-- Erweitert die zulaessigen block_type-Werte für
-- lesson_content_blocks um sechs interaktive Typen.
--
-- Phase 1 (Aufdeck-Karten, Inline-Quiz, Akkordeon)
-- Phase 2 (Sortier-Aufgabe, Szenario, Schritt-für-Schritt)
--
-- Die Spalte content (jsonb) bleibt unveraendert, jeder neue
-- Typ hat seinen eigenen JSON-Shape (siehe lib/lektion.ts).
-- =============================================================

alter table public.lesson_content_blocks
  drop constraint if exists lesson_content_blocks_block_type_check;

alter table public.lesson_content_blocks
  add constraint lesson_content_blocks_block_type_check
  check (
    block_type in (
      -- bisher
      'text',
      'checkliste',
      'video_url',
      'hinweis',
      -- Phase 1
      'aufdeck_karte',
      'inline_quiz',
      'akkordeon',
      -- Phase 2
      'sortieren',
      'szenario',
      'schritte'
    )
  );

-- =============================================================
-- JSON-Shapes pro Typ (Doku, nicht enforced):
--
-- aufdeck_karte:
--   { "frage": "...", "antwort_markdown": "..." }
--
-- inline_quiz:
--   { "typ": "single" | "multiple",
--     "frage": "...",
--     "optionen": [
--       { "text": "...", "korrekt": true|false, "erklaerung": "..." }
--     ] }
--
-- akkordeon:
--   { "einleitung": "..." | null,
--     "items": [ { "frage": "...", "antwort_markdown": "..." } ] }
--
-- sortieren:
--   { "aufgabe": "...",
--     "schritte_korrekt": ["1...", "2...", "3..."] }
--
-- szenario:
--   { "situation_markdown": "...",
--     "optionen": [
--       { "text": "...", "korrekt": true|false, "feedback_markdown": "..." }
--     ] }
--
-- schritte:
--   { "titel": "...",
--     "schritte": [
--       { "titel": "...", "body_markdown": "...", "hinweis": "..." | null }
--     ] }
-- =============================================================

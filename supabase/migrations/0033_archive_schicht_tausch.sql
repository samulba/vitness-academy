-- =============================================================
-- 0033_archive_schicht_tausch.sql
-- Schicht-Tausch wurde aus dem UI entfernt -- Template wird auf
-- 'archiviert' gesetzt damit's nicht mehr in /formulare auftaucht.
-- Bestehende Submissions bleiben erhalten (nur das Template wird
-- ausgeblendet).
-- =============================================================

update public.form_templates
   set status = 'archiviert',
       updated_at = now()
 where id = '00000000-0000-0000-0000-000000000103'
   and status = 'aktiv';

-- =========================================================
-- 0065_fuehrungskraft_als_custom_rolle.sql
--
-- System-Rollen aufräumen: Führungskraft ist konzeptionell eine
-- Verwaltungs-Custom-Rolle (Studio-Leiter mit beschränktem Zugriff)
-- und wird in der UI im Custom-Bereich erwartet. Wir nehmen den
-- is_system-Flag weg, damit:
--   - die Rolle im Rollen-Übersichts-Block "Verwaltungs-Rollen"
--     auftaucht, nicht in den System-Rollen.
--   - Admin sie editieren/archivieren kann wie jede andere Custom-
--     Verwaltungs-Rolle.
--
-- Die UUID '00000000-0000-0000-0000-000000000002' bleibt erhalten,
-- damit getCurrentProfile() weiter das richtige role_permissions-
-- Set für User mit profiles.role='fuehrungskraft' lädt. Das Enum
-- in profiles.role bleibt auch unverändert.
--
-- System bleiben: Mitarbeiter (Default für neue User), Admin,
-- Superadmin. Diese drei sind die echten System-Anker.
-- =========================================================

update public.roles
   set is_system = false
 where id = '00000000-0000-0000-0000-000000000002';

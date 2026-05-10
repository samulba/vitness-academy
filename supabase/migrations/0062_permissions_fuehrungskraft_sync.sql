-- =========================================================
-- 0062_permissions_fuehrungskraft_sync.sql
--
-- Vorbereitung für den Wechsel von requireRole() auf
-- requirePermission() in Pages und Actions: die System-Rolle
-- Fuehrungskraft hatte bisher implizit (via requireRole) Zugriff
-- auf Standorte (Lesen + Bearbeiten) und das Audit-Log (Lesen).
-- In Migration 0025 wurden diese Permissions aber nie geseedet.
--
-- Damit nach der Code-Migration kein Fuehrungskraft-User regrediert,
-- ergaenzen wir die fehlenden Defaults hier.
--
-- Standorte: Studioleiter koennen ihren Standort verwalten
--   -> view + create + edit  (kein delete, das bleibt admin-only)
-- Audit-Log: Studioleiter koennen Änderungen ihres Bereichs einsehen
--   -> view  (Audit-Log ist sowieso nur lesbar; create/edit/delete
--             werden vom System über den audit_event-Trigger
--             vergeben und sind nicht UI-relevant)
-- Benutzer: Studioleiter koennen Notizen anlegen + Checklist toggeln
--   -> edit hinzu  (view war schon da; ohne edit bleibt das
--                   Mitarbeiterprofil read-only für Fuehrungskraefte,
--                   was Notizen + Onboarding-Haken blockiert)
-- =========================================================

do $$
declare
  fuehrung_id uuid := '00000000-0000-0000-0000-000000000002';
  aktion text;
begin
  -- Standorte: view + create + edit
  foreach aktion in array array['view','create','edit'] loop
    insert into public.role_permissions (role_id, modul, aktion)
      values (fuehrung_id, 'standorte', aktion)
      on conflict do nothing;
  end loop;

  -- Audit-Log: view
  insert into public.role_permissions (role_id, modul, aktion)
    values (fuehrung_id, 'audit', 'view')
    on conflict do nothing;

  -- Benutzer: edit (Notizen, Checklist-Toggle, Onboarding-Templates zuweisen)
  insert into public.role_permissions (role_id, modul, aktion)
    values (fuehrung_id, 'benutzer', 'edit')
    on conflict do nothing;
end $$;

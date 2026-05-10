-- =========================================================
-- 0061_permissions_extend.sql
--
-- Permissions-Matrix produktiv schalten:
--   1. RLS auf roles/role_permissions aufweichen: admin + superadmin
--      duerfen jetzt schreiben (war vorher nur superadmin).
--   2. 5 neue Module ergaenzen, die in 0025 noch fehlten:
--      putzprotokolle, onboarding-templates, feedback, lohn,
--      provisionen
--   3. Default-Permissions fuer System-Rollen seeden.
--   4. Audit-Trigger auf roles + role_permissions, damit
--      Aenderungen im audit_log auftauchen.
--
-- Module-Liste vollstaendig (20):
--   lernpfade, quizze, praxisaufgaben, praxisfreigaben, wissen,
--   aufgaben, infos, kontakte, maengel, formulare, benutzer,
--   standorte, rollen, audit, fortschritt,
--   putzprotokolle, onboarding-templates, feedback, lohn, provisionen
-- =========================================================

-- =========================================================
-- 1) RLS-Policies aufweichen: admin + superadmin
-- =========================================================
drop policy if exists "roles_superadmin_write" on public.roles;
drop policy if exists "roles_admin_write" on public.roles;
create policy "roles_admin_write"
  on public.roles for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

drop policy if exists "role_permissions_superadmin_write" on public.role_permissions;
drop policy if exists "role_permissions_admin_write" on public.role_permissions;
create policy "role_permissions_admin_write"
  on public.role_permissions for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

-- =========================================================
-- 2) Default-Permissions fuer die 5 neuen Module seeden
--    sowie alle weiterhin gueltigen
-- =========================================================
do $$
declare
  superadmin_id uuid := '00000000-0000-0000-0000-000000000004';
  admin_id      uuid := '00000000-0000-0000-0000-000000000003';
  fuehrung_id   uuid := '00000000-0000-0000-0000-000000000002';
  modul text;
  aktion text;
  neue_module text[] := array[
    'putzprotokolle','onboarding-templates','feedback','lohn','provisionen'
  ];
  -- Module die fuehrungskraft mit view+create+edit hat
  fuehrung_inbox_module text[] := array[
    'putzprotokolle','onboarding-templates','feedback'
  ];
begin
  -- Superadmin: alle 5 neuen Module x alle 4 Aktionen
  foreach modul in array neue_module loop
    foreach aktion in array array['view','create','edit','delete'] loop
      insert into public.role_permissions (role_id, modul, aktion)
        values (superadmin_id, modul, aktion)
        on conflict do nothing;
    end loop;
  end loop;

  -- Admin: alle 5 neuen Module x alle 4 Aktionen
  -- (audit/rollen-Restriktionen aus 0025 betreffen die neuen Module nicht)
  foreach modul in array neue_module loop
    foreach aktion in array array['view','create','edit','delete'] loop
      insert into public.role_permissions (role_id, modul, aktion)
        values (admin_id, modul, aktion)
        on conflict do nothing;
    end loop;
  end loop;

  -- Fuehrungskraft: putzprotokolle, onboarding-templates, feedback
  -- mit view+create+edit (kein delete -- destruktive Aktionen bleiben
  -- bei Admin). Lohn + Provisionen NICHT (sensitiv, admin-only).
  foreach modul in array fuehrung_inbox_module loop
    foreach aktion in array array['view','create','edit'] loop
      insert into public.role_permissions (role_id, modul, aktion)
        values (fuehrung_id, modul, aktion)
        on conflict do nothing;
    end loop;
  end loop;

  -- Mitarbeiter: keine Permissions auf neue Module
  -- (Mitarbeiter-Bereich ist nicht permission-gated; eingeloggt
  -- reicht. Permissions wirken nur fuer /admin/*-Sichtbarkeit.)
  null;
end $$;

-- =========================================================
-- 3) Audit-Trigger auf roles + role_permissions
--    (war in 0020 noch nicht da, weil Tabellen erst in 0025
--    angelegt wurden)
-- =========================================================
drop trigger if exists audit_trg on public.roles;
create trigger audit_trg
  after insert or update or delete on public.roles
  for each row execute function public.audit_event();

drop trigger if exists audit_trg on public.role_permissions;
create trigger audit_trg
  after insert or update or delete on public.role_permissions
  for each row execute function public.audit_event();

-- =========================================================
-- 0025_permissions_matrix.sql
-- Permissions-Matrix für custom Rollen.
--
-- Architektur:
--   - public.roles enthält sowohl System-Rollen (is_system=true,
--     dauerhaft, koennen nicht gelöscht werden) als auch
--     selbst gepflegte Custom-Rollen.
--   - public.role_permissions: composite (role_id, modul, aktion).
--     Anwesenheit eines Eintrags = Recht erteilt.
--   - profiles.custom_role_id (nullable) zeigt auf eine Custom-Rolle.
--     Wenn gesetzt, ersetzen deren Permissions die der Basis-Rolle.
--     profiles.role bleibt Pflicht und definiert den Basis-Level
--     (mitarbeiter/fuehrungskraft/admin/superadmin) -- damit
--     bestehende RLS-Policies (is_admin() etc.) weiter funktionieren.
--
-- Das Permission-Set einer Rolle wird im App-Code geprüft;
-- RLS bleibt vorerst auf der bestehenden enum-Logik. Custom Rollen
-- mit Basis-Level "admin" erben dadurch automatisch alle DB-Rechte
-- ihrer Basis-Rolle.
-- =========================================================

create table public.roles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  beschreibung  text,
  base_level    text not null default 'mitarbeiter'
                  check (base_level in ('mitarbeiter','fuehrungskraft','admin','superadmin')),
  is_system     boolean not null default false,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index roles_name_active_idx
  on public.roles (lower(name))
  where archived_at is null;

create table public.role_permissions (
  role_id  uuid not null references public.roles(id) on delete cascade,
  modul    text not null,
  aktion   text not null,
  primary key (role_id, modul, aktion)
);

-- updated_at trigger
create trigger roles_set_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

-- profiles bekommt optionalen Verweis auf custom_role_id
alter table public.profiles
  add column if not exists custom_role_id uuid
    references public.roles(id) on delete set null;

create index if not exists profiles_custom_role_idx
  on public.profiles (custom_role_id);

-- =========================================================
-- 4 System-Rollen seeden mit deterministischen UUIDs
-- (damit App-Code referenzieren kann)
-- =========================================================
insert into public.roles (id, name, beschreibung, base_level, is_system) values
  ('00000000-0000-0000-0000-000000000001', 'Mitarbeiter', 'Standardrolle für Mitarbeiter im Studio.', 'mitarbeiter', true),
  ('00000000-0000-0000-0000-000000000002', 'Führungskraft', 'Studioleitung mit Zugriff auf Inbox-Bereiche.', 'fuehrungskraft', true),
  ('00000000-0000-0000-0000-000000000003', 'Admin', 'Voller Verwaltungs-Zugriff auf alle Inhalte.', 'admin', true),
  ('00000000-0000-0000-0000-000000000004', 'Superadmin', 'Wie Admin plus Rollen-Verwaltung.', 'superadmin', true)
on conflict (id) do nothing;

-- =========================================================
-- Default-Permissions pro System-Rolle seeden
-- Module: lernpfade, quizze, praxisaufgaben, praxisfreigaben,
--         wissen, aufgaben, infos, kontakte, maengel, formulare,
--         benutzer, standorte, rollen, audit, fortschritt
-- Aktionen: view, create, edit, delete
-- =========================================================

-- Helper: alle 4 Aktionen für ein Modul + Rolle anlegen
do $$
declare
  superadmin_id uuid := '00000000-0000-0000-0000-000000000004';
  admin_id      uuid := '00000000-0000-0000-0000-000000000003';
  fuehrung_id   uuid := '00000000-0000-0000-0000-000000000002';
  mitarbeiter_id uuid := '00000000-0000-0000-0000-000000000001';
  modul text;
  aktion text;
  alle_module text[] := array[
    'lernpfade','quizze','praxisaufgaben','praxisfreigaben',
    'wissen','aufgaben','infos','kontakte','maengel','formulare',
    'benutzer','standorte','rollen','audit','fortschritt'
  ];
  fuehrung_module text[] := array[
    'praxisfreigaben','aufgaben','infos','kontakte','maengel',
    'formulare','fortschritt'
  ];
begin
  -- Superadmin: alles
  foreach modul in array alle_module loop
    foreach aktion in array array['view','create','edit','delete'] loop
      insert into public.role_permissions (role_id, modul, aktion)
        values (superadmin_id, modul, aktion)
        on conflict do nothing;
    end loop;
  end loop;

  -- Admin: alles ausser rollen-delete und audit-delete
  foreach modul in array alle_module loop
    foreach aktion in array array['view','create','edit','delete'] loop
      if modul = 'rollen' and aktion = 'delete' then
        continue;
      end if;
      if modul = 'audit' and aktion in ('create','edit','delete') then
        continue;
      end if;
      insert into public.role_permissions (role_id, modul, aktion)
        values (admin_id, modul, aktion)
        on conflict do nothing;
    end loop;
  end loop;

  -- Fuehrungskraft: view+create+edit auf Inbox-Module + view auf Lernen
  foreach modul in array fuehrung_module loop
    foreach aktion in array array['view','create','edit'] loop
      insert into public.role_permissions (role_id, modul, aktion)
        values (fuehrung_id, modul, aktion)
        on conflict do nothing;
    end loop;
  end loop;
  -- Fuehrungskraft sieht zusaetzlich Inhalte (read-only)
  foreach modul in array array['lernpfade','quizze','praxisaufgaben','wissen','benutzer'] loop
    insert into public.role_permissions (role_id, modul, aktion)
      values (fuehrung_id, modul, 'view')
      on conflict do nothing;
  end loop;

  -- Mitarbeiter: keine Verwaltungs-Permissions
  -- (Lernen + Studio-Module werden über RLS gesteuert,
  --  diese Matrix steuert nur den Admin-Bereich)
  null;
end $$;

-- =========================================================
-- SQL-Helper: hat_permission(uid, modul, aktion)
-- Loest custom_role_id auf wenn vorhanden, sonst Mapping über
-- profiles.role -> System-Rollen-UUID.
-- =========================================================
create or replace function public.hat_permission(
  p_user_id uuid,
  p_modul text,
  p_aktion text
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with prof as (
    select role, custom_role_id from public.profiles where id = p_user_id
  ),
  rolle as (
    select coalesce(
      (select custom_role_id from prof),
      case (select role from prof)
        when 'mitarbeiter'    then '00000000-0000-0000-0000-000000000001'::uuid
        when 'fuehrungskraft' then '00000000-0000-0000-0000-000000000002'::uuid
        when 'admin'          then '00000000-0000-0000-0000-000000000003'::uuid
        when 'superadmin'     then '00000000-0000-0000-0000-000000000004'::uuid
      end
    ) as id
  )
  select exists (
    select 1 from public.role_permissions rp, rolle
    where rp.role_id = rolle.id
      and rp.modul = p_modul
      and rp.aktion = p_aktion
  );
$$;

-- =========================================================
-- RLS für roles + role_permissions
-- =========================================================
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;

-- Alle authentifizierten lesen (UI braucht Liste für Dropdowns)
drop policy if exists "roles_authenticated_read" on public.roles;
create policy "roles_authenticated_read"
  on public.roles for select
  to authenticated
  using (true);

drop policy if exists "role_permissions_authenticated_read" on public.role_permissions;
create policy "role_permissions_authenticated_read"
  on public.role_permissions for select
  to authenticated
  using (true);

-- Schreiben nur Superadmin
drop policy if exists "roles_superadmin_write" on public.roles;
create policy "roles_superadmin_write"
  on public.roles for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

drop policy if exists "role_permissions_superadmin_write" on public.role_permissions;
create policy "role_permissions_superadmin_write"
  on public.role_permissions for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

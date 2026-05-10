-- =========================================================
-- 0066_profile_roles_junction.sql
--
-- Multi-Custom-Rollen pro Mitarbeiter.
--
-- Bisher: profiles.custom_role_id (FK, single).
-- Neu:    profile_roles(profile_id, role_id) -- M:N-Junction.
--
-- Use-Case: ein Mitarbeiter ist gleichzeitig "Trainer" UND
-- "Vertrieb" -> sieht beide Tab-Sets. Permissions sind additiv
-- (UNION) im App-Layer-Loader.
--
-- Regel (UI-seitig durchgesetzt, nicht DB):
--   - max. 1 Verwaltungs-Custom-Rolle (base_level != 'mitarbeiter')
--   - beliebig viele Mitarbeiter-Custom-Rollen (base_level = 'mitarbeiter')
--
-- profiles.custom_role_id bleibt als Spalte zunächst erhalten
-- (Legacy-Reads tolerieren). Loader liest aber ausschliesslich
-- aus profile_roles. Wird in späterer Migration entfernt.
-- =========================================================

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id    uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);

create index if not exists profile_roles_profile_idx
  on public.profile_roles (profile_id);
create index if not exists profile_roles_role_idx
  on public.profile_roles (role_id);

-- =========================================================
-- RLS: Lesen für authentifizierte (UI braucht Listen),
-- Schreiben nur Admin/Superadmin (analog roles_admin_write).
-- =========================================================
alter table public.profile_roles enable row level security;

drop policy if exists "profile_roles_authenticated_read" on public.profile_roles;
create policy "profile_roles_authenticated_read"
  on public.profile_roles for select
  to authenticated
  using (true);

drop policy if exists "profile_roles_admin_write" on public.profile_roles;
create policy "profile_roles_admin_write"
  on public.profile_roles for all
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

-- Audit-Trigger (composite-PK -- audit_event() aus 0063 verträgt das)
drop trigger if exists audit_trg on public.profile_roles;
create trigger audit_trg
  after insert or update or delete on public.profile_roles
  for each row execute function public.audit_event();

-- =========================================================
-- Daten-Migration: bestehende profiles.custom_role_id übernehmen
-- =========================================================
insert into public.profile_roles (profile_id, role_id)
select id, custom_role_id
from public.profiles
where custom_role_id is not null
on conflict do nothing;

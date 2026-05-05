-- =============================================================
-- 0037_contact_roles.sql
-- Admin-gepflegter Rollen-Katalog fuer studio_contacts.role_tags.
-- Statt freiem Text-Feld waehlt der Admin aus dieser Liste.
-- =============================================================

create table if not exists public.studio_contact_roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists studio_contact_roles_sort_idx
  on public.studio_contact_roles (sort_order, name);

-- Standard-Rollen seeden
insert into public.studio_contact_roles (name, sort_order) values
  ('Vertrieb', 10),
  ('Trainer', 20),
  ('Service', 30),
  ('Reha', 40),
  ('Reinigung', 50),
  ('Lieferant', 60),
  ('Sonstiges', 100)
on conflict (name) do nothing;

-- Existierende role_tags aus studio_contacts in den Katalog uebernehmen
insert into public.studio_contact_roles (name, sort_order)
select distinct unnest(role_tags), 50
  from public.studio_contacts
 where role_tags is not null
   and array_length(role_tags, 1) > 0
on conflict (name) do nothing;

alter table public.studio_contact_roles enable row level security;

drop policy if exists "contact_roles_select_authed" on public.studio_contact_roles;
create policy "contact_roles_select_authed"
  on public.studio_contact_roles for select
  to authenticated
  using (true);

drop policy if exists "contact_roles_admin_write" on public.studio_contact_roles;
create policy "contact_roles_admin_write"
  on public.studio_contact_roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

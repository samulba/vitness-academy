-- =============================================================
-- 0013_kontakte.sql
-- Studio-Kontaktliste (Mitarbeiter, externe Trainer, Lieferanten).
-- Mitarbeiter sehen die Liste, Studioleitung pflegt sie.
-- =============================================================

create table if not exists public.studio_contacts (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations(id) on delete set null,
  first_name  text,
  last_name   text,
  role_tags   text[] not null default '{}',
  phone       text,
  email       text,
  notes       text,
  sort_order  integer not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists studio_contacts_sort_idx
  on public.studio_contacts (sort_order, last_name);

create index if not exists studio_contacts_role_tags_idx
  on public.studio_contacts using gin (role_tags);

drop trigger if exists set_updated_at_studio_contacts on public.studio_contacts;
create trigger set_updated_at_studio_contacts
  before update on public.studio_contacts
  for each row execute function public.set_updated_at();

alter table public.studio_contacts enable row level security;

-- alle authentifizierten User koennen Kontakte sehen
drop policy if exists "contacts_select_authed" on public.studio_contacts;
create policy "contacts_select_authed"
  on public.studio_contacts for select
  to authenticated
  using (true);

-- nur Admins/Superadmins schreiben
drop policy if exists "contacts_admin_write" on public.studio_contacts;
create policy "contacts_admin_write"
  on public.studio_contacts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

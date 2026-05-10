-- =============================================================
-- 0028_user_locations.sql
-- Multi-Studio-Mitgliedschaft. Bisher hatte jeder Mitarbeiter EINEN
-- Standort (profiles.location_id). Jetzt: jeder kann Member von
-- mehreren Studios sein, mit einem als "primary" markiert.
--
-- Phase 1 (diese Migration): rein additiv. Tabelle anlegen, alle
-- bestehenden profile.location_id-Werte einmalig in user_locations
-- spiegeln. profiles.location_id BLEIBT erhalten als "home/primary"
-- für Backwards-Compat -- wird in späteren Phasen abgelöst oder
-- mit Trigger gespiegelt.
-- =============================================================

create table if not exists public.user_locations (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  location_id  uuid not null references public.locations(id) on delete cascade,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  primary key (user_id, location_id)
);

create index if not exists user_locations_location_idx
  on public.user_locations (location_id);

create index if not exists user_locations_primary_idx
  on public.user_locations (user_id)
  where is_primary;

-- Initial-Backfill: jeder Profile mit gesetzter location_id bekommt
-- einen Eintrag mit is_primary=true. ON CONFLICT DO NOTHING schuetzt
-- bei Re-Run.
insert into public.user_locations (user_id, location_id, is_primary)
select id, location_id, true
from public.profiles
where location_id is not null
on conflict (user_id, location_id) do nothing;

-- =============================================================
-- RLS
-- =============================================================
alter table public.user_locations enable row level security;

-- User sieht eigene Memberships
drop policy if exists "user_locations_select_own" on public.user_locations;
create policy "user_locations_select_own"
  on public.user_locations for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Schreiben nur Admin/Superadmin
drop policy if exists "user_locations_admin_write" on public.user_locations;
create policy "user_locations_admin_write"
  on public.user_locations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- Trigger: profiles.location_id <-> user_locations is_primary
-- synchron halten. Wenn Admin am Mitarbeiter-Detail die Heim-Location
-- ändert (alte UI), wird der primary-Eintrag aktualisiert. Erst
-- wenn die neue UI live ist, wird der Trigger evtl. abgeschaltet.
-- =============================================================
create or replace function public.sync_primary_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.location_id is null then
    update public.user_locations
       set is_primary = false
     where user_id = new.id;
    return new;
  end if;

  -- Existierende Membership zur neuen Location als primary markieren,
  -- alle anderen als nicht-primary. Falls es noch keine Membership
  -- gibt, eine anlegen.
  insert into public.user_locations (user_id, location_id, is_primary)
    values (new.id, new.location_id, true)
    on conflict (user_id, location_id) do update
      set is_primary = true;

  update public.user_locations
     set is_primary = false
   where user_id = new.id
     and location_id <> new.location_id;

  return new;
end;
$$;

drop trigger if exists profiles_sync_primary_location on public.profiles;
create trigger profiles_sync_primary_location
  after insert or update of location_id on public.profiles
  for each row execute function public.sync_primary_location();

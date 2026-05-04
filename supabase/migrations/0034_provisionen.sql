-- =============================================================
-- 0034_provisionen.sql
-- Provisions-Modul fuer Vertriebler. Loest die Excel-Provisionsliste
-- ab.
--
-- Schema:
--   - profiles.kann_provisionen: Flag, ob User die Vertriebs-Section
--     in der Sidebar sehen + Eintraege anlegen darf.
--   - commission_rates: versionierte Provisions-Saetze pro Laufzeit.
--     Beim Lesen wird der Satz gewaehlt mit valid_from <= entry.datum
--     (max). So bleiben alte Eintraege unberuehrt wenn Admin neue
--     Saetze anlegt.
--   - commission_entries: 1 Zeile pro Abschluss. Provision wird im
--     App-Layer aus rate × beitrag_netto + startpaket × startpaket-
--     bonus berechnet (nicht persistiert).
-- =============================================================

-- 1) Flag auf profiles
alter table public.profiles
  add column if not exists kann_provisionen boolean not null default false;

-- 2) Saetze-Tabelle
create table if not exists public.commission_rates (
  id                    uuid primary key default gen_random_uuid(),
  laufzeit              text not null
                          check (laufzeit in ('26','52','104','sonst')),
  prozent_beitrag       numeric(5,2) not null default 0,
  prozent_startpaket    numeric(5,2) not null default 0,
  valid_from            date not null default current_date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists commission_rates_lookup_idx
  on public.commission_rates (laufzeit, valid_from desc);

drop trigger if exists set_updated_at_commission_rates on public.commission_rates;
create trigger set_updated_at_commission_rates
  before update on public.commission_rates
  for each row execute function public.set_updated_at();

-- Default-Saetze aus Excel seeden (idempotent)
insert into public.commission_rates (laufzeit, prozent_beitrag, prozent_startpaket, valid_from)
select * from (values
  ('26'::text,   20.00, 0.00,    '2024-01-01'::date),
  ('52'::text,   30.00, 0.00,    '2024-01-01'::date),
  ('104'::text,  50.00, 8.10,    '2024-01-01'::date),
  ('sonst'::text,10.00, 0.00,    '2024-01-01'::date)
) as v(laufzeit, prozent_beitrag, prozent_startpaket, valid_from)
where not exists (
  select 1 from public.commission_rates cr
  where cr.laufzeit = v.laufzeit and cr.valid_from = v.valid_from
);

-- 3) Eintraege-Tabelle
create table if not exists public.commission_entries (
  id                uuid primary key default gen_random_uuid(),
  vertriebler_id    uuid not null references public.profiles(id) on delete cascade,
  location_id       uuid references public.locations(id) on delete set null,
  datum             date not null,
  mitglied_name     text not null,
  mitglied_nummer   text,
  laufzeit          text not null
                      check (laufzeit in ('26','52','104','sonst')),
  beitrag_14taegig  numeric(8,2) not null default 0,
  beitrag_netto     numeric(8,2) not null default 0,
  startpaket        numeric(8,2) not null default 0,
  getraenke_soli    numeric(8,2) not null default 0,
  bemerkung         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists commission_entries_vertriebler_datum_idx
  on public.commission_entries (vertriebler_id, datum desc);

create index if not exists commission_entries_datum_idx
  on public.commission_entries (datum desc);

drop trigger if exists set_updated_at_commission_entries on public.commission_entries;
create trigger set_updated_at_commission_entries
  before update on public.commission_entries
  for each row execute function public.set_updated_at();

-- =============================================================
-- RLS
-- =============================================================
alter table public.commission_rates enable row level security;
alter table public.commission_entries enable row level security;

-- commission_rates: alle authentifizierten lesen (App-Layer braucht
-- die Saetze fuer die Berechnung), nur Admin schreibt.
drop policy if exists "rates_select" on public.commission_rates;
create policy "rates_select"
  on public.commission_rates for select
  to authenticated
  using (true);

drop policy if exists "rates_admin_write" on public.commission_rates;
create policy "rates_admin_write"
  on public.commission_rates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- commission_entries:
--   - Vertriebler liest + schreibt eigene Eintraege (auth.uid() = vertriebler_id)
--     UND profile.kann_provisionen = true
--   - Admin liest + schreibt alle
drop policy if exists "entries_select_own_or_admin" on public.commission_entries;
create policy "entries_select_own_or_admin"
  on public.commission_entries for select
  to authenticated
  using (vertriebler_id = auth.uid() or public.is_admin());

drop policy if exists "entries_insert_own_provi" on public.commission_entries;
create policy "entries_insert_own_provi"
  on public.commission_entries for insert
  to authenticated
  with check (
    vertriebler_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kann_provisionen = true
    )
  );

drop policy if exists "entries_update_own_or_admin" on public.commission_entries;
create policy "entries_update_own_or_admin"
  on public.commission_entries for update
  to authenticated
  using (vertriebler_id = auth.uid() or public.is_admin())
  with check (vertriebler_id = auth.uid() or public.is_admin());

drop policy if exists "entries_delete_own_or_admin" on public.commission_entries;
create policy "entries_delete_own_or_admin"
  on public.commission_entries for delete
  to authenticated
  using (vertriebler_id = auth.uid() or public.is_admin());

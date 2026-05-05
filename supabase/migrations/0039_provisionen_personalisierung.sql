-- =============================================================
-- 0039_provisionen_personalisierung.sql
--
-- Pro-Vertriebler-Override + Bonus-Stufen.
--
--   * commission_rates_personal: persönliche Sätze pro Vertriebler.
--     Wenn ein passender persönlicher Satz existiert, gewinnt er gegen-
--     über dem Default. Ansonsten gilt commission_rates wie bisher.
--
--   * commission_bonus_stufen: ab N Abschlüssen pro Monat zahlt der
--     Vertriebler X% extra auf seine Monats-Provision. vertriebler_id
--     NULL = Default für alle Vertriebler.
-- =============================================================

create table if not exists public.commission_rates_personal (
  id                  uuid primary key default gen_random_uuid(),
  vertriebler_id      uuid not null references public.profiles(id) on delete cascade,
  laufzeit            text not null check (laufzeit in ('26','52','104','sonst')),
  prozent_beitrag     numeric(5,2) not null,
  prozent_startpaket  numeric(5,2) not null default 0,
  valid_from          date not null default current_date,
  notiz               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists commission_rates_personal_lookup_idx
  on public.commission_rates_personal (vertriebler_id, laufzeit, valid_from desc);

drop trigger if exists set_updated_at_commission_rates_personal
  on public.commission_rates_personal;
create trigger set_updated_at_commission_rates_personal
  before update on public.commission_rates_personal
  for each row execute function public.set_updated_at();

create table if not exists public.commission_bonus_stufen (
  id                  uuid primary key default gen_random_uuid(),
  vertriebler_id      uuid references public.profiles(id) on delete cascade,
  -- vertriebler_id NULL = Default für ALLE Vertriebler
  ab_abschluessen     integer not null check (ab_abschluessen > 0),
  bonus_prozent       numeric(5,2) not null check (bonus_prozent >= 0),
  valid_from          date not null default current_date,
  notiz               text,
  created_at          timestamptz not null default now()
);

create index if not exists commission_bonus_stufen_lookup_idx
  on public.commission_bonus_stufen (vertriebler_id, valid_from desc);

-- =============================================================
-- RLS
-- =============================================================
alter table public.commission_rates_personal enable row level security;
alter table public.commission_bonus_stufen enable row level security;

-- Vertriebler liest eigene Sätze. Admin liest alle. Sonst: nichts.
drop policy if exists "rates_personal_read_own_or_admin"
  on public.commission_rates_personal;
create policy "rates_personal_read_own_or_admin"
  on public.commission_rates_personal for select
  to authenticated
  using (auth.uid() = vertriebler_id or public.is_admin());

drop policy if exists "rates_personal_admin_write"
  on public.commission_rates_personal;
create policy "rates_personal_admin_write"
  on public.commission_rates_personal for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Bonus-Stufen: alle authentifizierten lesen Default + eigene.
-- Admin schreibt.
drop policy if exists "bonus_stufen_read_own_or_default"
  on public.commission_bonus_stufen;
create policy "bonus_stufen_read_own_or_default"
  on public.commission_bonus_stufen for select
  to authenticated
  using (
    vertriebler_id is null
    or auth.uid() = vertriebler_id
    or public.is_admin()
  );

drop policy if exists "bonus_stufen_admin_write"
  on public.commission_bonus_stufen;
create policy "bonus_stufen_admin_write"
  on public.commission_bonus_stufen for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

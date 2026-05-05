-- =============================================================
-- 0040_provisionen_targets.sql
--
-- Pro-Vertriebler Monats-Ziel (Targets). Optional. Wenn nicht
-- gesetzt, wird kein Target-Tracker angezeigt.
--
-- Beispiel: Lara bekommt für April: 15 Abschlüsse oder 2.500 €
-- Provision als Ziel. Dashboard zeigt Progress-Bar.
-- =============================================================

create table if not exists public.commission_targets (
  id              uuid primary key default gen_random_uuid(),
  vertriebler_id  uuid not null references public.profiles(id) on delete cascade,
  monat_yyyymm    text not null check (monat_yyyymm ~ '^\d{4}-\d{2}$'),
  ziel_abschluesse integer,
  ziel_provision   numeric(10,2),
  notiz           text,
  created_at      timestamptz not null default now(),
  unique (vertriebler_id, monat_yyyymm)
);

create index if not exists commission_targets_lookup_idx
  on public.commission_targets (vertriebler_id, monat_yyyymm);

alter table public.commission_targets enable row level security;

-- Vertriebler liest eigenes Ziel. Admin liest alle. Admin schreibt alle.
drop policy if exists "targets_read_own_or_admin" on public.commission_targets;
create policy "targets_read_own_or_admin"
  on public.commission_targets for select to authenticated
  using (auth.uid() = vertriebler_id or public.is_admin());

drop policy if exists "targets_admin_write" on public.commission_targets;
create policy "targets_admin_write"
  on public.commission_targets for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

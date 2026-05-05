-- =============================================================
-- 0041_provisionen_abrechnung.sql
--
-- Monats-Abrechnung & Auszahlungs-Workflow.
--
--   * commission_payouts: ein Snapshot pro Vertriebler+Monat. Sobald
--     der Monat "gelocked" ist, gelten die hier gespeicherten Werte
--     als verbindlich für die Auszahlung. Editieren der Einträge
--     wird durch einen Trigger blockiert.
--
--   * Trigger guard_locked_provisionen: prüft bei INSERT/UPDATE/DELETE
--     auf commission_entries, ob für den betroffenen Vertriebler im
--     betroffenen Monat ein Payout existiert. Wenn ja → Exception.
--
-- Wichtig: Die Sperre gilt PRO Vertriebler+Monat. Wenn nur einer von
-- mehreren Vertrieblern abgerechnet ist, können andere weiter
-- editieren.
-- =============================================================

create table if not exists public.commission_payouts (
  id              uuid primary key default gen_random_uuid(),
  monat_yyyymm    text not null check (monat_yyyymm ~ '^\d{4}-\d{2}$'),
  vertriebler_id  uuid not null references public.profiles(id) on delete restrict,
  -- Snapshot zum Lock-Zeitpunkt. Provisionen sind ab hier "gefroren".
  abschluesse_anzahl integer not null default 0,
  provision_summe    numeric(10,2) not null default 0,
  bonus_summe        numeric(10,2) not null default 0,
  total              numeric(10,2) not null default 0,
  bonus_stufe_info   text,  -- z.B. "ab 10 Abschlüssen +5%"
  -- Auszahlungs-Status
  status text not null default 'offen'
    check (status in ('offen', 'ausgezahlt', 'geblockt')),
  ausgezahlt_am   date,
  ausgezahlt_via  text,    -- "ueberweisung" / "bar" / "magicline" / freitext
  ausgezahlt_note text,
  -- Wer hat den Monat abgeschlossen
  locked_by    uuid references public.profiles(id) on delete set null,
  locked_at    timestamptz not null default now(),
  unique (monat_yyyymm, vertriebler_id)
);

create index if not exists commission_payouts_lookup_idx
  on public.commission_payouts (monat_yyyymm, status);

create index if not exists commission_payouts_vertriebler_idx
  on public.commission_payouts (vertriebler_id, monat_yyyymm desc);

alter table public.commission_payouts enable row level security;

-- Vertriebler liest eigene Payouts. Admin liest alle. Admin schreibt alle.
drop policy if exists "payouts_read_own_or_admin" on public.commission_payouts;
create policy "payouts_read_own_or_admin"
  on public.commission_payouts for select to authenticated
  using (auth.uid() = vertriebler_id or public.is_admin());

drop policy if exists "payouts_admin_write" on public.commission_payouts;
create policy "payouts_admin_write"
  on public.commission_payouts for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- Lock-Trigger
-- =============================================================
-- security definer, damit Vertriebler den Trigger-Output nicht
-- umgehen können (RLS auf commission_payouts blockiert sie sonst
-- vom Lesen).
create or replace function public.guard_locked_provisionen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  monat_new text;
  monat_old text;
  v_id_new uuid;
  v_id_old uuid;
begin
  -- INSERT: nur new
  -- UPDATE: beide checken (falls datum oder vertriebler_id sich ändert)
  -- DELETE: nur old
  if TG_OP in ('INSERT','UPDATE') then
    monat_new := to_char(new.datum, 'YYYY-MM');
    v_id_new := new.vertriebler_id;
    if exists (
      select 1 from public.commission_payouts p
       where p.monat_yyyymm = monat_new
         and p.vertriebler_id = v_id_new
    ) then
      raise exception 'Monat % für Vertriebler:in % ist bereits abgerechnet -- keine Änderungen mehr möglich.', monat_new, v_id_new
        using errcode = 'P0001';
    end if;
  end if;
  if TG_OP in ('UPDATE','DELETE') then
    monat_old := to_char(old.datum, 'YYYY-MM');
    v_id_old := old.vertriebler_id;
    if exists (
      select 1 from public.commission_payouts p
       where p.monat_yyyymm = monat_old
         and p.vertriebler_id = v_id_old
    ) then
      raise exception 'Monat % für Vertriebler:in % ist bereits abgerechnet -- keine Änderungen mehr möglich.', monat_old, v_id_old
        using errcode = 'P0001';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists guard_locked_provisionen_trg on public.commission_entries;
create trigger guard_locked_provisionen_trg
  before insert or update or delete on public.commission_entries
  for each row execute function public.guard_locked_provisionen();

-- =============================================================
-- 0057_schichten_lohn.sql
-- Mitarbeiter-Schichtplan-Tracker + monatliche Lohnabrechnungen.
--
-- Ziel: Mitarbeiter:innen tragen ihre eigenen Schichten ein
-- (Datum, Von/Bis, Pause, Notiz) und sehen pro Monat die Summe.
-- Verwaltung laedt für jeden Mitarbeiter pro Monat eine PDF-Lohn-
-- abrechnung hoch. Mitarbeiter:innen sehen die eigene Abrechnung
-- direkt in der App und koennen sie mit den eigenen Schicht-Notizen
-- abgleichen.
-- =============================================================

-- 1) shifts: pro Mitarbeiter pro Tag MEHRERE Schichten möglich
--    (z.B. zweigeteilte Schichten Vormittag + Abend)
create table if not exists public.shifts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  location_id     uuid references public.locations(id) on delete set null,
  datum           date not null,
  von_zeit        time not null,
  bis_zeit        time not null,
  pause_minuten   integer not null default 0 check (pause_minuten >= 0),
  notiz           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists shifts_user_datum_idx
  on public.shifts (user_id, datum desc);
create index if not exists shifts_location_datum_idx
  on public.shifts (location_id, datum desc);

-- 2) lohnabrechnungen: pro Mitarbeiter pro Monat EINE Abrechnung
create table if not exists public.lohnabrechnungen (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  -- Format YYYY-MM (Monat der Abrechnung)
  monat           text not null check (monat ~ '^\d{4}-\d{2}$'),
  pdf_path        text not null,
  -- Optional für Quick-Anzeige im UI
  brutto_cents    integer,
  netto_cents     integer,
  hochgeladen_von uuid references public.profiles(id) on delete set null,
  hochgeladen_am  timestamptz not null default now(),
  unique (user_id, monat)
);

create index if not exists lohnabrechnungen_user_monat_idx
  on public.lohnabrechnungen (user_id, monat desc);

-- ----------------------- updated_at-Trigger für shifts -------
create or replace function public.touch_shifts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_shifts_updated_at_trg on public.shifts;
create trigger touch_shifts_updated_at_trg
  before update on public.shifts
  for each row execute function public.touch_shifts_updated_at();

-- ----------------------- RLS shifts ---------------------------
alter table public.shifts enable row level security;

-- Mitarbeiter sieht/schreibt nur eigene Schichten. Admin sieht alle.
drop policy if exists "shifts_select_own_or_admin" on public.shifts;
create policy "shifts_select_own_or_admin"
  on public.shifts for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin() or public.is_staff_or_higher());

drop policy if exists "shifts_insert_own" on public.shifts;
create policy "shifts_insert_own"
  on public.shifts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "shifts_update_own_or_admin" on public.shifts;
create policy "shifts_update_own_or_admin"
  on public.shifts for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "shifts_delete_own_or_admin" on public.shifts;
create policy "shifts_delete_own_or_admin"
  on public.shifts for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- ----------------------- RLS lohnabrechnungen ------------------
alter table public.lohnabrechnungen enable row level security;

-- Mitarbeiter sieht nur eigene Abrechnungen. Admin sieht alle + schreibt.
drop policy if exists "lohn_select_own_or_admin" on public.lohnabrechnungen;
create policy "lohn_select_own_or_admin"
  on public.lohnabrechnungen for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin() or public.is_staff_or_higher());

drop policy if exists "lohn_admin_write" on public.lohnabrechnungen;
create policy "lohn_admin_write"
  on public.lohnabrechnungen for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------- Storage-Bucket ------------------------
insert into storage.buckets (id, name, public)
  values ('lohnabrechnungen', 'lohnabrechnungen', false)
  on conflict (id) do nothing;

-- Bucket ist NICHT public — Zugriff via Signed-URL aus Server-Action
-- Mitarbeiter darf eigene lesen (Pfad-Konvention beginnt mit user_id),
-- Admin darf alles.
drop policy if exists "lohn_pdf_select_own_or_admin" on storage.objects;
create policy "lohn_pdf_select_own_or_admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'lohnabrechnungen'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "lohn_pdf_admin_write" on storage.objects;
create policy "lohn_pdf_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'lohnabrechnungen' and public.is_admin());

drop policy if exists "lohn_pdf_admin_update" on storage.objects;
create policy "lohn_pdf_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lohnabrechnungen' and public.is_admin())
  with check (bucket_id = 'lohnabrechnungen' and public.is_admin());

drop policy if exists "lohn_pdf_admin_delete" on storage.objects;
create policy "lohn_pdf_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lohnabrechnungen' and public.is_admin());

-- ----------------------- Notifications -------------------------
-- Type-Enum erweitern um "lohnabrechnung_neu"
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'mangel_status',
    'submission_status',
    'submission_neu',
    'praxis_decision',
    'aufgabe_neu',
    'info_neu',
    'lektion_q_antwort',
    'cleaning_protocol_submitted',
    'lohnabrechnung_neu'
  ));

-- Trigger: bei INSERT auf lohnabrechnungen → Notification an
-- den jeweiligen Mitarbeiter
create or replace function public.notify_lohnabrechnung_neu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_monat_text text;
begin
  -- Monat formatieren von "2026-05" zu "Mai 2026"
  v_monat_text := to_char(to_date(new.monat || '-01', 'YYYY-MM-DD'), 'TMMonth YYYY');
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.user_id,
    'lohnabrechnung_neu',
    'Lohnabrechnung verfügbar',
    'Deine Abrechnung für ' || trim(v_monat_text) || ' ist hochgeladen.',
    '/lohn?monat=' || new.monat
  );
  return new;
end;
$$;

drop trigger if exists notify_lohnabrechnung_neu_trg on public.lohnabrechnungen;
create trigger notify_lohnabrechnung_neu_trg
  after insert on public.lohnabrechnungen
  for each row execute function public.notify_lohnabrechnung_neu();

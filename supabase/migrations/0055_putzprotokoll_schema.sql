-- =============================================================
-- 0055_putzprotokoll_schema.sql
-- Tägliches Reinigungs-Protokoll digital. Pro Standort EIN Template
-- mit beliebig vielen Bereichen (Empfangsbereich, Trainingsbereiche,
-- Umkleide, Sanitär+Sauna, ...). Pro Tag pro Standort wird ein
-- cleaning_protocol angelegt mit den ausgefüllten Tasks/Mängeln/Photos.
-- =============================================================

-- 1) Templates: 1:1 mit locations
create table if not exists public.cleaning_protocol_templates (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid unique not null references public.locations(id) on delete cascade,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) Sections: Bereiche pro Template (Empfang, Training, ...)
create table if not exists public.cleaning_protocol_sections (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.cleaning_protocol_templates(id) on delete cascade,
  titel       text not null,
  aufgaben    jsonb not null default '[]'::jsonb, -- string[]
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists cleaning_sections_template_idx
  on public.cleaning_protocol_sections (template_id, sort_order);

-- 3) Protokolle: pro Standort pro Tag eines
-- sections jsonb-Format pro Eintrag:
--   { section_id: uuid, titel: text, tasks_done: text[], maengel: text, photo_paths: text[] }
create table if not exists public.cleaning_protocols (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references public.locations(id) on delete cascade,
  datum         date not null,
  sections      jsonb not null default '[]'::jsonb,
  general_note  text,
  status        text not null default 'eingereicht'
                  check (status in ('eingereicht','reviewed')),
  submitted_by  uuid references public.profiles(id) on delete set null,
  submitted_at  timestamptz not null default now(),
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz,
  review_note   text,
  unique (location_id, datum)
);

create index if not exists cleaning_protocols_location_datum_idx
  on public.cleaning_protocols (location_id, datum desc);

-- ----------------------- RLS -------------------------------
alter table public.cleaning_protocol_templates enable row level security;
alter table public.cleaning_protocol_sections enable row level security;
alter table public.cleaning_protocols enable row level security;

-- Templates + Sections: alle Authenticated lesen, nur Admins schreiben
drop policy if exists "cleaning_templates_read" on public.cleaning_protocol_templates;
create policy "cleaning_templates_read"
  on public.cleaning_protocol_templates for select
  to authenticated using (true);

drop policy if exists "cleaning_templates_admin_write" on public.cleaning_protocol_templates;
create policy "cleaning_templates_admin_write"
  on public.cleaning_protocol_templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "cleaning_sections_read" on public.cleaning_protocol_sections;
create policy "cleaning_sections_read"
  on public.cleaning_protocol_sections for select
  to authenticated using (true);

drop policy if exists "cleaning_sections_admin_write" on public.cleaning_protocol_sections;
create policy "cleaning_sections_admin_write"
  on public.cleaning_protocol_sections for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Protocols: alle Authenticated im selben Standort lesen, INSERT eigene,
-- UPDATE Author oder Admin, DELETE Admin only.
drop policy if exists "cleaning_protocols_read" on public.cleaning_protocols;
create policy "cleaning_protocols_read"
  on public.cleaning_protocols for select
  to authenticated using (true);

drop policy if exists "cleaning_protocols_insert_own" on public.cleaning_protocols;
create policy "cleaning_protocols_insert_own"
  on public.cleaning_protocols for insert
  to authenticated
  with check (auth.uid() = submitted_by);

drop policy if exists "cleaning_protocols_update_own_or_admin" on public.cleaning_protocols;
create policy "cleaning_protocols_update_own_or_admin"
  on public.cleaning_protocols for update
  to authenticated
  using (auth.uid() = submitted_by or public.is_admin())
  with check (auth.uid() = submitted_by or public.is_admin());

drop policy if exists "cleaning_protocols_delete_admin" on public.cleaning_protocols;
create policy "cleaning_protocols_delete_admin"
  on public.cleaning_protocols for delete
  to authenticated
  using (public.is_admin());

-- ----------------------- Storage-Bucket ----------------------
insert into storage.buckets (id, name, public)
  values ('cleaning-photos', 'cleaning-photos', true)
  on conflict (id) do nothing;

drop policy if exists "cleaning_photos_read" on storage.objects;
create policy "cleaning_photos_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cleaning-photos');

drop policy if exists "cleaning_photos_insert" on storage.objects;
create policy "cleaning_photos_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cleaning-photos');

drop policy if exists "cleaning_photos_admin_delete" on storage.objects;
create policy "cleaning_photos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cleaning-photos' and public.is_admin());

-- ----------------------- Notifications ------------------------
-- Type-Enum erweitern
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
    'cleaning_protocol_submitted'
  ));

-- Trigger: bei INSERT auf cleaning_protocols → Staff im Standort
-- benachrichtigen
create or replace function public.notify_cleaning_protocol_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_location_name text;
  v_submitter_name text;
  v_admin_id uuid;
begin
  select name into v_location_name
    from public.locations
    where id = new.location_id;

  select full_name into v_submitter_name
    from public.profiles
    where id = new.submitted_by;

  for v_admin_id in
    select id from public.profiles
    where role in ('fuehrungskraft', 'admin', 'superadmin')
      and id <> coalesce(new.submitted_by, '00000000-0000-0000-0000-000000000000'::uuid)
      and archived_at is null
      and (location_id is null or location_id = new.location_id)
  loop
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_admin_id,
      'cleaning_protocol_submitted',
      'Putzprotokoll: ' || coalesce(v_location_name, 'Studio'),
      coalesce(v_submitter_name, 'Mitarbeiter:in') || ' hat das Putzprotokoll für '
        || to_char(new.datum, 'DD.MM.YYYY') || ' eingereicht.',
      '/admin/putzprotokolle/' || new.id::text
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists notify_cleaning_protocol_submitted_trg
  on public.cleaning_protocols;
create trigger notify_cleaning_protocol_submitted_trg
  after insert on public.cleaning_protocols
  for each row execute function public.notify_cleaning_protocol_submitted();

-- ----------------------- updated_at-Trigger ------------------
create or replace function public.touch_cleaning_template_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_cleaning_template_updated_at_trg
  on public.cleaning_protocol_templates;
create trigger touch_cleaning_template_updated_at_trg
  before update on public.cleaning_protocol_templates
  for each row execute function public.touch_cleaning_template_updated_at();

-- =============================================================
-- 0014_announcements.sql
-- Studio-Announcements / Wichtige Infos.
-- Studioleitung postet Mitteilungen, alle Mitarbeiter sehen
-- sie auf /infos und in einem Dashboard-Banner falls
-- ungelesen + warning/critical.
-- =============================================================

create table if not exists public.studio_announcements (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations(id) on delete set null,
  title       text not null,
  body        text not null default '',
  importance  text not null default 'info'
              check (importance in ('info', 'warning', 'critical')),
  pinned      boolean not null default false,
  published   boolean not null default true,
  author_id   uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists studio_announcements_published_idx
  on public.studio_announcements (published, pinned desc, created_at desc);

drop trigger if exists set_updated_at_studio_announcements on public.studio_announcements;
create trigger set_updated_at_studio_announcements
  before update on public.studio_announcements
  for each row execute function public.set_updated_at();

alter table public.studio_announcements enable row level security;

drop policy if exists "announcements_select_authed" on public.studio_announcements;
create policy "announcements_select_authed"
  on public.studio_announcements for select
  to authenticated
  using (published = true or public.is_admin());

drop policy if exists "announcements_admin_write" on public.studio_announcements;
create policy "announcements_admin_write"
  on public.studio_announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- Read-Tracking pro User
-- =============================================================
create table if not exists public.user_announcement_reads (
  user_id          uuid not null references public.profiles(id)             on delete cascade,
  announcement_id  uuid not null references public.studio_announcements(id) on delete cascade,
  read_at          timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

alter table public.user_announcement_reads enable row level security;

drop policy if exists "announcement_reads_select_own" on public.user_announcement_reads;
create policy "announcement_reads_select_own"
  on public.user_announcement_reads for select
  using (auth.uid() = user_id);

drop policy if exists "announcement_reads_insert_own" on public.user_announcement_reads;
create policy "announcement_reads_insert_own"
  on public.user_announcement_reads for insert
  with check (auth.uid() = user_id);

drop policy if exists "announcement_reads_delete_own" on public.user_announcement_reads;
create policy "announcement_reads_delete_own"
  on public.user_announcement_reads for delete
  using (auth.uid() = user_id);

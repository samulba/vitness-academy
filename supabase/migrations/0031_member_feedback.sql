-- =============================================================
-- 0031_member_feedback.sql
-- Mitarbeiter erfassen Feedback von Mitgliedern (Lob, Beschwerde,
-- Anregung) -- Stimmungsbild für Studioleitung. Magicline behaelt
-- die Mitglieder selbst, hier sind nur Notes.
-- =============================================================

create table if not exists public.member_feedback (
  id              uuid primary key default gen_random_uuid(),
  location_id     uuid references public.locations(id) on delete set null,
  member_name     text,
  feedback_text   text not null,
  sentiment       text not null default 'neutral'
                    check (sentiment in ('positive','neutral','negative')),
  category        text not null default 'allgemein'
                    check (category in (
                      'allgemein','service','sauberkeit','geraete',
                      'kurse','beitrag','sonstiges'
                    )),
  captured_by     uuid references public.profiles(id) on delete set null,
  captured_at     timestamptz not null default now()
);

create index if not exists member_feedback_captured_at_idx
  on public.member_feedback (captured_at desc);

create index if not exists member_feedback_sentiment_idx
  on public.member_feedback (sentiment);

create index if not exists member_feedback_location_idx
  on public.member_feedback (location_id);

alter table public.member_feedback enable row level security;

-- Alle authentifizierten Mitarbeiter koennen lesen + selbst erfassen.
-- Löschen darf der Eigentuemer (eigenes Eingetragenes) ODER Admin.
drop policy if exists "member_feedback_select" on public.member_feedback;
create policy "member_feedback_select"
  on public.member_feedback for select
  to authenticated
  using (true);

drop policy if exists "member_feedback_insert_own" on public.member_feedback;
create policy "member_feedback_insert_own"
  on public.member_feedback for insert
  to authenticated
  with check (auth.uid() = captured_by);

drop policy if exists "member_feedback_update_own_or_admin"
  on public.member_feedback;
create policy "member_feedback_update_own_or_admin"
  on public.member_feedback for update
  to authenticated
  using (auth.uid() = captured_by or public.is_admin())
  with check (auth.uid() = captured_by or public.is_admin());

drop policy if exists "member_feedback_delete_own_or_admin"
  on public.member_feedback;
create policy "member_feedback_delete_own_or_admin"
  on public.member_feedback for delete
  to authenticated
  using (auth.uid() = captured_by or public.is_admin());

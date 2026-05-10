-- =============================================================
-- 0019_lektion_qa.sql
-- Q&A pro Lektion: Mitarbeiter koennen Fragen stellen, jeder
-- (besonders Studioleitung) kann antworten. Antworten von
-- admin/fuehrungskraft sind als is_official markiert und
-- werden in der UI hervorgehoben.
-- =============================================================

create table if not exists public.lesson_questions (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  asked_by    uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists lesson_questions_lesson_idx
  on public.lesson_questions (lesson_id, created_at desc);
create index if not exists lesson_questions_asked_by_idx
  on public.lesson_questions (asked_by);

drop trigger if exists set_updated_at_lesson_questions on public.lesson_questions;
create trigger set_updated_at_lesson_questions
  before update on public.lesson_questions
  for each row execute function public.set_updated_at();

create table if not exists public.lesson_answers (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.lesson_questions(id) on delete cascade,
  answered_by   uuid not null references public.profiles(id) on delete cascade,
  body          text not null,
  is_official   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists lesson_answers_question_idx
  on public.lesson_answers (question_id, created_at asc);

drop trigger if exists set_updated_at_lesson_answers on public.lesson_answers;
create trigger set_updated_at_lesson_answers
  before update on public.lesson_answers
  for each row execute function public.set_updated_at();

-- ----------------------- RLS lesson_questions -------------------
alter table public.lesson_questions enable row level security;

drop policy if exists "lq_select_authed" on public.lesson_questions;
create policy "lq_select_authed"
  on public.lesson_questions for select
  to authenticated
  using (true);

drop policy if exists "lq_insert_own" on public.lesson_questions;
create policy "lq_insert_own"
  on public.lesson_questions for insert
  to authenticated
  with check (auth.uid() = asked_by);

-- Eigene Fragen darf jeder bearbeiten/löschen, Admin auch alle
drop policy if exists "lq_update_own_or_admin" on public.lesson_questions;
create policy "lq_update_own_or_admin"
  on public.lesson_questions for update
  to authenticated
  using (auth.uid() = asked_by or public.is_staff_or_higher())
  with check (auth.uid() = asked_by or public.is_staff_or_higher());

drop policy if exists "lq_delete_own_or_admin" on public.lesson_questions;
create policy "lq_delete_own_or_admin"
  on public.lesson_questions for delete
  to authenticated
  using (auth.uid() = asked_by or public.is_staff_or_higher());

-- ----------------------- RLS lesson_answers ---------------------
alter table public.lesson_answers enable row level security;

drop policy if exists "la_select_authed" on public.lesson_answers;
create policy "la_select_authed"
  on public.lesson_answers for select
  to authenticated
  using (true);

drop policy if exists "la_insert_own" on public.lesson_answers;
create policy "la_insert_own"
  on public.lesson_answers for insert
  to authenticated
  with check (auth.uid() = answered_by);

drop policy if exists "la_update_own_or_admin" on public.lesson_answers;
create policy "la_update_own_or_admin"
  on public.lesson_answers for update
  to authenticated
  using (auth.uid() = answered_by or public.is_staff_or_higher())
  with check (auth.uid() = answered_by or public.is_staff_or_higher());

drop policy if exists "la_delete_own_or_admin" on public.lesson_answers;
create policy "la_delete_own_or_admin"
  on public.lesson_answers for delete
  to authenticated
  using (auth.uid() = answered_by or public.is_staff_or_higher());

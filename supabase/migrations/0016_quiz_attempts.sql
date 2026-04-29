-- =============================================================
-- 0016_quiz_attempts.sql
-- Persistente Inline-Quiz-Versuche.
-- Ein Lektion-Abschluss ist erst möglich, wenn alle inline_quiz-
-- Blöcke der Lektion korrekt beantwortet wurden.
-- =============================================================

create table if not exists public.user_inline_quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id)              on delete cascade,
  lesson_id   uuid not null references public.lessons(id)               on delete cascade,
  block_id    uuid not null references public.lesson_content_blocks(id) on delete cascade,
  passed_at   timestamptz not null default now(),
  unique (user_id, block_id)
);

create index if not exists user_inline_quiz_attempts_user_lesson_idx
  on public.user_inline_quiz_attempts (user_id, lesson_id);

alter table public.user_inline_quiz_attempts enable row level security;

drop policy if exists "iqa_select_own" on public.user_inline_quiz_attempts;
create policy "iqa_select_own"
  on public.user_inline_quiz_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "iqa_insert_own" on public.user_inline_quiz_attempts;
create policy "iqa_insert_own"
  on public.user_inline_quiz_attempts for insert
  with check (auth.uid() = user_id);

-- Admins koennen Versuche aller User sehen (fuer Fortschritts-UI)
drop policy if exists "iqa_admin_select_all" on public.user_inline_quiz_attempts;
create policy "iqa_admin_select_all"
  on public.user_inline_quiz_attempts for select
  using (public.is_admin());

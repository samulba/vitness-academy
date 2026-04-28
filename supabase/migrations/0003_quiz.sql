-- Vitness Akademie -- Migration 0003: Quiz-System
-- Tabellen: quizzes, quiz_questions, quiz_options, quiz_attempts, quiz_attempt_answers
-- Ein Quiz haengt entweder an einer Lektion ODER an einem Modul (genau eines).

create table public.quizzes (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  passing_score   int  not null default 80
                  check (passing_score between 0 and 100),
  lesson_id       uuid references public.lessons(id) on delete cascade,
  module_id       uuid references public.modules(id) on delete cascade,
  status          text not null default 'aktiv'
                  check (status in ('entwurf','aktiv','archiviert')),
  sort_order      int  not null default 0,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Genau eine Bindung muss gesetzt sein
  check (
    (lesson_id is not null and module_id is null) or
    (lesson_id is null and module_id is not null)
  )
);
create index quizzes_lesson_idx on public.quizzes(lesson_id);
create index quizzes_module_idx on public.quizzes(module_id);
create index quizzes_status_idx on public.quizzes(status);

create table public.quiz_questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes(id) on delete cascade,
  prompt          text not null,
  question_type   text not null default 'single'
                  check (question_type in ('single','multiple')),
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index quiz_questions_quiz_idx on public.quiz_questions(quiz_id);

create table public.quiz_options (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references public.quiz_questions(id) on delete cascade,
  label           text not null,
  is_correct      boolean not null default false,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now()
);
create index quiz_options_question_idx on public.quiz_options(question_id);

create table public.quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  score           int  not null default 0
                  check (score between 0 and 100),
  passed          boolean not null default false,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz
);
create index quiz_attempts_quiz_idx on public.quiz_attempts(quiz_id);
create index quiz_attempts_user_idx on public.quiz_attempts(user_id);

create table public.quiz_attempt_answers (
  id                   uuid primary key default gen_random_uuid(),
  attempt_id           uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id          uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_ids  uuid[] not null default '{}',
  is_correct           boolean not null default false,
  created_at           timestamptz not null default now()
);
create index quiz_attempt_answers_attempt_idx on public.quiz_attempt_answers(attempt_id);

-- updated_at-Trigger
create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

create trigger quiz_questions_set_updated_at
  before update on public.quiz_questions
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.quizzes              enable row level security;
alter table public.quiz_questions       enable row level security;
alter table public.quiz_options         enable row level security;
alter table public.quiz_attempts        enable row level security;
alter table public.quiz_attempt_answers enable row level security;

-- Quizze + Fragen + Optionen: lesbar fuer Auth, schreibbar nur Admin
create policy "quizzes Auth lesen"
  on public.quizzes for select to authenticated using (true);
create policy "quizzes Admin schreiben"
  on public.quizzes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "quiz_questions Auth lesen"
  on public.quiz_questions for select to authenticated using (true);
create policy "quiz_questions Admin schreiben"
  on public.quiz_questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "quiz_options Auth lesen"
  on public.quiz_options for select to authenticated using (true);
create policy "quiz_options Admin schreiben"
  on public.quiz_options for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Versuche: User sieht/schreibt eigene, Fuehrungskraft+ sieht alle, Admin verwaltet
create policy "quiz_attempts eigene lesen"
  on public.quiz_attempts for select to authenticated
  using (user_id = auth.uid());
create policy "quiz_attempts Fuehrungskraft+ lesen"
  on public.quiz_attempts for select to authenticated
  using (public.is_staff_or_higher());
create policy "quiz_attempts eigene anlegen"
  on public.quiz_attempts for insert to authenticated
  with check (user_id = auth.uid());
create policy "quiz_attempts eigene aktualisieren"
  on public.quiz_attempts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "quiz_attempts Admin verwalten"
  on public.quiz_attempts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Versuchs-Antworten: Sichtbarkeit ueber zugehoerigen Versuch
create policy "quiz_attempt_answers eigene lesen"
  on public.quiz_attempt_answers for select to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts a
       where a.id = quiz_attempt_answers.attempt_id
         and (a.user_id = auth.uid() or public.is_staff_or_higher())
    )
  );
create policy "quiz_attempt_answers eigene anlegen"
  on public.quiz_attempt_answers for insert to authenticated
  with check (
    exists (
      select 1 from public.quiz_attempts a
       where a.id = quiz_attempt_answers.attempt_id
         and a.user_id = auth.uid()
    )
  );
create policy "quiz_attempt_answers Admin"
  on public.quiz_attempt_answers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

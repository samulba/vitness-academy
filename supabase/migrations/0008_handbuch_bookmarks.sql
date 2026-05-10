-- =============================================================
-- 0008_handbuch_bookmarks.sql
-- Persönliche Favoriten (Bookmarks) im Handbuch.
-- Mitarbeiter markieren Artikel mit einem Stern; eigene
-- Favoriten erscheinen oben im Handbuch für Quick-Access.
-- =============================================================

create table if not exists public.user_article_bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id)            on delete cascade,
  article_id  uuid not null references public.knowledge_articles(id)  on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, article_id)
);

create index if not exists user_article_bookmarks_user_idx
  on public.user_article_bookmarks (user_id);

alter table public.user_article_bookmarks enable row level security;

drop policy if exists "bookmarks_select_own" on public.user_article_bookmarks;
create policy "bookmarks_select_own"
  on public.user_article_bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.user_article_bookmarks;
create policy "bookmarks_insert_own"
  on public.user_article_bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.user_article_bookmarks;
create policy "bookmarks_delete_own"
  on public.user_article_bookmarks for delete
  using (auth.uid() = user_id);

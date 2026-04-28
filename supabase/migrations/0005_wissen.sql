-- Vitness Akademie -- Migration 0005: Wissensdatenbank
-- Tabellen: knowledge_categories, knowledge_articles
-- Artikel haben Markdown-Inhalt und sind durchsuchbar.

create table public.knowledge_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.knowledge_articles (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.knowledge_categories(id) on delete set null,
  title        text not null,
  slug         text not null unique,
  summary      text,
  body         text not null default '',           -- Markdown
  status       text not null default 'aktiv'
               check (status in ('entwurf','aktiv','archiviert')),
  sort_order   int  not null default 0,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index knowledge_articles_category_idx on public.knowledge_articles(category_id);
create index knowledge_articles_status_idx   on public.knowledge_articles(status);
create index knowledge_articles_title_idx    on public.knowledge_articles using gin (to_tsvector('simple', title));
create index knowledge_articles_body_idx     on public.knowledge_articles using gin (to_tsvector('simple', body));

-- updated_at-Trigger
create trigger knowledge_categories_set_updated_at
  before update on public.knowledge_categories
  for each row execute function public.set_updated_at();

create trigger knowledge_articles_set_updated_at
  before update on public.knowledge_articles
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.knowledge_categories enable row level security;
alter table public.knowledge_articles   enable row level security;

create policy "knowledge_categories Auth lesen"
  on public.knowledge_categories for select to authenticated using (true);
create policy "knowledge_categories Admin schreiben"
  on public.knowledge_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "knowledge_articles Auth lesen"
  on public.knowledge_articles for select to authenticated using (true);
create policy "knowledge_articles Admin schreiben"
  on public.knowledge_articles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

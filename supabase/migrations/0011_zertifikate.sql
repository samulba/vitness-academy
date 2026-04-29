-- =============================================================
-- 0011_zertifikate.sql
-- Zertifikate beim Abschluss eines Lernpfads.
-- Wird beim ersten Erreichen von 100% angelegt, bleibt
-- bestehen. Format der certificate_number: VA-YYYY-NNNNN
-- =============================================================

create sequence if not exists public.user_path_certificates_seq;

create or replace function public.next_certificate_number()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('public.user_path_certificates_seq');
  return 'VA-' || to_char(now(), 'YYYY') || '-' || lpad(n::text, 5, '0');
end;
$$;

create table if not exists public.user_path_certificates (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id)         on delete cascade,
  learning_path_id    uuid not null references public.learning_paths(id)   on delete cascade,
  certificate_number  text not null unique default public.next_certificate_number(),
  generated_at        timestamptz not null default now(),
  unique (user_id, learning_path_id)
);

create index if not exists user_path_certificates_user_idx
  on public.user_path_certificates (user_id);

alter table public.user_path_certificates enable row level security;

drop policy if exists "certs_select_own" on public.user_path_certificates;
create policy "certs_select_own"
  on public.user_path_certificates for select
  using (auth.uid() = user_id);

drop policy if exists "certs_insert_own" on public.user_path_certificates;
create policy "certs_insert_own"
  on public.user_path_certificates for insert
  with check (auth.uid() = user_id);

-- Admins koennen alle Zertifikate sehen (z.B. fuer Fortschritts-Export)
drop policy if exists "certs_admin_select_all" on public.user_path_certificates;
create policy "certs_admin_select_all"
  on public.user_path_certificates for select
  using (public.is_admin());

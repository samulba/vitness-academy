-- =============================================================
-- 0036_form_attachments_bucket.sql
-- Storage-Bucket für Datei-Anhaenge in Form-Submissions
-- (z.B. Krankenschein-PDF in Krankmeldung).
-- Privat: Mitarbeiter laedt eigene hoch, sieht eigene + Admin
-- alle. Pfad-Konvention: ${user_id}/${timestamp}-${field}.${ext}
-- =============================================================

insert into storage.buckets (id, name, public)
  values ('form-attachments', 'form-attachments', false)
  on conflict (id) do nothing;

drop policy if exists "form_attachments_select_own_or_admin" on storage.objects;
create policy "form_attachments_select_own_or_admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'form-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff_or_higher()
    )
  );

drop policy if exists "form_attachments_insert_own" on storage.objects;
create policy "form_attachments_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'form-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "form_attachments_delete_admin" on storage.objects;
create policy "form_attachments_delete_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'form-attachments'
    and public.is_admin()
  );

-- =============================================================================
-- News image gallery + storage bucket for generated match posters.
-- =============================================================================
-- Adds a multi-image gallery to app.news and a public Storage bucket where the
-- admin "Generar noticia" flow uploads one poster per match date. Idempotent.
-- =============================================================================

create schema if not exists app;

-- Gallery column (ordered list of image URLs) ---------------------------------
alter table app.news add column if not exists images text[] not null default '{}';

-- Storage bucket for uploaded news / poster images ---------------------------
insert into storage.buckets (id, name, public)
values ('news', 'news', true)
on conflict (id) do update set public = true;

drop policy if exists "news_public_read" on storage.objects;
create policy "news_public_read" on storage.objects
  for select using (bucket_id = 'news');

drop policy if exists "news_admin_insert" on storage.objects;
create policy "news_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'news');

drop policy if exists "news_admin_update" on storage.objects;
create policy "news_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'news') with check (bucket_id = 'news');

drop policy if exists "news_admin_delete" on storage.objects;
create policy "news_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'news');

notify pgrst, 'reload schema';

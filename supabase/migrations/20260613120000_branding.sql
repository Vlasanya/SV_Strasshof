-- =============================================================================
-- Branding settings — logo, hero image, and hero text editable from admin.
-- =============================================================================
-- Adds a public Storage bucket for uploaded brand assets and seeds the hero
-- text defaults into app.site_settings. Idempotent.
-- =============================================================================

create schema if not exists app;

-- Storage bucket for uploaded logo / hero images ------------------------------
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do update set public = true;

-- Public read; authenticated (admin) write on the branding bucket.
drop policy if exists "branding_public_read" on storage.objects;
create policy "branding_public_read" on storage.objects
  for select using (bucket_id = 'branding');

drop policy if exists "branding_admin_insert" on storage.objects;
create policy "branding_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'branding');

drop policy if exists "branding_admin_update" on storage.objects;
create policy "branding_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'branding') with check (bucket_id = 'branding');

drop policy if exists "branding_admin_delete" on storage.objects;
create policy "branding_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'branding');

-- Seed hero text defaults (only if missing) ----------------------------------
insert into app.site_settings (key, value) values
  ('hero_eyebrow', 'Saison 2025/26'),
  ('hero_title', 'ASKÖ Strasshof SV'),
  ('hero_title_highlight', 'Strasshof'),
  ('hero_subtitle', 'Fußballverein in Niederösterreich. Werde Teil unserer Mannschaft!'),
  ('hero_cta_primary_label', 'Kontakt'),
  ('hero_cta_secondary_label', 'Mannschaften')
on conflict (key) do nothing;

notify pgrst, 'reload schema';

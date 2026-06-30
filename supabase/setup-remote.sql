-- Strasshof full DB setup — run once in Supabase SQL Editor

-- ========== migrations/20260611000000_app_schema.sql ==========
-- =============================================================================
-- App schema — club-owned website content (ASKÖ Strasshof SV).
-- =============================================================================
-- RLS: public read of published / visible content; writes for authenticated admins.
-- =============================================================================

create schema if not exists app;

-- News / blog -----------------------------------------------------------------
create table if not exists app.news (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  title        text not null,
  category     text,
  excerpt      text,
  body         text,
  cover_image  text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists news_published_idx on app.news(published, published_at desc);

-- Sponsors --------------------------------------------------------------------
create table if not exists app.sponsor (
  id         bigint generated always as identity primary key,
  name       text not null,
  tier       text,                          -- Principal | Oficial | Colaborador
  logo_url   text,
  website    text,
  active     boolean not null default true,
  sort_order int,
  created_at timestamptz not null default now()
);

-- Merch / shop ----------------------------------------------------------------
create table if not exists app.merch (
  id         bigint generated always as identity primary key,
  name       text not null,
  category   text,
  price      numeric(10,2) not null default 0,
  image_url  text,
  sizes      text[],
  in_stock   boolean not null default true,
  created_at timestamptz not null default now()
);

-- Contact / enrolment submissions --------------------------------------------
create table if not exists app.contact_message (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Teams (managed in admin; squad/match data via ÖFB links/widgets) -----------
create table if not exists app.team (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  category    text,
  photo_url   text,
  coach_name  text,
  description text,
  oefb_url    text,
  sort_order  int not null default 0,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists team_sort_idx on app.team(sort_order, name);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table app.news            enable row level security;
alter table app.sponsor         enable row level security;
alter table app.merch           enable row level security;
alter table app.contact_message enable row level security;
alter table app.team            enable row level security;

-- Public (anon) read of published / public content
drop policy if exists public_read_news on app.news;
create policy public_read_news on app.news for select using (published = true);

drop policy if exists public_read_sponsor on app.sponsor;
create policy public_read_sponsor on app.sponsor for select using (true);

drop policy if exists public_read_merch on app.merch;
create policy public_read_merch on app.merch for select using (true);

drop policy if exists public_read_team on app.team;
create policy public_read_team on app.team for select using (hidden = false);

-- Anyone may submit a contact message (insert only, no read)
drop policy if exists public_insert_contact on app.contact_message;
create policy public_insert_contact on app.contact_message for insert with check (true);

-- Authenticated (admin) full access on every app table
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'app'
  loop
    execute format('drop policy if exists %I on app.%I;', 'admin_all_' || t, t);
    execute format(
      'create policy %I on app.%I for all to authenticated using (true) with check (true);',
      'admin_all_' || t, t);
  end loop;
end $$;

-- =============================================================================
-- Role grants (RLS still governs which rows are visible/writable)
-- =============================================================================
-- PostgREST connects as anon / authenticated, which need schema USAGE + table
-- privileges in addition to the RLS policies above.
grant usage on schema app to anon, authenticated;
grant select on all tables in schema app to anon, authenticated;
grant insert on app.contact_message to anon;            -- public contact form
grant all on all tables in schema app to authenticated;  -- admin CRUD
alter default privileges in schema app
  grant select on tables to anon, authenticated;

notify pgrst, 'reload schema';

-- ========== migrations/20260611010000_sponsorship.sql ==========
-- =============================================================================
-- Sponsorship dossier ("Dossier de Patrocinio") — editable content.
-- =============================================================================
-- Collaboration tiers, individual ad actions, and a generic key/value settings
-- store for the editable text + contact block on the /patrocinio page.
-- Idempotent: safe to run multiple times.
-- =============================================================================

create schema if not exists app;

create table if not exists app.sponsorship_plan (
  id          bigint generated always as identity primary key,
  name        text not null,
  price       numeric(10,2) not null default 0,
  period      text not null default 'temporada',
  features    text[] not null default '{}',
  highlighted boolean not null default false,
  sort_order  int,
  created_at  timestamptz not null default now()
);

create table if not exists app.ad_action (
  id         bigint generated always as identity primary key,
  name       text not null,
  note       text,
  price      numeric(10,2) not null default 0,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists app.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- RLS ------------------------------------------------------------------------
alter table app.sponsorship_plan enable row level security;
alter table app.ad_action        enable row level security;
alter table app.site_settings    enable row level security;

drop policy if exists public_read_sponsorship_plan on app.sponsorship_plan;
create policy public_read_sponsorship_plan on app.sponsorship_plan for select using (true);

drop policy if exists public_read_ad_action on app.ad_action;
create policy public_read_ad_action on app.ad_action for select using (true);

drop policy if exists public_read_site_settings on app.site_settings;
create policy public_read_site_settings on app.site_settings for select using (true);

drop policy if exists admin_all_sponsorship_plan on app.sponsorship_plan;
create policy admin_all_sponsorship_plan on app.sponsorship_plan
  for all to authenticated using (true) with check (true);

drop policy if exists admin_all_ad_action on app.ad_action;
create policy admin_all_ad_action on app.ad_action
  for all to authenticated using (true) with check (true);

drop policy if exists admin_all_site_settings on app.site_settings;
create policy admin_all_site_settings on app.site_settings
  for all to authenticated using (true) with check (true);

-- Grants ---------------------------------------------------------------------
grant usage on schema app to anon, authenticated;
grant select on app.sponsorship_plan, app.ad_action, app.site_settings
  to anon, authenticated;
grant all on app.sponsorship_plan, app.ad_action, app.site_settings
  to authenticated;

-- Seed defaults (from the UD Fonteta dossier) --------------------------------
insert into app.sponsorship_plan (name, price, period, features, highlighted, sort_order)
select * from (values
  ('Bronce', 600::numeric, 'temporada', array[
    '2 publicaciones mensuales.',
    '4 stories mensuales con mención.',
    'Presencia en la sección de patrocinadores.'
  ], false, 1),
  ('Plata', 900::numeric, 'temporada', array[
    '4 publicaciones mensuales.',
    '8 stories mensuales con mención.',
    '1 sorteo conjunto al mes.',
    'Presencia en la sección de patrocinadores.'
  ], false, 2),
  ('Oro', 1500::numeric, 'temporada', array[
    '6 publicaciones mensuales.',
    '12 stories compartidas.',
    '2 sorteos conjuntos al mes.',
    '1 video promocional con jugadores.',
    'Presencia destacada en la sección de patrocinadores.',
    'Prioridad en acciones promocionales.'
  ], true, 3)
) as v(name, price, period, features, highlighted, sort_order)
where not exists (select 1 from app.sponsorship_plan);

insert into app.ad_action (name, note, price, sort_order)
select * from (values
  ('Publicidad en camiseta', 'por equipo', 1000::numeric, 1),
  ('Valla publicitaria', null, 400::numeric, 2),
  ('Pack 5 stories', null, 100::numeric, 3),
  ('Enlace destacado en Instagram', null, 200::numeric, 4),
  ('Exclusividad de sector', null, 500::numeric, 5)
) as v(name, note, price, sort_order)
where not exists (select 1 from app.ad_action);

insert into app.site_settings (key, value) values
  ('sponsorship_intro_title', '¿Quiénes somos?'),
  ('sponsorship_intro_body', 'La U.D. Fonteta es mucho más que un club de fútbol. Desde hace más de 45 años somos una referencia deportiva y social en el barrio de Fuente de San Luis. Ofrecemos a niños y niñas un entorno seguro, educativo y saludable donde desarrollarse dentro y fuera del terreno de juego. Actualmente contamos con más de 300 deportistas y sus familias, formando una gran comunidad unida por valores como el esfuerzo, el respeto, el compromiso y la superación.'),
  ('sponsorship_mission_body', 'En la U.D. Fonteta entendemos el fútbol como una herramienta educativa. A través de él enseñamos valores fundamentales que acompañarán a nuestros jugadores durante toda su vida.'),
  ('sponsorship_contact_name', 'Francisco Carrasco'),
  ('sponsorship_contact_role', 'Responsable de Marketing'),
  ('sponsorship_contact_phone', '690 15 51 90'),
  ('sponsorship_contact_email', 'udfonteta@gmail.com')
on conflict (key) do nothing;

notify pgrst, 'reload schema';

-- ========== migrations/20260612000000_privacy.sql ==========
-- =============================================================================
-- Privacy / GDPR — global site toggles.
-- =============================================================================

create schema if not exists app;

insert into app.site_settings (key, value) values
  ('privacy_contact_email', 'dsgvo-rechte@oefb.at')
on conflict (key) do nothing;

notify pgrst, 'reload schema';

-- ========== migrations/20260613120000_branding.sql ==========
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

-- ========== migrations/20260613130000_news_gallery.sql ==========
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

-- ========== seed/strasshof_teams.sql ==========
-- Seed teams for ASKÖ Strasshof SV (2025/26) — idempotent by slug.
insert into app.team (slug, name, category, sort_order, oefb_url)
values
  ('KM', 'KM', 'KM', 1, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/KM/Kader/'),
  ('Res', 'Res', 'Res', 2, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/Res/Kader/'),
  ('U15', 'U15', 'U15', 3, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U15/Kader/'),
  ('U14-A', 'U14 A', 'U14 A', 4, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U14-A/Kader/'),
  ('U14-B', 'U14 B', 'U14 B', 5, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U14-B/Kader/'),
  ('U12-B', 'U12 B', 'U12 B', 6, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U12-B/Kader/'),
  ('U11', 'U11', 'U11', 7, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U11/Kader/'),
  ('U10', 'U10', 'U10', 8, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U10/Kader/'),
  ('U09-A', 'U09 A', 'U09 A', 9, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U09-A/Kader/'),
  ('U09-B', 'U09 B', 'U09 B', 10, '/AskoeStrasshofSv/Mannschaften/Saison-2025-26/U09-B/Kader/')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  sort_order = excluded.sort_order,
  oefb_url = excluded.oefb_url,
  updated_at = now();

notify pgrst, 'reload schema';


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

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

-- Seed defaults (ASKÖ Strasshof SV) -------------------------------------------
insert into app.sponsorship_plan (name, price, period, features, highlighted, sort_order)
select * from (values
  ('Bronze', 600::numeric, 'Saison', array[
    '2 Beiträge pro Monat.',
    '4 Stories pro Monat mit Erwähnung.',
    'Präsenz im Sponsorenbereich.'
  ], false, 1),
  ('Silber', 900::numeric, 'Saison', array[
    '4 Beiträge pro Monat.',
    '8 Stories pro Monat mit Erwähnung.',
    '1 gemeinsames Gewinnspiel pro Monat.',
    'Präsenz im Sponsorenbereich.'
  ], false, 2),
  ('Gold', 1500::numeric, 'Saison', array[
    '6 Beiträge pro Monat.',
    '12 geteilte Stories.',
    '2 gemeinsame Gewinnspiele pro Monat.',
    '1 Werbevideo mit Spielern.',
    'Hervorgehobene Präsenz im Sponsorenbereich.',
    'Priorität bei Werbeaktionen.'
  ], true, 3)
) as v(name, price, period, features, highlighted, sort_order)
where not exists (select 1 from app.sponsorship_plan);

insert into app.ad_action (name, note, price, sort_order)
select * from (values
  ('Werbung auf dem Trikot', 'pro Mannschaft', 1000::numeric, 1),
  ('Werbebande', null, 400::numeric, 2),
  ('Paket 5 Stories', null, 100::numeric, 3),
  ('Hervorgehobener Instagram-Link', null, 200::numeric, 4),
  ('Branchenexklusivität', null, 500::numeric, 5)
) as v(name, note, price, sort_order)
where not exists (select 1 from app.ad_action);

insert into app.site_settings (key, value) values
  ('sponsorship_intro_title', 'Wer wir sind'),
  ('sponsorship_intro_body', 'Der ASKÖ Strasshof SV ist mehr als ein Fußballverein. Wir bieten Kindern und Jugendlichen ein sicheres, sportliches Umfeld in der Region Niederösterreich. Mit zahlreichen Mannschaften und engagierten Familien stehen wir für Fairplay, Teamgeist und Nachwuchsförderung.'),
  ('sponsorship_mission_body', 'Fußball verstehen wir als Bildung: Werte wie Respekt, Einsatz und Zusammenhalt begleiten unsere Spielerinnen und Spieler auf und neben dem Platz.'),
  ('sponsorship_contact_name', ''),
  ('sponsorship_contact_role', 'Sponsoring & Marketing'),
  ('sponsorship_contact_phone', ''),
  ('sponsorship_contact_email', '')
on conflict (key) do nothing;

notify pgrst, 'reload schema';

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
  description text,
  price      numeric(10,2) not null default 0,
  image_url  text,
  sizes      text[],
  in_stock   boolean not null default true,
  sort_order int not null default 0,
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

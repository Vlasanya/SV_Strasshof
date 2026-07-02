-- Club calendar: trainings, gatherings, meetings (not ÖFB fixtures).

create schema if not exists app;

create table if not exists app.club_event (
  id          bigint generated always as identity primary key,
  title       text not null,
  event_type  text not null default 'training'
    check (event_type in ('training', 'gathering', 'meeting', 'tournament', 'other')),
  team_id     bigint references app.team(id) on delete set null,
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  all_day     boolean not null default false,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists club_event_starts_idx
  on app.club_event(starts_at desc);

create index if not exists club_event_team_idx
  on app.club_event(team_id);

alter table app.club_event enable row level security;

drop policy if exists public_read_club_event on app.club_event;
create policy public_read_club_event on app.club_event
  for select to anon, authenticated using (published = true);

drop policy if exists admin_all_club_event on app.club_event;
create policy admin_all_club_event on app.club_event
  for all to authenticated using (true) with check (true);

grant usage on schema app to anon, authenticated;
grant select on app.club_event to anon, authenticated;
grant all on app.club_event to authenticated;

notify pgrst, 'reload schema';

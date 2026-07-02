-- Membership / trial training inquiries (public wizard → admin review).

create schema if not exists app;

create table if not exists app.join_inquiry (
  id          bigint generated always as identity primary key,
  birth_year  int not null,
  team_id     bigint references app.team(id) on delete set null,
  team_name   text not null,
  child_name  text,
  contact_name text not null,
  email       text not null,
  phone       text,
  message     text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists join_inquiry_created_idx
  on app.join_inquiry(created_at desc);

alter table app.join_inquiry enable row level security;

drop policy if exists public_insert_join_inquiry on app.join_inquiry;
create policy public_insert_join_inquiry on app.join_inquiry
  for insert to anon, authenticated with check (true);

drop policy if exists admin_all_join_inquiry on app.join_inquiry;
create policy admin_all_join_inquiry on app.join_inquiry
  for all to authenticated using (true) with check (true);

grant usage on schema app to anon, authenticated;
grant insert on app.join_inquiry to anon, authenticated;
grant all on app.join_inquiry to authenticated;

notify pgrst, 'reload schema';

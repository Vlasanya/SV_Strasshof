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

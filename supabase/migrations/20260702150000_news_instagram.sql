-- Instagram publish status on news + default caption settings.
alter table app.news
  add column if not exists instagram_posted boolean not null default false,
  add column if not exists instagram_post_id text,
  add column if not exists instagram_error text,
  add column if not exists instagram_hashtags text;

insert into app.site_settings (key, value) values
  ('ig_mention', '@askoestasshof'),
  ('ig_default_hashtags', '#Strasshof #fussball')
on conflict (key) do nothing;

notify pgrst, 'reload schema';

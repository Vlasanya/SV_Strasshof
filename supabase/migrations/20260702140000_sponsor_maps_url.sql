-- Optional Google Maps link for sponsors / local partners on /sponsoren.
alter table app.sponsor
  add column if not exists maps_url text;

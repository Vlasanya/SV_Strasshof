-- Strasshof sponsors & local partners — editable via /admin/sponsoren.
-- Requires migration 20260702140000_sponsor_maps_url.sql (maps_url column).

insert into app.sponsor (name, tier, logo_url, website, maps_url, active, sort_order)
select * from (values
  (
    'Pizzeria Domani',
    'Colaborador',
    '/sponsoren/domani.svg',
    'https://www.domani.at/',
    'https://maps.app.goo.gl/d5tQ9EKZq5y1D4Pg8',
    true,
    10
  ),
  (
    'OMV',
    'Colaborador',
    '/sponsoren/omv.svg',
    'https://www.omv.at/',
    'https://maps.app.goo.gl/CE1K9WUKsbf1nmGM6',
    true,
    11
  ),
  (
    'Raiffeisen Regionalbank Gänserndorf',
    'Colaborador',
    '/sponsoren/raiffeisen.svg',
    'https://www.raiffeisen.at/',
    'https://maps.app.goo.gl/K5um8f2h1c9VeYQr5',
    true,
    12
  ),
  (
    'HOFER',
    'Colaborador',
    '/sponsoren/hofer.svg',
    'https://www.hofer.at/',
    'https://maps.app.goo.gl/XdF5MnfouZBE7tKm6',
    true,
    13
  )
) as v(name, tier, logo_url, website, maps_url, active, sort_order)
where not exists (
  select 1
  from app.sponsor
  where name in (
    'Pizzeria Domani',
    'OMV',
    'Raiffeisen Regionalbank Gänserndorf',
    'HOFER'
  )
);

-- Backfill maps_url when sponsors were seeded with only a Maps link in website.
update app.sponsor
set
  maps_url = website,
  website = null
where maps_url is null
  and website like 'https://maps.%';

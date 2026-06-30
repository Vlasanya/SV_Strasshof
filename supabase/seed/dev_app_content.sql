-- =============================================================================
-- DEV seed — sample club-owned content (news, sponsors, shop).
-- =============================================================================
-- Demo data adapted from the Localfootballclubwebsite reference, to make the
-- DEV site look populated. Touches ONLY the app schema — never ffcv.* (that
-- comes from the FFCV sync). Do NOT run this against production.
--
-- Apply to your DEV database, e.g.:
--   psql "$DATABASE_URL" -f supabase/seed/dev_app_content.sql
-- or paste it into the Supabase (dev project) SQL editor.
--
-- Idempotent: news upserts by slug; sponsors/merch only seed when empty.
-- =============================================================================

-- News -----------------------------------------------------------------------
insert into app.news (slug, title, category, excerpt, body, cover_image, published, published_at)
values
  (
    'victoria-senior-cd-alcobendas',
    'Victoria crucial del Senior ante el CD Alcobendas (3-1)',
    'Resultados',
    'Partido intenso en el Campo Municipal donde el equipo senior demostró su mejor versión con un doblete de Luis Herrera y un gol de Daniel Prados.',
    $md$El equipo Senior firmó una victoria contundente ante el CD Alcobendas en lo que fue uno de los mejores partidos de la temporada. El marcador final de 3-1 no hace justicia a la superioridad demostrada por los locales durante los 90 minutos.

Luis Herrera fue el gran protagonista con un doblete en la segunda parte, mientras que Daniel Prados marcó el primero en el minuto 23. El equipo mantiene así su racha positiva y se sitúa a solo dos puntos del líder.$md$,
    'https://images.unsplash.com/photo-1764438300230-f1eb26b918cf?w=800&h=480&fit=crop&auto=format',
    true,
    '2026-05-18'
  ),
  (
    'cadete-a-fase-final-copa-comunidad',
    'El Cadete A se clasifica para la fase final de la Copa Comunidad',
    'Copa',
    'Los chicos de Javier López confirman su pase a la fase final tras superar con autoridad al rival en cuartos de final.',
    $md$El equipo Cadete A ha conseguido clasificarse para la fase final de la Copa de la Comunidad tras una brillante actuación en cuartos de final.

Javier López, entrenador del equipo, destacó la entrega de todo el grupo: "Estoy muy orgulloso de estos chicos. Han trabajado muy duro durante toda la temporada y se merecen este logro".$md$,
    'https://images.unsplash.com/photo-1766247732021-498b394f4e33?w=800&h=480&fit=crop&auto=format',
    true,
    '2026-05-15'
  ),
  (
    'jornada-puertas-abiertas',
    'Jornada de puertas abiertas este sábado para categorías inferiores',
    'Club',
    'El club organiza una mañana de fútbol abierta a todos los niños y niñas de entre 5 y 10 años. Entrada libre y sin inscripción previa.',
    $md$El club organiza este sábado una jornada de puertas abiertas dirigida a los más pequeños. Todos los niños y niñas de entre 5 y 10 años están invitados a pasar una mañana de fútbol.

Las actividades comenzarán a las 10:00 y finalizarán a las 13:00. No es necesaria inscripción previa. Se ruega asistir con ropa deportiva y botas de tacos.$md$,
    'https://images.unsplash.com/photo-1767902012345-bd31f0ba76d7?w=800&h=480&fit=crop&auto=format',
    true,
    '2026-05-12'
  ),
  (
    'benjamin-a-golea-majadahonda',
    'El Benjamín A golea 4-0 al CD Majadahonda en casa',
    'Resultados',
    'Espectacular actuación de los más jóvenes del club, que lideran la clasificación de su grupo con autoridad a falta de dos jornadas.',
    $md$El equipo Benjamín A continúa su impresionante racha esta temporada con una nueva goleada en casa. Los 4-0 ante el CD Majadahonda reflejan el buen trabajo del cuerpo técnico.

A falta de dos jornadas para el final de la liga regular, el Benjamín A lidera su grupo con 8 puntos de ventaja sobre el segundo clasificado.$md$,
    'https://images.unsplash.com/photo-1778764205580-15e6f081e074?w=800&h=480&fit=crop&auto=format',
    true,
    '2026-05-17'
  ),
  (
    'nuevos-uniformes-2026-27',
    'Nuevos uniformes para la temporada 2026-27',
    'Club',
    'El club presenta las nuevas equipaciones que estrenarán todos los equipos la próxima temporada, con un diseño renovado que mantiene los colores tradicionales.',
    $md$El club ha presentado oficialmente los nuevos uniformes para la temporada 2026-27. Las nuevas equipaciones mantienen los colores tradicionales del club con un diseño moderno y funcional.

Todos los equipos contarán con camiseta local, camiseta visitante y portería. Los pedidos podrán realizarse a través de la secretaría del club.$md$,
    'https://images.unsplash.com/photo-1764703666646-acc2f7d48857?w=800&h=480&fit=crop&auto=format',
    true,
    '2026-05-05'
  ),
  (
    'acuerdo-patrocinio-supermercados-frescura',
    'Acuerdo de patrocinio con Supermercados Frescura',
    'Club',
    'El club firma un nuevo acuerdo de colaboración con la cadena de supermercados local, que se convierte en patrocinador oficial del fútbol base.',
    $md$El club y Supermercados Frescura han firmado un acuerdo de patrocinio que convertirá a la empresa local en patrocinador oficial de las categorías de fútbol base durante las próximas dos temporadas.

"Este tipo de colaboraciones son fundamentales para garantizar la continuidad de nuestro proyecto deportivo y mantener las cuotas accesibles para las familias", señaló la directiva.$md$,
    'https://images.unsplash.com/photo-1774201427166-a6bd297020f5?w=800&h=480&fit=crop&auto=format',
    true,
    '2026-04-28'
  )
on conflict (slug) do nothing;

-- Sponsors -------------------------------------------------------------------
insert into app.sponsor (name, tier, logo_url, website, active, sort_order)
select * from (values
  ('Construcciones López',            'Principal',   null::text, null::text, true, 1),
  ('Supermercados Frescura',          'Oficial',     null,       null,       true, 2),
  ('Farmacia Robledal',              'Oficial',     null,       null,       true, 3),
  ('Clínica Dental Vega',            'Colaborador', null,       null,       true, 4),
  ('Autoescuela Madrid Sur',          'Colaborador', null,       null,       true, 5),
  ('Taller Mecánico Hermanos Castro', 'Colaborador', null,       null,       true, 6)
) as v(name, tier, logo_url, website, active, sort_order)
where not exists (select 1 from app.sponsor);

-- Shop / merch ---------------------------------------------------------------
insert into app.merch (name, category, price, image_url, sizes, in_stock)
select * from (values
  ('Camiseta Oficial Local 2025-26',    'Camisetas',   49.95::numeric, 'https://images.unsplash.com/photo-1772474659559-7d009fef11df?w=600&h=600&fit=crop&auto=format', array['XS','S','M','L','XL','XXL'], true),
  ('Camiseta Oficial Visitante 2025-26','Camisetas',   49.95::numeric, 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=600&h=600&fit=crop&auto=format', array['XS','S','M','L','XL','XXL'], true),
  ('Camiseta Entreno',                  'Camisetas',   29.95::numeric, 'https://images.unsplash.com/photo-1662096909714-e2f206d0a636?w=600&h=600&fit=crop&auto=format', array['XS','S','M','L','XL'],       true),
  ('Sudadera con capucha',              'Sudaderas',   59.95::numeric, 'https://images.unsplash.com/photo-1576188973526-0e5d7047b0cf?w=600&h=600&fit=crop&auto=format', array['XS','S','M','L','XL','XXL'], true),
  ('Taza del club',                     'Accesorios',  14.95::numeric, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop&auto=format', null::text[],                       true),
  ('Taza Premium Edición Limitada',     'Accesorios',  19.95::numeric, 'https://images.unsplash.com/photo-1504624855736-54c752430304?w=600&h=600&fit=crop&auto=format', null::text[],                       false),
  ('Camiseta Fan Retro',                'Camisetas',   34.95::numeric, 'https://images.unsplash.com/photo-1745944756454-938dcb6e62ea?w=600&h=600&fit=crop&auto=format', array['S','M','L','XL'],            true),
  ('Pack Bufanda + Gorro',              'Accesorios',  24.95::numeric, 'https://images.unsplash.com/photo-1581655353466-d5ad6765dd37?w=600&h=600&fit=crop&auto=format', null::text[],                       true)
) as v(name, category, price, image_url, sizes, in_stock)
where not exists (select 1 from app.merch);

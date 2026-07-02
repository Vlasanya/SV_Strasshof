-- Insert German shop products (idempotent by product name).
alter table app.merch add column if not exists description text;

insert into app.merch (name, category, description, price, image_url, sizes, in_stock, sort_order)
select v.name, v.category, v.description, v.price, v.image_url, v.sizes, v.in_stock, v.sort_order
from (values
  (
    'Heimtrikot 2025/26',
    'Trikots',
    'Offizielles Heimtrikot in Vereinsfarben. Individuelle Aufdrucke auf Anfrage.',
    49.95::numeric,
    'https://images.unsplash.com/photo-1772474659559-7d009fef11df?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL']::text[],
    true,
    1
  ),
  (
    'Auswärtstrikot 2025/26',
    'Trikots',
    'Auswärtstrikot für Spiel und Training.',
    49.95::numeric,
    'https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL']::text[],
    true,
    2
  ),
  (
    'Trainingsshirt',
    'Trikots',
    'Atmungsaktives Trainingsshirt mit Vereinslogo.',
    29.95::numeric,
    'https://images.unsplash.com/photo-1662096909714-e2f206d0a636?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL']::text[],
    true,
    3
  ),
  (
    'Trainingsshorts',
    'Shorts',
    'Leichte Shorts für Training und Spiel.',
    24.95::numeric,
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL']::text[],
    true,
    4
  ),
  (
    'Trainingshose',
    'Hosen',
    'Lange Trainingshose für kühlere Tage.',
    34.95::numeric,
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL']::text[],
    true,
    5
  ),
  (
    'Hoodie Verein',
    'Hoodies',
    'Kapuzenpullover mit Vereinswappen — ideal für Fans und Eltern.',
    59.95::numeric,
    'https://images.unsplash.com/photo-1576188973526-0e5d7047b0cf?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL','XXL']::text[],
    true,
    6
  ),
  (
    'Trainingsjacke',
    'Jacken',
    'Leichte Jacke für Training und Freizeit.',
    64.95::numeric,
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&auto=format',
    array['128','140','152','164','S','M','L','XL']::text[],
    true,
    7
  ),
  (
    'Vereinsmütze',
    'Mützen',
    'Warme Mütze mit Stickerei.',
    18.95::numeric,
    'https://images.unsplash.com/photo-1581655353466-d5ad6765dd37?w=600&h=600&fit=crop&auto=format',
    array['Einheitsgröße']::text[],
    true,
    8
  ),
  (
    'Spielerhandschuhe',
    'Handschuhe',
    'Handschuhe für Herbst und Winter am Platz.',
    22.95::numeric,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&auto=format',
    array['S','M','L']::text[],
    true,
    9
  ),
  (
    'Vereinsrucksack',
    'Rucksäcke',
    'Robuster Rucksack mit Vereinslogo — für Training und Schule.',
    39.95::numeric,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&auto=format',
    null::text[],
    true,
    10
  ),
  (
    'Vereinstasse',
    'Accessoires',
    'Keramiktasse mit Vereinslogo.',
    14.95::numeric,
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop&auto=format',
    null::text[],
    true,
    11
  ),
  (
    'Fanschal',
    'Accessoires',
    'Schal in Vereinsfarben.',
    19.95::numeric,
    'https://images.unsplash.com/photo-1581655353466-d5ad6765dd37?w=600&h=600&fit=crop&auto=format',
    null::text[],
    true,
    12
  )
) as v(name, category, description, price, image_url, sizes, in_stock, sort_order)
where not exists (
  select 1 from app.merch m where m.name = v.name
);

-- German sponsorship defaults for ASKÖ Strasshof SV (run in SQL Editor after setup-remote.sql)
update app.sponsorship_plan set
  period = 'Saison',
  features = case name
    when 'Bronze' then array[
      '2 Beiträge pro Monat.',
      '4 Stories pro Monat mit Erwähnung.',
      'Präsenz im Sponsorenbereich.'
    ]
    when 'Silber' then array[
      '4 Beiträge pro Monat.',
      '8 Stories pro Monat mit Erwähnung.',
      '1 gemeinsames Gewinnspiel pro Monat.',
      'Präsenz im Sponsorenbereich.'
    ]
    when 'Gold' then array[
      '6 Beiträge pro Monat.',
      '12 geteilte Stories.',
      '2 gemeinsame Gewinnspiele pro Monat.',
      '1 Werbevideo mit Spielern.',
      'Hervorgehobene Präsenz im Sponsorenbereich.',
      'Priorität bei Werbeaktionen.'
    ]
    else features
  end,
  name = case name
    when 'Bronce' then 'Bronze'
    when 'Plata' then 'Silber'
    when 'Oro' then 'Gold'
    else name
  end
where name in ('Bronce', 'Plata', 'Oro', 'Bronze', 'Silber', 'Gold');

update app.ad_action set
  name = case name
    when 'Publicidad en camiseta' then 'Werbung auf dem Trikot'
    when 'Valla publicitaria' then 'Werbebande'
    when 'Pack 5 stories' then 'Paket 5 Stories'
    when 'Enlace destacado en Instagram' then 'Hervorgehobener Instagram-Link'
    when 'Exclusividad de sector' then 'Branchenexklusivität'
    else name
  end,
  note = case
    when note = 'por equipo' then 'pro Mannschaft'
    else note
  end;

insert into app.site_settings (key, value) values
  ('sponsorship_intro_title', 'Wer wir sind'),
  ('sponsorship_intro_body', 'Der ASKÖ Strasshof SV ist mehr als ein Fußballverein. Wir bieten Kindern und Jugendlichen ein sicheres, sportliches Umfeld in der Region Niederösterreich. Mit zahlreichen Mannschaften und engagierten Familien stehen wir für Fairplay, Teamgeist und Nachwuchsförderung.'),
  ('sponsorship_mission_body', 'Fußball verstehen wir als Bildung: Werte wie Respekt, Einsatz und Zusammenhalt begleiten unsere Spielerinnen und Spieler auf und neben dem Platz.'),
  ('sponsorship_contact_name', ''),
  ('sponsorship_contact_role', 'Sponsoring & Marketing'),
  ('sponsorship_contact_phone', ''),
  ('sponsorship_contact_email', '')
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

notify pgrst, 'reload schema';

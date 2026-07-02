-- Allow match (Spiel) as club calendar event type.

alter table app.club_event
  drop constraint if exists club_event_event_type_check;

alter table app.club_event
  add constraint club_event_event_type_check
  check (event_type in (
    'training', 'gathering', 'meeting', 'tournament', 'match', 'other'
  ));

notify pgrst, 'reload schema';

-- Training pitch / field assignment for club calendar.

alter table app.club_event
  add column if not exists field text;

notify pgrst, 'reload schema';

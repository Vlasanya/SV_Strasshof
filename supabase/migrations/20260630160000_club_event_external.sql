-- External tournament links / MeinTurnierplan widget embeds on club events.

alter table app.club_event
  add column if not exists external_url text,
  add column if not exists external_widget text;

notify pgrst, 'reload schema';

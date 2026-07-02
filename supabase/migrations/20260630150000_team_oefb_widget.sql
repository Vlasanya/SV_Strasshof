-- Optional ÖFB Vereinswidget embed (Spielplan Mannschaft) per team.

alter table app.team
  add column if not exists oefb_widget_spiele text;

notify pgrst, 'reload schema';

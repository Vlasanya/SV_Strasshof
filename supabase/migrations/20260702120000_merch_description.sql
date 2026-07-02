-- Optional product description for shop detail pages.
alter table app.merch
  add column if not exists description text;

notify pgrst, 'reload schema';

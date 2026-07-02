alter table app.merch
  add column if not exists sort_order int not null default 0;

notify pgrst, 'reload schema';

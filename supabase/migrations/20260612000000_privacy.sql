-- =============================================================================
-- Privacy / GDPR — global site toggles.
-- =============================================================================

create schema if not exists app;

insert into app.site_settings (key, value) values
  ('privacy_contact_email', 'dsgvo-rechte@oefb.at')
on conflict (key) do nothing;

notify pgrst, 'reload schema';

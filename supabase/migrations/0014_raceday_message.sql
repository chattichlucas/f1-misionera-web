-- Texto del popup de día de carrera. Después de 0001–0013. Idempotente.
alter table public.site_settings
  add column if not exists raceday_message text;

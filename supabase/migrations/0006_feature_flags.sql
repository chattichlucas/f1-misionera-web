-- =====================================================================
--  Flags de funciones opcionales. Ejecutar después de 0001–0005. Idempotente.
-- =====================================================================

-- Recálculo de carrera por tiempo + penalizaciones (off por defecto).
alter table public.site_settings
  add column if not exists recalc_enabled boolean not null default false;

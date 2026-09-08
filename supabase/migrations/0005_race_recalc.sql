-- =====================================================================
--  Recálculo de carrera con penalizaciones de tiempo
--  Ejecutar DESPUÉS de 0001–0004. Idempotente.
-- =====================================================================

-- Tiempo total de carrera del piloto, en milisegundos (null = DNF/no cargado).
alter table public.session_results
  add column if not exists finish_ms bigint;

-- Penalización de tiempo en segundos (además de la "Sanción" de texto).
alter table public.penalties
  add column if not exists time_penalty_seconds numeric not null default 0;

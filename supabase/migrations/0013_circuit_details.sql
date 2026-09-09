-- =====================================================================
--  Detalle de circuito: récord de vuelta real + info. Después de 0001–0012.
-- =====================================================================

alter table public.circuits add column if not exists lap_record_time text;
alter table public.circuits add column if not exists lap_record_holder text;
alter table public.circuits add column if not exists lap_record_year int;
alter table public.circuits add column if not exists lap_record_car text;
alter table public.circuits add column if not exists turns int;
alter table public.circuits add column if not exists description text;

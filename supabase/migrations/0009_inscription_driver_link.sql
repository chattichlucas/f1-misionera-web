-- =====================================================================
--  Vínculo inscripción -> piloto creado al aceptarla.
--  Después de 0001–0008. Idempotente.
-- =====================================================================

alter table public.inscriptions
  add column if not exists driver_id uuid references public.drivers(id) on delete set null;

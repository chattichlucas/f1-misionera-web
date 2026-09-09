-- =====================================================================
--  Datos de pago estructurados (los carga el admin). Después de 0001–0010.
-- =====================================================================

alter table public.site_settings add column if not exists payment_amount text;
alter table public.site_settings add column if not exists payment_alias text;
alter table public.site_settings add column if not exists payment_holder text;

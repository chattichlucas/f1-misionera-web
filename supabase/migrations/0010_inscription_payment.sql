-- =====================================================================
--  Comprobante de pago en la inscripción. Después de 0001–0009. Idempotente.
-- =====================================================================

alter table public.inscriptions
  add column if not exists payment_proof_path text;
alter table public.inscriptions
  add column if not exists payer_alias text;
alter table public.inscriptions
  add column if not exists payer_name text;

-- Instrucciones de pago que se muestran en la página pública de inscripción.
alter table public.site_settings
  add column if not exists payment_info text;

-- Bucket PRIVADO para los comprobantes (solo el servidor con service_role los lee).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes', 'comprobantes', false,
  5242880,
  array['image/png','image/jpeg','image/webp','application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp','application/pdf'];

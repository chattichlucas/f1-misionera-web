-- =====================================================================
--  Storage: bucket público "media" para logos, fotos y portadas
--  Ejecutar DESPUÉS de 0001–0003. Idempotente.
--
--  Las subidas se hacen desde el servidor con service_role (no necesita
--  policies). La lectura es pública porque el bucket es público.
--
--  Si este INSERT falla por permisos, creá el bucket a mano:
--  Supabase -> Storage -> New bucket -> nombre "media" -> Public -> Create
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  5242880,
  array['image/png','image/jpeg','image/webp','image/avif','image/svg+xml']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp','image/avif','image/svg+xml'];

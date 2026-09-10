-- WhatsApp / teléfono en la inscripción. Después de 0001–0014. Idempotente.
alter table public.inscriptions
  add column if not exists whatsapp text;

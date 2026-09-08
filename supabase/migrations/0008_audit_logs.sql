-- =====================================================================
--  Auditoría: quién crea / edita / borra. Después de 0001–0007. Idempotente.
-- =====================================================================

create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_email  text,
  actor_id     uuid,
  action       text not null,        -- create | update | delete | settings | permissions | inscription | recalc | import
  entity       text,                 -- tabla / módulo
  entity_id    text,
  summary      text,
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Solo superadmin puede leer. La escritura la hace el servidor con service_role.
drop policy if exists "audit read" on public.audit_logs;
create policy "audit read" on public.audit_logs
  for select to authenticated using (public.is_superadmin());

create index if not exists idx_audit_created on public.audit_logs (created_at desc);
create index if not exists idx_audit_actor   on public.audit_logs (actor_email);
create index if not exists idx_audit_action  on public.audit_logs (action);

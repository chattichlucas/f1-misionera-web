-- =====================================================================
--  Log de importaciones de resultados. Después de 0001–0006. Idempotente.
-- =====================================================================

create table if not exists public.import_logs (
  id           uuid primary key default gen_random_uuid(),
  round_id     uuid references public.rounds(id) on delete set null,
  round_label  text,
  session      text,
  ok           boolean not null default true,
  message      text,
  imported     int not null default 0,
  matched      jsonb not null default '[]'::jsonb,
  unmatched    jsonb not null default '[]'::jsonb,
  source_ip    text,
  forced       boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.import_logs enable row level security;

drop policy if exists "import_logs read" on public.import_logs;
create policy "import_logs read" on public.import_logs
  for select to authenticated using (public.can_view('session_results'));
-- La escritura la hace el endpoint con service_role (bypassea RLS).

create index if not exists idx_import_logs_created on public.import_logs (created_at desc);

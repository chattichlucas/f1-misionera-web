-- =====================================================================
--  Permisos por usuario y por módulo
--  Ejecutar DESPUÉS de 0001_init.sql. Idempotente.
-- =====================================================================

-- ---------- tablas ---------------------------------------------------
create table if not exists public.superadmins (
  email      text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.user_permissions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  module     text not null,
  level      text not null default 'none' check (level in ('none','view','edit')),
  updated_at timestamptz not null default now(),
  primary key (user_id, module)
);

alter table public.superadmins      enable row level security;
alter table public.user_permissions enable row level security;

-- ---------- funciones ---------------------------------------------
-- SECURITY DEFINER para evitar recursión de RLS al leer estas tablas.
create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.superadmins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Modo compatibilidad: si todavía no se configuró ningún superadmin,
-- cualquier usuario autenticado tiene acceso total (comportamiento previo).
create or replace function public.perm_compat()
returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.superadmins);
$$;

create or replace function public.perm_level(p_module text)
returns text language sql stable security definer set search_path = public as $$
  select case
    when auth.uid() is null then 'none'
    when public.is_superadmin() then 'edit'
    when public.perm_compat() then 'edit'
    else coalesce(
      (select level from public.user_permissions
        where user_id = auth.uid() and module = p_module),
      'none')
  end;
$$;

create or replace function public.can_edit(p_module text)
returns boolean language sql stable as $$
  select public.perm_level(p_module) = 'edit';
$$;

create or replace function public.can_view(p_module text)
returns boolean language sql stable as $$
  select public.perm_level(p_module) in ('view','edit');
$$;

-- ---------- RLS de las tablas de permisos -----------------------
drop policy if exists "superadmin all sa"   on public.superadmins;
drop policy if exists "superadmin read up"  on public.user_permissions;
drop policy if exists "self read up"        on public.user_permissions;
drop policy if exists "superadmin write up" on public.user_permissions;

create policy "superadmin all sa" on public.superadmins
  for all to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

create policy "self read up" on public.user_permissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_superadmin());

create policy "superadmin write up" on public.user_permissions
  for all to authenticated
  using (public.is_superadmin()) with check (public.is_superadmin());

-- ---------- Reemplazar "admin write" por permisos por módulo -----
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('site_settings',      'settings'),
      ('seasons',            'seasons'),
      ('categories',         'categories'),
      ('teams',              'teams'),
      ('circuits',           'circuits'),
      ('drivers',            'drivers'),
      ('rounds',             'rounds'),
      ('session_results',    'session_results'),
      ('penalties',          'penalties'),
      ('news',               'news'),
      ('regulation_sections','regulation_sections')
    ) as t(tbl, module)
  loop
    execute format('drop policy if exists "admin write" on public.%I;', rec.tbl);
    execute format('drop policy if exists "mod write"   on public.%I;', rec.tbl);
    execute format($f$
      create policy "mod write" on public.%I
        for all to authenticated
        using (public.can_edit(%L))
        with check (public.can_edit(%L));
    $f$, rec.tbl, rec.module, rec.module);
  end loop;
end $$;

-- ---------- inscripciones ---------------------------------------
drop policy if exists "public insert" on public.inscriptions;
drop policy if exists "admin read"    on public.inscriptions;
drop policy if exists "admin manage"  on public.inscriptions;
drop policy if exists "admin delete"  on public.inscriptions;
drop policy if exists "insc read"     on public.inscriptions;
drop policy if exists "insc write"    on public.inscriptions;
drop policy if exists "insc delete"   on public.inscriptions;

create policy "public insert" on public.inscriptions
  for insert with check (status = 'pendiente');
create policy "insc read" on public.inscriptions
  for select to authenticated using (public.can_view('inscriptions'));
create policy "insc write" on public.inscriptions
  for update to authenticated
  using (public.can_edit('inscriptions')) with check (public.can_edit('inscriptions'));
create policy "insc delete" on public.inscriptions
  for delete to authenticated using (public.can_edit('inscriptions'));

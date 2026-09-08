-- =====================================================================
--  Sponsors, organizadores, modo mantenimiento e idioma por defecto
--  Ejecutar DESPUÉS de 0001 y 0002. Idempotente.
-- =====================================================================

-- ---------- site_settings: nuevas columnas ------------------------
alter table public.site_settings
  add column if not exists maintenance_mode boolean not null default false;
alter table public.site_settings
  add column if not exists maintenance_message text;
alter table public.site_settings
  add column if not exists default_locale text not null default 'es';

-- ---------- sponsors --------------------------------------------
create table if not exists public.sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  logo_url    text,
  url         text,
  tier        text default 'Oficial',
  sort        int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- organizers -----------------------------------------
create table if not exists public.organizers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  email      text,
  discord    text,
  whatsapp   text,
  photo_url  text,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- RLS ------------------------------------------------
alter table public.sponsors   enable row level security;
alter table public.organizers enable row level security;

do $$
declare rec record;
begin
  for rec in select * from (values
    ('sponsors',   'sponsors'),
    ('organizers', 'organizers')
  ) as t(tbl, module)
  loop
    execute format('drop policy if exists "public read" on public.%I;', rec.tbl);
    execute format('drop policy if exists "mod write"   on public.%I;', rec.tbl);
    execute format('create policy "public read" on public.%I for select using (true);', rec.tbl);
    execute format($f$
      create policy "mod write" on public.%I
        for all to authenticated
        using (public.can_edit(%L))
        with check (public.can_edit(%L));
    $f$, rec.tbl, rec.module, rec.module);
  end loop;
end $$;

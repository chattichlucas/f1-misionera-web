-- =====================================================================
--  Liga Web · esquema inicial
--  Ejecutar en Supabase: SQL Editor -> pegar todo -> Run
-- =====================================================================

-- ---------- helpers ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- authenticated == admin (las cuentas se crean a mano en Supabase Auth).
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select auth.role() = 'authenticated';
$$;

-- ---------- site_settings (singleton) --------------------------------
create table if not exists public.site_settings (
  id            int primary key default 1 check (id = 1),
  league_name   text not null default 'Mi Liga',
  tagline       text not null default 'Liga de F1 · Temporada 2026',
  season_label  text not null default 'Temporada 2026',
  logo_url      text,
  hero_image_url text,
  -- colores (hex). Alimentan las variables CSS del sitio.
  color_bg      text not null default '#05070a',
  color_panel   text not null default '#0c1118',
  color_panel_2 text not null default '#0a0d11',
  color_line    text not null default '#202833',
  color_text    text not null default '#f5f7fa',
  color_muted   text not null default '#8d97a5',
  color_primary text not null default '#ff6500',
  color_primary_fg text not null default '#0a0500',
  color_accent  text not null default '#4a97ff',
  color_positive text not null default '#3bd671',
  color_negative text not null default '#ff3b46',
  -- redes
  discord_url   text,
  instagram_url text,
  youtube_url   text,
  twitch_url    text,
  tiktok_url    text,
  contact_email text,
  -- esquema de puntos (documental / usado como sugerencia en el panel)
  points_scheme jsonb not null default '{"race":[25,18,15,12,10,8,6,4,2,1],"sprint":[8,7,6,5,4,3,2,1],"fastest_lap":1,"pole":0}'::jsonb,
  inscriptions_open boolean not null default true,
  updated_at    timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;
drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------- seasons -------------------------------------------------
create table if not exists public.seasons (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  year       int not null,
  is_active  boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- categories --------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  season_id  uuid references public.seasons(id) on delete cascade,
  name       text not null,
  slug       text not null,
  weekday    text,               -- ej: "Miércoles"
  time_text  text,               -- ej: "22:00 ARG"
  description text,
  sort       int not null default 0,
  unique (season_id, slug)
);

-- ---------- teams -------------------------------------------------
create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  season_id  uuid references public.seasons(id) on delete cascade,
  name       text not null,
  slug       text not null,
  full_name  text,
  car_name   text,
  color      text not null default '#888888',
  color2     text not null default '#222222',
  logo_url   text,
  sort       int not null default 0,
  unique (season_id, slug)
);

-- ---------- circuits ---------------------------------------------
create table if not exists public.circuits (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  country      text,
  country_code text,              -- ISO alpha-2 en minúsculas, ej: "ar"
  flag_emoji   text,
  map_url      text,
  length_km    numeric,
  laps         int
);

-- ---------- drivers --------------------------------------------
create table if not exists public.drivers (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories(id) on delete cascade,
  team_id      uuid references public.teams(id) on delete set null,
  name         text not null,
  nationality  text,
  country_code text,
  number       int,
  gamertag     text,
  seat         text not null default 'titular' check (seat in ('titular','reserva')),
  photo_url    text,
  bio          text,
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------- rounds --------------------------------------------
create table if not exists public.rounds (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories(id) on delete cascade,
  circuit_id   uuid references public.circuits(id) on delete set null,
  round_number int not null,
  race_date    timestamptz,
  is_sprint    boolean not null default false,
  status       text not null default 'proximo' check (status in ('proximo','finalizado','cancelado')),
  notes        text,
  created_at   timestamptz not null default now()
);

-- ---------- session_results ----------------------------------
create table if not exists public.session_results (
  id           uuid primary key default gen_random_uuid(),
  round_id     uuid not null references public.rounds(id) on delete cascade,
  driver_id    uuid not null references public.drivers(id) on delete cascade,
  session_type text not null default 'race' check (session_type in ('race','qualifying','sprint')),
  position     int,
  points       numeric not null default 0,
  grid         int,
  dnf          boolean not null default false,
  dsq          boolean not null default false,
  pole         boolean not null default false,
  fastest_lap  boolean not null default false,
  time_text    text,               -- ej: "1:32:04.551" o "+5.212"
  best_lap     text,
  notes        text,
  unique (round_id, driver_id, session_type)
);

-- ---------- penalties ---------------------------------------
create table if not exists public.penalties (
  id            uuid primary key default gen_random_uuid(),
  round_id      uuid references public.rounds(id) on delete set null,
  driver_id     uuid references public.drivers(id) on delete set null,
  category_id   uuid references public.categories(id) on delete set null,
  headline      text not null,
  detail        text,
  sanction      text,               -- ej: "+5s", "Drive-through", "3 pts licencia"
  license_points int not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------- news ------------------------------------------
create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  body         text,
  cover_url    text,
  published    boolean not null default true,
  published_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_news_updated on public.news;
create trigger trg_news_updated before update on public.news
  for each row execute function public.set_updated_at();

-- ---------- regulation_sections -------------------------
create table if not exists public.regulation_sections (
  id       uuid primary key default gen_random_uuid(),
  sort     int not null default 0,
  heading  text not null,
  body     text not null default '',
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_reg_updated on public.regulation_sections;
create trigger trg_reg_updated before update on public.regulation_sections
  for each row execute function public.set_updated_at();

-- ---------- inscriptions -------------------------------
create table if not exists public.inscriptions (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories(id) on delete set null,
  category_label text,
  full_name    text not null,
  nationality  text,
  number_pref  int,
  gamertag     text,
  discord      text,
  platform     text,               -- PC / PS5 / Xbox
  experience   text,
  notes        text,
  status       text not null default 'pendiente' check (status in ('pendiente','aceptada','rechazada','reserva')),
  created_at   timestamptz not null default now()
);

-- =====================================================================
--  Vistas de clasificación
-- =====================================================================
create or replace view public.driver_standings
with (security_invoker = true) as
select
  d.id                as driver_id,
  d.category_id,
  d.name,
  d.country_code,
  d.number,
  d.gamertag,
  d.seat,
  d.team_id,
  t.name              as team_name,
  t.color             as team_color,
  t.color2            as team_color2,
  coalesce(sum(sr.points), 0)                                                          as points,
  count(*) filter (where sr.session_type in ('race','sprint') and sr.position = 1)     as wins,
  count(*) filter (where sr.session_type = 'race' and sr.position <= 3)                as podiums,
  count(*) filter (where sr.pole)                                                      as poles,
  count(*) filter (where sr.fastest_lap)                                               as fastest_laps
from public.drivers d
left join public.teams t          on t.id = d.team_id
left join public.session_results sr on sr.driver_id = d.id
group by d.id, t.id;

create or replace view public.team_standings
with (security_invoker = true) as
select
  t.id                as team_id,
  t.season_id,
  c.id                as category_id,
  c.name              as category_name,
  t.name,
  t.color,
  t.color2,
  t.logo_url,
  coalesce(sum(sr.points), 0)                                                      as points,
  count(*) filter (where sr.session_type in ('race','sprint') and sr.position = 1) as wins
from public.teams t
join public.drivers d       on d.team_id = t.id
join public.categories c    on c.id = d.category_id
left join public.session_results sr on sr.driver_id = d.id
group by t.id, c.id;

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.site_settings        enable row level security;
alter table public.seasons              enable row level security;
alter table public.categories           enable row level security;
alter table public.teams                enable row level security;
alter table public.circuits             enable row level security;
alter table public.drivers              enable row level security;
alter table public.rounds               enable row level security;
alter table public.session_results      enable row level security;
alter table public.penalties            enable row level security;
alter table public.news                 enable row level security;
alter table public.regulation_sections  enable row level security;
alter table public.inscriptions         enable row level security;

-- lectura pública + escritura admin, para las tablas de contenido
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'site_settings','seasons','categories','teams','circuits','drivers',
    'rounds','session_results','penalties','news','regulation_sections'
  ]
  loop
    execute format('drop policy if exists "public read" on public.%I;', tbl);
    execute format('drop policy if exists "admin write" on public.%I;', tbl);
    execute format('create policy "public read" on public.%I for select using (true);', tbl);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin());', tbl);
  end loop;
end $$;

-- inscripciones: alta pública, lectura/gestión sólo admin
drop policy if exists "public insert" on public.inscriptions;
drop policy if exists "admin read"    on public.inscriptions;
drop policy if exists "admin manage"  on public.inscriptions;
drop policy if exists "admin delete"  on public.inscriptions;
create policy "public insert" on public.inscriptions
  for insert with check (status = 'pendiente');
create policy "admin read" on public.inscriptions
  for select to authenticated using (public.is_admin());
create policy "admin manage" on public.inscriptions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.inscriptions
  for delete to authenticated using (public.is_admin());

-- =====================================================================
--  Índices
-- =====================================================================
create index if not exists idx_categories_season on public.categories(season_id);
create index if not exists idx_teams_season      on public.teams(season_id);
create index if not exists idx_drivers_category  on public.drivers(category_id);
create index if not exists idx_drivers_team      on public.drivers(team_id);
create index if not exists idx_rounds_category   on public.rounds(category_id);
create index if not exists idx_results_round     on public.session_results(round_id);
create index if not exists idx_results_driver    on public.session_results(driver_id);
create index if not exists idx_penalties_round   on public.penalties(round_id);

-- =====================================================================
--  Grants para las vistas (PostgREST / API)
-- =====================================================================
grant select on public.driver_standings to anon, authenticated;
grant select on public.team_standings   to anon, authenticated;

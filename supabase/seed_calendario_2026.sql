-- =====================================================================
--  Calendario 2026 · rondas 13–24 · jueves 21:30 ARG desde el 17/09/2026
--  Requiere haber corrido seed_circuits_2026.sql antes.
--  Cambiá 'a' por el slug de tu categoría. Re-ejecutable (upsert).
-- =====================================================================

create unique index if not exists rounds_cat_round_key
  on public.rounds (category_id, round_number);

with cat as (
  select id from public.categories where slug = 'a' limit 1
),
data(round_number, circuit_name, race_date, is_sprint) as (
  values
    (13, 'Hungaroring',                             timestamptz '2026-09-17 21:30:00-03:00', false),
    (14, 'Circuit Zandvoort',                       timestamptz '2026-09-24 21:30:00-03:00', true),
    (15, 'Autodromo Nazionale Monza',               timestamptz '2026-10-01 21:30:00-03:00', false),
    (16, 'Madring',                                 timestamptz '2026-10-08 21:30:00-03:00', false),
    (17, 'Baku City Circuit',                       timestamptz '2026-10-15 21:30:00-03:00', false),
    (18, 'Marina Bay Street Circuit',               timestamptz '2026-10-22 21:30:00-03:00', true),
    (19, 'Circuit of the Americas',                 timestamptz '2026-10-29 21:30:00-03:00', false),
    (20, 'Autódromo Hermanos Rodríguez',            timestamptz '2026-11-05 21:30:00-03:00', false),
    (21, 'Autódromo José Carlos Pace (Interlagos)', timestamptz '2026-11-12 21:30:00-03:00', false),
    (22, 'Las Vegas Strip Circuit',                 timestamptz '2026-11-19 21:30:00-03:00', false),
    (23, 'Lusail International Circuit',             timestamptz '2026-11-26 21:30:00-03:00', false),
    (24, 'Yas Marina Circuit',                      timestamptz '2026-12-03 21:30:00-03:00', false)
)
insert into public.rounds (category_id, circuit_id, round_number, race_date, is_sprint, status)
select cat.id, c.id, d.round_number, d.race_date, d.is_sprint, 'proximo'
from data d
cross join cat
join public.circuits c on c.name = d.circuit_name
on conflict (category_id, round_number) do update
  set circuit_id = excluded.circuit_id,
      race_date  = excluded.race_date,
      is_sprint  = excluded.is_sprint;

-- Para otra categoría: cambiá 'a' arriba y volvé a correr todo el bloque.

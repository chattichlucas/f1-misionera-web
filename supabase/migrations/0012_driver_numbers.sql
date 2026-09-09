-- =====================================================================
--  Números de piloto: reservados + únicos por categoría. Después de 0001–0011.
-- =====================================================================

-- Lista de números que no se pueden usar (separados por coma). Ej: "1, 17".
alter table public.site_settings
  add column if not exists blocked_driver_numbers text default '1, 17';

-- Unicidad de número dentro de una categoría (ignora los null).
-- OJO: si ya hay números repetidos, este índice NO se crea hasta que los limpies.
create unique index if not exists drivers_category_number_key
  on public.drivers (category_id, number)
  where number is not null;

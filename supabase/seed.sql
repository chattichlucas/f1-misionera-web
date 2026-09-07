-- =====================================================================
--  Seed de ejemplo · Temporada 2026 (F1 25, grilla 2026)
--  Opcional. Ejecutar DESPUÉS de 0001_init.sql.
--  Reemplazá los datos por los de tu liga (o cargalos desde el panel).
-- =====================================================================

-- Temporada activa
insert into public.seasons (id, name, year, is_active)
values ('00000000-0000-0000-0000-000000000001', 'Temporada 2026', 2026, true)
on conflict (id) do nothing;

-- Categorías
insert into public.categories (season_id, name, slug, weekday, time_text, sort) values
  ('00000000-0000-0000-0000-000000000001', 'Categoría A', 'a', 'Miércoles', '22:00 ARG', 1),
  ('00000000-0000-0000-0000-000000000001', 'Categoría B', 'b', 'Martes',    '22:00 ARG', 2)
on conflict do nothing;

-- Escuderías F1 2026 (colores base, editables)
insert into public.teams (season_id, name, slug, full_name, color, color2, sort) values
  ('00000000-0000-0000-0000-000000000001','McLaren','mclaren','McLaren Formula 1 Team','#FF8000','#333333',1),
  ('00000000-0000-0000-0000-000000000001','Ferrari','ferrari','Scuderia Ferrari','#E8002D','#111111',2),
  ('00000000-0000-0000-0000-000000000001','Red Bull','red-bull','Oracle Red Bull Racing','#3671C6','#F5C518',3),
  ('00000000-0000-0000-0000-000000000001','Mercedes','mercedes','Mercedes-AMG Petronas','#27F4D2','#000000',4),
  ('00000000-0000-0000-0000-000000000001','Aston Martin','aston-martin','Aston Martin Aramco','#229971','#CEDC00',5),
  ('00000000-0000-0000-0000-000000000001','Alpine','alpine','Alpine F1 Team','#0093CC','#FF87BC',6),
  ('00000000-0000-0000-0000-000000000001','Williams','williams','Williams Racing','#64C4FF','#00224E',7),
  ('00000000-0000-0000-0000-000000000001','Racing Bulls','racing-bulls','Visa Cash App RB','#6692FF','#1634CB',8),
  ('00000000-0000-0000-0000-000000000001','Haas','haas','MoneyGram Haas F1 Team','#B6BABD','#111111',9),
  ('00000000-0000-0000-0000-000000000001','Audi','audi','Audi F1 Team','#B4B4B4','#232323',10),
  ('00000000-0000-0000-0000-000000000001','Cadillac','cadillac','Cadillac F1 Team','#001E5F','#B99B5B',11)
on conflict do nothing;

-- Circuitos de ejemplo (la bandera se dibuja desde country_code)
insert into public.circuits (name, country, country_code) values
  ('Albert Park', 'Australia', 'au'),
  ('Shanghai', 'China', 'cn'),
  ('Suzuka', 'Japón', 'jp'),
  ('Sakhir', 'Bahrein', 'bh'),
  ('Yeda', 'Arabia Saudita', 'sa')
on conflict do nothing;

-- Sección de reglamento de ejemplo
insert into public.regulation_sections (sort, heading, body) values
  (1, 'Conducta en pista', 'Se espera pilotaje limpio y respetuoso. El contacto evitable se sanciona según criterio de comisarios.'),
  (2, 'Sistema de puntos', 'Carrera: 25-18-15-12-10-8-6-4-2-1. Punto extra por vuelta rápida dentro del top 10.'),
  (3, 'Asistencia', 'La inasistencia sin aviso con 24 h de anticipación puede implicar pérdida de butaca.')
on conflict do nothing;

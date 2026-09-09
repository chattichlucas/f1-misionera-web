-- =====================================================================
--  Récords de vuelta reales de F1 + nº de curvas (layouts actuales).
--  Datos aproximados de memoria — verificá y editá los que haga falta
--  desde el panel (Circuitos). Requiere 0013_circuit_details.sql.
-- =====================================================================

update public.circuits as c set
  turns = v.turns, lap_record_time = v.t, lap_record_holder = v.h,
  lap_record_year = v.y, lap_record_car = v.car
from (values
  ('Albert Park Grand Prix Circuit',          14, '1:19.813', 'Charles Leclerc',   2024, 'Ferrari'),
  ('Shanghai International Circuit',           16, '1:32.238', 'Michael Schumacher',2004, 'Ferrari'),
  ('Suzuka International Racing Course',       18, '1:30.983', 'Lewis Hamilton',    2019, 'Mercedes'),
  ('Miami International Autodrome',            19, '1:29.708', 'Max Verstappen',    2023, 'Red Bull'),
  ('Circuit Gilles-Villeneuve',               14, '1:13.078', 'Valtteri Bottas',   2019, 'Mercedes'),
  ('Circuit de Monaco',                       19, '1:12.909', 'Lewis Hamilton',    2021, 'Mercedes'),
  ('Circuit de Barcelona-Catalunya',          14, '1:16.330', 'Max Verstappen',    2023, 'Red Bull'),
  ('Red Bull Ring',                           10, '1:05.619', 'Carlos Sainz',      2020, 'McLaren'),
  ('Silverstone Circuit',                     18, '1:27.097', 'Max Verstappen',    2020, 'Red Bull'),
  ('Circuit de Spa-Francorchamps',            19, '1:44.701', 'Sergio Pérez',      2024, 'Red Bull'),
  ('Hungaroring',                             14, '1:16.627', 'Lewis Hamilton',    2020, 'Mercedes'),
  ('Circuit Zandvoort',                       14, '1:11.097', 'Lewis Hamilton',    2021, 'Mercedes'),
  ('Autodromo Nazionale Monza',               11, '1:21.046', 'Rubens Barrichello',2004, 'Ferrari'),
  ('Baku City Circuit',                       20, '1:43.009', 'Charles Leclerc',   2019, 'Ferrari'),
  ('Sepang International Circuit',             15, '1:34.080', 'Sebastian Vettel',  2017, 'Ferrari'),
  ('Marina Bay Street Circuit',               19, '1:35.867', 'Lewis Hamilton',    2023, 'Mercedes'),
  ('Circuit of the Americas',                 20, '1:36.169', 'Charles Leclerc',   2019, 'Ferrari'),
  ('Autódromo Hermanos Rodríguez',            17, '1:17.774', 'Valtteri Bottas',   2021, 'Mercedes'),
  ('Autódromo José Carlos Pace (Interlagos)', 15, '1:10.540', 'Valtteri Bottas',   2018, 'Mercedes'),
  ('Las Vegas Strip Circuit',                 17, '1:35.490', 'Oscar Piastri',     2023, 'McLaren'),
  ('Lusail International Circuit',             16, '1:24.319', 'Max Verstappen',    2024, 'Red Bull'),
  ('Yas Marina Circuit',                      16, '1:26.103', 'Max Verstappen',    2021, 'Red Bull')
) as v(name, turns, t, h, y, car)
where c.name = v.name;

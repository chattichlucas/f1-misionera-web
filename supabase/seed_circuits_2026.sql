-- =====================================================================
--  Circuitos temporada 2026 (F1 25) · 23 pistas
--  Pegar en Supabase -> SQL Editor -> Run. Re-ejecutable (upsert por nombre).
--  "laps" = vueltas a 50% de distancia.
-- =====================================================================

create unique index if not exists circuits_name_key on public.circuits (name);

insert into public.circuits (name, country, country_code, length_km, laps) values
  ('Albert Park Grand Prix Circuit',          'Australia',              'au', 5.278, 29),
  ('Shanghai International Circuit',           'China',                  'cn', 5.451, 28),
  ('Suzuka International Racing Course',       'Japón',                  'jp', 5.807, 27),
  ('Miami International Autodrome',            'Estados Unidos',         'us', 5.412, 29),
  ('Circuit Gilles-Villeneuve',               'Canadá',                 'ca', 4.361, 35),
  ('Circuit de Monaco',                       'Mónaco',                 'mc', 3.337, 39),
  ('Circuit de Barcelona-Catalunya',          'España',                 'es', 4.657, 33),
  ('Red Bull Ring',                           'Austria',                'at', 4.318, 36),
  ('Silverstone Circuit',                     'Reino Unido',            'gb', 5.891, 26),
  ('Circuit de Spa-Francorchamps',            'Bélgica',                'be', 7.004, 22),
  ('Hungaroring',                             'Hungría',                'hu', 4.381, 35),
  ('Circuit Zandvoort',                       'Países Bajos',           'nl', 4.259, 36),
  ('Autodromo Nazionale Monza',               'Italia',                 'it', 5.793, 27),
  ('Madring',                                 'España',                 'es', 5.416, 29),
  ('Baku City Circuit',                       'Azerbaiyán',             'az', 6.003, 26),
  ('Sepang International Circuit',             'Malasia',                'my', 5.543, 28),
  ('Marina Bay Street Circuit',               'Singapur',               'sg', 5.063, 31),
  ('Circuit of the Americas',                 'Estados Unidos',         'us', 5.513, 28),
  ('Autódromo Hermanos Rodríguez',            'México',                 'mx', 4.304, 36),
  ('Autódromo José Carlos Pace (Interlagos)', 'Brasil',                 'br', 4.309, 36),
  ('Las Vegas Strip Circuit',                 'Estados Unidos',         'us', 6.120, 25),
  ('Lusail International Circuit',             'Catar',                  'qa', 5.418, 29),
  ('Yas Marina Circuit',                      'Emiratos Árabes Unidos', 'ae', 5.554, 28)
on conflict (name) do update
  set country      = excluded.country,
      country_code = excluded.country_code,
      length_km    = excluded.length_km,
      laps         = excluded.laps;

-- Si ya corriste supabase/seed.sql y quedaron circuitos cortos duplicados
-- ('Albert Park', 'Shanghai', 'Suzuka', 'Sakhir', 'Yeda'), borralos:
-- delete from public.circuits where name in ('Albert Park','Shanghai','Suzuka','Sakhir','Yeda');

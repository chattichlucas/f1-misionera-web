// Tipos de dominio (escritos a mano; reflejan supabase/migrations/0001_init.sql).

export type SiteSettings = {
  id: number;
  league_name: string;
  tagline: string;
  season_label: string;
  logo_url: string | null;
  hero_image_url: string | null;
  color_bg: string;
  color_panel: string;
  color_panel_2: string;
  color_line: string;
  color_text: string;
  color_muted: string;
  color_primary: string;
  color_primary_fg: string;
  color_accent: string;
  color_positive: string;
  color_negative: string;
  discord_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  twitch_url: string | null;
  tiktok_url: string | null;
  contact_email: string | null;
  points_scheme: PointsScheme;
  inscriptions_open: boolean;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  default_locale: string;
  recalc_enabled: boolean;
  updated_at: string;
};

export type Sponsor = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  url: string | null;
  tier: string | null;
  sort: number;
  active: boolean;
  created_at: string;
};

export type Organizer = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  discord: string | null;
  whatsapp: string | null;
  photo_url: string | null;
  sort: number;
  created_at: string;
};

export type PointsScheme = {
  race: number[];
  sprint: number[];
  fastest_lap: number;
  pole: number;
};

export type Season = {
  id: string;
  name: string;
  year: number;
  is_active: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  season_id: string | null;
  name: string;
  slug: string;
  weekday: string | null;
  time_text: string | null;
  description: string | null;
  sort: number;
};

export type Team = {
  id: string;
  season_id: string | null;
  name: string;
  slug: string;
  full_name: string | null;
  car_name: string | null;
  color: string;
  color2: string;
  logo_url: string | null;
  sort: number;
};

export type Circuit = {
  id: string;
  name: string;
  country: string | null;
  country_code: string | null;
  flag_emoji: string | null;
  map_url: string | null;
  length_km: number | null;
  laps: number | null;
};

export type Driver = {
  id: string;
  category_id: string | null;
  team_id: string | null;
  name: string;
  nationality: string | null;
  country_code: string | null;
  number: number | null;
  gamertag: string | null;
  seat: "titular" | "reserva";
  photo_url: string | null;
  bio: string | null;
  sort: number;
  created_at: string;
};

export type Round = {
  id: string;
  category_id: string | null;
  circuit_id: string | null;
  round_number: number;
  race_date: string | null;
  is_sprint: boolean;
  status: "proximo" | "finalizado" | "cancelado";
  notes: string | null;
  created_at: string;
};

export type SessionType = "race" | "qualifying" | "sprint";

export type SessionResult = {
  id: string;
  round_id: string;
  driver_id: string;
  session_type: SessionType;
  position: number | null;
  points: number;
  grid: number | null;
  dnf: boolean;
  dsq: boolean;
  pole: boolean;
  fastest_lap: boolean;
  time_text: string | null;
  finish_ms: number | null;
  best_lap: string | null;
  notes: string | null;
};

export type Penalty = {
  id: string;
  round_id: string | null;
  driver_id: string | null;
  category_id: string | null;
  headline: string;
  detail: string | null;
  sanction: string | null;
  license_points: number;
  time_penalty_seconds: number;
  created_at: string;
};

export type News = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  published: boolean;
  published_at: string;
  updated_at: string;
};

export type RegulationSection = {
  id: string;
  sort: number;
  heading: string;
  body: string;
  updated_at: string;
};

export type Inscription = {
  id: string;
  category_id: string | null;
  category_label: string | null;
  full_name: string;
  nationality: string | null;
  number_pref: number | null;
  gamertag: string | null;
  discord: string | null;
  platform: string | null;
  experience: string | null;
  notes: string | null;
  status: "pendiente" | "aceptada" | "rechazada" | "reserva";
  created_at: string;
};

export type DriverStanding = {
  driver_id: string;
  category_id: string | null;
  name: string;
  country_code: string | null;
  number: number | null;
  gamertag: string | null;
  seat: "titular" | "reserva";
  team_id: string | null;
  team_name: string | null;
  team_color: string | null;
  team_color2: string | null;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  fastest_laps: number;
};

export type TeamStanding = {
  team_id: string;
  season_id: string | null;
  category_id: string | null;
  category_name: string | null;
  name: string;
  color: string;
  color2: string;
  logo_url: string | null;
  points: number;
  wins: number;
};

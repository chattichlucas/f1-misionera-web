import { cache } from "react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type {
  Category,
  Circuit,
  Driver,
  DriverStanding,
  News,
  Organizer,
  Penalty,
  RegulationSection,
  Round,
  SessionResult,
  SiteSettings,
  Sponsor,
  Team,
  TeamStanding,
} from "@/lib/types";

/**
 * Todas las funciones degradan a datos vacíos / por defecto si Supabase
 * todavía no está configurado, para que el sitio compile y renderice.
 */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!hasSupabaseEnv()) return DEFAULT_SETTINGS;
  const sb = await createClient();
  const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) } as SiteSettings;
});

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("sort");
  return (data ?? []) as Category[];
}

export async function getTeams(): Promise<Team[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb.from("teams").select("*").order("sort");
  return (data ?? []) as Team[];
}

export async function getDrivers(): Promise<Driver[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb
    .from("drivers")
    .select("*")
    .order("sort")
    .order("name");
  return (data ?? []) as Driver[];
}

export async function getCircuits(): Promise<Circuit[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb.from("circuits").select("*").order("name");
  return (data ?? []) as Circuit[];
}

export async function getCircuit(id: string): Promise<Circuit | null> {
  if (!hasSupabaseEnv()) return null;
  const sb = await createClient();
  const { data } = await sb.from("circuits").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Circuit | null;
}

/** Circuitos con longitud parecida (± 0.6 km), excluyendo el propio. */
export async function getSimilarCircuits(circuit: Circuit): Promise<Circuit[]> {
  if (!hasSupabaseEnv() || circuit.length_km == null) return [];
  const sb = await createClient();
  const { data } = await sb
    .from("circuits")
    .select("*")
    .neq("id", circuit.id)
    .gte("length_km", circuit.length_km - 0.6)
    .lte("length_km", circuit.length_km + 0.6)
    .order("length_km");
  return (data ?? []) as Circuit[];
}

export type RoundWithCircuit = Round & { circuit: Circuit | null; category: Category | null };

export async function getRounds(): Promise<RoundWithCircuit[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb
    .from("rounds")
    .select("*, circuit:circuits(*), category:categories(*)")
    .order("round_number");
  return (data ?? []) as RoundWithCircuit[];
}

export async function getNextRound(): Promise<RoundWithCircuit | null> {
  const rounds = await getRounds();
  const upcoming = rounds
    .filter((r) => r.status === "proximo" && r.race_date)
    .sort((a, b) => new Date(a.race_date!).getTime() - new Date(b.race_date!).getTime());
  return upcoming[0] ?? rounds.find((r) => r.status === "proximo") ?? null;
}

export async function getDriverStandings(categoryId?: string): Promise<DriverStanding[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  let q = sb.from("driver_standings").select("*");
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data } = await q;
  return ((data ?? []) as DriverStanding[]).sort(
    (a, b) => b.points - a.points || b.wins - a.wins || b.podiums - a.podiums,
  );
}

export async function getTeamStandings(categoryId?: string): Promise<TeamStanding[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  let q = sb.from("team_standings").select("*");
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data } = await q;
  return ((data ?? []) as TeamStanding[]).sort((a, b) => b.points - a.points || b.wins - a.wins);
}

export type RoundResults = {
  round: RoundWithCircuit;
  results: (SessionResult & { driver: Driver | null })[];
};

export async function getRoundResults(roundId: string): Promise<RoundResults | null> {
  if (!hasSupabaseEnv()) return null;
  const sb = await createClient();
  const { data: round } = await sb
    .from("rounds")
    .select("*, circuit:circuits(*), category:categories(*)")
    .eq("id", roundId)
    .maybeSingle();
  if (!round) return null;
  const { data: results } = await sb
    .from("session_results")
    .select("*, driver:drivers(*)")
    .eq("round_id", roundId)
    .order("session_type")
    .order("position", { nullsFirst: false });
  return {
    round: round as RoundWithCircuit,
    results: (results ?? []) as RoundResults["results"],
  };
}

export async function getPenalties(): Promise<(Penalty & { driver: Driver | null; round: Round | null })[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb
    .from("penalties")
    .select("*, driver:drivers(*), round:rounds(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as (Penalty & { driver: Driver | null; round: Round | null })[];
}

export async function getNews(limit?: number): Promise<News[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  let q = sb
    .from("news")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as News[];
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  if (!hasSupabaseEnv()) return null;
  const sb = await createClient();
  const { data } = await sb.from("news").select("*").eq("slug", slug).maybeSingle();
  return (data ?? null) as News | null;
}

export async function getRegulation(): Promise<RegulationSection[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb.from("regulation_sections").select("*").order("sort");
  return (data ?? []) as RegulationSection[];
}

export async function getSponsors(): Promise<Sponsor[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb
    .from("sponsors")
    .select("*")
    .eq("active", true)
    .order("sort");
  return (data ?? []) as Sponsor[];
}

export async function getOrganizers(): Promise<Organizer[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = await createClient();
  const { data } = await sb.from("organizers").select("*").order("sort");
  return (data ?? []) as Organizer[];
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyPermissions, canEdit } from "@/lib/permissions";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { computeClassification, type RaceRow, type RecalcRow } from "@/lib/recalc";
import type { PointsScheme } from "@/lib/types";

export type RecalcResult = {
  error?: string;
  session?: "race" | "sprint";
  rows?: RecalcRow[];
  applied?: boolean;
};

async function load(roundId: string, sessionType: "race" | "sprint") {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("No autorizado");
  const mp = await getMyPermissions();
  if (!canEdit(mp, "session_results")) throw new Error("Sin permiso de edición en Resultados");

  const { data: settings } = await sb
    .from("site_settings")
    .select("points_scheme, recalc_enabled")
    .eq("id", 1)
    .maybeSingle();
  if (!settings?.recalc_enabled) throw new Error("La función de recálculo está deshabilitada");
  const scheme = (settings?.points_scheme ?? DEFAULT_SETTINGS.points_scheme) as PointsScheme;

  const { data: results } = await sb
    .from("session_results")
    .select("id, driver_id, finish_ms, dnf, dsq, pole, fastest_lap, position, points, driver:drivers(name)")
    .eq("round_id", roundId)
    .eq("session_type", sessionType);

  const { data: penalties } = await sb
    .from("penalties")
    .select("driver_id, time_penalty_seconds")
    .eq("round_id", roundId);

  const penByDriver = new Map<string, number>();
  for (const p of penalties ?? []) {
    const row = p as { driver_id: string | null; time_penalty_seconds: number | null };
    if (!row.driver_id) continue;
    penByDriver.set(
      row.driver_id,
      (penByDriver.get(row.driver_id) ?? 0) + Number(row.time_penalty_seconds ?? 0),
    );
  }

  const rows: RaceRow[] = (results ?? []).map((r) => {
    const rec = r as Record<string, unknown> & { driver: { name?: string } | null };
    return {
      id: String(rec.id),
      driver_id: String(rec.driver_id),
      driver_name: rec.driver?.name ?? "—",
      finish_ms: rec.finish_ms == null ? null : Number(rec.finish_ms),
      dnf: Boolean(rec.dnf),
      dsq: Boolean(rec.dsq),
      pole: Boolean(rec.pole),
      fastest_lap: Boolean(rec.fastest_lap),
      position: rec.position == null ? null : Number(rec.position),
      points: Number(rec.points ?? 0),
      penalty_s: penByDriver.get(String(rec.driver_id)) ?? 0,
    };
  });

  const arr = sessionType === "sprint" ? scheme.sprint : scheme.race;
  const flPoint = sessionType === "race" ? scheme.fastest_lap : 0;
  const polePoint = sessionType === "race" ? scheme.pole : 0;
  const computed = computeClassification(rows, arr, flPoint, polePoint);
  return { sb, computed };
}

export async function previewRecalc(
  roundId: string,
  sessionType: "race" | "sprint" = "race",
): Promise<RecalcResult> {
  try {
    const { computed } = await load(roundId, sessionType);
    if (computed.length === 0) return { error: "Esa fecha no tiene resultados cargados para esa sesión." };
    return { session: sessionType, rows: computed };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function applyRecalc(
  roundId: string,
  sessionType: "race" | "sprint" = "race",
): Promise<RecalcResult> {
  try {
    const { sb, computed } = await load(roundId, sessionType);
    if (computed.length === 0) return { error: "Nada para aplicar." };
    for (const r of computed) {
      const { error } = await sb
        .from("session_results")
        .update({ position: r.new_position, points: r.new_points })
        .eq("id", r.id);
      if (error) return { error: error.message };
    }
    revalidatePath("/", "layout");
    return { session: sessionType, rows: computed, applied: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

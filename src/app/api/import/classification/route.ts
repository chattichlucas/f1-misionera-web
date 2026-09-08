import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

type ResultIn = {
  name?: string;
  gamertag?: string;
  number?: number;
  position?: number;
  grid?: number;
  total_race_time_s?: number;
  penalties_time_s?: number;
  best_lap_ms?: number;
  result_status?: number; // 3 finished · 4 DNF · 5 DSQ · 6 not classified · 7 retired
  points?: number;
};

type Payload = {
  round_id?: string;
  round?: number;
  category?: string; // slug
  session?: "race" | "sprint" | "qualifying";
  finalize?: boolean;
  force?: boolean; // re-importar una fecha ya finalizada
  results: ResultIn[];
};

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "?";
}

function authorized(req: NextRequest): boolean {
  const token = process.env.IMPORT_TOKEN;
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  const q = req.nextUrl.searchParams.get("token") ?? "";
  return bearer === token || q === token;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage:
      "POST JSON { round_id | (round + category), session, results:[{gamertag|number, position, grid, total_race_time_s, penalties_time_s, best_lap_ms, result_status, points}] } con header Authorization: Bearer <IMPORT_TOKEN>",
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!Array.isArray(body.results) || body.results.length === 0) {
    return NextResponse.json({ error: "Falta results[]" }, { status: 400 });
  }

  const session = body.session ?? "race";
  const forced = Boolean(body.force);
  const ip = clientIp(req);
  const sb = createAdminClient();

  async function log(fields: {
    round_id: string | null;
    round_label: string | null;
    ok: boolean;
    message: string;
    imported?: number;
    matched?: string[];
    unmatched?: string[];
  }) {
    try {
      await sb.from("import_logs").insert({
        round_id: fields.round_id,
        round_label: fields.round_label,
        session,
        ok: fields.ok,
        message: fields.message,
        imported: fields.imported ?? 0,
        matched: fields.matched ?? [],
        unmatched: fields.unmatched ?? [],
        source_ip: ip,
        forced,
      });
    } catch {
      /* el log no debe romper el import */
    }
  }

  // --- resolver la fecha ---
  let roundId = body.round_id ?? null;
  let categoryId: string | null = null;
  let roundStatus: string | null = null;
  let roundLabel: string | null = null;

  const roundSelect = "id, category_id, round_number, status, circuit:circuits(name)";

  if (!roundId) {
    if (body.round == null || !body.category) {
      return NextResponse.json(
        { error: "Indicá round_id, o round + category (slug)" },
        { status: 400 },
      );
    }
    const { data: cat } = await sb
      .from("categories")
      .select("id")
      .eq("slug", body.category)
      .maybeSingle();
    if (!cat) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    categoryId = cat.id;
    const { data: rnd } = await sb
      .from("rounds")
      .select(roundSelect)
      .eq("category_id", cat.id)
      .eq("round_number", body.round)
      .maybeSingle();
    if (!rnd) return NextResponse.json({ error: "Fecha no encontrada" }, { status: 404 });
    roundId = rnd.id;
    roundStatus = (rnd as { status?: string }).status ?? null;
    roundLabel = `R${(rnd as { round_number?: number }).round_number} ${(rnd as { circuit?: { name?: string } }).circuit?.name ?? ""}`.trim();
  } else {
    const { data: rnd } = await sb
      .from("rounds")
      .select(roundSelect)
      .eq("id", roundId)
      .maybeSingle();
    if (!rnd) return NextResponse.json({ error: "Fecha no encontrada" }, { status: 404 });
    categoryId = (rnd as { category_id: string }).category_id;
    roundStatus = (rnd as { status?: string }).status ?? null;
    roundLabel = `R${(rnd as { round_number?: number }).round_number} ${(rnd as { circuit?: { name?: string } }).circuit?.name ?? ""}`.trim();
  }

  if (roundStatus === "finalizado" && !forced) {
    await log({
      round_id: roundId,
      round_label: roundLabel,
      ok: false,
      message: "Rechazado: la fecha ya está finalizada (mandá force:true para pisar).",
    });
    return NextResponse.json(
      { error: "La fecha ya está finalizada. Mandá \"force\": true para re-importar." },
      { status: 409 },
    );
  }

  // --- pilotos de la categoría ---
  const { data: drivers } = await sb
    .from("drivers")
    .select("id, name, gamertag, number")
    .eq("category_id", categoryId);
  const byTag = new Map<string, string>();
  const byNum = new Map<number, string>();
  for (const d of drivers ?? []) {
    if (d.gamertag) byTag.set(d.gamertag.trim().toLowerCase(), d.id);
    if (d.number != null) byNum.set(Number(d.number), d.id);
  }

  const matched: string[] = [];
  const unmatched: string[] = [];
  const rows: Record<string, unknown>[] = [];

  for (const r of body.results) {
    const tag = r.gamertag?.trim().toLowerCase();
    const driverId = (tag && byTag.get(tag)) || (r.number != null && byNum.get(Number(r.number))) || null;
    const who = r.gamertag || r.name || `#${r.number ?? "?"}`;
    if (!driverId) {
      unmatched.push(who);
      continue;
    }
    matched.push(who);

    const status = r.result_status ?? 3;
    const dnf = status === 4 || status === 7 || status === 6;
    const dsq = status === 5;
    const totalS =
      r.total_race_time_s != null
        ? r.total_race_time_s + (r.penalties_time_s ?? 0)
        : null;
    const finishMs = totalS != null && !dnf && !dsq ? Math.round(totalS * 1000) : null;

    rows.push({
      round_id: roundId,
      driver_id: driverId,
      session_type: session,
      position: r.position ?? null,
      points: r.points ?? 0,
      grid: r.grid ?? null,
      dnf,
      dsq,
      finish_ms: finishMs,
      time_text: finishMs != null ? formatDuration(finishMs) : null,
      best_lap: r.best_lap_ms != null ? formatDuration(r.best_lap_ms) : null,
    });
  }

  if (rows.length > 0) {
    const { error } = await sb
      .from("session_results")
      .upsert(rows, { onConflict: "round_id,driver_id,session_type" });
    if (error) {
      await log({
        round_id: roundId,
        round_label: roundLabel,
        ok: false,
        message: `Error al guardar: ${error.message}`,
        matched,
        unmatched,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if ((body.finalize ?? session === "race") && roundId) {
    await sb.from("rounds").update({ status: "finalizado" }).eq("id", roundId);
  }

  await log({
    round_id: roundId,
    round_label: roundLabel,
    ok: true,
    message: unmatched.length
      ? `Importado con ${unmatched.length} piloto(s) sin coincidencia`
      : "Importado OK",
    imported: rows.length,
    matched,
    unmatched,
  });

  return NextResponse.json({
    ok: true,
    round_id: roundId,
    session,
    imported: rows.length,
    matched,
    unmatched,
  });
}

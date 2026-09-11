import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDriver,
  getDriverResults,
  getDriverStandings,
  getSettings,
  getTeammates,
  getTeams,
} from "@/lib/data";
import { Panel, PanelTitle, EmptyState } from "@/components/ui";
import { flagEmoji, formatDate, ordinal } from "@/lib/format";
import type { SessionType } from "@/lib/types";

export const revalidate = 60;

const SESSION_LABEL: Record<SessionType, string> = {
  qualifying: "Clasificación",
  sprint: "Sprint",
  race: "Carrera",
};

function resultTone(row: { position: number | null; dnf: boolean; dsq: boolean }): {
  bg: string;
  fg: string;
} {
  if (row.dsq || row.dnf) return { bg: "var(--negative)", fg: "#fff" };
  if (row.position == null) return { bg: "var(--panel-2)", fg: "var(--muted)" };
  if (row.position <= 3) return { bg: "var(--positive)", fg: "#04170c" };
  if (row.position <= 10) return { bg: "var(--accent)", fg: "#04101f" };
  return { bg: "var(--panel-2)", fg: "var(--text)" };
}

export default async function DriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getDriver(id);
  if (!driver) notFound();

  const [teams, standings, results, teammates, settings] = await Promise.all([
    getTeams(),
    getDriverStandings(driver.category_id ?? undefined),
    getDriverResults(driver.id),
    getTeammates(driver),
    getSettings(),
  ]);

  const team = teams.find((t) => t.id === driver.team_id) ?? null;
  const poleFl = settings.pole_fl_enabled;

  const rankIndex = standings.findIndex((s) => s.driver_id === driver.id);
  const mine = rankIndex >= 0 ? standings[rankIndex] : null;
  const position = rankIndex >= 0 ? rankIndex + 1 : null;

  const teammate = teammates[0] ?? null;
  const teammateStanding = teammate
    ? standings.find((s) => s.driver_id === teammate.id) ?? null
    : null;

  const raceResults = results.filter((r) => r.session_type === "race");
  const form = raceResults.slice(0, 5).reverse();

  // con escudería: sus 2 colores. sin escudería: los 2 colores base del sitio.
  const teamColor = team?.color ?? "var(--primary)";
  const teamColor2 = team?.color2 ?? "var(--accent)";

  const stat = (label: string, value: React.ReactNode) => (
    <div
      className="rounded-xl px-4 py-3 text-center"
      style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
    >
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="shell">
        <div
          className="relative overflow-hidden rounded-panel p-6 sm:p-8"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${teamColor} 22%, var(--panel)) 0%, var(--panel-2) 70%)`,
            border: "1px solid var(--line)",
          }}
        >
          {driver.number != null && (
            <span
              className="pointer-events-none absolute right-4 top-4 select-none text-[150px] font-black leading-none sm:right-6 sm:top-6 sm:text-[190px]"
              style={{ color: teamColor, opacity: 0.14 }}
            >
              {driver.number}
            </span>
          )}

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            {driver.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={driver.photo_url}
                alt={driver.name}
                className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                style={{ border: `2px solid ${teamColor}` }}
              />
            ) : (
              <div
                className="grid h-24 w-24 place-items-center rounded-2xl text-3xl font-black sm:h-28 sm:w-28"
                style={{
                  background: `linear-gradient(135deg, ${teamColor}, ${teamColor2})`,
                  color: "#fff",
                }}
              >
                {driver.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="eyebrow">Ficha de piloto</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {flagEmoji(driver.country_code)} {driver.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {team && (
                  <span className="chip" style={{ borderColor: "var(--line)" }}>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${teamColor}, ${teamColor2})` }}
                    />
                    {team.name}
                  </span>
                )}
                {driver.gamertag && <span className="chip">{driver.gamertag}</span>}
                <span className="chip uppercase">{driver.seat}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {stat("Puntos", mine?.points ?? 0)}
            {stat("Posición", position ? ordinal(position) : "—")}
            {stat("Victorias", mine?.wins ?? 0)}
            {stat("Podios", mine?.podiums ?? 0)}
            {poleFl && stat("Poles", mine?.poles ?? 0)}
            {poleFl && stat("V. rápidas", mine?.fastest_laps ?? 0)}
          </div>

          {form.length > 0 && (
            <div className="relative mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                Forma reciente
              </p>
              <div className="flex flex-wrap gap-1.5">
                {form.map((r) => {
                  const tone = resultTone(r);
                  const inner = (
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg text-xs font-extrabold"
                      style={{ background: tone.bg, color: tone.fg }}
                      title={r.round?.circuit?.name ?? ""}
                    >
                      {r.dsq ? "DSQ" : r.dnf ? "DNF" : ordinal(r.position)}
                    </span>
                  );
                  return r.round ? (
                    <Link key={r.id} href={`/resultados/${r.round.id}`}>
                      {inner}
                    </Link>
                  ) : (
                    <span key={r.id}>{inner}</span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {driver.bio && (
        <section className="shell">
          <Panel className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{driver.bio}</p>
          </Panel>
        </section>
      )}

      {teammate && (
        <section className="shell">
          <Panel className="p-5">
            <p className="eyebrow">Compañero de equipo</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <Link href={`/pilotos/${driver.id}`} className="text-right">
                <p className="font-bold">{driver.name}</p>
                <p className="text-2xl font-black">{mine?.points ?? 0}</p>
              </Link>
              <div className="h-10 flex-1 overflow-hidden rounded-full" style={{ background: "var(--panel-2)" }}>
                {(() => {
                  const a = mine?.points ?? 0;
                  const b = teammateStanding?.points ?? 0;
                  const total = a + b || 1;
                  const pct = Math.round((a / total) * 100);
                  return (
                    <div className="flex h-full">
                      <div style={{ width: `${pct}%`, background: teamColor }} />
                      <div style={{ width: `${100 - pct}%`, background: "var(--line)" }} />
                    </div>
                  );
                })()}
              </div>
              <Link href={`/pilotos/${teammate.id}`}>
                <p className="font-bold">{teammate.name}</p>
                <p className="text-2xl font-black">{teammateStanding?.points ?? 0}</p>
              </Link>
            </div>
          </Panel>
        </section>
      )}

      <section className="shell">
        <Panel>
          <PanelTitle title="Resultados de la temporada" hint={driver.gamertag ?? undefined} />
          {results.length === 0 ? (
            <EmptyState>Todavía no hay resultados cargados.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Ronda</th>
                    <th>Sesión</th>
                    <th className="num">Pos</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.round?.circuit_id ? (
                          <Link href={`/circuitos/${r.round.circuit_id}`} className="font-semibold hover:text-primary">
                            {flagEmoji(r.round?.circuit?.country_code)} {r.round?.circuit?.name ?? "—"}
                          </Link>
                        ) : (
                          <span className="font-semibold">{r.round?.circuit?.name ?? "—"}</span>
                        )}
                        <span className="ml-1 text-xs text-muted">{formatDate(r.round?.race_date)}</span>
                      </td>
                      <td className="text-muted">{SESSION_LABEL[r.session_type]}</td>
                      <td className="num font-bold">
                        {r.dsq ? "DSQ" : r.dnf ? "DNF" : ordinal(r.position)}
                        {poleFl && r.pole && <span className="ml-1 chip text-[9px]">POLE</span>}
                        {poleFl && r.fastest_lap && <span className="ml-1 chip text-[9px]">VR</span>}
                      </td>
                      <td className="num font-extrabold">{r.points || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}

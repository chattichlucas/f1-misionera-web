import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoundResults } from "@/lib/data";
import { PageHero, Panel, PanelTitle, EmptyState } from "@/components/ui";
import { flagEmoji, formatDateTime, ordinal } from "@/lib/format";
import type { SessionType } from "@/lib/types";

export const revalidate = 60;

const SESSION_LABEL: Record<SessionType, string> = {
  qualifying: "Clasificación",
  sprint: "Sprint",
  race: "Carrera",
};
const SESSION_ORDER: SessionType[] = ["qualifying", "sprint", "race"];

export default async function RoundResultPage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round: roundId } = await params;
  const data = await getRoundResults(roundId);
  if (!data) notFound();

  const { round, results } = data;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={`Ronda ${round.round_number} · ${round.category?.name ?? ""}`}
        title={`${flagEmoji(round.circuit?.country_code)} ${round.circuit?.name ?? "Ronda"}`}
      >
        {formatDateTime(round.race_date)}
        {round.is_sprint ? " · Fin de semana Sprint" : ""}
        {"  "}
        <Link href="/resultados" className="ml-2 font-bold text-primary">
          ← Volver
        </Link>
      </PageHero>

      <section className="shell space-y-4">
        {SESSION_ORDER.map((st) => {
          const rows = results
            .filter((r) => r.session_type === st)
            .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
          if (rows.length === 0) return null;
          return (
            <Panel key={st}>
              <PanelTitle title={SESSION_LABEL[st]} />
              <div className="overflow-x-auto">
                <table className="data-table min-w-[560px]">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Piloto</th>
                      <th className="num">Tiempo / Gap</th>
                      <th className="num">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="font-bold">
                          {r.dnf ? "DNF" : r.dsq ? "DSQ" : ordinal(r.position)}
                        </td>
                        <td>
                          <span className="font-semibold">
                            {flagEmoji(r.driver?.country_code)} {r.driver?.name ?? "—"}
                          </span>
                          {r.pole && <span className="ml-2 chip text-[10px]">POLE</span>}
                          {r.fastest_lap && <span className="ml-1 chip text-[10px]">VR</span>}
                        </td>
                        <td className="num text-muted">{r.time_text ?? "—"}</td>
                        <td className="num font-extrabold">{r.points || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          );
        })}

        {results.length === 0 && (
          <Panel>
            <EmptyState>Todavía no se cargaron los resultados de esta ronda.</EmptyState>
          </Panel>
        )}
      </section>
    </div>
  );
}

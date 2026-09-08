import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoundResults } from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { PageHero, Panel, PanelTitle, EmptyState } from "@/components/ui";
import { flagEmoji, formatDateTime, ordinal } from "@/lib/format";
import type { SessionType } from "@/lib/types";

export const revalidate = 60;

const SESSION_ORDER: SessionType[] = ["qualifying", "sprint", "race"];

export default async function RoundResultPage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round: roundId } = await params;
  const [data, d] = await Promise.all([getRoundResults(roundId), getDict()]);
  if (!data) notFound();

  const { round, results } = data;
  const sessionLabel: Record<SessionType, string> = {
    qualifying: d.pages.qualifying,
    sprint: d.common.sprint,
    race: d.pages.race,
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={`${d.common.round} ${round.round_number} · ${round.category?.name ?? ""}`}
        title={`${flagEmoji(round.circuit?.country_code)} ${round.circuit?.name ?? d.common.round}`}
      >
        {formatDateTime(round.race_date)}
        {round.is_sprint ? ` · ${d.common.sprint}` : ""}
        {"  "}
        <Link href="/resultados" className="ml-2 font-bold text-primary">
          ← {d.common.back}
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
              <PanelTitle title={sessionLabel[st]} />
              <div className="overflow-x-auto">
                <table className="data-table min-w-[560px]">
                  <thead>
                    <tr>
                      <th>{d.common.pos}</th>
                      <th>{d.common.driver}</th>
                      <th className="num">{d.common.time}</th>
                      <th className="num">{d.common.points}</th>
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
                          {r.fastest_lap && <span className="ml-1 chip text-[10px]">{d.common.fl}</span>}
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
            <EmptyState>{d.pages.resultsEmpty}</EmptyState>
          </Panel>
        )}
      </section>
    </div>
  );
}

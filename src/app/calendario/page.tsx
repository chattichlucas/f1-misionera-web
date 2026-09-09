import Link from "next/link";
import { getCategories, getRounds } from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji, formatDateTime } from "@/lib/format";

export const revalidate = 60;

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, rounds, d] = await Promise.all([
    getCategories(),
    getRounds(),
    getDict(),
  ]);

  const statusLabel: Record<string, string> = {
    proximo: d.status.upcoming,
    finalizado: d.status.finished,
    cancelado: d.status.cancelled,
  };

  const filtered = cat ? rounds.filter((r) => r.category?.slug === cat) : rounds;

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.pages.calendarTitle} title={d.pages.calendarTitle}>
        {d.pages.calendarSub}
      </PageHero>

      <CategoryTabs
        categories={categories}
        active={cat ?? null}
        basePath="/calendario"
        allLabel={d.common.all}
      />

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>{d.pages.calendarEmpty}</EmptyState>
          </Panel>
        )}
        {filtered.map((r) => (
          <Panel key={r.id} className="flex h-full flex-col p-5 transition hover:border-primary">
            <div className="flex items-start justify-between">
              <span className="text-3xl font-black text-muted">
                {String(r.round_number).padStart(2, "0")}
              </span>
              <span
                className="chip"
                style={{
                  borderColor: r.status === "finalizado" ? "var(--positive)" : "var(--line)",
                }}
              >
                {statusLabel[r.status] ?? r.status}
              </span>
            </div>

            {r.circuit_id ? (
              <Link href={`/circuitos/${r.circuit_id}`} className="mt-3 text-lg font-extrabold hover:text-primary">
                {flagEmoji(r.circuit?.country_code)} {r.circuit?.name ?? "—"}
              </Link>
            ) : (
              <p className="mt-3 text-lg font-extrabold">{flagEmoji(r.circuit?.country_code)} —</p>
            )}

            <p className="text-sm text-muted">
              {r.category?.name}
              {r.is_sprint ? ` · ${d.common.sprint}` : ""}
            </p>
            <p className="mt-1 text-sm">📅 {formatDateTime(r.race_date)}</p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
              {r.circuit_id && (
                <Link href={`/circuitos/${r.circuit_id}`} className="text-primary">
                  Ver circuito →
                </Link>
              )}
              {r.status === "finalizado" && (
                <Link href={`/resultados/${r.id}`} className="text-primary">
                  {d.pages.seeResults} →
                </Link>
              )}
            </div>
          </Panel>
        ))}
      </section>
    </div>
  );
}

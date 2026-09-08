import Link from "next/link";
import { getCategories, getRounds } from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji, formatDate } from "@/lib/format";

export const revalidate = 60;

export default async function ResultadosPage({
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

  const done = rounds
    .filter((r) => r.status === "finalizado")
    .filter((r) => (cat ? r.category?.slug === cat : true))
    .sort((a, b) => b.round_number - a.round_number);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.pages.resultsTitle} title={d.pages.resultsTitle}>
        {d.pages.resultsSub}
      </PageHero>

      <CategoryTabs
        categories={categories}
        active={cat ?? null}
        basePath="/resultados"
        allLabel={d.common.all}
      />

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {done.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>{d.pages.resultsEmpty}</EmptyState>
          </Panel>
        )}
        {done.map((r) => (
          <Link key={r.id} href={`/resultados/${r.id}`}>
            <Panel className="h-full p-5 transition hover:border-primary">
              <p className="text-sm text-muted">
                {d.common.round} {r.round_number} · {r.category?.name}
              </p>
              <p className="mt-1 text-lg font-extrabold">
                {flagEmoji(r.circuit?.country_code)} {r.circuit?.name}
              </p>
              <p className="text-sm text-muted">{formatDate(r.race_date)}</p>
              <span className="mt-3 inline-block text-sm font-bold text-primary">
                {d.pages.seeResults} →
              </span>
            </Panel>
          </Link>
        ))}
      </section>
    </div>
  );
}

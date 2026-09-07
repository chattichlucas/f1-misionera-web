import Link from "next/link";
import { getCategories, getRounds } from "@/lib/data";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji, formatDate } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Resultados" };

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, rounds] = await Promise.all([getCategories(), getRounds()]);

  const done = rounds
    .filter((r) => r.status === "finalizado")
    .filter((r) => (cat ? r.category?.slug === cat : true))
    .sort((a, b) => b.round_number - a.round_number);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Temporada 2026" title="Resultados">
        Qualy y carrera de cada ronda disputada.
      </PageHero>

      <CategoryTabs categories={categories} active={cat ?? null} basePath="/resultados" />

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {done.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>Todavía no hay rondas finalizadas.</EmptyState>
          </Panel>
        )}
        {done.map((r) => (
          <Link key={r.id} href={`/resultados/${r.id}`}>
            <Panel className="h-full p-5 transition hover:border-primary">
              <p className="text-sm text-muted">
                Ronda {r.round_number} · {r.category?.name}
              </p>
              <p className="mt-1 text-lg font-extrabold">
                {flagEmoji(r.circuit?.country_code)} {r.circuit?.name}
              </p>
              <p className="text-sm text-muted">{formatDate(r.race_date)}</p>
              <span className="mt-3 inline-block text-sm font-bold text-primary">Ver resultados →</span>
            </Panel>
          </Link>
        ))}
      </section>
    </div>
  );
}

import Link from "next/link";
import { getCategories, getRounds } from "@/lib/data";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji, formatDateTime } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Calendario" };

const STATUS_LABEL: Record<string, string> = {
  proximo: "Próxima",
  finalizado: "Finalizada",
  cancelado: "Cancelada",
};

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, rounds] = await Promise.all([getCategories(), getRounds()]);

  const filtered = cat
    ? rounds.filter((r) => r.category?.slug === cat)
    : rounds;

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Temporada 2026" title="Calendario">
        Todas las rondas de la temporada. Las fechas finalizadas enlazan a sus resultados.
      </PageHero>

      <CategoryTabs categories={categories} active={cat ?? null} basePath="/calendario" />

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>No hay fechas cargadas todavía.</EmptyState>
          </Panel>
        )}
        {filtered.map((r) => {
          const inner = (
            <Panel className="h-full p-5 transition hover:border-primary">
              <div className="flex items-start justify-between">
                <span className="text-3xl font-black text-muted">
                  {String(r.round_number).padStart(2, "0")}
                </span>
                <span
                  className="chip"
                  style={{
                    borderColor:
                      r.status === "finalizado" ? "var(--positive)" : "var(--line)",
                  }}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </div>
              <p className="mt-3 text-lg font-extrabold">
                {flagEmoji(r.circuit?.country_code)} {r.circuit?.name ?? "A confirmar"}
              </p>
              <p className="text-sm text-muted">
                {r.category?.name}
                {r.is_sprint ? " · Sprint" : ""}
              </p>
              <p className="mt-1 text-sm">📅 {formatDateTime(r.race_date)}</p>
            </Panel>
          );
          return r.status === "finalizado" ? (
            <Link key={r.id} href={`/resultados/${r.id}`}>
              {inner}
            </Link>
          ) : (
            <div key={r.id}>{inner}</div>
          );
        })}
      </section>
    </div>
  );
}

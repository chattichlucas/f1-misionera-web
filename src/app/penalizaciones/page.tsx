import { getPenalties } from "@/lib/data";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { flagEmoji, formatDate } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Penalizaciones" };

export default async function PenalizacionesPage() {
  const penalties = await getPenalties();

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Control deportivo" title="Penalizaciones">
        Sanciones aplicadas por los comisarios durante la temporada.
      </PageHero>

      <section className="shell">
        <Panel>
          {penalties.length === 0 ? (
            <EmptyState>No hay sanciones cargadas.</EmptyState>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
              {penalties.map((p) => (
                <li key={p.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">
                      {p.driver ? `${flagEmoji(p.driver.country_code)} ${p.driver.name} · ` : ""}
                      {p.headline}
                    </p>
                    {p.sanction && (
                      <span className="chip" style={{ borderColor: "var(--negative)" }}>
                        {p.sanction}
                      </span>
                    )}
                  </div>
                  {p.detail && <p className="mt-1 text-sm text-muted">{p.detail}</p>}
                  <p className="mt-1 text-xs text-muted">{formatDate(p.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

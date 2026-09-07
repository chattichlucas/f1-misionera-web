import { getDrivers, getTeams } from "@/lib/data";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { flagEmoji } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Escuderías" };

export default async function EscuderiasPage() {
  const [teams, drivers] = await Promise.all([getTeams(), getDrivers()]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Temporada 2026" title="Escuderías">
        Los constructores de la temporada, con sus colores y pilotos.
      </PageHero>

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>No hay escuderías cargadas todavía.</EmptyState>
          </Panel>
        )}
        {teams.map((t) => {
          const roster = drivers.filter((d) => d.team_id === t.id);
          return (
            <Panel key={t.id} className="overflow-hidden">
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color2})` }}
              />
              <div className="p-5">
                <p className="text-lg font-extrabold">{t.name}</p>
                {t.full_name && <p className="text-sm text-muted">{t.full_name}</p>}
                <ul className="mt-3 space-y-1 text-sm">
                  {roster.length === 0 && <li className="text-muted">Sin pilotos asignados.</li>}
                  {roster.map((d) => (
                    <li key={d.id} className="flex items-center justify-between">
                      <span>
                        {flagEmoji(d.country_code)} {d.name}
                      </span>
                      <span className="text-muted">{d.number != null ? `#${d.number}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          );
        })}
      </section>
    </div>
  );
}

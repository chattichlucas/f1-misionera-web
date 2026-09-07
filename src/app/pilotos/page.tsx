import { getCategories, getDrivers, getTeams } from "@/lib/data";
import { PageHero, Panel, EmptyState, TeamChip } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Pilotos" };

export default async function PilotosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, drivers, teams] = await Promise.all([
    getCategories(),
    getDrivers(),
    getTeams(),
  ]);

  const teamById = new Map(teams.map((t) => [t.id, t]));
  const activeCat = cat ? categories.find((c) => c.slug === cat) : null;
  const filtered = activeCat
    ? drivers.filter((d) => d.category_id === activeCat.id)
    : drivers;

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Temporada 2026" title="Pilotos">
        La parrilla actual con nacionalidad, número y escudería.
      </PageHero>

      <CategoryTabs categories={categories} active={activeCat?.slug ?? null} basePath="/pilotos" />

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>No hay pilotos cargados todavía.</EmptyState>
          </Panel>
        )}
        {filtered.map((d) => {
          const team = d.team_id ? teamById.get(d.team_id) : undefined;
          return (
            <Panel
              key={d.id}
              className="p-5"
              // borde de color del equipo
            >
              <div
                className="h-1 w-12 rounded-full"
                style={{ background: team?.color ?? "var(--primary)" }}
              />
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-lg font-extrabold">
                  {flagEmoji(d.country_code)} {d.name}
                </p>
                {d.number != null && (
                  <span className="text-2xl font-black text-muted">{d.number}</span>
                )}
              </div>
              {d.gamertag && <p className="text-sm text-muted">{d.gamertag}</p>}
              <div className="mt-3 flex items-center justify-between">
                <TeamChip name={team?.name ?? null} color={team?.color} color2={team?.color2} />
                <span className="chip text-[10px] uppercase">{d.seat}</span>
              </div>
            </Panel>
          );
        })}
      </section>
    </div>
  );
}

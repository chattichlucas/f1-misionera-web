import { getCategories, getDrivers, getTeams } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { PageHero, Panel, EmptyState, TeamChip } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji } from "@/lib/format";

export const revalidate = 60;

export default async function PilotosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, drivers, teams, d] = await Promise.all([
    getCategories(),
    getDrivers(),
    getTeams(),
    getDict(),
  ]);

  const teamById = new Map(teams.map((t) => [t.id, t]));
  const activeCat = cat ? categories.find((c) => c.slug === cat) : null;
  const filtered = activeCat
    ? drivers.filter((dr) => dr.category_id === activeCat.id)
    : drivers;

  const seatLabel: Record<string, string> = {
    titular: d.common.titular,
    reserva: d.common.reserve,
  };

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.pages.driversTitle} title={d.pages.driversTitle}>
        {d.pages.driversSub}
      </PageHero>

      <CategoryTabs
        categories={categories}
        active={activeCat?.slug ?? null}
        basePath="/pilotos"
        allLabel={d.common.all}
      />

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <Panel className="sm:col-span-2 lg:col-span-3">
            <EmptyState>{d.pages.driversEmpty}</EmptyState>
          </Panel>
        )}
        {filtered.map((dr) => {
          const team = dr.team_id ? teamById.get(dr.team_id) : undefined;
          return (
            <Panel key={dr.id} className="p-5">
              <div
                className="h-1 w-12 rounded-full"
                style={{ background: team?.color ?? "var(--primary)" }}
              />
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-lg font-extrabold">
                  {flagEmoji(dr.country_code)} {dr.name}
                </p>
                {dr.number != null && (
                  <span className="text-2xl font-black text-muted">{dr.number}</span>
                )}
              </div>
              {dr.gamertag && <p className="text-sm text-muted">{dr.gamertag}</p>}
              <div className="mt-3 flex items-center justify-between">
                <TeamChip name={team?.name ?? null} color={team?.color} color2={team?.color2} />
                <span className="chip text-[10px] uppercase">{seatLabel[dr.seat] ?? dr.seat}</span>
              </div>
            </Panel>
          );
        })}
      </section>
    </div>
  );
}

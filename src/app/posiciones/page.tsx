import { getCategories, getDriverStandings, getTeamStandings } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { PageHero, Panel, PanelTitle, EmptyState, TeamChip } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji } from "@/lib/format";

export const revalidate = 60;

export default async function PosicionesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, d] = await Promise.all([getCategories(), getDict()]);
  const activeCat = cat ? categories.find((c) => c.slug === cat) : categories[0];

  const [drivers, teams] = await Promise.all([
    getDriverStandings(activeCat?.id),
    getTeamStandings(activeCat?.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.pages.standingsTitle} title={d.pages.standingsTitle}>
        {d.pages.standingsSub}
      </PageHero>

      <CategoryTabs
        categories={categories}
        active={activeCat?.slug ?? null}
        basePath="/posiciones"
        allLabel={d.common.all}
      />

      <section className="shell space-y-4">
        <Panel>
          <PanelTitle title={d.home.drivers} hint={activeCat?.name} />
          {drivers.length === 0 ? (
            <EmptyState>{d.home.noResults}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>{d.common.pos}</th>
                    <th>{d.common.driver}</th>
                    <th>{d.common.team}</th>
                    <th className="num">{d.common.points}</th>
                    <th className="num">{d.common.wins}</th>
                    <th className="num">{d.common.podiums}</th>
                    <th className="num">{d.common.poles}</th>
                    <th className="num">{d.common.fl}</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((row, i) => (
                    <tr key={row.driver_id}>
                      <td>
                        <span className={`rank-badge ${i < 3 ? `r${i + 1}` : ""}`}>{i + 1}</span>
                      </td>
                      <td>
                        <span className="font-semibold">
                          {flagEmoji(row.country_code)} {row.name}
                        </span>
                        {row.number != null && (
                          <span className="ml-1 text-xs text-muted">#{row.number}</span>
                        )}
                      </td>
                      <td>
                        <TeamChip name={row.team_name} color={row.team_color} color2={row.team_color2} />
                      </td>
                      <td className="num font-extrabold">{row.points}</td>
                      <td className="num">{row.wins}</td>
                      <td className="num">{row.podiums}</td>
                      <td className="num">{row.poles}</td>
                      <td className="num">{row.fastest_laps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelTitle title={d.home.constructors} />
          {teams.length === 0 ? (
            <EmptyState>{d.home.noResults}</EmptyState>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{d.common.pos}</th>
                  <th>{d.nav.teams}</th>
                  <th className="num">{d.common.points}</th>
                  <th className="num">{d.common.wins}</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t.team_id}>
                    <td>
                      <span className={`rank-badge ${i < 3 ? `r${i + 1}` : ""}`}>{i + 1}</span>
                    </td>
                    <td>
                      <TeamChip name={t.name} color={t.color} color2={t.color2} />
                    </td>
                    <td className="num font-extrabold">{t.points}</td>
                    <td className="num">{t.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>
    </div>
  );
}

import { getCategories, getDriverStandings, getTeamStandings } from "@/lib/data";
import { PageHero, Panel, PanelTitle, EmptyState, TeamChip } from "@/components/ui";
import { CategoryTabs } from "@/components/category-tabs";
import { flagEmoji } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Posiciones" };

export default async function PosicionesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const categories = await getCategories();
  const activeCat = cat ? categories.find((c) => c.slug === cat) : categories[0];

  const [drivers, teams] = await Promise.all([
    getDriverStandings(activeCat?.id),
    getTeamStandings(activeCat?.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Campeonato" title="Posiciones">
        Clasificación de pilotos y constructores{activeCat ? ` · ${activeCat.name}` : ""}.
      </PageHero>

      <CategoryTabs
        categories={categories}
        active={activeCat?.slug ?? null}
        basePath="/posiciones"
      />

      <section className="shell space-y-4">
        <Panel>
          <PanelTitle title="Pilotos" hint={`${drivers.length} pilotos`} />
          {drivers.length === 0 ? (
            <EmptyState>Sin resultados cargados todavía.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Piloto</th>
                    <th>Equipo</th>
                    <th className="num">Pts</th>
                    <th className="num">Vict.</th>
                    <th className="num">Podios</th>
                    <th className="num">Poles</th>
                    <th className="num">VR</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d, i) => (
                    <tr key={d.driver_id}>
                      <td>
                        <span className={`rank-badge ${i < 3 ? `r${i + 1}` : ""}`}>{i + 1}</span>
                      </td>
                      <td>
                        <span className="font-semibold">
                          {flagEmoji(d.country_code)} {d.name}
                        </span>
                        {d.number != null && (
                          <span className="ml-1 text-xs text-muted">#{d.number}</span>
                        )}
                      </td>
                      <td>
                        <TeamChip name={d.team_name} color={d.team_color} color2={d.team_color2} />
                      </td>
                      <td className="num font-extrabold">{d.points}</td>
                      <td className="num">{d.wins}</td>
                      <td className="num">{d.podiums}</td>
                      <td className="num">{d.poles}</td>
                      <td className="num">{d.fastest_laps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelTitle title="Constructores" />
          {teams.length === 0 ? (
            <EmptyState>Sin resultados cargados todavía.</EmptyState>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Escudería</th>
                  <th className="num">Pts</th>
                  <th className="num">Vict.</th>
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

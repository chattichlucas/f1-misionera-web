import Link from "next/link";
import {
  getCategories,
  getDriverStandings,
  getNews,
  getNextRound,
  getSettings,
  getSponsors,
  getTeamStandings,
} from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { Countdown } from "@/components/countdown";
import { SponsorsBlock } from "@/components/sponsors";
import { Panel, PanelTitle, EmptyState, TeamChip } from "@/components/ui";
import { flagEmoji, formatDateTime } from "@/lib/format";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, nextRound, news, categories, sponsors, d] = await Promise.all([
    getSettings(),
    getNextRound(),
    getNews(3),
    getCategories(),
    getSponsors(),
    getDict(),
  ]);

  const firstCat = categories[0];
  const [driverStandings, teamStandings] = await Promise.all([
    getDriverStandings(firstCat?.id),
    getTeamStandings(firstCat?.id),
  ]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="shell grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div
          className="panel relative overflow-hidden p-8 sm:p-10"
          style={
            settings.hero_image_url
              ? {
                  backgroundImage: `linear-gradient(180deg, color-mix(in srgb, var(--bg) 30%, transparent), var(--bg)), url(${settings.hero_image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <p className="eyebrow">{settings.season_label}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {settings.league_name}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{settings.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {settings.twitch_url && (
              <a href={settings.twitch_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                ▶ {d.common.watchStream}
              </a>
            )}
            <Link href="/posiciones" className="btn btn-ghost">
              {d.common.viewChampionship}
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {settings.discord_url && (
              <a href={settings.discord_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">
                Discord
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">
                Instagram
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">
                YouTube
              </a>
            )}
          </div>
        </div>

        <Panel className="p-6">
          <p className="eyebrow">{d.home.nextRace}</p>
          {nextRound ? (
            <>
              <h2 className="mt-1 text-2xl font-extrabold">
                {flagEmoji(nextRound.circuit?.country_code)}{" "}
                {nextRound.circuit?.name ?? d.common.time}
              </h2>
              <p className="text-sm text-muted">
                {d.common.round} {nextRound.round_number}
                {nextRound.category ? ` · ${nextRound.category.name}` : ""}
                {nextRound.is_sprint ? ` · ${d.common.sprint}` : ""}
              </p>
              <p className="mt-1 text-sm">📅 {formatDateTime(nextRound.race_date)}</p>
              <div className="mt-4">
                <Countdown
                  iso={nextRound.race_date}
                  labels={{
                    d: d.common.days,
                    h: d.common.hours,
                    m: d.common.min,
                    s: d.common.sec,
                    live: d.common.inPit,
                  }}
                />
              </div>
              <Link href="/calendario" className="mt-4 inline-block text-sm font-bold text-primary">
                {d.common.seeCalendar} →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">{d.home.noNextDate}</p>
          )}
        </Panel>
      </section>

      {/* NOTICIAS */}
      {news.length > 0 && (
        <section className="shell">
          <Panel>
            <PanelTitle
              title={d.home.latestNews}
              action={
                <Link href="/noticias" className="text-sm font-bold text-primary">
                  {d.common.seeAll} →
                </Link>
              }
            />
            <div className="divide-y" style={{ borderColor: "var(--line)" }}>
              {news.map((n) => (
                <Link
                  key={n.id}
                  href={`/noticias/${n.slug}`}
                  className="block px-5 py-4 hover:bg-[var(--panel-2)]"
                >
                  <p className="text-xs text-muted">{formatDateTime(n.published_at)}</p>
                  <p className="font-bold">{n.title}</p>
                  {n.excerpt && <p className="text-sm text-muted">{n.excerpt}</p>}
                </Link>
              ))}
            </div>
          </Panel>
        </section>
      )}

      {/* STANDINGS */}
      <section className="shell grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle
            title={d.home.drivers}
            hint={firstCat?.name}
            action={
              <Link href="/posiciones" className="text-sm font-bold text-primary">
                {d.common.seeFull} →
              </Link>
            }
          />
          {driverStandings.length === 0 ? (
            <EmptyState>{d.home.noResults}</EmptyState>
          ) : (
            <table className="data-table">
              <tbody>
                {driverStandings.slice(0, 6).map((row, i) => (
                  <tr key={row.driver_id}>
                    <td className="w-8 font-bold text-muted">{i + 1}</td>
                    <td>
                      <span className="font-semibold">
                        {flagEmoji(row.country_code)} {row.name}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <TeamChip name={row.team_name} color={row.team_color} color2={row.team_color2} />
                    </td>
                    <td className="num font-extrabold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel>
          <PanelTitle title={d.home.constructors} hint={firstCat?.name} />
          {teamStandings.length === 0 ? (
            <EmptyState>{d.home.noResults}</EmptyState>
          ) : (
            <table className="data-table">
              <tbody>
                {teamStandings.slice(0, 6).map((t, i) => (
                  <tr key={t.team_id}>
                    <td className="w-8 font-bold text-muted">{i + 1}</td>
                    <td>
                      <TeamChip name={t.name} color={t.color} color2={t.color2} />
                    </td>
                    <td className="num font-extrabold">{t.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className="shell">
          <SponsorsBlock sponsors={sponsors} title={d.pages.sponsors} />
        </section>
      )}

      {/* CATEGORIAS / CTA */}
      <section className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Panel key={c.id} className="p-5">
            <p className="eyebrow">{d.home.category}</p>
            <p className="text-lg font-extrabold">{c.name}</p>
            <p className="text-sm text-muted">
              {[c.weekday, c.time_text].filter(Boolean).join(" · ") || d.home.timeTbd}
            </p>
          </Panel>
        ))}
        <Panel className="flex flex-col justify-between p-5">
          <div>
            <p className="eyebrow">{d.home.join}</p>
            <p className="text-lg font-extrabold">{d.home.registration}</p>
            <p className="text-sm text-muted">
              {settings.inscriptions_open ? d.home.open : d.home.closed}
            </p>
          </div>
          <Link href="/inscripciones" className="btn btn-primary mt-4">
            {d.home.register}
          </Link>
        </Panel>
      </section>
    </div>
  );
}

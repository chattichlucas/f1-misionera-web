import Link from "next/link";
import { getNews } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export const revalidate = 60;

export default async function NoticiasPage() {
  const [news, d] = await Promise.all([getNews(), getDict()]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.home.latestNews} title={d.pages.newsTitle} />

      <section className="shell">
        <Panel>
          {news.length === 0 ? (
            <EmptyState>{d.pages.newsEmpty}</EmptyState>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
              {news.map((n) => (
                <li key={n.id}>
                  <Link href={`/noticias/${n.slug}`} className="block px-5 py-4 hover:bg-[var(--panel-2)]">
                    <p className="text-xs text-muted">{formatDateTime(n.published_at)}</p>
                    <p className="font-bold">{n.title}</p>
                    {n.excerpt && <p className="text-sm text-muted">{n.excerpt}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

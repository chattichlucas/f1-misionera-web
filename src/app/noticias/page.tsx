import Link from "next/link";
import { getNews } from "@/lib/data";
import { PageHero, Panel, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "Noticias" };

export default async function NoticiasPage() {
  const news = await getNews();

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Comunidad" title="Noticias" />

      <section className="shell">
        <Panel>
          {news.length === 0 ? (
            <EmptyState>No hay noticias publicadas.</EmptyState>
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

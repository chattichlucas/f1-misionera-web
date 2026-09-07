import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsBySlug } from "@/lib/data";
import { PageHero } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export const revalidate = 60;

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n || !n.published) notFound();

  return (
    <div className="space-y-6">
      <PageHero eyebrow={formatDateTime(n.published_at)} title={n.title} />
      <article className="shell">
        <div className="panel p-6 sm:p-8">
          {n.excerpt && <p className="text-lg text-muted">{n.excerpt}</p>}
          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{n.body}</div>
          <Link href="/noticias" className="mt-6 inline-block text-sm font-bold text-primary">
            ← Todas las noticias
          </Link>
        </div>
      </article>
    </div>
  );
}

import { getRegulation } from "@/lib/data";
import { PageHero, Panel, EmptyState } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Reglamento" };

export default async function ReglamentoPage() {
  const sections = await getRegulation();

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Temporada 2026" title="Reglamento oficial">
        Normativa deportiva y de conducta de la liga.
      </PageHero>

      <section className="shell space-y-4">
        {sections.length === 0 && (
          <Panel>
            <EmptyState>El reglamento todavía no fue publicado.</EmptyState>
          </Panel>
        )}
        {sections.map((s) => (
          <Panel key={s.id} className="p-6">
            <h2 className="text-lg font-extrabold">{s.heading}</h2>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {s.body}
            </div>
          </Panel>
        ))}
      </section>
    </div>
  );
}

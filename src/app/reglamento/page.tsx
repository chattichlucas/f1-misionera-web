import { getRegulation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { PageHero, Panel, EmptyState } from "@/components/ui";

export const revalidate = 60;

export default async function ReglamentoPage() {
  const [sections, d] = await Promise.all([getRegulation(), getDict()]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.nav.regulation} title={d.pages.regulationTitle}>
        {d.pages.regulationSub}
      </PageHero>

      <section className="shell space-y-4">
        {sections.length === 0 && (
          <Panel>
            <EmptyState>{d.pages.regulationEmpty}</EmptyState>
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

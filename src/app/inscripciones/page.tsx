import { getCategories, getSettings } from "@/lib/data";
import { PageHero } from "@/components/ui";
import { InscriptionForm } from "./form";

export const metadata = { title: "Inscripciones" };

export default async function InscripcionesPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Sumate"
        title="Inscripciones"
      >
        Completá el formulario para pedir tu lugar en la parrilla. La organización te
        contacta por Discord.
      </PageHero>

      <section className="shell">
        <InscriptionForm categories={categories} open={settings.inscriptions_open} />
      </section>
    </div>
  );
}

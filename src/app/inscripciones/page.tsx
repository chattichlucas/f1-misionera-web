import { getCategories, getSettings } from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { PageHero } from "@/components/ui";
import { InscriptionForm } from "./form";

export default async function InscripcionesPage() {
  const [categories, settings, d] = await Promise.all([
    getCategories(),
    getSettings(),
    getDict(),
  ]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.home.join} title={d.pages.registrationTitle}>
        {d.pages.registrationSub}
      </PageHero>

      <section className="shell">
        <InscriptionForm
          categories={categories}
          open={settings.inscriptions_open}
          paymentInfo={settings.payment_info}
        />
      </section>
    </div>
  );
}

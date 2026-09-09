import { getSettings } from "@/lib/data";
import { getDict } from "@/lib/i18n-server";
import { PageHero } from "@/components/ui";
import { InscriptionForm } from "./form";

export default async function InscripcionesPage() {
  const [settings, d] = await Promise.all([getSettings(), getDict()]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={d.home.join} title={d.pages.registrationTitle}>
        {d.pages.registrationSub}
      </PageHero>

      <section className="shell">
        <InscriptionForm
          open={settings.inscriptions_open}
          payment={{
            amount: settings.payment_amount,
            alias: settings.payment_alias,
            holder: settings.payment_holder,
          }}
        />
      </section>
    </div>
  );
}

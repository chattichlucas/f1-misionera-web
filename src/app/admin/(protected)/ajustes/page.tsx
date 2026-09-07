import { getSettings } from "@/lib/data";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Ajustes del sitio</h1>
      <p className="text-sm text-muted">
        Marca, colores, redes y esquema de puntos. Los cambios se ven al instante en el sitio.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}

import { getSettings } from "@/lib/data";
import { getMyPermissions, canEdit } from "@/lib/permissions";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const mp = await getMyPermissions();
  if (!canEdit(mp, "settings")) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">Ajustes del sitio</h1>
        <p className="mt-2 text-sm text-muted">Necesitás permiso de edición en este módulo.</p>
      </div>
    );
  }
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

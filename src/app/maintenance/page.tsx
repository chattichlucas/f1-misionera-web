import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "En mantenimiento" };

export default async function MaintenancePage() {
  const s = await getSettings();
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="panel max-w-md p-8">
        <p className="eyebrow">{s.league_name}</p>
        <h1 className="mt-2 text-3xl font-extrabold">Sitio en mantenimiento</h1>
        <p className="mt-3 text-muted">
          {s.maintenance_message?.trim() ||
            "Estamos actualizando el sitio. Volvé en un rato."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
          {s.discord_url && (
            <a href={s.discord_url} target="_blank" rel="noopener noreferrer" className="chip hover:border-primary">
              Discord
            </a>
          )}
          {s.instagram_url && (
            <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="chip hover:border-primary">
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

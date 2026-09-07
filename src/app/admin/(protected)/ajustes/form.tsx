"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveSettings, type ActionResult } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";

const input = "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm outline-none border";
const st = { borderColor: "var(--line)" } as const;

function Text({ name, label, def, help }: { name: string; label: string; def: string | null; help?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <input name={name} defaultValue={def ?? ""} className={input} style={st} />
      {help && <span className="mt-1 block text-xs text-muted">{help}</span>}
    </label>
  );
}

function Color({ name, label, def }: { name: string; label: string; def: string }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="font-semibold">{label}</span>
      <input type="color" name={name} defaultValue={def} className="h-9 w-16 rounded border bg-transparent" style={st} />
    </label>
  );
}

export function SettingsForm({ settings: s }: { settings: SiteSettings }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSettings, {});

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-6">
      <div className="panel space-y-4 p-5">
        <h2 className="font-bold">Marca</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="league_name" label="Nombre de la liga" def={s.league_name} />
          <Text name="season_label" label="Etiqueta de temporada" def={s.season_label} help="ej: Temporada 2026 · Cat. A" />
          <Text name="tagline" label="Lema / descripción" def={s.tagline} />
          <Text name="logo_url" label="Logo (URL)" def={s.logo_url} />
          <Text name="hero_image_url" label="Imagen de portada (URL)" def={s.hero_image_url} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="inscriptions_open" defaultChecked={s.inscriptions_open} className="h-5 w-5" />
          Inscripciones abiertas
        </label>
      </div>

      <div className="panel space-y-4 p-5">
        <h2 className="font-bold">Colores</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Color name="color_primary" label="Primario" def={s.color_primary} />
          <Color name="color_primary_fg" label="Texto sobre primario" def={s.color_primary_fg} />
          <Color name="color_accent" label="Acento" def={s.color_accent} />
          <Color name="color_bg" label="Fondo" def={s.color_bg} />
          <Color name="color_panel" label="Panel" def={s.color_panel} />
          <Color name="color_panel_2" label="Panel 2" def={s.color_panel_2} />
          <Color name="color_line" label="Líneas / bordes" def={s.color_line} />
          <Color name="color_text" label="Texto" def={s.color_text} />
          <Color name="color_muted" label="Texto tenue" def={s.color_muted} />
          <Color name="color_positive" label="Positivo" def={s.color_positive} />
          <Color name="color_negative" label="Negativo" def={s.color_negative} />
        </div>
      </div>

      <div className="panel space-y-4 p-5">
        <h2 className="font-bold">Redes y contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="discord_url" label="Discord" def={s.discord_url} />
          <Text name="instagram_url" label="Instagram" def={s.instagram_url} />
          <Text name="youtube_url" label="YouTube" def={s.youtube_url} />
          <Text name="twitch_url" label="Twitch" def={s.twitch_url} />
          <Text name="tiktok_url" label="TikTok" def={s.tiktok_url} />
          <Text name="contact_email" label="Email de contacto" def={s.contact_email} />
        </div>
      </div>

      <div className="panel space-y-3 p-5">
        <h2 className="font-bold">Esquema de puntos</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">JSON</span>
          <textarea
            name="points_scheme"
            rows={4}
            defaultValue={JSON.stringify(s.points_scheme)}
            className={input}
            style={st}
          />
          <span className="mt-1 block text-xs text-muted">
            Referencia para cargar puntos en el panel de resultados. No recalcula resultados ya cargados.
          </span>
        </label>
      </div>

      {state.error && <p className="text-sm font-semibold text-negative">{state.error}</p>}
      {state.ok && <p className="text-sm font-semibold text-positive">Guardado.</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

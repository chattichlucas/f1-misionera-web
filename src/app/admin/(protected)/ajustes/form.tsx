"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveSettings, type ActionResult } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { ColorInput } from "@/components/admin/color-input";
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
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="font-semibold">{label}</span>
      <ColorInput name={name} defaultValue={def} />
    </div>
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-semibold">Logo</span>
            <ImageUpload
              name="logo_url"
              value={s.logo_url}
              folder="brand"
              maxWidth={320}
              maxKB={150}
              hint="PNG transparente o SVG. Recomendado < 100 KB."
            />
          </div>
          <div>
            <span className="mb-1 block text-sm font-semibold">Imagen de portada</span>
            <ImageUpload
              name="hero_image_url"
              value={s.hero_image_url}
              folder="brand"
              maxWidth={1920}
              maxKB={500}
              hint="Foto de fondo del inicio. WebP/JPG, recomendado < 400 KB."
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="inscriptions_open" defaultChecked={s.inscriptions_open} className="h-5 w-5" />
          Inscripciones abiertas
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Datos para el pago de la inscripción</span>
          <textarea
            name="payment_info"
            rows={3}
            defaultValue={s.payment_info ?? ""}
            className={input}
            style={st}
            placeholder={"Transferí $X a:\nAlias: mi.liga.f1\nCVU: 0000...\nTitular: Nombre Apellido"}
          />
          <span className="mt-1 block text-xs text-muted">
            Se muestra en el formulario de inscripción, arriba de la subida del comprobante.
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Idioma por defecto</span>
          <select
            name="default_locale"
            defaultValue={s.default_locale}
            className={input}
            style={st}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </label>
      </div>

      <div className="panel space-y-3 p-5">
        <h2 className="font-bold">Funciones</h2>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="pole_fl_enabled" defaultChecked={s.pole_fl_enabled} className="h-5 w-5" />
          Pole position y vuelta rápida
        </label>
        <p className="text-xs text-muted">
          Si lo apagás, se ocultan los checkboxes de Pole/VR en Resultados y las columnas
          Poles/VR en Posiciones, y no suman puntos.
        </p>
        <label className="flex items-center gap-2 pt-2 text-sm font-semibold">
          <input type="checkbox" name="recalc_enabled" defaultChecked={s.recalc_enabled} className="h-5 w-5" />
          Recálculo de carrera por tiempo + penalizaciones
        </label>
        <p className="text-xs text-muted">
          Habilita el menú &quot;Recalcular carrera&quot; y los campos de tiempo total y
          penalización en segundos.
        </p>
      </div>

      <div className="panel space-y-3 p-5">
        <h2 className="font-bold">Modo mantenimiento</h2>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="maintenance_mode" defaultChecked={s.maintenance_mode} className="h-5 w-5" />
          Sitio en mantenimiento (el público ve un aviso; el panel sigue accesible)
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Mensaje</span>
          <textarea
            name="maintenance_message"
            rows={2}
            defaultValue={s.maintenance_message ?? ""}
            className={input}
            style={st}
            placeholder="Volvemos pronto. Estamos actualizando el sitio."
          />
        </label>
      </div>

      <div className="panel space-y-4 p-5">
        <h2 className="font-bold">Colores</h2>
        <div className="grid gap-3 sm:grid-cols-2">
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

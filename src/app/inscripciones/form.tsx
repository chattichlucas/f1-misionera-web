"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitInscription, type InscriptionState } from "./actions";
import type { Category } from "@/lib/types";

const field =
  "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2.5 text-sm outline-none border";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Enviando…" : "Enviar inscripción"}
    </button>
  );
}

export function InscriptionForm({
  categories,
  open,
}: {
  categories: Category[];
  open: boolean;
}) {
  const [state, action] = useActionState<InscriptionState, FormData>(submitInscription, {});

  if (state.ok) {
    return (
      <div className="panel p-6 text-sm">
        <p className="text-base font-extrabold text-positive">¡Inscripción enviada!</p>
        <p className="mt-1 text-muted">
          La organización va a revisar tu solicitud y te va a contactar por Discord.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="panel space-y-4 p-6">
      {!open && (
        <p className="chip" style={{ borderColor: "var(--negative)" }}>
          Inscripciones cerradas — podés dejar tus datos igual para la lista de espera.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Nombre y apellido *</span>
          <input name="full_name" required className={field} style={{ borderColor: "var(--line)" }} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Gamertag / usuario *</span>
          <input name="gamertag" required className={field} style={{ borderColor: "var(--line)" }} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Nacionalidad</span>
          <input name="nationality" className={field} style={{ borderColor: "var(--line)" }} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Número preferido</span>
          <input name="number_pref" type="number" min={1} max={99} className={field} style={{ borderColor: "var(--line)" }} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Categoría</span>
          <select
            name="category_id"
            className={field}
            style={{ borderColor: "var(--line)" }}
            defaultValue=""
          >
            <option value="">Sin preferencia</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Plataforma</span>
          <select name="platform" className={field} style={{ borderColor: "var(--line)" }} defaultValue="PC">
            <option>PC</option>
            <option>PS5</option>
            <option>Xbox</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Discord</span>
          <input name="discord" className={field} style={{ borderColor: "var(--line)" }} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Experiencia previa</span>
          <input name="experience" className={field} style={{ borderColor: "var(--line)" }} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Notas</span>
        <textarea name="notes" rows={3} className={field} style={{ borderColor: "var(--line)" }} />
      </label>

      {state.error && (
        <p className="text-sm font-semibold text-negative">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitInscription, type InscriptionState } from "./actions";
import type { Category } from "@/lib/types";

const field =
  "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2.5 text-sm outline-none border";
const line = { borderColor: "var(--line)" } as const;

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
  payment,
}: {
  categories: Category[];
  open: boolean;
  payment: { amount: string | null; alias: string | null; holder: string | null };
}) {
  const hasPayment = Boolean(payment.alias || payment.holder || payment.amount);
  const [state, action] = useActionState<InscriptionState, FormData>(submitInscription, {});

  if (state.ok) {
    return (
      <div className="panel p-6 text-sm">
        <p className="text-base font-extrabold text-positive">¡Inscripción enviada!</p>
        <p className="mt-1 text-muted">
          La organización va a revisar tu solicitud y el comprobante, y te va a contactar por Discord.
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
          <input name="full_name" required className={field} style={line} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Gamertag / usuario *</span>
          <input name="gamertag" required className={field} style={line} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Nacionalidad</span>
          <input name="nationality" className={field} style={line} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Número preferido</span>
          <input name="number_pref" type="number" min={1} max={99} className={field} style={line} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Categoría</span>
          <select name="category_id" className={field} style={line} defaultValue="">
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
          <select name="platform" className={field} style={line} defaultValue="PC">
            <option>PC</option>
            <option>PS5</option>
            <option>Xbox</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Discord</span>
          <input name="discord" className={field} style={line} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Experiencia previa</span>
          <input name="experience" className={field} style={line} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Notas</span>
        <textarea name="notes" rows={3} className={field} style={line} />
      </label>

      {/* --- PAGO --- */}
      <div className="rounded-xl p-4" style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}>
        <p className="text-sm font-extrabold">Pago de la inscripción</p>
        {hasPayment && (
          <div className="mt-2 rounded-lg p-3 text-sm" style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
              Datos para transferir el monto de la inscripción
            </p>
            <dl className="space-y-1">
              {payment.amount && (
                <div className="flex gap-2">
                  <dt className="font-semibold">Monto:</dt>
                  <dd className="text-muted">{payment.amount}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="font-semibold">ALIAS/CVU:</dt>
                <dd className="text-muted">{payment.alias || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Nombre del titular de la cuenta:</dt>
                <dd className="text-muted">{payment.holder || "—"}</dd>
              </div>
            </dl>
          </div>
        )}
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-semibold">Comprobante de transferencia (imagen o PDF, máx 5 MB)</span>
          <input
            type="file"
            name="payment_proof"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--panel)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text"
          />
        </label>
      </div>

      {state.error && (
        <p className="text-sm font-semibold text-negative">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}

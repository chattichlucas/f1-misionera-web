"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Field, Resource } from "@/lib/admin/resources";
import { ImageUpload } from "@/components/admin/image-upload";
import { ColorInput } from "@/components/admin/color-input";
import { formatDuration } from "@/lib/format";

type Row = Record<string, unknown>;
type RefOptions = Record<string, { id: string; label: string }[]>;

const inputCls =
  "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm outline-none border";
const inputStyle = { borderColor: "var(--line)" } as const;

function toDatetimeLocal(value: unknown): string {
  if (!value || typeof value !== "string") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function FieldInput({
  field,
  value,
  refOptions,
}: {
  field: Field;
  value: unknown;
  refOptions: RefOptions;
}) {
  const common = { name: field.name, className: inputCls, style: inputStyle };
  const v = value ?? field.defaultValue ?? "";

  switch (field.type) {
    case "textarea":
      return <textarea {...common} rows={4} defaultValue={String(v ?? "")} />;
    case "number":
      return <input {...common} type="number" step="any" defaultValue={v === null ? "" : String(v)} />;
    case "duration":
      return (
        <input
          {...common}
          type="text"
          placeholder="h:mm:ss.mmm"
          defaultValue={typeof v === "number" ? formatDuration(v) : String(v ?? "")}
        />
      );
    case "boolean":
      return (
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(value ?? field.defaultValue)}
          className="h-5 w-5"
        />
      );
    case "datetime":
      return <input {...common} type="datetime-local" defaultValue={toDatetimeLocal(value)} />;
    case "color":
      return <ColorInput name={field.name} defaultValue={String(v || "#888888")} />;
    case "select":
      return (
        <select {...common} defaultValue={String(v ?? "")}>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "reference":
      return (
        <select {...common} defaultValue={String(value ?? "")}>
          <option value="">—</option>
          {(refOptions[field.name] ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "image":
      return (
        <ImageUpload
          name={field.name}
          value={value ? String(value) : ""}
          folder={field.folder}
          maxWidth={field.maxWidth}
          maxKB={field.maxKB}
          hint={field.help}
        />
      );
    default:
      return <input {...common} type="text" defaultValue={String(v ?? "")} />;
  }
}

function display(field: Field, value: unknown, refOptions: RefOptions): string {
  if (value == null || value === "") return "—";
  if (field.type === "boolean") return value ? "Sí" : "No";
  if (field.type === "reference") {
    return refOptions[field.name]?.find((o) => o.id === value)?.label ?? String(value);
  }
  if (field.type === "datetime") return new Date(String(value)).toLocaleString("es-AR");
  if (field.type === "duration") return formatDuration(Number(value));
  return String(value);
}

export function ResourceManager({
  resource,
  rows,
  refOptions,
  readOnly = false,
}: {
  resource: Resource;
  rows: Row[];
  refOptions: RefOptions;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldByName = new Map(resource.fields.map((f) => [f.name, f]));
  const hasSlug = resource.fields.some((f) => f.name === "slug");

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function onFormInput(e: React.FormEvent<HTMLFormElement>) {
    if (!hasSlug) return;
    const t = e.target as HTMLInputElement;
    if (t.name === "slug") {
      t.dataset.touched = "1";
      return;
    }
    if (t.name === "name") {
      const slug = e.currentTarget.querySelector<HTMLInputElement>('input[name="slug"]');
      if (slug && !slug.dataset.touched) slug.value = slugify(t.value);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    // checkboxes ausentes -> asegurar clave
    for (const f of resource.fields) {
      if (f.type === "boolean" && !fd.has(f.name)) fd.set(f.name, "");
    }
    const res = await saveResource({}, fd);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    const fd = new FormData();
    fd.set("__resource", resource.key);
    fd.set("__id", id);
    const res = await deleteResource({}, fd);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{resource.label}</h1>
          <p className="text-sm text-muted">
            {rows.length} registros{readOnly && " · solo lectura"}
          </p>
        </div>
        {!editing && !readOnly && (
          <button className="btn btn-primary" onClick={() => setEditing({})}>
            + Nuevo
          </button>
        )}
      </div>

      {error && (
        <p className="panel border-negative p-3 text-sm font-semibold text-negative">{error}</p>
      )}

      {editing && (
        <form onSubmit={onSubmit} onInput={onFormInput} className="panel space-y-4 p-5">
          <input type="hidden" name="__resource" value={resource.key} />
          {editing.id ? <input type="hidden" name="__id" value={String(editing.id)} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {resource.fields.map((f) => (
              <label
                key={f.name}
                className={
                  f.type === "textarea" || f.type === "image"
                    ? "block text-sm sm:col-span-2"
                    : "block text-sm"
                }
              >
                <span className="mb-1 block font-semibold">
                  {f.label}
                  {f.required && <span className="text-primary"> *</span>}
                </span>
                <FieldInput field={f} value={editing[f.name]} refOptions={refOptions} />
                {f.help && f.type !== "image" && (
                  <span className="mt-1 block text-xs text-muted">{f.help}</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="panel overflow-x-auto">
        <table className="data-table min-w-[560px]">
          <thead>
            <tr>
              {resource.listColumns.map((c) => (
                <th key={c}>{fieldByName.get(c)?.label ?? c}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={resource.listColumns.length + 1} className="text-center text-muted">
                  Sin registros.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={String(row.id)}>
                {resource.listColumns.map((c) => (
                  <td key={c}>{display(fieldByName.get(c) ?? { name: c, label: c, type: "text" }, row[c], refOptions)}</td>
                ))}
                <td className="num whitespace-nowrap">
                  {readOnly ? (
                    <span className="text-sm text-muted">—</span>
                  ) : (
                    <>
                      <button className="text-sm font-semibold text-primary" onClick={() => setEditing(row)}>
                        Editar
                      </button>
                      <button
                        className="ml-3 text-sm font-semibold text-muted hover:text-negative"
                        onClick={() => onDelete(String(row.id))}
                      >
                        Borrar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

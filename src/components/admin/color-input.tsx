"use client";

import { useState } from "react";

function normalize(v: string): string {
  let s = v.trim();
  if (s && !s.startsWith("#")) s = "#" + s;
  return s.toLowerCase();
}
const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

export function ColorInput({
  name,
  defaultValue = "#888888",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || "#888888");
  const valid = isHex(value);
  const swatch = valid ? value : "#888888";

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={value} />
      <input
        type="color"
        value={swatch}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-12 shrink-0 rounded border bg-transparent"
        style={{ borderColor: "var(--line)" }}
        aria-label={`${name} selector`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(normalize(e.target.value))}
        spellCheck={false}
        placeholder="#ff3b00"
        className="w-28 rounded-lg bg-[var(--panel-2)] px-2 py-1.5 text-sm outline-none border"
        style={{ borderColor: valid ? "var(--line)" : "var(--negative)" }}
        aria-label={`${name} hex`}
      />
    </div>
  );
}

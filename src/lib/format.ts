const TZ = "America/Argentina/Buenos_Aires";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "A definir";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "A definir";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "A definir";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "A definir";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

export function formatWeekday(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: TZ }).format(d);
}

/** Emoji bandera desde ISO alpha-2 ("ar" -> 🇦🇷). */
export function flagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🏁";
  const cc = code.toUpperCase();
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (cc.charCodeAt(0) - 65),
    A + (cc.charCodeAt(1) - 65),
  );
}

export function ordinal(n: number | null | undefined): string {
  if (n == null) return "–";
  return `${n}º`;
}

export function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

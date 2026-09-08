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

// Argentina no usa horario de verano desde 2009 → offset fijo -03:00.
const ARG_OFFSET_MS = 3 * 3600 * 1000;

/** instante ISO → "YYYY-MM-DDTHH:mm" en hora de Argentina (para <input datetime-local>). */
export function argDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - ARG_OFFSET_MS).toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" (hora de Argentina) → instante ISO UTC. */
export function argLocalToISO(s: string | null | undefined): string | null {
  if (!s) return null;
  const withSec = s.length === 16 ? `${s}:00` : s;
  const d = new Date(`${withSec}-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function ordinal(n: number | null | undefined): string {
  if (n == null) return "–";
  return `${n}º`;
}

export function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

/** "1:32:04.551" | "1:04.551" | "64.5" -> milisegundos. Devuelve null si no parsea. */
export function parseDuration(input: string | null | undefined): number | null {
  if (!input) return null;
  const s = String(input).trim().replace(",", ".");
  if (!s) return null;
  const m = s.match(/^(?:(\d+):)?(?:(\d{1,2}):)?(\d{1,2}(?:\.\d{1,3})?)$/);
  if (!m) return null;
  let h = 0, min = 0, sec = 0;
  if (m[1] != null && m[2] != null) {
    h = Number(m[1]); min = Number(m[2]); sec = Number(m[3]);
  } else if (m[2] != null) {
    min = Number(m[2]); sec = Number(m[3]);
  } else if (m[1] != null) {
    min = Number(m[1]); sec = Number(m[3]);
  } else {
    sec = Number(m[3]);
  }
  return Math.round((h * 3600 + min * 60 + sec) * 1000);
}

/** milisegundos -> "1:32:04.551" */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3600000);
  const min = Math.floor((total % 3600000) / 60000);
  const sec = Math.floor((total % 60000) / 1000);
  const mmm = total % 1000;
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const body = `${pad(min)}:${pad(sec)}.${pad(mmm, 3)}`;
  return h > 0 ? `${h}:${body}` : body;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "datetime"
  | "color"
  | "select"
  | "reference"
  | "image"
  | "duration";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // para select
  refTable?: string; // para reference
  refLabel?: string; // columna a mostrar del refTable
  help?: string;
  defaultValue?: string | number | boolean;
  // para image:
  folder?: string;
  maxWidth?: number;
  maxKB?: number;
  /** el campo solo se muestra si esta función está habilitada en Ajustes */
  feature?: "recalc" | "pole_fl";
};

export type Resource = {
  key: string;
  label: string;
  table: string;
  /** columnas a mostrar en la tabla (subset de field names) */
  listColumns: string[];
  /** orden por defecto */
  orderBy?: { column: string; ascending?: boolean };
  fields: Field[];
};

export const RESOURCES: Record<string, Resource> = {
  seasons: {
    key: "seasons",
    label: "Temporadas",
    table: "seasons",
    listColumns: ["name", "year", "is_active"],
    orderBy: { column: "year", ascending: false },
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "year", label: "Año", type: "number", required: true },
      { name: "is_active", label: "Activa", type: "boolean" },
    ],
  },

  categories: {
    key: "categories",
    label: "Categorías",
    table: "categories",
    listColumns: ["name", "slug", "weekday", "time_text", "sort"],
    orderBy: { column: "sort" },
    fields: [
      { name: "season_id", label: "Temporada", type: "reference", refTable: "seasons", refLabel: "name", required: true },
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "slug", label: "Slug (etiqueta para la URL)", type: "text", required: true,
        help: "Se completa solo desde el nombre. Minúsculas sin espacios: a, b, masters…" },
      { name: "weekday", label: "Día", type: "text", help: "ej: Miércoles" },
      { name: "time_text", label: "Horario", type: "text", help: "ej: 22:00 ARG" },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "sort", label: "Orden", type: "number", defaultValue: 0 },
    ],
  },

  teams: {
    key: "teams",
    label: "Escuderías",
    table: "teams",
    listColumns: ["name", "slug", "color", "sort"],
    orderBy: { column: "sort" },
    fields: [
      { name: "season_id", label: "Temporada", type: "reference", refTable: "seasons", refLabel: "name", required: true },
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "full_name", label: "Nombre completo", type: "text" },
      { name: "car_name", label: "Auto", type: "text" },
      { name: "color", label: "Color principal", type: "color", defaultValue: "#ff6500" },
      { name: "color2", label: "Color secundario", type: "color", defaultValue: "#222222" },
      { name: "logo_url", label: "Logo", type: "image", folder: "teams", maxWidth: 320, maxKB: 200,
        help: "PNG con fondo transparente o SVG. Recomendado < 100 KB." },
      { name: "sort", label: "Orden", type: "number", defaultValue: 0 },
    ],
  },

  circuits: {
    key: "circuits",
    label: "Circuitos",
    table: "circuits",
    listColumns: ["name", "country", "country_code"],
    orderBy: { column: "name" },
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "country", label: "País", type: "text" },
      { name: "country_code", label: "Código país (ISO-2)", type: "text", help: "ej: ar, br, it — dibuja la bandera" },
      { name: "map_url", label: "Mapa del trazado", type: "image", folder: "circuits", maxWidth: 800, maxKB: 250 },
      { name: "length_km", label: "Longitud (km)", type: "number" },
      { name: "laps", label: "Vueltas", type: "number" },
    ],
  },

  drivers: {
    key: "drivers",
    label: "Pilotos",
    table: "drivers",
    listColumns: ["name", "number", "gamertag", "seat", "sort"],
    orderBy: { column: "sort" },
    fields: [
      { name: "category_id", label: "Categoría", type: "reference", refTable: "categories", refLabel: "name", required: true },
      { name: "team_id", label: "Escudería", type: "reference", refTable: "teams", refLabel: "name" },
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "nationality", label: "Nacionalidad", type: "text" },
      { name: "country_code", label: "Código país (ISO-2)", type: "text", help: "ej: ar" },
      { name: "number", label: "Número", type: "number",
        help: "Único por categoría. No se pueden usar los reservados (Ajustes del sitio)." },
      { name: "gamertag", label: "Gamertag", type: "text" },
      { name: "seat", label: "Butaca", type: "select", options: ["titular", "reserva"], defaultValue: "titular" },
      { name: "photo_url", label: "Foto", type: "image", folder: "drivers", maxWidth: 480, maxKB: 150 },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "sort", label: "Orden", type: "number", defaultValue: 0 },
    ],
  },

  rounds: {
    key: "rounds",
    label: "Fechas / Calendario",
    table: "rounds",
    listColumns: ["round_number", "race_date", "status", "is_sprint"],
    orderBy: { column: "round_number" },
    fields: [
      { name: "category_id", label: "Categoría", type: "reference", refTable: "categories", refLabel: "name", required: true },
      { name: "circuit_id", label: "Circuito", type: "reference", refTable: "circuits", refLabel: "name" },
      { name: "round_number", label: "Ronda N°", type: "number", required: true },
      { name: "race_date", label: "Fecha y hora", type: "datetime" },
      { name: "is_sprint", label: "Sprint", type: "boolean" },
      { name: "status", label: "Estado", type: "select", options: ["proximo", "finalizado", "cancelado"], defaultValue: "proximo" },
      { name: "notes", label: "Notas", type: "textarea" },
    ],
  },

  session_results: {
    key: "session_results",
    label: "Resultados",
    table: "session_results",
    listColumns: ["session_type", "position", "points"],
    orderBy: { column: "position" },
    fields: [
      { name: "round_id", label: "Fecha", type: "reference", refTable: "rounds", refLabel: "round_number", required: true },
      { name: "driver_id", label: "Piloto", type: "reference", refTable: "drivers", refLabel: "name", required: true },
      { name: "session_type", label: "Sesión", type: "select", options: ["race", "qualifying", "sprint"], defaultValue: "race" },
      { name: "position", label: "Posición", type: "number" },
      { name: "points", label: "Puntos", type: "number", defaultValue: 0 },
      { name: "grid", label: "Grilla", type: "number" },
      { name: "finish_ms", label: "Tiempo total de carrera", type: "duration", feature: "recalc",
        help: "h:mm:ss.mmm (ej: 1:32:04.551). Necesario para recalcular con penalizaciones." },
      { name: "time_text", label: "Tiempo / Gap (texto libre)", type: "text" },
      { name: "best_lap", label: "Mejor vuelta", type: "text" },
      { name: "dnf", label: "DNF (abandonó)", type: "boolean" },
      { name: "dsq", label: "DSQ (descalificado)", type: "boolean" },
      { name: "pole", label: "Pole", type: "boolean", feature: "pole_fl" },
      { name: "fastest_lap", label: "Vuelta rápida", type: "boolean", feature: "pole_fl" },
      { name: "notes", label: "Notas", type: "text" },
    ],
  },

  penalties: {
    key: "penalties",
    label: "Penalizaciones",
    table: "penalties",
    listColumns: ["headline", "sanction", "created_at"],
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { name: "round_id", label: "Fecha", type: "reference", refTable: "rounds", refLabel: "round_number" },
      { name: "driver_id", label: "Piloto", type: "reference", refTable: "drivers", refLabel: "name" },
      { name: "category_id", label: "Categoría", type: "reference", refTable: "categories", refLabel: "name" },
      { name: "headline", label: "Título", type: "text", required: true },
      { name: "detail", label: "Detalle", type: "textarea" },
      { name: "sanction", label: "Sanción (texto)", type: "text", help: "ej: +5s, Drive-through, Amonestación" },
      { name: "time_penalty_seconds", label: "Penalización de tiempo (segundos)", type: "number", defaultValue: 0,
        feature: "recalc",
        help: "Se suma al tiempo del piloto al recalcular la carrera. 0 = no afecta la clasificación." },
      { name: "license_points", label: "Puntos de licencia", type: "number", defaultValue: 0 },
    ],
  },

  news: {
    key: "news",
    label: "Noticias",
    table: "news",
    listColumns: ["title", "published", "published_at"],
    orderBy: { column: "published_at", ascending: false },
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "slug", label: "Slug (url)", type: "text", required: true },
      { name: "excerpt", label: "Bajada", type: "textarea" },
      { name: "body", label: "Cuerpo", type: "textarea" },
      { name: "cover_url", label: "Portada", type: "image", folder: "news", maxWidth: 1280, maxKB: 350 },
      { name: "published", label: "Publicada", type: "boolean", defaultValue: true },
    ],
  },

  regulation_sections: {
    key: "regulation_sections",
    label: "Reglamento",
    table: "regulation_sections",
    listColumns: ["sort", "heading"],
    orderBy: { column: "sort" },
    fields: [
      { name: "sort", label: "Orden", type: "number", defaultValue: 0 },
      { name: "heading", label: "Título de sección", type: "text", required: true },
      { name: "body", label: "Texto", type: "textarea", required: true },
    ],
  },

  sponsors: {
    key: "sponsors",
    label: "Sponsors",
    table: "sponsors",
    listColumns: ["name", "tier", "sort", "active"],
    orderBy: { column: "sort" },
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "tier", label: "Categoría", type: "text", help: "ej: Principal, Oficial, Colaborador" },
      { name: "logo_url", label: "Logo", type: "image", folder: "sponsors", maxWidth: 400, maxKB: 200,
        help: "PNG con fondo transparente o SVG. Recomendado < 100 KB." },
      { name: "url", label: "Sitio web (URL)", type: "text" },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "sort", label: "Orden", type: "number", defaultValue: 0 },
      { name: "active", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },

  organizers: {
    key: "organizers",
    label: "Contacto",
    table: "organizers",
    listColumns: ["name", "role", "sort"],
    orderBy: { column: "sort" },
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "role", label: "Rol", type: "text", help: "ej: Director, Comisario, Caster" },
      { name: "email", label: "Email", type: "text" },
      { name: "discord", label: "Discord", type: "text" },
      { name: "whatsapp", label: "WhatsApp / teléfono", type: "text" },
      { name: "photo_url", label: "Foto", type: "image", folder: "organizers", maxWidth: 320, maxKB: 120 },
      { name: "sort", label: "Orden", type: "number", defaultValue: 0 },
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

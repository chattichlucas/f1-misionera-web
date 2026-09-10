#!/usr/bin/env node
/**
 * Importador de resultados F1 25 -> Liga Web
 *
 * Escucha la telemetría UDP de F1 25 y, al terminar la carrera (paquete
 * "Final Classification"), sube la clasificación a /api/import/classification.
 *
 * Uso:
 *   node importer.js --round 3 --category categoria-a [--session race]
 *
 * Requiere Node 18+. Sin dependencias (usa dgram y fetch nativos).
 * Configuración: archivo .env en esta carpeta con SITE_URL e IMPORT_TOKEN.
 *
 * En F1 25 (PS/PC): Ajustes -> Telemetría -> UDP Activado, Formato 2025,
 * Modo difusión Activado (o IP de esta máquina), Puerto 20777.
 */

import dgram from "node:dgram";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const HEADER = 29; // tamaño del PacketHeader en F1 23/24/25

// ---------- config ----------------------------------------------------
function loadEnv() {
  const env = {};
  try {
    const txt = readFileSync(join(HERE, ".env"), "utf8");
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sin .env */
  }
  return env;
}

function parseArgs() {
  const a = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith("--")) {
      const k = a[i].slice(2);
      const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
      out[k] = v;
    }
  }
  return out;
}

const ENV = loadEnv();
const ARGS = parseArgs();

const SITE_URL = (ARGS["site-url"] || ENV.SITE_URL || "").replace(/\/+$/, "");
const IMPORT_TOKEN = ARGS.token || ENV.IMPORT_TOKEN || "";
const ROUND = ARGS.round ? Number(ARGS.round) : null;
const ROUND_ID = ARGS["round-id"] || null;
const CATEGORY = ARGS.category || null;
const SESSION = (ARGS.session || "race").toLowerCase(); // race | sprint | qualifying
const PORT = Number(ARGS.port || ENV.UDP_PORT || 20777);
const HOST = ARGS.host || "0.0.0.0";
const FORCE = ARGS.force === "true" || ARGS.force === "1";

function die(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

if (!SITE_URL) die("Falta SITE_URL (en .env o --site-url).");
if (!IMPORT_TOKEN) die("Falta IMPORT_TOKEN (en .env o --token).");
if (!ROUND_ID && (!ROUND || !CATEGORY))
  die("Indicá --round <n> --category <slug>  (o --round-id <uuid>).");

// ---------- parsers UDP ----------------------------------------------
/** name[48] UTF-8 terminado en null */
function readName(buf, off) {
  let end = off;
  while (end < off + 48 && buf[end] !== 0) end++;
  return buf.toString("utf8", off, end).trim();
}

/** Participants (packet 4). Devuelve { [carIndex]: {number, name} } */
function parseParticipants(buf) {
  const numCars = buf.readUInt8(HEADER);
  const rest = buf.length - HEADER - 1;
  const entry = Math.floor(rest / 22); // 58 (F1 23) / 60 (F1 24) / >60 (F1 25)
  const map = {};
  for (let i = 0; i < numCars; i++) {
    const base = HEADER + 1 + i * entry;
    if (base + 55 > buf.length) break;
    // offsets estables entre versiones (todo lo que se agregó va DESPUÉS de m_name):
    //  m_raceNumber = base + 5 ; m_name[48] = base + 7 ; m_showOnlineNames = base + 56
    const number = buf.readUInt8(base + 5);
    let name = readName(buf, base + 7);
    if (/^player$/i.test(name)) name = "";
    map[i] = { number, name };
  }
  return map;
}

/** Final Classification (packet 8). Devuelve array de resultados por carIndex */
function parseFinalClassification(buf) {
  const numCars = buf.readUInt8(HEADER);
  // el array es fijo de 22 entradas (m_numCars solo dice cuántas son válidas)
  const entry = Math.floor((buf.length - HEADER - 1) / 22); // 45 (F1 23/24) / 46 (F1 25)
  const hasReason = entry >= 46;
  const out = [];
  for (let i = 0; i < numCars; i++) {
    const base = HEADER + 1 + i * entry;
    if (base + entry > buf.length) break;
    const position = buf.readUInt8(base + 0);
    const gridPosition = buf.readUInt8(base + 2);
    const points = buf.readUInt8(base + 3);
    const resultStatus = buf.readUInt8(base + 5);
    const p = base + 6 + (hasReason ? 1 : 0);
    const bestLapMs = buf.readUInt32LE(p);
    const totalRaceTime = buf.readDoubleLE(p + 4);
    const penaltiesTime = buf.readUInt8(p + 12);
    out.push({
      carIndex: i,
      position,
      grid: gridPosition,
      points,
      result_status: resultStatus,
      best_lap_ms: bestLapMs || null,
      total_race_time_s: totalRaceTime || null,
      penalties_time_s: penaltiesTime || 0,
    });
  }
  return out;
}

// ---------- estado ---------------------------------------------------
let participants = {};
let lastSessionUID = null;
let posted = new Set();
let savedSessions = new Set();
let uploading = false;
let lastSavedFile = null;
let sawParticipants = false;

const SAVE_DIR = join(HERE, "saved");

/** Arma el body a partir de la clasificación parseada. */
function buildBody(classification) {
  const results = classification.map((c) => {
    const p = participants[c.carIndex] || {};
    const r = {
      number: p.number ?? null,
      position: c.position || null,
      grid: c.grid || null,
      points: c.points ?? 0,
      result_status: c.result_status,
      best_lap_ms: c.best_lap_ms,
      penalties_time_s: c.penalties_time_s,
    };
    if (p.name) r.gamertag = p.name;
    if (c.result_status === 3 && c.total_race_time_s) r.total_race_time_s = c.total_race_time_s;
    return r;
  });
  const body = { session: SESSION, results, force: FORCE };
  if (ROUND_ID) body.round_id = ROUND_ID;
  else {
    body.round = ROUND;
    body.category = CATEGORY;
  }
  return body;
}

/** Guarda el body en disco. Devuelve la ruta del archivo. */
function saveBody(body, tag) {
  try {
    mkdirSync(SAVE_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = join(SAVE_DIR, `carrera-${stamp}-${tag}.json`);
    writeFileSync(file, JSON.stringify(body, null, 2));
    return file;
  } catch (e) {
    console.error("✖ No se pudo guardar en disco:", e?.message);
    return null;
  }
}

// ---------- POST ----------------------------------------------------
async function postBody(body) {
  console.log(`\n⇪ Subiendo ${body.results.length} pilotos a ${SITE_URL}/api/import/classification …`);
  try {
    const res = await fetch(`${SITE_URL}/api/import/classification`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${IMPORT_TOKEN}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`✖ ${res.status}: ${json.error || res.statusText}`);
      if (res.status === 401) console.error("  (revisá que IMPORT_TOKEN coincida entre el .env del importador y el del servidor)");
      if (res.status === 409) console.error("  (mandá --force para pisar una fecha ya finalizada)");
      return false;
    }
    console.log(`✅ Importado · ${json.imported} guardados · ${json.matched?.length ?? 0} matcheados`);
    if (json.unmatched?.length) {
      console.warn(`⚠ Sin coincidencia (revisá gamertag/número en la parrilla): ${json.unmatched.join(", ")}`);
    }
    return true;
  } catch (e) {
    console.error("✖ Error de red: " + (e?.message || e));
    return false;
  }
}


const DEBUG = ARGS.debug === "true" || ARGS.debug === "1";

// ---------- socket -------------------------------------------------
const sock = dgram.createSocket("udp4");

let pktCount = 0;
let firstPacketLogged = false;
const seenIds = new Set();

// Heartbeat: cada 15s avisa si está recibiendo pero todavía no hubo carrera.
setInterval(() => {
  if (pktCount === 0) {
    console.log("… todavía no llegó ningún paquete UDP. Revisá: telemetría UDP ON, puerto 20777, modo difusión ON, y el firewall.");
  } else if (!posted.size) {
    console.log(
      `… recibiendo (${pktCount} paquetes${sawParticipants ? `, ${Object.keys(participants).length} pilotos en sesión` : ""}). Esperando el fin de la carrera.`,
    );
  }
}, 15000);

sock.on("message", (buf) => {
  if (buf.length < HEADER) return;
  const format = buf.readUInt16LE(0);
  const packetId = buf.readUInt8(6);
  const sessionUID = buf.readBigUInt64LE(7).toString();

  pktCount++;
  if (!firstPacketLogged) {
    firstPacketLogged = true;
    console.log(`✓ Recibiendo telemetría · formato ${format}`);
  }
  if (DEBUG && !seenIds.has(packetId)) {
    seenIds.add(packetId);
    console.log(`  [debug] primer paquete id=${packetId} (${buf.length} bytes)`);
  }

  if (format !== 2025 && format !== 2024 && format !== 2023) {
    if (!sock._warnedFormat) {
      console.warn(`⚠ Formato UDP ${format} — configurá "Formato UDP: 2025" en el juego.`);
      sock._warnedFormat = true;
    }
  }

  if (sessionUID !== lastSessionUID) {
    lastSessionUID = sessionUID;
    participants = {};
    sawParticipants = false;
  }

  if (packetId === 4) {
    try {
      participants = parseParticipants(buf);
      if (!sawParticipants) {
        sawParticipants = true;
        console.log(`• Sesión ${sessionUID.slice(-6)} · ${Object.keys(participants).length} pilotos`);
      }
    } catch (e) {
      console.error("parseParticipants:", e?.message);
    }
    return;
  }

  if (packetId === 8) {
    if (posted.has(sessionUID)) return; // ya subido OK
    if (uploading) return; // intento en curso
    let body;
    try {
      const cls = parseFinalClassification(buf);
      body = buildBody(cls);
      if (!savedSessions.has(sessionUID)) {
        savedSessions.add(sessionUID);
        console.log(`\n🏁 Clasificación final (${cls.length} autos)`);
        for (const c of cls.slice().sort((a, b) => a.position - b.position)) {
          const p = participants[c.carIndex] || {};
          console.log(
            `  P${String(c.position).padStart(2)} · #${String(p.number ?? "?").padStart(2)} ${p.name || "(oculto)"}`,
          );
        }
        lastSavedFile = saveBody(body, sessionUID.slice(-6));
        if (lastSavedFile) console.log(`💾 Guardado en ${lastSavedFile}`);
      }
    } catch (e) {
      console.error("parseFinalClassification:", e?.message);
      return;
    }
    uploading = true;
    postBody(body).then((ok) => {
      uploading = false;
      if (ok) posted.add(sessionUID);
      else if (lastSavedFile) {
        console.warn(
          `⚠ No subió. Reintentá luego con:\n  node importer.js --resend "${lastSavedFile}" --round ${ROUND ?? "N"} --category ${CATEGORY ?? "slug"}`,
        );
      }
    });
  }
});

// --resend <archivo> : re-sube una carrera guardada en disco.
if (ARGS.resend) {
  let body;
  try {
    body = JSON.parse(readFileSync(ARGS.resend, "utf8"));
  } catch (e) {
    die("No pude leer el archivo: " + e.message);
  }
  if (ROUND) body.round = ROUND;
  if (CATEGORY) body.category = CATEGORY;
  if (ROUND_ID) body.round_id = ROUND_ID;
  if (ARGS.session) body.session = SESSION;
  if (FORCE) body.force = true;
  console.log(`Re-enviando ${ARGS.resend} …`);
  postBody(body).then((ok) => process.exit(ok ? 0 : 1));
}
// --test : manda una clasificación de prueba (2 pilotos) para verificar el endpoint.
else if (ARGS.test === "true" || ARGS.test === "1") {
  console.log("Modo prueba: enviando 2 pilotos ficticios…");
  const body = buildBody([
    { carIndex: 0, position: 1, grid: 1, points: 25, result_status: 3, best_lap_ms: 90000, total_race_time_s: 3600, penalties_time_s: 0 },
    { carIndex: 1, position: 2, grid: 2, points: 18, result_status: 3, best_lap_ms: 90500, total_race_time_s: 3605, penalties_time_s: 0 },
  ]);
  postBody(body).then((ok) => process.exit(ok ? 0 : 1));
}
// modo normal: escuchar UDP
else {
  sock.on("error", (e) => die("socket: " + e.message));
  sock.bind(PORT, HOST, () => {
    console.log(`▶ Escuchando telemetría F1 25 en ${HOST}:${PORT}`);
    console.log(`  Destino: ${SITE_URL}  ·  ${ROUND_ID ? `round_id ${ROUND_ID}` : `ronda ${ROUND} / ${CATEGORY}`}  ·  sesión ${SESSION}`);
    console.log("  Dejalo abierto durante la carrera. Cada carrera se guarda en ./saved/ y se sube.\n");
  });
}

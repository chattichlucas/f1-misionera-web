# Importador de resultados F1 25

Escucha la telemetría UDP de F1 25 y sube la clasificación final de la carrera
al sitio de la liga (`POST /api/import/classification`).

- **Node 18+**, sin dependencias.
- Corre en cualquier PC / Raspberry en la **misma red** que la consola/PC que juega.

## 1. En F1 25 (PS5 / PC)

Ajustes → **Configuración de telemetría**:

| Opción | Valor |
|---|---|
| Telemetría UDP | **Activada** |
| Modo difusión UDP | **Activado** (o poné la IP de la máquina que corre este script) |
| Puerto UDP | **20777** |
| Formato UDP | **2025** |

En la máquina que corre el script: permití **UDP entrante 20777** en el firewall.

## 2. En el sitio de la liga

En `/home/…/liga-web/.env` del servidor:

```
IMPORT_TOKEN=una-cadena-larga-y-aleatoria
```

Y `docker compose up -d --force-recreate`.

## 3. Configurar el script

```
cd tools/importer
cp .env.example .env
```

Editá `.env`:

```
SITE_URL=https://tudominio
IMPORT_TOKEN=una-cadena-larga-y-aleatoria   # el mismo del servidor
```

## 4. Correrlo

Dejalo abierto **durante la carrera**. Sube solo cuando aparece la pantalla de
clasificación final.

```bash
node importer.js --round 3 --category categoria-a
```

Opciones:

| Flag | Default | Qué hace |
|---|---|---|
| `--round <n>` | — | número de fecha de la liga (obligatorio salvo `--round-id`) |
| `--category <slug>` | — | slug de la categoría, ej `categoria-a` |
| `--round-id <uuid>` | — | alternativa a `--round` + `--category` |
| `--session <race\|sprint>` | `race` | qué sesión estás importando |
| `--force` | off | pisa una fecha ya finalizada |
| `--port <n>` | `20777` | puerto UDP |

### Ejemplo de salida

```
▶ Escuchando telemetría F1 25 en 0.0.0.0:20777
• Sesión a1b2c3 · 20 pilotos
🏁 Clasificación final (20 autos)
  P 1 · #44 chatti_lucas
  P 2 · #16 otro_piloto
  ...
⇪ Subiendo 20 pilotos a https://tudominio/api/import/classification …
✅ Importado · 20 guardados · 18 matcheados
⚠ Sin coincidencia: Fulano, Mengano   <- revisá el gamertag/número de esos en Pilotos
```

## Notas

- Si un jugador tiene los nombres online ocultos, se importa por **número de auto**
  (por eso cargá el número de cada piloto en la parrilla).
- El endpoint es idempotente: re-correrlo actualiza, no duplica.
- Al importar una `race`, la fecha queda marcada como **finalizada**. Para volver a
  importarla usá `--force`.
- Las **penalizaciones de tiempo de la liga** (comisarios) se cargan aparte en el
  panel y se aplican con "Recalcular carrera".

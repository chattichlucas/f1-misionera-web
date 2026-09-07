# Liga Web

Sitio oficial para una liga de F1 (F1 25, temporada 2026) con:

- **Frontend público**: inicio con cuenta regresiva, calendario, posiciones (pilotos y
  constructores), pilotos, escuderías, resultados por fecha, penalizaciones, reglamento,
  noticias e inscripciones.
- **Panel de administración** (`/admin`) protegido con login: ABM de todo el contenido,
  gestión de inscripciones y ajustes de marca / colores / redes / puntos.

## Stack

| Pieza | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 3 (colores por variables CSS que salen de la base) |
| Base de datos + Auth | Supabase (Postgres + Auth) |
| Hosting | Docker en tu servidor (imagen `liga-web:latest`) |
| CI/CD | GitHub Actions con runner **self-hosted** (misma metodología que IA-Racing) |

El sitio **compila y renderiza sin Supabase** (muestra estados vacíos), así el primer
deploy funciona antes de cargar credenciales.

## Puesta en marcha — ver `DEPLOY.md`

Al hacer `push` a `main`, el runner self-hosted:

1. corre la migración SQL contra Supabase (si `SUPABASE_DB_URL` está en el `.env` del server),
2. `docker build -t liga-web:latest .`,
3. `docker compose down && up -d` → contenedor en el puerto `3000`.

Config del servidor: `/home/ubuntu/liga-web/.env` (ver `.env.example`) + runner
self-hosted con `docker`. Detalle completo en `DEPLOY.md`.

## Desarrollo local (requiere Node 18+)

```bash
npm install
cp .env.example .env.local   # completar con las claves de Supabase
npm run dev
```

> Nota: `next.config.mjs` tiene `typescript.ignoreBuildErrors: true` para no frenar el
> primer deploy. Una vez con Node local, corré `npm run typecheck`, corregí lo que
> aparezca y poné esa opción en `false`.

## Estructura

```
src/
  app/
    (público)            page.tsx, calendario, posiciones, pilotos, escuderias,
                         resultados/[round], penalizaciones, reglamento,
                         noticias/[slug], inscripciones
    admin/
      login/             login con Supabase Auth
      (protected)/       layout con guard + panel
        manage/[resource]  ABM genérico (pilotos, equipos, fechas, resultados, ...)
        inscripciones/   gestión de solicitudes
        ajustes/         site_settings (marca, colores, redes, puntos)
  components/            header, footer, ui, countdown, category-tabs, admin/*
  lib/
    supabase/            clients (browser / server / admin / middleware)
    admin/resources.ts   config declarativa del ABM
    data.ts              lecturas para el front público
    types.ts             tipos de dominio
supabase/
  migrations/0001_init.sql
  seed.sql
```

## Modelo de datos

`seasons › categories › (teams, drivers, rounds › session_results)` + `penalties`,
`news`, `regulation_sections`, `inscriptions`, `site_settings`.

Las **posiciones** se calculan solas con las vistas `driver_standings` y
`team_standings` a partir de `session_results` (no se cargan puntos totales a mano).

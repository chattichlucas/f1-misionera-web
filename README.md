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
| Hosting | Vercel |

El sitio **compila y renderiza sin Supabase** (muestra estados vacíos), así el primer
deploy funciona antes de cargar credenciales.

## Puesta en marcha — ver `DEPLOY.md`

Resumen:

1. Crear proyecto en [Supabase](https://supabase.com) y correr `supabase/migrations/0001_init.sql`
   en el SQL Editor. Opcional: `supabase/seed.sql`.
2. Crear el usuario admin en Supabase → Authentication → Users → *Add user*.
3. Importar el repo en [Vercel](https://vercel.com), setear las variables de entorno
   (ver `.env.example`) y desplegar.
4. Entrar a `https://TU-DOMINIO/admin`, cargar los datos de la liga y personalizar en
   **Ajustes del sitio**.

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

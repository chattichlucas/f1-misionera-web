# Deploy paso a paso

## 1. Supabase

1. Entrá a https://supabase.com/dashboard y creá un proyecto nuevo (region: São Paulo).
   Guardá la **Database password**.
2. En el menú lateral: **SQL Editor** → *New query* → pegá todo el contenido de
   `supabase/migrations/0001_init.sql` → **Run**.
3. (Opcional, datos de ejemplo) Repetí con `supabase/seed.sql`.
4. **Project Settings → API**. Copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Usuario administrador

**Authentication → Users → Add user → Create new user**

- Email + contraseña (marcá *Auto Confirm User*).
- Ese email/clave es con el que vas a entrar a `/admin`.
- Para agregar más admins, repetí. (Cualquier usuario autenticado es admin; no se
  permite auto-registro desde el sitio.)

## 3. Repositorio

El proyecto ya está en GitHub. Si necesitás re-subirlo:

```bash
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

## 4. Vercel

1. https://vercel.com/new → *Import* el repo de GitHub.
2. Framework preset: **Next.js** (lo detecta solo). No cambies build settings.
3. **Environment Variables** → agregá las tres de arriba
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`) para *Production* y *Preview*.
4. **Deploy**.

## 5. Configurar la liga

1. `https://TU-DOMINIO.vercel.app/admin` → login con el usuario del paso 2.
2. **Ajustes del sitio**: nombre, lema, logo (URL), colores de la liga, redes,
   esquema de puntos, y si las inscripciones están abiertas.
3. **Temporadas** → creá la temporada 2026 y marcala como activa.
4. **Categorías** → A, B, ... (con día y horario).
5. **Escuderías** → las 11 de F1 2026 (o usá el seed).
6. **Circuitos** → cargá los del calendario (con código de país ISO-2 para la bandera).
7. **Pilotos** → la parrilla por categoría, con número, gamertag y escudería.
8. **Fechas / Calendario** → una fila por ronda y categoría, con fecha/hora.
9. Después de cada carrera: **Resultados** → una fila por piloto y sesión
   (`race` / `qualifying` / `sprint`) con posición y puntos. Las **Posiciones** se
   actualizan solas.
10. **Penalizaciones**, **Noticias** y **Reglamento** según haga falta.

## Dominio propio

Vercel → Project → **Settings → Domains** → agregá tu dominio y seguí las
instrucciones de DNS.

## Subir imágenes (logos, portadas)

Opción simple: **Supabase → Storage → New bucket** `public` (marcá *Public bucket*),
subí el archivo y usá la URL pública en el campo correspondiente del panel.

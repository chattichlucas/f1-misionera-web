# Deploy — Docker + GitHub Actions (self-hosted)

Misma metodología que **IA-Racing**: al hacer `push` a `main`, un runner
self-hosted en tu servidor construye la imagen Docker y levanta el contenedor con
`docker compose`. La base de datos y el auth son de **Supabase** (cloud).

```
push a main ─► GitHub Actions (runner self-hosted en tu server)
                 ├─ migra la base (psql contra Supabase, idempotente)
                 ├─ docker build -t liga-web:latest .
                 └─ docker compose down && up -d   ─►  contenedor en :3000
```

---

## 1. Supabase (una sola vez)

1. Crear proyecto en https://supabase.com/dashboard.
2. **SQL Editor** → correr **en orden** cada archivo de `supabase/migrations/`
   (`0001_init.sql`, `0002_permissions.sql`, …). Son idempotentes. Si configurás
   `SUPABASE_DB_URL`, el workflow los corre solo en cada deploy.
   (Opcional: `supabase/seed.sql` para datos de ejemplo — **no** lo corras más de una vez.)
3. **Authentication → Users → Add user → Create new user** (con *Auto Confirm*):
   ese email/clave entra a `/admin`. (No uses "Send invitation".)
4. **Authentication → URL Configuration**:
   - **Site URL:** `http://TU_IP:3000` (o tu dominio)
   - **Redirect URLs:** agregá `http://TU_IP:3000/**`
   Necesario para que el link de "recuperar contraseña" (`/admin/password`) funcione.
5. **Project Settings → API Keys** → anotar `Project URL`, `Publishable key`, `Secret key`.
6. **Project Settings → Database → Connection string → URI** (Session pooler si tu server
   es IPv4) → anotar la cadena.

## 2. Servidor — archivo `.env`

Creá `/home/ubuntu/liga-web/.env` (mismo patrón que `/home/ubuntu/ia-racing/.env`).
Si tu usuario no es `ubuntu`, ajustá la ruta en `docker-compose.yml` y en
`.github/workflows/deploy.yml`.

```env
# se inyectan en el build (NEXT_PUBLIC_*) y también en runtime
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...     # o la anon key legacy (eyJ...)

# sólo runtime (servidor)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...              # o la service_role legacy

# emails con acceso total y gestión de permisos (separados por coma).
# vacío = cualquier usuario logueado tiene acceso total (modo compat).
SUPERADMIN_EMAILS=vos@gmail.com

# opcional: si está, el workflow corre TODAS las migraciones en cada deploy
# (Session pooler si tu server es IPv4)
SUPABASE_DB_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
```

### Permisos por usuario

- Superadmin = email en `SUPERADMIN_EMAILS`. Acceso total + pantalla **Usuarios y
  permisos** para repartir accesos.
- A cada otro usuario le asignás por módulo: **sin acceso / ver / editar**.
- Se aplica en el panel, en las server actions y en RLS (Postgres).
- El primer superadmin tiene que **entrar una vez** para que el sistema de permisos
  se active (queda registrado en la tabla `superadmins`). Antes de eso, o con
  `SUPERADMIN_EMAILS` vacío, cualquier logueado edita todo.

## 3. Runner self-hosted (una sola vez)

En GitHub: **Settings → Actions → Runners → New self-hosted runner** y seguí los
pasos en el server (igual que IA-Racing). El runner necesita `docker` y `sudo`.

## 4. Push

```bash
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

El workflow `Deploy Liga Web` corre solo. Verificá en la pestaña **Actions**.

## 5. Resultado

- Contenedor `liga-web` escuchando en el puerto **3000** del server
  (`docker compose ps`). Cambiá el mapeo de puerto en `docker-compose.yml` si hace
  falta.
- Poné tu reverse proxy (nginx / Traefik / Caddy) apuntando a `127.0.0.1:3000` con
  tu dominio y HTTPS.

## 6. Cargar la liga

`https://TU-DOMINIO/admin` → login → **Ajustes del sitio** (marca, colores, redes,
puntos) → cargar Temporada, Categorías, Escuderías, Circuitos, Pilotos, Fechas.
Después de cada carrera: **Resultados** (una fila por piloto y sesión). Las
**Posiciones** se calculan solas.

---

## Comandos útiles en el server

```bash
cd <carpeta-del-checkout-del-runner>   # o cloná el repo aparte para operar a mano
sudo docker compose logs -f liga-web
sudo docker compose restart liga-web
sudo docker compose up -d --force-recreate
```

## Migración manual (si no usás SUPABASE_DB_URL)

Corré **en orden** cada archivo de `supabase/migrations/` en el **SQL Editor** de
Supabase cada vez que cambie el esquema. Son idempotentes.

## Subida de imágenes

El panel comprime y reescala las imágenes en el navegador (a WebP) antes de subirlas
al bucket **`media`**.

- `0004_storage.sql` crea el bucket. Si falla por permisos: **Supabase → Storage →
  New bucket** → nombre `media` → **Public bucket** → Create.
- Necesita `SUPABASE_SERVICE_ROLE_KEY` bien seteada (la subida corre en el servidor).

Pesos recomendados: logos SVG/PNG < 100 KB · fotos WebP < 150 KB · portada del inicio
< 400 KB. El panel rechaza lo que supere el límite de cada campo tras comprimir.

## Desarrollo local (requiere Node 18+)

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

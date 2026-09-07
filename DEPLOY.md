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
2. **SQL Editor** → pegar `supabase/migrations/0001_init.sql` → **Run**.
   (Opcional: `supabase/seed.sql` para datos de ejemplo — **no** lo corras más de una vez.)
3. **Authentication → Users → Add user** (con *Auto Confirm*): ese email/clave entra a `/admin`.
4. **Project Settings → API** → anotar `Project URL`, `anon public`, `service_role`.
5. **Project Settings → Database → Connection string → URI** → anotar la cadena
   (agregale `?sslmode=require` al final si no lo trae).

## 2. Servidor — archivo `.env`

Creá `/home/ubuntu/liga-web/.env` (mismo patrón que `/home/ubuntu/ia-racing/.env`).
Si tu usuario no es `ubuntu`, ajustá la ruta en `docker-compose.yml` y en
`.github/workflows/deploy.yml`.

```env
# se inyectan en el build (NEXT_PUBLIC_*) y también en runtime
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# sólo runtime (servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# opcional: si está, el workflow corre la migración en cada deploy
SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.xxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

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

Corré `supabase/migrations/0001_init.sql` en el **SQL Editor** de Supabase cada vez
que cambie el esquema. Es idempotente (`create ... if not exists`, `create or
replace`, `drop policy if exists`).

## Desarrollo local (requiere Node 18+)

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

# wishboard

App demo educativa: un tablero de deseos. Backend en Node.js + Express con
PostgreSQL (usando `pg` directo, sin ORM), frontend en HTML/CSS/JS plano.

## Cómo correrlo

1. Copia el archivo de variables de entorno:

   ```sh
   cp .env.example .env
   ```

2. Levanta todo con Docker Compose:

   ```sh
   docker compose up --build
   ```

3. Abre [http://localhost](http://localhost) para el frontend. El backend
   queda expuesto también en `http://localhost:3000` (por ejemplo,
   `http://localhost:3000/api/health`).

El frontend sirve los archivos estáticos con nginx y hace proxy de `/api`
hacia el servicio `backend`, así que no hay problemas de CORS.

## Estructura

- `backend/` — API Express (`/api/health`, `/api/wishes`, `/api/wishes/random`)
- `frontend/` — HTML/CSS/JS plano servido con nginx
- `docker-compose.yml` — orquesta `db` (Postgres), `backend` y `frontend`

## Tests del backend

```sh
cd backend
npm install
npm test
```

Los tests (Jest + Supertest) necesitan una base de datos PostgreSQL
alcanzable a través de las variables `DB_HOST`, `DB_USER`, `DB_PASSWORD` y
`DB_NAME` (la más simple es levantar solo el servicio `db` con
`docker compose up db`).

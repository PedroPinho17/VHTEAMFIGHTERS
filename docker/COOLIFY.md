# Coolify deployment notes

## Services

1. **PostgreSQL** — managed DB or Coolify Postgres
2. **Redis** — managed Redis
3. **S3** — MinIO service or external S3-compatible storage
4. **API** — Dockerfile `apps/api/Dockerfile`, port `3001`
5. **Web** — Dockerfile `apps/web/Dockerfile`, port `3000`

## Reverse proxy

Prefer a single domain:

- `https://vhteamfighters.pt/` → web
- `https://vhteamfighters.pt/api/*` → api

Set:

- `BETTER_AUTH_URL=https://vhteamfighters.pt`
- `NEXT_PUBLIC_APP_URL=https://vhteamfighters.pt`
- `NEXT_PUBLIC_API_URL=https://vhteamfighters.pt`

This keeps Better Auth cookies on the same site.

## Build args (web)

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_S3_PUBLIC_URL`
- `NEXT_PUBLIC_S3_BUCKET`
- `NEXT_PUBLIC_SENTRY_DSN` (optional)

## Runtime env (api)

See root `.env.example`. Minimum:

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `S3_*`
- `SMTP_*`
- `ENROLLMENT_NOTIFY_TO`
- `SENTRY_DSN` (optional)

API entrypoint runs `prisma migrate deploy` before start.

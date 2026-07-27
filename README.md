# VH Team Fighters

Site + CMS para a equipa de kickboxing **VH Team Fighters**.

## Stack

- Next.js 15 (site + admin)
- NestJS (API, Better Auth, BullMQ)
- PostgreSQL + Prisma
- Redis + BullMQ (emails de inscrição)
- S3 / MinIO (media)
- shadcn-style UI
- Docker / Coolify
- Sentry (opcional via DSN)

## Arranque local

```bash
# 1. Infra (só se Postgres/Redis/MinIO não estiverem a correr)
pnpm docker:up

# 2. Arrancar API + Web
pnpm dev
```

Na 1ª vez (ou máquina nova):

```bash
pnpm install
cp .env.example .env   # se ainda não existir
pnpm db:migrate
pnpm db:seed
pnpm docker:up
pnpm dev
```

Portas locais: Postgres `5433` · Redis `6380` · MinIO `9010`

Auth: o browser fala com `/api` no mesmo origem (`:3000`); o Next faz proxy para a Nest (`:3001`) — evita login duplo por cookies cross-port.

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- API: http://localhost:3001/api/health
- Mailpit: http://localhost:8025

### Credenciais seed

- Email: `admin@vhteamfighters.local`
- Password: `Admin123!`

## Coolify

1. Deploy serviços Postgres, Redis e S3 (ou MinIO).
2. Deploy `apps/api` com Dockerfile `apps/api/Dockerfile` (porta 3001).
3. Deploy `apps/web` com Dockerfile `apps/web/Dockerfile` (porta 3000).
4. Proxy: `/` → web, `/api` → api (mesmo domínio para cookies Better Auth).
5. Definir env vars a partir de `.env.example` (`SENTRY_DSN`, `BETTER_AUTH_SECRET`, etc.).

## Estrutura

```
apps/web          # Next.js
apps/api          # NestJS
packages/database # Prisma
packages/shared   # tipos partilhados
```

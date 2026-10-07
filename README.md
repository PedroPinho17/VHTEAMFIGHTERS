# VH Team Fighters

Site + CMS para a equipa de kickboxing **VH Team Fighters**.

## Stack

- Next.js 15 (site + admin)
- NestJS (API, Better Auth, BullMQ)
- PostgreSQL + Prisma
- Redis + BullMQ (emails de inscrição)
- S3 / MinIO local (media)
- Docker / Coolify
- Sentry (opcional via DSN)

## Arranque local

```bash
pnpm install
cp .env.example .env
# Preencher ADMIN_PASSWORD (≥12 chars), ENROLLMENT_NOTIFY_TO, BETTER_AUTH_SECRET
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Portas locais (só `127.0.0.1`): Postgres `5435` · Redis `6382` · MinIO `9014` · Mailpit `8025`

O `docker:up` activa o perfil `local` (MinIO + Mailpit). Em produção o object storage é externo (S3/R2).

Auth: o browser fala com `/api` na mesma origem (`:3000`); o Next faz proxy para a Nest (`:3001`).

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- Privacidade: http://localhost:3000/privacidade
- API health / ready: http://localhost:3001/api/health · `/api/ready`

Smoke (API a correr): `pnpm smoke`  
Testes API: `pnpm --filter @vh/api test`

### Credenciais seed

Definidas só no teu `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). **Não há password por omissão no repositório.**

## Segurança (resumo)

- Registo público desactivado; papel por omissão `NONE`
- Helmet, limites de body, rate limit (Redis + `req.ip`) + honeypot nas inscrições
- `mustChangePassword` obriga troca no primeiro login (`/admin/change-password`)
- Validação de env em produção (auth, SMTP, S3, notify)
- RGPD: consentimento, `/privacidade`, export/erase no admin

Operação: [docs/RUNBOOK.md](docs/RUNBOOK.md) · CI: `.github/workflows/ci.yml`  
Ruleset do `main`: Enforcement **Active** + checks `audit` / `test` / `docker` obrigatórios.

## Coolify

1. Deploy Postgres, Redis e S3 (ou MinIO gerido) — **sem** defaults `minioadmin` em produção.
2. Deploy `apps/api` (`apps/api/Dockerfile`, porta 3001).
3. Deploy `apps/web` (`apps/web/Dockerfile`, porta 3000).
4. Proxy: `/` → web, `/api` → api (mesmo domínio para cookies).
5. Env a partir de `.env.example` com segredos reais (`ENROLLMENT_NOTIFY_TO` = email da equipa).

## Estrutura

```
apps/web          # Next.js
apps/api          # NestJS
packages/database # Prisma
packages/shared   # tipos partilhados
docs/RUNBOOK.md   # operação e backups
```

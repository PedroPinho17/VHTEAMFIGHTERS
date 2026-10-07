# RUNBOOK — VH Team Fighters

Operação do site + CMS sem credenciais neste documento.

## Ambientes

| Serviço | Local | Produção (Coolify) |
|---------|--------|-------------------|
| Web | `:3000` | domínio público |
| API | `:3001` | mesmo domínio `/api` |
| Postgres | `127.0.0.1:5435` | serviço gerido |
| Redis | `127.0.0.1:6382` | serviço gerido |
| Object storage | MinIO perfil `local` | S3/R2/Garage HTTPS |
| Mail | Mailpit perfil `local` | SMTP real |

## Arranque local

```bash
cp .env.example .env   # preencher ADMIN_PASSWORD (≥12), ENROLLMENT_NOTIFY_TO, BETTER_AUTH_SECRET
pnpm install
pnpm docker:up         # usa COMPOSE_PROFILES=local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Health: `GET /api/health` · Ready (inclui S3): `GET /api/ready`

## Auth

- Registo público **desactivado** (`disableSignUp`).
- Contas admin só via seed / processo interno.
- Papel por omissão: `NONE` (sem backoffice).
- Após seed, `mustChangePassword=true` — alterar password no primeiro acesso administrativo.

## Backups

### Postgres

```bash
# Dump (substituir URL; sem ?schema=… para pg_dump)
pg_dump "$PG_URL" -Fc --no-owner --no-acl -f "backups/vh-$(date +%Y%m%d).dump"
```

Restauro: `pg_restore -d "$PG_URL" --clean --if-exists --no-owner --no-acl ficheiro.dump`

### Bucket S3

Usar a ferramenta do fornecedor (AWS CLI, rclone, consola R2) para sync periódico do bucket `S3_BUCKET`. Manter cópias fora do volume de produção.

## RGPD (inscrições)

- Página pública: `/privacidade`
- Consentimento obrigatório no formulário
- Admin: export JSON e apagar/anonimizar em Inscrições
- Conservação típica: até 24 meses (ver política)

## Protecção do `main`

No GitHub: Settings → Branches → Branch protection em `main`:

- Require pull request before merging
- Require status checks (CI) to pass
- Do not allow force pushes

## Incidentes

| Sintoma | Verificar |
|---------|-----------|
| API não arranca em prod | `BETTER_AUTH_SECRET`, SMTP, `ENROLLMENT_NOTIFY_TO`, S3 HTTPS |
| `/api/ready` 503 | Postgres, Redis, bucket S3 |
| Spam em inscrições | rate limit (5/15min/IP), honeypot; considerar Turnstile |
| Login falha | cookies same-origin (proxy `/api` → API), `BETTER_AUTH_URL` |

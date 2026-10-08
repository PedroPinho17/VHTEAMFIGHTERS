# RUNBOOK — VH Team Fighters

Operação do site + CMS sem credenciais neste documento.

## Ambientes

| Serviço | Local | Produção (Coolify) |
|---------|--------|-------------------|
| Web | `:3000` | domínio público |
| API | `:3001` (só via proxy em prod) | mesmo domínio `/api` — **não publicar 3001** |
| Postgres | `127.0.0.1:5435` | serviço gerido |
| Redis | `127.0.0.1:6382` | serviço gerido |
| Object storage | Garage perfil `local` (`:3900`) | S3/R2/Garage HTTPS |
| Mail | Mailpit perfil `local` | SMTP real (ex. Resend) |

## Arranque local

```bash
cp .env.example .env   # preencher ADMIN_PASSWORD (≥12), ENROLLMENT_NOTIFY_TO (email real do cliente), BETTER_AUTH_SECRET
pnpm install
pnpm docker:up         # usa COMPOSE_PROFILES=local (Postgres, Redis, Garage, Mailpit)
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Health: `GET /api/health` · Ready (inclui S3): `GET /api/ready`

### Migração antiga falhada (P3009)

Se a API não arrancar com `P3009` / migração falhada `20261007120000_auth_gdpr_hardening`
(versão antiga da migração que falhava no Postgres), marcar como rolled-back e voltar a aplicar:

```bash
pnpm --filter @vh/database exec prisma migrate resolve --rolled-back 20261007120000_auth_gdpr_hardening
pnpm db:deploy
```

Só afecta bases onde a versão v3 dessa migração já tinha falhado.

## Auth

- Registo público **desactivado** (`disableSignUp`).
- Contas admin só via seed / processo interno.
- Papel por omissão: `NONE` (sem backoffice).
- Após seed, `mustChangePassword=true` — alterar password no primeiro acesso administrativo.
- A nova password não pode ser igual à actual; após a troca, iniciar sessão de novo.

## Proxy e porta 3001

Em produção a API **não** deve ser publicada directamente na Internet.
O Traefik/Coolify fala com a API na rede interna; o browser só usa o domínio público (`/api` → API).

Com `trust proxy`, se a porta 3001 estiver exposta sem proxy, `X-Forwarded-For` volta a ser falsificável e o rate limit de inscrições deixa de ser fiável.

## Email de inscrições

`ENROLLMENT_NOTIFY_TO` tem de ser o email real confirmado com o cliente.
O `.env.example` deixa o campo vazio de propósito — em `NODE_ENV=production` a API recusa arrancar sem um endereço válido (não `.local` / `example.com`).

Teste real (após configurar Resend ou Brevo no `.env`):

1. Preencher `SMTP_*` e `ENROLLMENT_NOTIFY_TO`.
2. Submeter uma inscrição no site.
3. Confirmar o email «Nova inscrição» na caixa do cliente (e na UI do Resend).

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

Ruleset: https://github.com/PedroPinho17/VHTEAMFIGHTERS/settings/rules

Confirmar **Enforcement status = Active** e checks obrigatórios:

- `audit` · `test` · `docker` · `compose-smoke`

Também: require PR before merging, block force pushes, restrict deletions.
Sem Active, o merge com CI vermelho volta a ser possível.

## Incidentes

| Sintoma | Verificar |
|---------|-----------|
| API não arranca em prod | `BETTER_AUTH_SECRET`, SMTP, `ENROLLMENT_NOTIFY_TO`, S3 HTTPS |
| API não arranca (P3009) | ver secção «Migração antiga falhada» |
| `/api/ready` 503 | Postgres, Redis, bucket S3/Garage |
| Spam em inscrições | rate limit (5/15min/IP), honeypot; considerar Turnstile |
| Login falha | cookies same-origin (proxy `/api` → API), `BETTER_AUTH_URL` |
| Avisos de inscrição em falta | `ENROLLMENT_NOTIFY_TO` real + SMTP/Resend |

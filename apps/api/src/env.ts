import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const candidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "..", "..", ".env"),
];

for (const path of candidates) {
  if (existsSync(path)) {
    config({ path });
    break;
  }
}

const DEV_PLACEHOLDER_SECRET = "dev-secret-change-me";

export function resolveAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (!secret || secret === DEV_PLACEHOLDER_SECRET || secret.length < 32) {
      throw new Error(
        "BETTER_AUTH_SECRET obrigatório em produção (min. 32 caracteres; não usar o default de desenvolvimento).",
      );
    }
    return secret;
  }

  return secret && secret.length > 0 ? secret : DEV_PLACEHOLDER_SECRET;
}

/** Falha cedo em produção se SMTP / S3 / notify estiverem em falta ou com defaults inseguros. */
export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;

  resolveAuthSecret();

  const required = [
    "SMTP_HOST",
    "SMTP_FROM",
    "ENROLLMENT_NOTIFY_TO",
    "S3_ENDPOINT",
    "S3_PUBLIC_URL",
    "S3_ACCESS_KEY",
    "S3_SECRET_KEY",
    "S3_BUCKET",
  ] as const;

  for (const key of required) {
    const value = process.env[key]?.trim();
    if (!value) {
      throw new Error(`${key} é obrigatório em produção.`);
    }
  }

  const notifyTo = process.env.ENROLLMENT_NOTIFY_TO!.trim();
  if (notifyTo.endsWith(".local") || notifyTo.includes("example.com")) {
    throw new Error(
      "ENROLLMENT_NOTIFY_TO deve ser um email real do cliente em produção (não .local).",
    );
  }

  const publicUrl = process.env.S3_PUBLIC_URL!.trim();
  if (!publicUrl.startsWith("https://") && process.env.ALLOW_INSECURE_S3 !== "true") {
    throw new Error(
      "S3_PUBLIC_URL deve usar HTTPS em produção (ou ALLOW_INSECURE_S3=true só para testes).",
    );
  }

  const access = process.env.S3_ACCESS_KEY!.trim();
  const secret = process.env.S3_SECRET_KEY!.trim();
  if (access === "minioadmin" || secret === "minioadmin") {
    throw new Error("Credenciais S3 por omissão (minioadmin) não são permitidas em produção.");
  }
}

if (process.env.NODE_ENV === "production") {
  assertProductionEnv();
}

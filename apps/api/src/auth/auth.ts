import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { passkey } from "@better-auth/passkey";
import { prisma } from "@vh/database";
import { resolveAuthSecret } from "../env";
import { authEmailPassword, authUserDefaults } from "./auth.config";

export { authEmailPassword, authUserDefaults } from "./auth.config";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const authUrl = process.env.BETTER_AUTH_URL ?? appUrl;
const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";
const isProd = process.env.NODE_ENV === "production";

/** Local hosts browsers treat as different origins (localhost ≠ 127.0.0.1). */
const localOrigins = [
  appUrl,
  authUrl,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://[::1]:3000",
  "http://[::1]:3001",
];

const trustedOrigins = isProd
  ? [...new Set([appUrl, authUrl].filter(Boolean))]
  : [...new Set(localOrigins.filter(Boolean))];

/**
 * Better Auth — registo público desactivado (contas só via seed / processo interno).
 * Papel por omissão: NONE (sem acesso ao backoffice).
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: resolveAuthSecret(),
  baseURL: authUrl,
  basePath: "/api/auth",
  trustedOrigins,
  emailAndPassword: { ...authEmailPassword },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      // Compose/CI smoke usa HTTP; ALLOW_INSECURE_S3 marca esse cenário.
      secure: isProd && process.env.ALLOW_INSECURE_S3 !== "true",
      path: "/",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: authUserDefaults.roleDefault,
        input: false,
      },
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  plugins: [
    passkey({
      rpID,
      rpName: "VH Team Fighters",
      origin: appUrl,
    }),
  ],
});

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  mustChangePassword?: boolean;
};

import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  // Same origin as the site — /api/auth is proxied to Nest
  baseURL: typeof window !== "undefined" ? window.location.origin : appUrl,
  plugins: [passkeyClient()],
});

/**
 * Sync root .env → packages/database/.env for Prisma CLI.
 * In CI (no .env file), write DATABASE_URL from the environment.
 */
import { copyFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, ".env");
const dest = resolve(root, "packages/database/.env");

mkdirSync(dirname(dest), { recursive: true });

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log("Synced .env → packages/database/.env");
} else if (process.env.DATABASE_URL) {
  writeFileSync(dest, `DATABASE_URL=${process.env.DATABASE_URL}\n`, "utf8");
  console.log("Wrote packages/database/.env from DATABASE_URL (CI)");
} else {
  console.warn("No .env and no DATABASE_URL — Prisma may fail to connect.");
  process.exit(1);
}

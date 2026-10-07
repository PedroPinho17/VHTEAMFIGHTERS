import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("auth hardening", () => {
  const authSrc = readFileSync(resolve(__dirname, "auth.ts"), "utf8");
  const guardSrc = readFileSync(resolve(__dirname, "auth.guard.ts"), "utf8");

  it("disables public email/password sign-up", () => {
    expect(authSrc).toMatch(/disableSignUp:\s*true/);
  });

  it("defaults new users to NONE (no backoffice)", () => {
    expect(authSrc).toMatch(/defaultValue:\s*"NONE"/);
  });

  it("requires min password length of 12", () => {
    expect(authSrc).toMatch(/minPasswordLength:\s*12/);
  });

  it("AdminGuard does not treat missing role as EDITOR", () => {
    expect(guardSrc).not.toMatch(/\?\?\s*"EDITOR"/);
    expect(guardSrc).toMatch(/ADMIN_ROLES/);
  });
});

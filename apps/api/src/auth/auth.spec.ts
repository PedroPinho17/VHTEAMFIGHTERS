import { describe, expect, it } from "vitest";
import { authEmailPassword, authUserDefaults } from "./auth.config";

describe("auth hardening (runtime config)", () => {
  it("disables public email/password sign-up", () => {
    expect(authEmailPassword.disableSignUp).toBe(true);
    expect(authEmailPassword.enabled).toBe(true);
  });

  it("defaults new users to NONE (no backoffice)", () => {
    expect(authUserDefaults.roleDefault).toBe("NONE");
  });

  it("requires min password length of 12", () => {
    expect(authEmailPassword.minPasswordLength).toBe(12);
  });
});

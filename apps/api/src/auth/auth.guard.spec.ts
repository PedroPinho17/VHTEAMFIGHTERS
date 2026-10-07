import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("AdminGuard source policy", () => {
  const src = readFileSync(resolve(__dirname, "auth.guard.ts"), "utf8");

  it("blocks missing roles and mustChangePassword", () => {
    expect(src).toMatch(/MUST_CHANGE_PASSWORD/);
    expect(src).toMatch(/mustChangePassword/);
    expect(src).not.toMatch(/\?\?\s*"EDITOR"/);
  });
});

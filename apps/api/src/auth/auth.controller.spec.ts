import { describe, expect, it } from "vitest";
import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  it("returns current user", () => {
    const controller = new AuthController();
    const user = { id: "u1", email: "a@example.com", role: "ADMIN" };
    expect(controller.me(user as never)).toEqual({ user });
  });
});

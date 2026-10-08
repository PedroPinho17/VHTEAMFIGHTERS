import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";

const { changePassword } = vi.hoisted(() => ({
  changePassword: vi.fn(),
}));

vi.mock("./auth", () => ({
  auth: {
    api: {
      changePassword,
    },
  },
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: (headers: unknown) => headers,
}));

import { MeController } from "./me.controller";

describe("MeController", () => {
  const prisma = {
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
  };
  let controller: MeController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MeController(prisma as never);
  });

  const user = { id: "u1", email: "admin@example.com", name: "Admin" };
  const req = { headers: {} } as never;
  const strong = "MySecurePass12!";

  it("rejects when new password equals current password before changePassword", async () => {
    const same = "SamePassword12!";
    await expect(
      controller.changePassword(user, { currentPassword: same, newPassword: same }, req),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it.each([
    "Password123!",
    "password123456",
    "123456789012",
    "qwertyuiopas",
    "adminadmin12",
  ])("rejects common weak password %s", async (weak) => {
    await expect(
      controller.changePassword(
        user,
        { currentPassword: strong, newPassword: weak },
        req,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("calls changePassword and clears mustChangePassword on success", async () => {
    changePassword.mockResolvedValue(undefined);
    const res = await controller.changePassword(
      user,
      { currentPassword: strong, newPassword: "AnotherStrong1!" },
      req,
    );
    expect(changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          currentPassword: strong,
          newPassword: "AnotherStrong1!",
          revokeOtherSessions: true,
        }),
      }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { mustChangePassword: false },
    });
    expect(res).toEqual({ ok: true });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("./auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: (headers: unknown) => headers,
}));

import { AdminGuard, AuthGuard } from "./auth.guard";

function fakeContext(req: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as ExecutionContext;
}

describe("AuthGuard", () => {
  const guard = new AuthGuard();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UnauthorizedException when there is no session", async () => {
    getSession.mockResolvedValue(null);
    const req = { headers: {} };
    await expect(guard.canActivate(fakeContext(req))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("sets req.user and returns true when session exists", async () => {
    const user = { id: "u1", email: "a@example.com" };
    const session = { id: "s1" };
    getSession.mockResolvedValue({ user, session });
    const req: Record<string, unknown> = { headers: {} };
    await expect(guard.canActivate(fakeContext(req))).resolves.toBe(true);
    expect(req.user).toEqual(user);
    expect(req.session).toEqual(session);
  });
});

describe("AdminGuard", () => {
  const guard = new AdminGuard();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UnauthorizedException when there is no session", async () => {
    getSession.mockResolvedValue(null);
    await expect(
      guard.canActivate(fakeContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("throws ForbiddenException when role is missing", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", role: undefined },
      session: {},
    });
    await expect(
      guard.canActivate(fakeContext({ headers: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws ForbiddenException when role is NONE", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", role: "NONE" },
      session: {},
    });
    await expect(
      guard.canActivate(fakeContext({ headers: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws MUST_CHANGE_PASSWORD when mustChangePassword is true", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", role: "ADMIN", mustChangePassword: true },
      session: {},
    });
    await expect(
      guard.canActivate(fakeContext({ headers: {} })),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: "MUST_CHANGE_PASSWORD" }),
    });
  });

  it("allows ADMIN without mustChangePassword", async () => {
    const user = { id: "u1", role: "ADMIN", mustChangePassword: false };
    getSession.mockResolvedValue({ user, session: { id: "s1" } });
    const req: Record<string, unknown> = { headers: {} };
    await expect(guard.canActivate(fakeContext(req))).resolves.toBe(true);
    expect(req.user).toEqual(user);
  });

  it("allows EDITOR without mustChangePassword", async () => {
    const user = { id: "u1", role: "EDITOR", mustChangePassword: false };
    getSession.mockResolvedValue({ user, session: {} });
    const req: Record<string, unknown> = { headers: {} };
    await expect(guard.canActivate(fakeContext(req))).resolves.toBe(true);
    expect(req.user).toEqual(user);
  });
});

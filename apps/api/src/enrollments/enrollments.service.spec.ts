import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpException } from "@nestjs/common";

vi.mock("@vh/database", () => ({
  EnrollmentStatus: {
    NEW: "NEW",
    SENT: "SENT",
    FAILED: "FAILED",
    HANDLED: "HANDLED",
  },
}));

import { EnrollmentsService } from "./enrollments.service";

describe("EnrollmentsService", () => {
  const prisma = {
    enrollment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  const redis = { client: null };
  const queue = { add: vi.fn().mockResolvedValue(undefined) };
  let service: EnrollmentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EnrollmentsService(prisma as never, redis as never, queue as never);
    service.onModuleInit();
  });

  it("ignores honeypot submissions", async () => {
    const res = await service.create(
      {
        name: "Bot",
        email: "bot@example.com",
        privacyConsent: true,
        website: "http://spam",
      },
      "1.1.1.1",
    );
    expect(res).toEqual({ ok: true, id: "ignored" });
    expect(prisma.enrollment.create).not.toHaveBeenCalled();
  });

  it("creates enrollment when consent is given", async () => {
    prisma.enrollment.create.mockResolvedValue({ id: "e1" });
    const res = await service.create(
      {
        name: "Ana",
        email: "ana@example.com",
        privacyConsent: true,
        phone: "910000000",
        message: "Olá",
      },
      "9.9.9.9",
    );
    expect(res).toEqual({ ok: true, id: "e1" });
    expect(prisma.enrollment.create).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalled();
  });

  it("rate-limits after 5 requests from same IP", async () => {
    prisma.enrollment.create.mockResolvedValue({ id: "e" });
    for (let i = 0; i < 5; i++) {
      await service.create(
        { name: "A", email: "a@example.com", privacyConsent: true },
        "8.8.8.8",
      );
    }
    await expect(
      service.create(
        { name: "A", email: "a@example.com", privacyConsent: true },
        "8.8.8.8",
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it("erases personal data for GDPR", async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: "e2",
      erasedAt: null,
      status: "NEW",
    });
    prisma.enrollment.update.mockResolvedValue({});
    await service.eraseGdpr("e2");
    expect(prisma.enrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "e2" },
        data: expect.objectContaining({
          name: "Apagado (RGPD)",
          phone: null,
          message: null,
        }),
      }),
    );
  });

  it("exports GDPR JSON for an active enrollment", async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: "e3",
      erasedAt: null,
      name: "Ana",
      email: "ana@example.com",
      phone: null,
      message: "x",
      status: "NEW",
      privacyConsent: true,
      consentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const payload = await service.exportGdpr("e3");
    expect(payload.format).toBe("vh-enrollment-gdpr-v1");
    expect(payload.enrollment.email).toBe("ana@example.com");
  });

  it("updates status and retries email", async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: "e4",
      erasedAt: null,
      status: "FAILED",
    });
    prisma.enrollment.update.mockResolvedValue({ id: "e4", status: "HANDLED" });
    await service.updateStatus("e4", { status: "HANDLED" });
    await service.retryEmail("e4");
    expect(queue.add).toHaveBeenCalled();
  });

  it("lists only non-erased enrollments", async () => {
    prisma.enrollment.findMany.mockResolvedValue([]);
    await service.listAdmin();
    expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { erasedAt: null } }),
    );
  });
});


import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMail } = vi.hoisted(() => ({
  sendMail: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({ sendMail })),
}));

vi.mock("@vh/database", () => ({
  EnrollmentStatus: { SENT: "SENT", FAILED: "FAILED" },
}));

import { EnrollmentEmailProcessor } from "./enrollment.processor";

describe("EnrollmentEmailProcessor", () => {
  const prisma = {
    enrollment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  let processor: EnrollmentEmailProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new EnrollmentEmailProcessor(prisma as never);
    process.env.ENROLLMENT_NOTIFY_TO = "notify@cliente.pt";
    process.env.SMTP_HOST = "smtp.example.com";
  });

  it("returns early when enrollment is missing", async () => {
    prisma.enrollment.findUnique.mockResolvedValue(null);
    await processor.process({ data: { enrollmentId: "e1" } } as never);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("throws when ENROLLMENT_NOTIFY_TO is empty", async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: "e1",
      name: "Ana",
      email: "a@example.com",
      privacyConsent: true,
    });
    process.env.ENROLLMENT_NOTIFY_TO = "  ";
    await expect(
      processor.process({ data: { enrollmentId: "e1" } } as never),
    ).rejects.toThrow(/ENROLLMENT_NOTIFY_TO/);
  });

  it("sends mail and marks SENT on success", async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: "e1",
      name: "Ana",
      email: "a@example.com",
      phone: "910",
      message: "Hi",
      privacyConsent: true,
    });
    sendMail.mockResolvedValue({});
    prisma.enrollment.update.mockResolvedValue({});
    await processor.process({ data: { enrollmentId: "e1" } } as never);
    expect(sendMail).toHaveBeenCalled();
    expect(prisma.enrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "SENT" } }),
    );
  });

  it("marks FAILED when sendMail throws", async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      id: "e1",
      name: "Ana",
      email: "a@example.com",
      privacyConsent: false,
    });
    sendMail.mockRejectedValue(new Error("smtp down"));
    prisma.enrollment.update.mockResolvedValue({});
    await expect(
      processor.process({ data: { enrollmentId: "e1" } } as never),
    ).rejects.toThrow("smtp down");
    expect(prisma.enrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "FAILED" } }),
    );
  });
});

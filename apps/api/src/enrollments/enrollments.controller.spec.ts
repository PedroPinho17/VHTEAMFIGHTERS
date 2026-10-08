import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { EnrollmentsController } from "./enrollments.controller";

describe("EnrollmentsController", () => {
  const enrollmentsService = {
    create: vi.fn(),
    listAdmin: vi.fn(),
    updateStatus: vi.fn(),
    retryEmail: vi.fn(),
    exportGdpr: vi.fn(),
    eraseGdpr: vi.fn(),
  };
  let controller: EnrollmentsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new EnrollmentsController(enrollmentsService as never);
  });

  it("create passes clientIp from request", async () => {
    enrollmentsService.create.mockResolvedValue({ ok: true, id: "e1" });
    const dto = { name: "Ana", email: "a@example.com", privacyConsent: true };
    const req = { ip: "203.0.113.1", socket: { remoteAddress: "127.0.0.1" } };
    await controller.create(dto as never, req);
    expect(enrollmentsService.create).toHaveBeenCalledWith(dto, "203.0.113.1");
  });

  it("gdpr erase without confirm throws BadRequestException", () => {
    expect(() => controller.erase("e1", {})).toThrow(BadRequestException);
    expect(enrollmentsService.eraseGdpr).not.toHaveBeenCalled();
  });

  it("gdpr erase with confirm delegates to service", async () => {
    enrollmentsService.eraseGdpr.mockResolvedValue({ ok: true });
    await controller.erase("e1", { confirm: true });
    expect(enrollmentsService.eraseGdpr).toHaveBeenCalledWith("e1");
  });

  it("delegates listAdmin, updateStatus and retry", async () => {
    await controller.listAdmin();
    await controller.updateStatus("e1", { status: "HANDLED" } as never);
    await controller.retry("e1");
    expect(enrollmentsService.listAdmin).toHaveBeenCalled();
    expect(enrollmentsService.updateStatus).toHaveBeenCalledWith("e1", {
      status: "HANDLED",
    });
    expect(enrollmentsService.retryEmail).toHaveBeenCalledWith("e1");
  });

  it("gdpr export sets Content-Disposition header", async () => {
    const payload = { id: "e1", name: "Ana" };
    enrollmentsService.exportGdpr.mockResolvedValue(payload);
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
    };
    const result = await controller.gdprExport("e1", res as never);
    expect(headers["Content-Type"]).toBe("application/json; charset=utf-8");
    expect(headers["Content-Disposition"]).toBe(
      'attachment; filename="gdpr-export-enrollment-e1.json"',
    );
    expect(result).toEqual(payload);
  });
});

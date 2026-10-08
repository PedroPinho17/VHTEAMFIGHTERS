import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ContactService } from "./contact.service";

describe("ContactService", () => {
  const prisma = {
    contactSettings: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  };
  const redis = { getJson: vi.fn(), setJson: vi.fn(), del: vi.fn() };
  let service: ContactService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContactService(prisma as never, redis as never);
  });

  it("getPublic returns cache hit", async () => {
    const row = { id: "c1", email: "info@example.com" };
    redis.getJson.mockResolvedValue(row);
    await expect(service.getPublic()).resolves.toEqual(row);
  });

  it("getPublic throws when not configured", async () => {
    redis.getJson.mockResolvedValue(null);
    prisma.contactSettings.findFirst.mockResolvedValue(null);
    await expect(service.getPublic()).rejects.toBeInstanceOf(NotFoundException);
  });

  it("update invalidates cache", async () => {
    prisma.contactSettings.findFirst.mockResolvedValue({ id: "c1" });
    prisma.contactSettings.update.mockResolvedValue({ id: "c1" });
    await service.update({ email: "x@example.com" } as never);
    expect(redis.del).toHaveBeenCalledWith("public:contact");
  });

  it("getAdmin reads from prisma", async () => {
    prisma.contactSettings.findFirst.mockResolvedValue({ id: "c1" });
    await service.getAdmin();
    expect(prisma.contactSettings.findFirst).toHaveBeenCalled();
  });
});

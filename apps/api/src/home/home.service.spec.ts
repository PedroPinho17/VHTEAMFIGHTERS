import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { HomeService } from "./home.service";

describe("HomeService", () => {
  const prisma = {
    siteHome: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  };
  const redis = { getJson: vi.fn(), setJson: vi.fn(), del: vi.fn() };
  let service: HomeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HomeService(prisma as never, redis as never);
  });

  it("getPublic cache miss stores result", async () => {
    redis.getJson.mockResolvedValue(null);
    const home = { id: "h1", heroTitle: "VH" };
    prisma.siteHome.findFirst.mockResolvedValue(home);
    await expect(service.getPublic()).resolves.toEqual(home);
    expect(redis.setJson).toHaveBeenCalledWith("public:home", home, 120);
  });

  it("getPublic throws when homepage missing", async () => {
    redis.getJson.mockResolvedValue(null);
    prisma.siteHome.findFirst.mockResolvedValue(null);
    await expect(service.getPublic()).rejects.toBeInstanceOf(NotFoundException);
  });

  it("update on existing row invalidates cache", async () => {
    prisma.siteHome.findFirst.mockResolvedValue({ id: "h1" });
    prisma.siteHome.update.mockResolvedValue({ id: "h1" });
    await service.update({ heroTitle: "New" } as never);
    expect(redis.del).toHaveBeenCalledWith("public:home");
  });

  it("getAdmin reads first row", async () => {
    await service.getAdmin();
    expect(prisma.siteHome.findFirst).toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { EventsService } from "./events.service";

describe("EventsService", () => {
  const prisma = {
    event: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const redis = { getJson: vi.fn(), setJson: vi.fn(), del: vi.fn() };
  let service: EventsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EventsService(prisma as never, redis as never);
  });

  it("listPublic uses cache", async () => {
    redis.getJson.mockResolvedValue([{ id: "ev1" }]);
    await expect(service.listPublic()).resolves.toEqual([{ id: "ev1" }]);
  });

  it("getPublic throws when not found", async () => {
    prisma.event.findFirst.mockResolvedValue(null);
    await expect(service.getPublic("x")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("create invalidates cache", async () => {
    prisma.event.create.mockResolvedValue({ id: "ev1" });
    await service.create({ title: "Fight", date: "2026-01-01", published: true } as never);
    expect(redis.del).toHaveBeenCalledWith("public:events");
  });

  it("listAdmin orders by date desc", async () => {
    prisma.event.findMany.mockResolvedValue([]);
    await service.listAdmin();
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { date: "desc" } }),
    );
  });

  it("remove deletes and invalidates", async () => {
    prisma.event.delete.mockResolvedValue({});
    await service.remove("ev1");
    expect(redis.del).toHaveBeenCalledWith("public:events");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";

describe("ScheduleService", () => {
  const prisma = {
    trainingSlot: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const redis = { getJson: vi.fn(), setJson: vi.fn(), del: vi.fn() };
  let service: ScheduleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ScheduleService(prisma as never, redis as never);
  });

  it("listPublic cache miss", async () => {
    redis.getJson.mockResolvedValue(null);
    prisma.trainingSlot.findMany.mockResolvedValue([]);
    await service.listPublic();
    expect(redis.setJson).toHaveBeenCalledWith("public:schedule", [], 120);
  });

  it("get throws when slot missing", async () => {
    prisma.trainingSlot.findUnique.mockResolvedValue(null);
    await expect(service.get("x")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("create invalidates cache", async () => {
    prisma.trainingSlot.create.mockResolvedValue({ id: "s1" });
    await service.create({ day: "MON", startTime: "18:00" } as never);
    expect(redis.del).toHaveBeenCalledWith("public:schedule");
  });

  it("update invalidates cache", async () => {
    prisma.trainingSlot.update.mockResolvedValue({ id: "s1" });
    await service.update("s1", { day: "TUE" } as never);
    expect(redis.del).toHaveBeenCalledWith("public:schedule");
  });

  it("listAdmin queries slots", async () => {
    await service.listAdmin();
    expect(prisma.trainingSlot.findMany).toHaveBeenCalled();
  });
});

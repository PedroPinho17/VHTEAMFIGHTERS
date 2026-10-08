import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { PeopleService } from "./people.service";

describe("PeopleService", () => {
  const prisma = {
    person: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const redis = {
    getJson: vi.fn(),
    setJson: vi.fn(),
    del: vi.fn(),
  };
  let service: PeopleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PeopleService(prisma as never, redis as never);
  });

  it("listPublic returns cached data on hit", async () => {
    const cached = [{ id: "p1", name: "Ana" }];
    redis.getJson.mockResolvedValue(cached);
    await expect(service.listPublic()).resolves.toEqual(cached);
    expect(prisma.person.findMany).not.toHaveBeenCalled();
  });

  it("listPublic loads from prisma and caches on miss", async () => {
    redis.getJson.mockResolvedValue(null);
    const people = [{ id: "p1" }];
    prisma.person.findMany.mockResolvedValue(people);
    await expect(service.listPublic()).resolves.toEqual(people);
    expect(redis.setJson).toHaveBeenCalledWith("public:people:all", people, 120);
  });

  it("get throws NotFoundException when missing", async () => {
    prisma.person.findUnique.mockResolvedValue(null);
    await expect(service.get("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("create invalidates public caches", async () => {
    prisma.person.create.mockResolvedValue({ id: "p1" });
    await service.create({ name: "Ana" } as never);
    expect(redis.del).toHaveBeenCalledWith(
      "public:people:all",
      "public:people:FIGHTER",
      "public:people:COACH",
    );
  });

  it("listAdmin queries all people", async () => {
    prisma.person.findMany.mockResolvedValue([]);
    await service.listAdmin();
    expect(prisma.person.findMany).toHaveBeenCalled();
  });
});

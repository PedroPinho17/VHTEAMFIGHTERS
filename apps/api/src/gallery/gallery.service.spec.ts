import { beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryService } from "./gallery.service";

describe("GalleryService", () => {
  const prisma = {
    galleryItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const redis = { getJson: vi.fn(), setJson: vi.fn(), del: vi.fn() };
  let service: GalleryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GalleryService(prisma as never, redis as never);
  });

  it("listPublic cache hit", async () => {
    const items = [{ id: "g1" }];
    redis.getJson.mockResolvedValue(items);
    await expect(service.listPublic()).resolves.toEqual(items);
  });

  it("listAdmin reads all items", async () => {
    await service.listAdmin();
    expect(prisma.galleryItem.findMany).toHaveBeenCalled();
  });

  it("create invalidates cache", async () => {
    prisma.galleryItem.create.mockResolvedValue({ id: "g1" });
    await service.create({ title: "Photo", imageUrl: "http://x/y.jpg" } as never);
    expect(redis.del).toHaveBeenCalledWith("public:gallery");
  });

  it("update invalidates cache", async () => {
    prisma.galleryItem.update.mockResolvedValue({ id: "g1" });
    await service.update("g1", { title: "P2" } as never);
    expect(redis.del).toHaveBeenCalledWith("public:gallery");
  });

  it("remove invalidates cache", async () => {
    await service.remove("g1");
    expect(redis.del).toHaveBeenCalledWith("public:gallery");
  });
});

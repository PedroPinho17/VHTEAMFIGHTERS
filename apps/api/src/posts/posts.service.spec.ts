import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { PostsService } from "./posts.service";

describe("PostsService", () => {
  const prisma = {
    post: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const redis = { getJson: vi.fn(), setJson: vi.fn(), del: vi.fn() };
  let service: PostsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PostsService(prisma as never, redis as never);
  });

  it("listPublic cache miss", async () => {
    redis.getJson.mockResolvedValue(null);
    prisma.post.findMany.mockResolvedValue([]);
    await service.listPublic();
    expect(redis.setJson).toHaveBeenCalledWith("public:posts", [], 120);
  });

  it("getBySlug throws when missing", async () => {
    prisma.post.findFirst.mockResolvedValue(null);
    await expect(service.getBySlug("nope")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("create invalidates cache", async () => {
    prisma.post.create.mockResolvedValue({ id: "p1" });
    await service.create({
      title: "T",
      slug: "t",
      published: true,
    } as never);
    expect(redis.del).toHaveBeenCalledWith("public:posts");
  });

  it("update invalidates cache", async () => {
    prisma.post.update.mockResolvedValue({ id: "p1" });
    await service.update("p1", { title: "T", slug: "t", published: false } as never);
    expect(redis.del).toHaveBeenCalledWith("public:posts");
  });

  it("listAdmin queries posts", async () => {
    await service.listAdmin();
    expect(prisma.post.findMany).toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostsController } from "./posts.controller";

describe("PostsController", () => {
  const postsService = {
    listPublic: vi.fn(),
    getBySlug: vi.fn(),
    listAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  let controller: PostsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PostsController(postsService as never);
  });

  it("delegates to posts service", async () => {
    await controller.listPublic();
    await controller.getBySlug("hello");
    await controller.listAdmin();
    await controller.create({ slug: "hello" } as never);
    await controller.update("p1", { slug: "hi" } as never);
    await controller.remove("p1");
    expect(postsService.getBySlug).toHaveBeenCalledWith("hello");
    expect(postsService.remove).toHaveBeenCalledWith("p1");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryController } from "./gallery.controller";

describe("GalleryController", () => {
  const galleryService = {
    listPublic: vi.fn(),
    listAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  let controller: GalleryController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new GalleryController(galleryService as never);
  });

  it("delegates to gallery service", async () => {
    await controller.listPublic();
    await controller.listAdmin();
    await controller.create({ title: "P" } as never);
    await controller.update("g1", { title: "Q" } as never);
    await controller.remove("g1");
    expect(galleryService.listPublic).toHaveBeenCalled();
    expect(galleryService.remove).toHaveBeenCalledWith("g1");
  });
});

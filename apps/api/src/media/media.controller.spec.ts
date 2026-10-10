import { beforeEach, describe, expect, it, vi } from "vitest";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { MediaController } from "./media.controller";
import { AdminGuard } from "../auth/auth.guard";

describe("MediaController", () => {
  const mediaService = {
    createPresignedUpload: vi.fn(),
  };
  let controller: MediaController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MediaController(mediaService as never);
  });

  it("presign delegates to media service", async () => {
    mediaService.createPresignedUpload.mockResolvedValue({ key: "k" });
    await controller.presign({ contentType: "image/png", folder: "gallery" });
    expect(mediaService.createPresignedUpload).toHaveBeenCalledWith(
      "image/png",
      "gallery",
    );
  });

  it("is protected by AdminGuard at class level", () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, MediaController) ??
      []) as unknown[];
    expect(guards).toContain(AdminGuard);
  });
});


import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaController } from "./media.controller";

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
    await controller.presign({ contentType: "image/png", folder: "photos" });
    expect(mediaService.createPresignedUpload).toHaveBeenCalledWith(
      "image/png",
      "photos",
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeController } from "./home.controller";

describe("HomeController", () => {
  const homeService = { getPublic: vi.fn(), getAdmin: vi.fn(), update: vi.fn() };
  let controller: HomeController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeController(homeService as never);
  });

  it("delegates to home service", async () => {
    await controller.getPublic();
    await controller.getAdmin();
    await controller.update({ heroTitle: "VH" } as never);
    expect(homeService.getPublic).toHaveBeenCalled();
    expect(homeService.getAdmin).toHaveBeenCalled();
    expect(homeService.update).toHaveBeenCalled();
  });
});

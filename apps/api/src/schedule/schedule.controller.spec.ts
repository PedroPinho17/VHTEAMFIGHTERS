import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScheduleController } from "./schedule.controller";

describe("ScheduleController", () => {
  const scheduleService = {
    listPublic: vi.fn(),
    listAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  let controller: ScheduleController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ScheduleController(scheduleService as never);
  });

  it("delegates to schedule service", async () => {
    await controller.listPublic();
    await controller.listAdmin();
    await controller.create({ day: "MON" } as never);
    await controller.update("s1", { day: "TUE" } as never);
    await controller.remove("s1");
    expect(scheduleService.remove).toHaveBeenCalledWith("s1");
  });
});

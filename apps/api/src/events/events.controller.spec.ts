import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventsController } from "./events.controller";

describe("EventsController", () => {
  const eventsService = {
    listPublic: vi.fn(),
    getPublic: vi.fn(),
    listAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  let controller: EventsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new EventsController(eventsService as never);
  });

  it("delegates public and admin routes", async () => {
    await controller.listPublic();
    await controller.getPublic("ev1");
    await controller.listAdmin();
    await controller.create({ title: "T" } as never);
    await controller.update("ev1", { title: "U" } as never);
    await controller.remove("ev1");
    expect(eventsService.listPublic).toHaveBeenCalled();
    expect(eventsService.getPublic).toHaveBeenCalledWith("ev1");
    expect(eventsService.remove).toHaveBeenCalledWith("ev1");
  });
});

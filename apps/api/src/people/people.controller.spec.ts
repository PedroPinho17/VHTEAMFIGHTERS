import { beforeEach, describe, expect, it, vi } from "vitest";
import { PeopleController } from "./people.controller";

describe("PeopleController", () => {
  const peopleService = {
    listPublic: vi.fn(),
    listAdmin: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  let controller: PeopleController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PeopleController(peopleService as never);
  });

  it("delegates listPublic with role", async () => {
    peopleService.listPublic.mockResolvedValue([]);
    await controller.listPublic("FIGHTER" as never);
    expect(peopleService.listPublic).toHaveBeenCalledWith("FIGHTER");
  });

  it("delegates admin CRUD", async () => {
    await controller.listAdmin();
    await controller.get("p1");
    await controller.create({ name: "A" } as never);
    await controller.update("p1", { name: "B" } as never);
    await controller.remove("p1");
    expect(peopleService.listAdmin).toHaveBeenCalled();
    expect(peopleService.get).toHaveBeenCalledWith("p1");
    expect(peopleService.create).toHaveBeenCalled();
    expect(peopleService.update).toHaveBeenCalledWith("p1", { name: "B" });
    expect(peopleService.remove).toHaveBeenCalledWith("p1");
  });
});

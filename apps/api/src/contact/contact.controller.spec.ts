import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactController } from "./contact.controller";

describe("ContactController", () => {
  const contactService = {
    getPublic: vi.fn(),
    getAdmin: vi.fn(),
    update: vi.fn(),
  };
  let controller: ContactController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ContactController(contactService as never);
  });

  it("delegates to contact service", async () => {
    await controller.getPublic();
    await controller.getAdmin();
    await controller.update({ email: "x@example.com" } as never);
    expect(contactService.getPublic).toHaveBeenCalled();
    expect(contactService.getAdmin).toHaveBeenCalled();
    expect(contactService.update).toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from "vitest";
import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  it("connects on module init", async () => {
    const service = new PrismaService();
    service.$connect = vi.fn().mockResolvedValue(undefined);
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it("disconnects on module destroy", async () => {
    const service = new PrismaService();
    service.$disconnect = vi.fn().mockResolvedValue(undefined);
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const redisClient = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  quit: vi.fn(),
};

vi.mock("ioredis", () => ({
  default: vi.fn(function RedisMock() {
    return redisClient;
  }),
}));

import { RedisService } from "./redis.service";

describe("RedisService", () => {
  let service: RedisService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RedisService();
  });

  it("getJson parses stored JSON", async () => {
    redisClient.get.mockResolvedValue('{"a":1}');
    await expect(service.getJson("k")).resolves.toEqual({ a: 1 });
  });

  it("getJson returns null for missing key", async () => {
    redisClient.get.mockResolvedValue(null);
    await expect(service.getJson("k")).resolves.toBeNull();
  });

  it("setJson stringifies with TTL", async () => {
    await service.setJson("k", { x: 2 }, 90);
    expect(redisClient.set).toHaveBeenCalledWith("k", '{"x":2}', "EX", 90);
  });

  it("del skips when no keys", async () => {
    await service.del();
    expect(redisClient.del).not.toHaveBeenCalled();
  });

  it("onModuleDestroy quits client", async () => {
    await service.onModuleDestroy();
    expect(redisClient.quit).toHaveBeenCalled();
  });
});

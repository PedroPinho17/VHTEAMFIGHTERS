import { describe, expect, it, vi } from "vitest";
import { SlidingWindowRateLimiter, clientIp, RedisRateLimiter } from "./rate-limit";

describe("clientIp", () => {
  it("uses req.ip and ignores spoofed X-Forwarded-For", () => {
    const req = {
      ip: "203.0.113.10",
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      socket: { remoteAddress: "10.0.0.1" },
    };
    // clientIp must not read headers — only ip/socket
    expect(clientIp(req)).toBe("203.0.113.10");
  });

  it("falls back to socket address", () => {
    expect(clientIp({ socket: { remoteAddress: "127.0.0.1" } })).toBe("127.0.0.1");
  });
});

describe("SlidingWindowRateLimiter", () => {
  it("allows up to the limit then blocks", () => {
    const limiter = new SlidingWindowRateLimiter(2, 60_000);
    expect(limiter.allow("a")).toBe(true);
    expect(limiter.allow("a")).toBe(true);
    expect(limiter.allow("a")).toBe(false);
  });
});

describe("RedisRateLimiter", () => {
  it("falls back to memory when redis is null", async () => {
    const limiter = new RedisRateLimiter(null, 1, 60_000, "t");
    expect(await limiter.allow("ip")).toBe(true);
    expect(await limiter.allow("ip")).toBe(false);
  });

  it("uses redis incr and sets expiry on first hit", async () => {
    const redis = {
      incr: vi.fn().mockResolvedValue(1),
      pexpire: vi.fn().mockResolvedValue(1),
    };
    const limiter = new RedisRateLimiter(redis as never, 2, 60_000, "enroll");
    expect(await limiter.allow("1.2.3.4")).toBe(true);
    expect(redis.incr).toHaveBeenCalledWith("enroll:1.2.3.4");
    expect(redis.pexpire).toHaveBeenCalledWith("enroll:1.2.3.4", 60_000);
  });

  it("falls back to memory when redis throws", async () => {
    const redis = {
      incr: vi.fn().mockRejectedValue(new Error("redis down")),
    };
    const limiter = new RedisRateLimiter(redis as never, 1, 60_000, "t");
    expect(await limiter.allow("ip")).toBe(true);
    expect(await limiter.allow("ip")).toBe(false);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpException, HttpStatus } from "@nestjs/common";

const s3Send = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function S3ClientMock() {
    return { send: s3Send };
  }),
  HeadBucketCommand: vi.fn(function HeadBucketCommand(input: unknown) {
    return { type: "HeadBucket", input };
  }),
}));

import { HealthController } from "./health.controller";

describe("HealthController", () => {
  const prisma = {
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  };
  const redis = {
    client: {
      ping: vi.fn().mockResolvedValue("PONG"),
    },
  };
  let controller: HealthController;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.HEALTH_CHECK_S3;
    controller = new HealthController(prisma as never, redis as never);
    prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    redis.client.ping.mockResolvedValue("PONG");
  });

  it("health returns ok when postgres and redis are up", async () => {
    const body = await controller.check();
    expect(body.status).toBe("ok");
    expect(body.checks.postgres).toBe("ok");
    expect(body.checks.redis).toBe("ok");
    expect(body.checks.s3).toBe("skipped");
  });

  it("ready throws SERVICE_UNAVAILABLE when postgres fails", async () => {
    prisma.$queryRaw.mockRejectedValue(new Error("db down"));
    s3Send.mockResolvedValue({});
    await expect(controller.ready()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: expect.objectContaining({
        status: "degraded",
        checks: expect.objectContaining({ postgres: "error" }),
      }),
    });
  });

  it("ready throws when redis ping is not PONG", async () => {
    redis.client.ping.mockResolvedValue("NOPE");
    s3Send.mockResolvedValue({});
    await expect(controller.ready()).rejects.toBeInstanceOf(HttpException);
  });

  it("ready returns ok when all dependencies including S3 are healthy", async () => {
    s3Send.mockResolvedValue({});
    const body = await controller.ready();
    expect(body.status).toBe("ok");
    expect(body.checks.s3).toBe("ok");
  });

  it("ready is degraded when S3 HeadBucket fails", async () => {
    s3Send.mockRejectedValue(new Error("s3 down"));
    await expect(controller.ready()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      response: expect.objectContaining({
        checks: expect.objectContaining({ s3: "error" }),
      }),
    });
  });
});

import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

@Controller("api")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get("health")
  async check() {
    return this.buildStatus(false);
  }

  /** Readiness: Postgres + Redis + S3 (para orquestradores / Coolify). */
  @Get("ready")
  async ready() {
    return this.buildStatus(true);
  }

  private async buildStatus(requireS3: boolean) {
    const checks: Record<string, "ok" | "error" | "skipped"> = {
      postgres: "ok",
      redis: "ok",
      s3: "skipped",
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      checks.postgres = "error";
    }

    try {
      const pong = await this.redis.client.ping();
      if (pong !== "PONG") checks.redis = "error";
    } catch {
      checks.redis = "error";
    }

    if (requireS3 || process.env.HEALTH_CHECK_S3 === "true") {
      try {
        const bucket = process.env.S3_BUCKET ?? "vh-media";
        const client = new S3Client({
          region: process.env.S3_REGION ?? "us-east-1",
          endpoint: process.env.S3_ENDPOINT,
          forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY ?? "",
            secretAccessKey: process.env.S3_SECRET_KEY ?? "",
          },
          requestChecksumCalculation: "WHEN_REQUIRED",
          responseChecksumValidation: "WHEN_REQUIRED",
        });
        await client.send(new HeadBucketCommand({ Bucket: bucket }));
        checks.s3 = "ok";
      } catch {
        checks.s3 = "error";
      }
    }

    const relevant = Object.entries(checks).filter(([, v]) => v !== "skipped");
    const healthy = relevant.every(([, v]) => v === "ok");
    const body = {
      status: healthy ? "ok" : "degraded",
      service: "vh-api",
      checks,
      ts: new Date().toISOString(),
    };

    if (!healthy) {
      throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return body;
  }
}

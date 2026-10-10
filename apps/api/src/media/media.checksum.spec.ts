import { describe, expect, it } from "vitest";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Regression: AWS SDK v3 flexible checksums embed x-amz-checksum-crc32=AAAAAA==
 * (empty-body CRC32) into presigned PUT URLs → Garage/R2 InvalidDigest.
 */
describe("S3 presign checksum configuration", () => {
  it("does not embed empty CRC32 checksum in the presigned URL", async () => {
    const client = new S3Client({
      region: "garage",
      endpoint: "http://localhost:3900",
      forcePathStyle: true,
      credentials: {
        accessKeyId: "GKtestdummy0123456789abcdef012",
        secretAccessKey: "a".repeat(64),
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: "vh-media",
        Key: "gallery/smoke.png",
        ContentType: "image/png",
      }),
      { expiresIn: 600 },
    );

    expect(url).not.toMatch(/x-amz-checksum/i);
    expect(url).not.toMatch(/x-amz-sdk-checksum-algorithm/i);
    expect(url).not.toMatch(/AAAAAA==/);
  });
});

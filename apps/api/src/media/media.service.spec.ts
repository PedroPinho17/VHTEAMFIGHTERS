import { beforeEach, describe, expect, it, vi } from "vitest";

const { send, getSignedUrl, S3ClientMock } = vi.hoisted(() => {
  const send = vi.fn();
  const getSignedUrl = vi.fn();
  const S3ClientMock = vi.fn(function S3ClientMock(
    this: unknown,
    config?: unknown,
  ) {
    (S3ClientMock as unknown as { lastConfig?: unknown }).lastConfig = config;
    return { send };
  });
  return { send, getSignedUrl, S3ClientMock };
});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: S3ClientMock,
  HeadBucketCommand: vi.fn(function HeadBucketCommand(input: unknown) {
    return { type: "HeadBucket", input };
  }),
  CreateBucketCommand: vi.fn(function CreateBucketCommand(input: unknown) {
    return { type: "CreateBucket", input };
  }),
  PutObjectCommand: vi.fn(function PutObjectCommand(input: unknown) {
    return { type: "PutObject", input };
  }),
  PutBucketCorsCommand: vi.fn(function PutBucketCorsCommand(input: unknown) {
    return { type: "PutBucketCors", input };
  }),
  PutBucketWebsiteCommand: vi.fn(function PutBucketWebsiteCommand(input: unknown) {
    return { type: "PutBucketWebsite", input };
  }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => getSignedUrl(...args),
}));

vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomUUID: () => "00000000-0000-4000-8000-000000000001",
  };
});

import { MediaService } from "./media.service";
import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

describe("MediaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.S3_PUBLIC_URL;
    delete process.env.S3_PUBLIC_INCLUDE_BUCKET;
    process.env.S3_BUCKET = "vh-media";
    send.mockResolvedValue({});
  });

  it("configures S3Client with WHEN_REQUIRED checksum options", () => {
    new MediaService();
    expect(S3ClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      }),
    );
  });

  it("createPresignedUpload returns key, uploadUrl and publicUrl without bucket path", async () => {
    getSignedUrl.mockResolvedValue("https://signed/upload");
    const service = new MediaService();
    const result = await service.createPresignedUpload("image/png", "gallery");
    expect(result.uploadUrl).toBe("https://signed/upload");
    expect(result.key).toMatch(/^gallery\/00000000-0000-4000-8000-000000000001\.png$/);
    expect(result.publicUrl).toBe(
      "http://vh-media.web.garage.localhost:3902/gallery/00000000-0000-4000-8000-000000000001.png",
    );
    expect(getSignedUrl).toHaveBeenCalled();
  });

  it("rejects non-image content types", async () => {
    const service = new MediaService();
    await expect(service.createPresignedUpload("text/html", "gallery")).rejects.toThrow(
      /contentType/i,
    );
  });

  it("rejects path-traversal folders", async () => {
    const service = new MediaService();
    await expect(service.createPresignedUpload("image/png", "../x")).rejects.toThrow(
      /folder/i,
    );
  });

  it("getPublicUrl strips trailing slash; optional bucket segment", () => {
    process.env.S3_PUBLIC_URL = "https://cdn.example.com/";
    const service = new MediaService();
    expect(service.getPublicUrl("uploads/x.jpg")).toBe(
      "https://cdn.example.com/uploads/x.jpg",
    );

    process.env.S3_PUBLIC_INCLUDE_BUCKET = "true";
    const withBucket = new MediaService();
    expect(withBucket.getPublicUrl("uploads/x.jpg")).toBe(
      "https://cdn.example.com/vh-media/uploads/x.jpg",
    );
  });

  it("pingBucket returns true when HeadBucket succeeds", async () => {
    send.mockResolvedValue({});
    const service = new MediaService();
    await expect(service.pingBucket()).resolves.toBe(true);
  });

  it("pingBucket returns false when HeadBucket fails", async () => {
    send.mockRejectedValue(new Error("down"));
    const service = new MediaService();
    await expect(service.pingBucket()).resolves.toBe(false);
  });

  it("onModuleInit creates bucket when HeadBucket fails", async () => {
    send.mockRejectedValueOnce(new Error("404")).mockResolvedValue({});
    const service = new MediaService();
    await service.onModuleInit();
    expect(send).toHaveBeenCalled();
    expect(HeadBucketCommand).toHaveBeenCalled();
    expect(CreateBucketCommand).toHaveBeenCalled();
  });
});

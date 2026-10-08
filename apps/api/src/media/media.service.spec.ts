import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const getSignedUrl = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function S3ClientMock() {
    return { send };
  }),
  HeadBucketCommand: vi.fn(function HeadBucketCommand(input: unknown) {
    return { type: "HeadBucket", input };
  }),
  CreateBucketCommand: vi.fn(function CreateBucketCommand(input: unknown) {
    return { type: "CreateBucket", input };
  }),
  PutObjectCommand: vi.fn(function PutObjectCommand(input: unknown) {
    return { type: "PutObject", input };
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
    process.env.S3_BUCKET = "vh-media";
  });

  it("createPresignedUpload returns key, uploadUrl and publicUrl", async () => {
    getSignedUrl.mockResolvedValue("https://signed/upload");
    const service = new MediaService();
    const result = await service.createPresignedUpload("image/png", "photos");
    expect(result.uploadUrl).toBe("https://signed/upload");
    expect(result.key).toMatch(/^photos\/00000000-0000-4000-8000-000000000001\.png$/);
    expect(result.publicUrl).toBe(
      "http://localhost:3900/vh-media/photos/00000000-0000-4000-8000-000000000001.png",
    );
    expect(getSignedUrl).toHaveBeenCalled();
  });

  it("getPublicUrl strips trailing slash on public base", () => {
    process.env.S3_PUBLIC_URL = "http://cdn.example.com/";
    const service = new MediaService();
    expect(service.getPublicUrl("uploads/x.jpg")).toBe(
      "http://cdn.example.com/vh-media/uploads/x.jpg",
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
    send
      .mockRejectedValueOnce(new Error("404"))
      .mockResolvedValueOnce({});
    const service = new MediaService();
    await service.onModuleInit();
    expect(send).toHaveBeenCalledTimes(2);
    expect(HeadBucketCommand).toHaveBeenCalled();
    expect(CreateBucketCommand).toHaveBeenCalled();
  });
});

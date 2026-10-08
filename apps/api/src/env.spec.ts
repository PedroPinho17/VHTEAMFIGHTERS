import { afterEach, describe, expect, it } from "vitest";
import { assertProductionEnv } from "./env";

describe("assertProductionEnv", () => {
  const keys = [
    "NODE_ENV",
    "BETTER_AUTH_SECRET",
    "SMTP_HOST",
    "SMTP_FROM",
    "ENROLLMENT_NOTIFY_TO",
    "S3_ENDPOINT",
    "S3_PUBLIC_URL",
    "S3_ACCESS_KEY",
    "S3_SECRET_KEY",
    "S3_BUCKET",
    "ALLOW_INSECURE_S3",
  ] as const;
  const saved: Partial<Record<(typeof keys)[number], string | undefined>> = {};

  afterEach(() => {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  function snapshot() {
    for (const key of keys) saved[key] = process.env[key];
  }

  it("rejects empty ENROLLMENT_NOTIFY_TO in production", () => {
    snapshot();
    process.env.NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "x".repeat(32);
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_FROM = "noreply@example.com";
    process.env.ENROLLMENT_NOTIFY_TO = "";
    process.env.S3_ENDPOINT = "https://s3.example.com";
    process.env.S3_PUBLIC_URL = "https://cdn.example.com";
    process.env.S3_ACCESS_KEY = "real-key";
    process.env.S3_SECRET_KEY = "real-secret";
    process.env.S3_BUCKET = "vh-media";
    expect(() => assertProductionEnv()).toThrow(/ENROLLMENT_NOTIFY_TO/);
  });

  it("rejects .local ENROLLMENT_NOTIFY_TO in production", () => {
    snapshot();
    process.env.NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "x".repeat(32);
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_FROM = "noreply@example.com";
    process.env.ENROLLMENT_NOTIFY_TO = "admin@vhteamfighters.local";
    process.env.S3_ENDPOINT = "https://s3.example.com";
    process.env.S3_PUBLIC_URL = "https://cdn.example.com";
    process.env.S3_ACCESS_KEY = "real-key";
    process.env.S3_SECRET_KEY = "real-secret";
    process.env.S3_BUCKET = "vh-media";
    expect(() => assertProductionEnv()).toThrow(/ENROLLMENT_NOTIFY_TO/);
  });

  it("accepts a complete production config", () => {
    snapshot();
    process.env.NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "x".repeat(32);
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_FROM = "noreply@example.com";
    process.env.ENROLLMENT_NOTIFY_TO = "equipa@cliente.pt";
    process.env.S3_ENDPOINT = "https://s3.example.com";
    process.env.S3_PUBLIC_URL = "https://cdn.example.com";
    process.env.S3_ACCESS_KEY = "real-key";
    process.env.S3_SECRET_KEY = "real-secret";
    process.env.S3_BUCKET = "vh-media";
    expect(() => assertProductionEnv()).not.toThrow();
  });
});

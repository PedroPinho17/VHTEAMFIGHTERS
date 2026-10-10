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
    "S3_CORS_ORIGINS",
    "ALLOW_INSECURE_S3",
    "GARAGE_RPC_SECRET",
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

  function fillValidProd() {
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
    process.env.S3_CORS_ORIGINS = "https://vhteamfighters.pt";
    delete process.env.GARAGE_RPC_SECRET;
    delete process.env.ALLOW_INSECURE_S3;
  }

  it("rejects empty ENROLLMENT_NOTIFY_TO in production", () => {
    snapshot();
    fillValidProd();
    process.env.ENROLLMENT_NOTIFY_TO = "";
    expect(() => assertProductionEnv()).toThrow(/ENROLLMENT_NOTIFY_TO/);
  });

  it("rejects .local ENROLLMENT_NOTIFY_TO in production", () => {
    snapshot();
    fillValidProd();
    process.env.ENROLLMENT_NOTIFY_TO = "admin@vhteamfighters.local";
    expect(() => assertProductionEnv()).toThrow(/ENROLLMENT_NOTIFY_TO/);
  });

  it("rejects example Garage credentials in production", () => {
    snapshot();
    fillValidProd();
    process.env.S3_ACCESS_KEY = "GKabcdef0123456789abcdef01234567";
    process.env.S3_SECRET_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    expect(() => assertProductionEnv()).toThrow(/exemplo|omissão/i);
  });

  it("rejects missing or wildcard S3_CORS_ORIGINS in production", () => {
    snapshot();
    fillValidProd();
    process.env.S3_CORS_ORIGINS = "";
    expect(() => assertProductionEnv()).toThrow(/S3_CORS_ORIGINS/);
    process.env.S3_CORS_ORIGINS = "*";
    expect(() => assertProductionEnv()).toThrow(/S3_CORS_ORIGINS/);
  });

  it("accepts a complete production config", () => {
    snapshot();
    fillValidProd();
    expect(() => assertProductionEnv()).not.toThrow();
  });
});


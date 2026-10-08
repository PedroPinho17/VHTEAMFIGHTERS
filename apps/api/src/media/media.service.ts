import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function requireS3Creds(): { accessKeyId: string; secretAccessKey: string } {
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (!accessKeyId || !secretAccessKey) {
    if (isProd) {
      throw new Error("S3_ACCESS_KEY e S3_SECRET_KEY são obrigatórios em produção.");
    }
    return { accessKeyId: "minioadmin", secretAccessKey: "minioadmin" };
  }

  if (isProd && (accessKeyId === "minioadmin" || secretAccessKey === "minioadmin")) {
    throw new Error("Credenciais S3 por omissão não são permitidas em produção.");
  }

  return { accessKeyId, secretAccessKey };
}

@Injectable()
export class MediaService implements OnModuleInit {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? "vh-media";
    this.publicUrl = process.env.S3_PUBLIC_URL ?? "http://localhost:3900";
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: requireS3Creds(),
    });
  }

  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      } catch {
        // bucket may already exist or object storage not up yet in cold starts
      }
    }
  }

  async createPresignedUpload(contentType: string, folder = "uploads") {
    const ext = contentType.split("/")[1] ?? "bin";
    const key = `${folder}/${randomUUID()}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 600 });
    return {
      key,
      uploadUrl,
      publicUrl: this.getPublicUrl(key),
    };
  }

  getPublicUrl(key: string) {
    return `${this.publicUrl.replace(/\/$/, "")}/${this.bucket}/${key}`;
  }

  /** Used by /api/ready */
  async pingBucket(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch {
      return false;
    }
  }
}

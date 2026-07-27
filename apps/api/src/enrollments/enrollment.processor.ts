import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import * as nodemailer from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";
import { EnrollmentStatus } from "@vh/database";

export const ENROLLMENT_QUEUE = "enrollment-email";

@Processor(ENROLLMENT_QUEUE)
export class EnrollmentEmailProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ enrollmentId: string }>): Promise<void> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: job.data.enrollmentId },
    });
    if (!enrollment) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
      auth:
        process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "noreply@vhteamfighters.local",
        to: process.env.ENROLLMENT_NOTIFY_TO ?? "admin@vhteamfighters.local",
        subject: `Nova inscrição: ${enrollment.name}`,
        text: [
          `Nome: ${enrollment.name}`,
          `Email: ${enrollment.email}`,
          `Telefone: ${enrollment.phone ?? "-"}`,
          `Mensagem: ${enrollment.message ?? "-"}`,
        ].join("\n"),
      });
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.SENT },
      });
    } catch (error) {
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.FAILED },
      });
      throw error;
    }
  }
}

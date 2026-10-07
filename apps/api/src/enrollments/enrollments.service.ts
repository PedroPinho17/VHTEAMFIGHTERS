import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { EnrollmentStatus } from "@vh/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEnrollmentDto, UpdateEnrollmentStatusDto } from "./enrollments.dto";
import { ENROLLMENT_QUEUE } from "./enrollment.processor";
import { SlidingWindowRateLimiter } from "../common/rate-limit";

@Injectable()
export class EnrollmentsService {
  private readonly limiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(ENROLLMENT_QUEUE) private readonly queue: Queue,
  ) {}

  async create(dto: CreateEnrollmentDto, ip: string) {
    if (dto.website?.trim()) {
      return { ok: true, id: "ignored" };
    }
    if (!this.limiter.allow(`enroll:${ip}`)) {
      throw new HttpException(
        "Demasiados pedidos. Tenta mais tarde.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        privacyConsent: true,
        consentAt: new Date(),
      },
    });
    await this.enqueueEmail(enrollment.id);
    return { ok: true, id: enrollment.id };
  }

  async listAdmin() {
    return this.prisma.enrollment.findMany({
      where: { erasedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, dto: UpdateEnrollmentStatusDto) {
    const existing = await this.requireActive(id);
    return this.prisma.enrollment.update({
      where: { id: existing.id },
      data: { status: dto.status as EnrollmentStatus },
    });
  }

  async retryEmail(id: string) {
    const existing = await this.requireActive(id);
    if (existing.status === EnrollmentStatus.HANDLED) {
      throw new BadRequestException("Inscrição já tratada");
    }
    await this.prisma.enrollment.update({
      where: { id },
      data: { status: EnrollmentStatus.NEW },
    });
    await this.enqueueEmail(id);
    return { ok: true };
  }

  async exportGdpr(id: string) {
    const enrollment = await this.requireActive(id);
    return {
      format: "vh-enrollment-gdpr-v1",
      exportedAt: new Date().toISOString(),
      enrollment: {
        id: enrollment.id,
        name: enrollment.name,
        email: enrollment.email,
        phone: enrollment.phone,
        message: enrollment.message,
        status: enrollment.status,
        privacyConsent: enrollment.privacyConsent,
        consentAt: enrollment.consentAt,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      },
    };
  }

  async eraseGdpr(id: string) {
    const existing = await this.requireActive(id);
    await this.prisma.enrollment.update({
      where: { id: existing.id },
      data: {
        name: "Apagado (RGPD)",
        email: `erased-${existing.id}@anon.vh.local`,
        phone: null,
        message: null,
        privacyConsent: false,
        consentAt: null,
        status: EnrollmentStatus.HANDLED,
        erasedAt: new Date(),
      },
    });
    return { ok: true };
  }

  private async requireActive(id: string) {
    const existing = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!existing || existing.erasedAt) {
      throw new NotFoundException("Inscrição não encontrada");
    }
    return existing;
  }

  private async enqueueEmail(enrollmentId: string) {
    await this.queue.add(
      "send",
      { enrollmentId },
      {
        attempts: 5,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
  }
}

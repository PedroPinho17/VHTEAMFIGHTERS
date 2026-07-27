import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEnrollmentDto } from "./enrollments.dto";
import { ENROLLMENT_QUEUE } from "./enrollment.processor";

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(ENROLLMENT_QUEUE) private readonly queue: Queue,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    const enrollment = await this.prisma.enrollment.create({ data: dto });
    await this.queue.add(
      "send",
      { enrollmentId: enrollment.id },
      {
        attempts: 5,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
    return { ok: true, id: enrollment.id };
  }

  async listAdmin() {
    return this.prisma.enrollment.findMany({ orderBy: { createdAt: "desc" } });
  }
}

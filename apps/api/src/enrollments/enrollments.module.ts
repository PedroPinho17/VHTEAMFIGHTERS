import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { EnrollmentsController } from "./enrollments.controller";
import { EnrollmentsService } from "./enrollments.service";
import { ENROLLMENT_QUEUE, EnrollmentEmailProcessor } from "./enrollment.processor";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [BullModule.registerQueue({ name: ENROLLMENT_QUEUE }), RedisModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentEmailProcessor],
})
export class EnrollmentsModule {}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { EnrollmentsService } from "./enrollments.service";
import { CreateEnrollmentDto, UpdateEnrollmentStatusDto } from "./enrollments.dto";
import { AdminGuard } from "../auth/auth.guard";
import { clientIp } from "../common/rate-limit";

@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post("api/public/enrollments")
  create(@Body() dto: CreateEnrollmentDto, @Req() req: Parameters<typeof clientIp>[0]) {
    return this.enrollmentsService.create(dto, clientIp(req));
  }

  @Get("api/admin/enrollments")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.enrollmentsService.listAdmin();
  }

  @Patch("api/admin/enrollments/:id/status")
  @UseGuards(AdminGuard)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateEnrollmentStatusDto) {
    return this.enrollmentsService.updateStatus(id, dto);
  }

  @Post("api/admin/enrollments/:id/retry")
  @UseGuards(AdminGuard)
  retry(@Param("id") id: string) {
    return this.enrollmentsService.retryEmail(id);
  }

  @Get("api/admin/enrollments/:id/gdpr-export")
  @UseGuards(AdminGuard)
  async gdprExport(@Param("id") id: string, @Res({ passthrough: true }) res: Response) {
    const payload = await this.enrollmentsService.exportGdpr(id);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gdpr-export-enrollment-${id}.json"`,
    );
    return payload;
  }

  @Post("api/admin/enrollments/:id/gdpr-erase")
  @UseGuards(AdminGuard)
  erase(@Param("id") id: string, @Body() body: { confirm?: boolean }) {
    if (body?.confirm !== true) {
      throw new BadRequestException("confirm: true é obrigatório");
    }
    return this.enrollmentsService.eraseGdpr(id);
  }
}

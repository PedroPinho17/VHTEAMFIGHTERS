import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EnrollmentsService } from "./enrollments.service";
import { CreateEnrollmentDto } from "./enrollments.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post("api/public/enrollments")
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Get("api/admin/enrollments")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.enrollmentsService.listAdmin();
  }
}

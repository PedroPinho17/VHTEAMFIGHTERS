import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { UpsertSlotDto } from "./schedule.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get("api/public/schedule")
  listPublic() {
    return this.scheduleService.listPublic();
  }

  @Get("api/admin/schedule")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.scheduleService.listAdmin();
  }

  @Post("api/admin/schedule")
  @UseGuards(AdminGuard)
  create(@Body() dto: UpsertSlotDto) {
    return this.scheduleService.create(dto);
  }

  @Put("api/admin/schedule/:id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpsertSlotDto) {
    return this.scheduleService.update(id, dto);
  }

  @Delete("api/admin/schedule/:id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.scheduleService.remove(id);
  }
}

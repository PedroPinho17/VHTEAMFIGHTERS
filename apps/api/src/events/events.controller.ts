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
import { EventsService } from "./events.service";
import { UpsertEventDto } from "./events.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("api/public/events")
  listPublic() {
    return this.eventsService.listPublic();
  }

  @Get("api/public/events/:id")
  getPublic(@Param("id") id: string) {
    return this.eventsService.getPublic(id);
  }

  @Get("api/admin/events")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.eventsService.listAdmin();
  }

  @Post("api/admin/events")
  @UseGuards(AdminGuard)
  create(@Body() dto: UpsertEventDto) {
    return this.eventsService.create(dto);
  }

  @Put("api/admin/events/:id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpsertEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete("api/admin/events/:id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.eventsService.remove(id);
  }
}

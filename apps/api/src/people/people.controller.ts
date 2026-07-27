import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PersonRole } from "@vh/database";
import { PeopleService } from "./people.service";
import { UpsertPersonDto } from "./people.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get("api/public/people")
  listPublic(@Query("role") role?: PersonRole) {
    return this.peopleService.listPublic(role);
  }

  @Get("api/admin/people")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.peopleService.listAdmin();
  }

  @Get("api/admin/people/:id")
  @UseGuards(AdminGuard)
  get(@Param("id") id: string) {
    return this.peopleService.get(id);
  }

  @Post("api/admin/people")
  @UseGuards(AdminGuard)
  create(@Body() dto: UpsertPersonDto) {
    return this.peopleService.create(dto);
  }

  @Put("api/admin/people/:id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpsertPersonDto) {
    return this.peopleService.update(id, dto);
  }

  @Delete("api/admin/people/:id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.peopleService.remove(id);
  }
}

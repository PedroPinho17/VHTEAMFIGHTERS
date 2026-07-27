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
import { GalleryService } from "./gallery.service";
import { UpsertGalleryDto } from "./gallery.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get("api/public/gallery")
  listPublic() {
    return this.galleryService.listPublic();
  }

  @Get("api/admin/gallery")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.galleryService.listAdmin();
  }

  @Post("api/admin/gallery")
  @UseGuards(AdminGuard)
  create(@Body() dto: UpsertGalleryDto) {
    return this.galleryService.create(dto);
  }

  @Put("api/admin/gallery/:id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpsertGalleryDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete("api/admin/gallery/:id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.galleryService.remove(id);
  }
}

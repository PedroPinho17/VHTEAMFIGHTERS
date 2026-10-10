import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { MediaService } from "./media.service";
import { PresignDto } from "./media.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller("api/admin/media")
@UseGuards(AdminGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("presign")
  presign(@Body() dto: PresignDto) {
    return this.mediaService.createPresignedUpload(dto.contentType, dto.folder);
  }
}

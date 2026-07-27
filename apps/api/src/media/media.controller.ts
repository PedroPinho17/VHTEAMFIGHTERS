import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { MediaService } from "./media.service";
import { AdminGuard } from "../auth/auth.guard";

class PresignDto {
  @IsString()
  contentType!: string;

  @IsOptional()
  @IsString()
  folder?: string;
}

@Controller("api/admin/media")
@UseGuards(AdminGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("presign")
  presign(@Body() dto: PresignDto) {
    return this.mediaService.createPresignedUpload(dto.contentType, dto.folder);
  }
}

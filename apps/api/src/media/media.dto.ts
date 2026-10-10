import { IsIn, IsOptional, IsString } from "class-validator";

export class PresignDto {
  @IsString()
  @IsIn(["image/jpeg", "image/png", "image/webp"], {
    message: "contentType inválido — use image/jpeg, image/png ou image/webp.",
  })
  contentType!: string;

  @IsOptional()
  @IsString()
  @IsIn(["uploads", "gallery", "people", "posts", "events", "branding", "home"], {
    message: "folder inválido",
  })
  folder?: string;
}

import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class UpsertGalleryDto {
  @IsString()
  imageKey!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  alt?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  album?: string | null;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

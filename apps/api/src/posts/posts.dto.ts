import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class UpsertPostDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  excerpt?: string | null;

  @IsString()
  body!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  coverKey?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}

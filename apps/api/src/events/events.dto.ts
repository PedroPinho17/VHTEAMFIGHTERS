import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class UpsertEventDto {
  @IsString()
  title!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  location?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  description?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  opponent?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  result?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  imageKey?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

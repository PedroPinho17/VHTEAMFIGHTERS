import { IsOptional, IsString, ValidateIf } from "class-validator";

export class UpdateHomeDto {
  @IsString()
  heroTitle!: string;

  @IsString()
  heroSubtitle!: string;

  @IsString()
  bodyText!: string;

  @IsString()
  ctaPrimaryLabel!: string;

  @IsString()
  ctaPrimaryHref!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  ctaSecondaryLabel?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  ctaSecondaryHref?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  heroImageKey?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  logoKey?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  faviconKey?: string | null;
}

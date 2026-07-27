import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class UpsertPersonDto {
  @IsIn(["FIGHTER", "COACH"])
  role!: "FIGHTER" | "COACH";

  @IsString()
  name!: string;

  @IsString()
  bio!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  photoKey?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsNumber()
  weightKg?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  titles?: string[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

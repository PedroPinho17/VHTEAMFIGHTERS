import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class UpsertSlotDto {
  @IsIn([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ])
  day!:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  modality!: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  level?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  note?: string | null;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

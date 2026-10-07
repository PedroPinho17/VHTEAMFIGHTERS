import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateEnrollmentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  /** Consentimento RGPD — obrigatório. */
  @IsBoolean()
  @Equals(true, { message: "É necessário aceitar a política de privacidade." })
  privacyConsent!: boolean;

  /** Honeypot — must stay empty. Not persisted. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class UpdateEnrollmentStatusDto {
  @IsIn(["NEW", "SENT", "FAILED", "HANDLED"])
  status!: "NEW" | "SENT" | "FAILED" | "HANDLED";
}

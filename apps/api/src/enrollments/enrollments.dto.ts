import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateEnrollmentDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

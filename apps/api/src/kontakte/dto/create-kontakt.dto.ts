import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { KontaktTyp } from "@maklerprogram/types";

export class CreateKontaktDto {
  @IsEnum(KontaktTyp)
  typ!: KontaktTyp;

  @IsString()
  @IsOptional()
  vorname?: string;

  @IsString()
  @IsOptional()
  nachname?: string;

  @IsString()
  @IsOptional()
  firma?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefon?: string;
}

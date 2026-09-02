import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ZaehlerTyp } from "@maklerprogram/types";

export class UpdateZaehlerDto {
  @IsEnum(ZaehlerTyp)
  @IsOptional()
  typ?: ZaehlerTyp;

  @IsString()
  @MinLength(1)
  @IsOptional()
  zaehlernummer?: string;

  @IsBoolean()
  @IsOptional()
  hauptzaehler?: boolean;

  @IsString()
  @IsOptional()
  versorger?: string;

  @IsString()
  @IsOptional()
  vertragsNr?: string;

  @IsString()
  @IsOptional()
  lage?: string;

  @IsString()
  @IsOptional()
  objektId?: string;

  @IsString()
  @IsOptional()
  einheitId?: string;
}

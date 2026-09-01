import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { MietvertragStatus } from "@maklerprogram/types";

export class UpdateMietvertragDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  einheitId?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  mieterId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  kaltmiete?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  nebenkostenVorauszahlung?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  kaution?: number;

  @IsString()
  @IsOptional()
  iban?: string;

  @IsBoolean()
  @IsOptional()
  sepaLastschrift?: boolean;

  @IsDateString()
  @IsOptional()
  beginn?: string;

  @IsDateString()
  @IsOptional()
  ende?: string;

  @IsEnum(MietvertragStatus)
  @IsOptional()
  status?: MietvertragStatus;
}

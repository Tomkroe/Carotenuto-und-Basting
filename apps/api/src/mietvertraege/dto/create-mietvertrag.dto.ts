import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { MietvertragStatus } from "@maklerprogram/types";

export class CreateMietvertragDto {
  @IsString()
  @MinLength(1)
  einheitId!: string;

  @IsString()
  @MinLength(1)
  mieterId!: string;

  @IsNumber()
  @Min(0)
  kaltmiete!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  nebenkostenVorauszahlung?: number;

  @IsDateString()
  beginn!: string;

  @IsDateString()
  @IsOptional()
  ende?: string;

  @IsEnum(MietvertragStatus)
  @IsOptional()
  status?: MietvertragStatus;
}

import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { VorgangStatus } from "@maklerprogram/types";

export class UpdateVorgangDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  titel?: string;

  @IsString()
  @IsOptional()
  beschreibung?: string;

  @IsEnum(VorgangStatus)
  @IsOptional()
  status?: VorgangStatus;

  @IsDateString()
  @IsOptional()
  faelligkeit?: string;

  @IsString()
  @IsOptional()
  objektId?: string;

  @IsString()
  @IsOptional()
  einheitId?: string;

  @IsString()
  @IsOptional()
  kontaktId?: string;

  @IsString()
  @IsOptional()
  verantwortlicherId?: string;
}

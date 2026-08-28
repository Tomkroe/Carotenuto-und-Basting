import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { NebenkostenStatus } from "@maklerprogram/types";

export class CreateNebenkostenabrechnungDto {
  @IsString()
  @MinLength(1)
  objektId!: string;

  @IsDateString()
  zeitraumVon!: string;

  @IsDateString()
  zeitraumBis!: string;

  @IsEnum(NebenkostenStatus)
  @IsOptional()
  status?: NebenkostenStatus;
}

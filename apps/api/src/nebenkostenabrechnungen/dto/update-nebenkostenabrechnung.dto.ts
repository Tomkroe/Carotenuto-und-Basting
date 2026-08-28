import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { NebenkostenStatus } from "@maklerprogram/types";

export class UpdateNebenkostenabrechnungDto {
  @IsDateString()
  @IsOptional()
  zeitraumVon?: string;

  @IsDateString()
  @IsOptional()
  zeitraumBis?: string;

  @IsEnum(NebenkostenStatus)
  @IsOptional()
  status?: NebenkostenStatus;
}

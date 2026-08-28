import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator";
import { VerteilerSchluessel } from "@maklerprogram/types";

export class CreateNebenkostenPositionDto {
  @IsString()
  @MinLength(1)
  bezeichnung!: string;

  @IsNumber()
  @Min(0)
  betrag!: number;

  @IsEnum(VerteilerSchluessel)
  verteilerschluessel!: VerteilerSchluessel;
}

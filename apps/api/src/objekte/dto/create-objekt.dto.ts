import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { ObjektTyp } from "@maklerprogram/types";

export class CreateObjektDto {
  @IsEnum(ObjektTyp)
  typ!: ObjektTyp;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  strasse!: string;

  @IsString()
  @MinLength(1)
  hausnummer!: string;

  @IsString()
  @MinLength(1)
  plz!: string;

  @IsString()
  @MinLength(1)
  ort!: string;

  @IsString()
  @IsOptional()
  land?: string;

  @IsNumber()
  @IsOptional()
  kaltmiete?: number;

  @IsNumber()
  @IsOptional()
  flaeche?: number;
}

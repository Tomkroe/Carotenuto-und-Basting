import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { ObjektTyp } from "@maklerprogram/types";

export class UpdateObjektDto {
  @IsEnum(ObjektTyp)
  @IsOptional()
  typ?: ObjektTyp;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  strasse?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  hausnummer?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  plz?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  ort?: string;

  @IsString()
  @IsOptional()
  land?: string;

  @IsNumber()
  @IsOptional()
  kaltmiete?: number;

  @IsNumber()
  @IsOptional()
  flaeche?: number;

  @IsNumber()
  @IsOptional()
  hausgeld?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eigenschaften?: string[];

  @IsString()
  @IsOptional()
  ansprechpartnerId?: string;

  @IsString()
  @IsOptional()
  abrechnungszeitraumStart?: string;

  @IsString()
  @IsOptional()
  abrechnungszeitraumEnde?: string;

  @IsString()
  @IsOptional()
  bankKontoinhaber?: string;

  @IsString()
  @IsOptional()
  bankIban?: string;

  @IsString()
  @IsOptional()
  bankBic?: string;
}

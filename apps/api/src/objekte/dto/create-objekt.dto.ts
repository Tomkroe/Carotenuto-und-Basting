import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
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

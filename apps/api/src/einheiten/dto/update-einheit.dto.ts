import { IsArray, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateEinheitDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  kategorie?: string;

  @IsNumber()
  @IsOptional()
  flaeche?: number;

  @IsNumber()
  @IsOptional()
  kaltmiete?: number;

  @IsNumber()
  @IsOptional()
  zimmer?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ausstattung?: string[];
}

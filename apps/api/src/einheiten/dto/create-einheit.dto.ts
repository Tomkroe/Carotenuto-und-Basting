import { IsArray, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateEinheitDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  kategorie!: string;

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

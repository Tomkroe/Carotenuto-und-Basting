import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

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
}

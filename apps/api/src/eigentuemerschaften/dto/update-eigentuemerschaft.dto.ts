import { IsNumber, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class UpdateEigentuemerschaftDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  einheitId?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  eigentuemerId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hausgeldAnteil?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  anteilProzent?: number;
}

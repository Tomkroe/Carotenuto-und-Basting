import { IsNumber, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateEigentuemerschaftDto {
  @IsString()
  @MinLength(1)
  einheitId!: string;

  @IsString()
  @MinLength(1)
  eigentuemerId!: string;

  @IsNumber()
  @Min(0)
  hausgeldAnteil!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  anteilProzent?: number;
}

import { IsDateString, IsNumber, Min } from "class-validator";

export class CreateZaehlerstandDto {
  @IsDateString()
  datum!: string;

  @IsNumber()
  @Min(0)
  wert!: number;
}

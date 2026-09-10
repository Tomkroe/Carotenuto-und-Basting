import { IsDateString, IsIn, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { BelegStatus, BelegTyp } from "@maklerprogram/types";

export class CreateBelegDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsOptional()
  belegnummer?: string;

  @IsIn([BelegTyp.EINNAHME, BelegTyp.AUSGABE])
  @IsOptional()
  typ?: BelegTyp;

  @IsNumber()
  betrag!: number;

  @IsDateString()
  belegdatum!: string;

  @IsIn([BelegStatus.OFFEN, BelegStatus.BEZAHLT])
  @IsOptional()
  status?: BelegStatus;

  @IsString()
  @IsOptional()
  notiz?: string;

  @IsString()
  @IsOptional()
  objektId?: string;

  @IsString()
  @IsOptional()
  kategorieId?: string;
}

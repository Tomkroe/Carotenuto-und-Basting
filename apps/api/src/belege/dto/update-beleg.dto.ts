import { IsDateString, IsIn, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { BelegStatus, BelegTyp } from "@maklerprogram/types";

export class UpdateBelegDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  belegnummer?: string;

  @IsIn([BelegTyp.EINNAHME, BelegTyp.AUSGABE])
  @IsOptional()
  typ?: BelegTyp;

  @IsNumber()
  @IsOptional()
  betrag?: number;

  @IsDateString()
  @IsOptional()
  belegdatum?: string;

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

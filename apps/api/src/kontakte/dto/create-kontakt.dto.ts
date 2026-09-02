import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { KontaktTyp } from "@maklerprogram/types";

export class CreateKontaktDto {
  @IsEnum(KontaktTyp)
  typ!: KontaktTyp;

  @IsString()
  @IsOptional()
  vorname?: string;

  @IsString()
  @IsOptional()
  nachname?: string;

  @IsString()
  @IsOptional()
  firma?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefon?: string;

  @IsString()
  @IsOptional()
  debitorNr?: string;

  @IsString()
  @IsOptional()
  kreditorNr?: string;

  @IsDateString()
  @IsOptional()
  geburtsdatum?: string;

  @IsString()
  @IsOptional()
  adresseStrasse?: string;

  @IsString()
  @IsOptional()
  adresseHausnummer?: string;

  @IsString()
  @IsOptional()
  adressePlz?: string;

  @IsString()
  @IsOptional()
  adresseOrt?: string;

  @IsString()
  @IsOptional()
  notizen?: string;

  @IsString()
  @IsOptional()
  bankKontoinhaber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankIban?: string;

  @IsString()
  @IsOptional()
  bankBic?: string;

  @IsString()
  @IsOptional()
  bankGlaeubigerId?: string;
}

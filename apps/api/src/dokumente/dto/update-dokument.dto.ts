import { IsEnum, IsOptional } from "class-validator";
import { DokumentKategorie } from "@maklerprogram/types";

export class UpdateDokumentDto {
  @IsEnum(DokumentKategorie)
  @IsOptional()
  kategorie?: DokumentKategorie | null;
}

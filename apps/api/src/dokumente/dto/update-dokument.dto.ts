import { IsOptional, IsString } from "class-validator";

export class UpdateDokumentDto {
  @IsString()
  @IsOptional()
  kategorieId?: string | null;
}

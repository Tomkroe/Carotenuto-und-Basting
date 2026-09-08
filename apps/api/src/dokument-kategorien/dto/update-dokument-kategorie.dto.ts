import { IsString, MinLength } from "class-validator";

export class UpdateDokumentKategorieDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

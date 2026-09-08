import { IsString, MinLength } from "class-validator";

export class CreateDokumentKategorieDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

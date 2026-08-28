import { IsString, MinLength } from "class-validator";

export class CreateKommentarDto {
  @IsString()
  @MinLength(1)
  text!: string;
}

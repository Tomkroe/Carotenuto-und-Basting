import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class CreateVorgangVorlageDto {
  @IsString()
  @MinLength(1)
  titel!: string;

  @IsString()
  @IsOptional()
  beschreibung?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labelIds?: string[];
}

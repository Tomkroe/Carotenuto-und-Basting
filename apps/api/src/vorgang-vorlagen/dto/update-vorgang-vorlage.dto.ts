import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateVorgangVorlageDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  titel?: string;

  @IsString()
  @IsOptional()
  beschreibung?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labelIds?: string[];
}

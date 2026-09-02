import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateToDoDto {
  @IsString()
  @MinLength(1)
  titel!: string;

  @IsDateString()
  @IsOptional()
  faelligkeit?: string;
}

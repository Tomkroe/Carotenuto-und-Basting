import { IsBoolean, IsDateString, IsOptional } from "class-validator";

export class UpdateToDoDto {
  @IsBoolean()
  @IsOptional()
  erledigt?: boolean;

  @IsDateString()
  @IsOptional()
  faelligkeit?: string;
}

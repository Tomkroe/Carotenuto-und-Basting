import { IsBoolean, IsOptional } from "class-validator";

export class UpdateToDoDto {
  @IsBoolean()
  @IsOptional()
  erledigt?: boolean;
}

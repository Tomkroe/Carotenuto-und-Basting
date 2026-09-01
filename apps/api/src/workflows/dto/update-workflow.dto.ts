import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateWorkflowDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  label?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  prompt?: string;
}

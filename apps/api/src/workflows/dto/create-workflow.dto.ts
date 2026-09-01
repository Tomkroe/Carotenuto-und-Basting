import { IsString, MinLength } from "class-validator";

export class CreateWorkflowDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  prompt!: string;
}
